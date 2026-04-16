const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { updateStreak } = require('../services/gamificationService');

const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new Student
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, parentName, parentEmail, languagePreference, schoolCode } = req.body;
  try {
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanParentEmail = parentEmail ? parentEmail.toLowerCase().trim() : '';

    console.log(`[registerUser] Attempting to register Student: ${cleanEmail}`);

    if (cleanEmail === cleanParentEmail) {
       return res.status(400).json({ message: 'Student and Parent emails must be different' });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      console.log(`[registerUser] Failed: Student email already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-create/Bind Parent 
    let parent = null;
    if (cleanParentEmail) {
      parent = await User.findOne({ email: cleanParentEmail });
      if (!parent) {
        console.log(`[registerUser] Creating missing parent: ${cleanParentEmail}`);
        parent = await User.create({
          name: parentName || 'Parent',
          email: cleanParentEmail,
          role: 'Parent',
          languagePreference: languagePreference || 'English' // inherit from student
        });
      } else if (!parent.languagePreference && languagePreference) {
        // Update existing parent language if not yet set
        parent.languagePreference = languagePreference;
        await parent.save();
      }
    }

    console.log(`[registerUser] Creating student record in DB...`);
    const user = await User.create({
      name, 
      email: cleanEmail, 
      role: 'Student', // Forced Role
      languagePreference, 
      schoolCode,
      parentId: parent ? parent._id : null,
      parentEmail: cleanParentEmail || null
    });

    console.log(`[registerUser] Success! Student created with ID: ${user._id}`);
    res.status(201).json({ message: 'Registration successful. Proceed to login to request OTP.' });
  } catch (error) {
    console.error(`[registerUser] Severe Exception:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request an OTP for Login
// @route   POST /api/auth/otp/request
// @access  Public
const requestOtp = async (req, res) => {
  const { email } = req.body;
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  
  console.log(`\n--- OTP REQUEST START ---`);
  console.log(`[requestOtp] Incoming Email: ${email}`);
  console.log(`[requestOtp] Parsed/Cleaned Email: ${cleanEmail}`);

  try {
    const genericResponse = { message: 'If account exists, OTP has been sent' };
    
    // Debug lookup directly
    const allUsers = await User.find({}).select('email role');
    console.log(`[requestOtp] Current DB Emails:`, allUsers.map(u => u.email).join(', '));

    const user = await User.findOne({ email: cleanEmail });
    console.log(`[requestOtp] User Lookup Result: ${user ? `FOUND (${user.role}) - ID: ${user._id}` : 'NOT FOUND'}`);

    if (!user) {
       console.log(`[requestOtp] Halting workflow - Email does not exist in DB.`);
       return res.json(genericResponse);
    }

    // 1. Check Lockout
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
       console.log(`[requestOtp] Halting workflow - User is currently locked out.`);
       return res.json(genericResponse);
    }
    
    // 2. Check Cooldown (60 seconds)
    if (user.lastOtpSentAt && (Date.now() - user.lastOtpSentAt.getTime() < 60000)) {
       console.log(`[requestOtp] Halting workflow - Cooldown threshold violated.`);
       return res.json(genericResponse); 
    }

    // 3. Generate 6-digit OTP
    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[requestOtp] Generated generic OTP for ${cleanEmail} successfully.`);
    
    // 4. Hash OTP with bcrypt
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(plainOtp, salt);

    // 5. Update User OTP records
    user.otpHash = otpHash;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    user.otpAttempts = 0; 
    user.lastOtpSentAt = Date.now();
    await user.save();
    console.log(`[requestOtp] Secured bounds updated in DB.`);

    // 6. Send Email
    const message = `Your OTP is: ${plainOtp}\nThis OTP is valid for 5 minutes.\nDo not share this code with anyone.`;
    await sendEmail({
      email: user.email,
      subject: 'RuralLearn Login OTP',
      message
    });

    console.log(`[requestOtp] Notification effectively dispatched over SMTP.`);
    console.log(`--- OTP REQUEST END ---\n`);

    res.json(genericResponse);
  } catch (error) {
    console.error(`[requestOtp] Fatal System Error:`, error);
    res.status(500).json({ message: 'Server error processing OTP request', error: error.toString() });
  }
};

// @desc    Verify OTP and issue JWT
// @route   POST /api/auth/otp/verify
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid OTP or parameters' });
    }

    // Check Lockout
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      return res.status(403).json({ message: 'Account is locked temporarily. Try again later.' });
    }

    // Check Null/Expired OTP
    if (!user.otpHash || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(401).json({ message: 'OTP expired or invalid. Please request a new one.' });
    }

    // Validate Hash
    const isMatch = await bcrypt.compare(otp.toString(), user.otpHash);
    if (!isMatch) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= 3) {
        user.otpLockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock 10 mins
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Success: Clear OTP data and Update metrics
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpLockUntil = undefined;
    await user.save();

    await updateStreak(user._id);

    console.log(`[verifyOtp] Verified and issued token successfully to: ${cleanEmail}`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      languagePreference: user.languagePreference,
      totalPoints: user.totalPoints,
      streak: user.streak,
      token: generateToken(user._id, user.email, user.role),
    });
  } catch (error) {
    console.error(`[verifyOtp] Failure:`, error);
    res.status(500).json({ message: 'Server error verifying OTP', error: error.toString() });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otpHash');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLanguage = async (req, res) => {
  const { languagePreference } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.languagePreference = languagePreference || 'English';
      await user.save();
      res.json({ message: 'Language preference updated', languagePreference: user.languagePreference });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, requestOtp, verifyOtp, getMe, updateLanguage };
