const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private (Parent, Teacher)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, studentId, subject, text } = req.body;
    
    if (!receiverId || !studentId || !subject || !text) {
      return res.status(400).json({ message: 'Please provide all necessary fields' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      student: studentId,
      subject: subject,
      text: text
    });

    // Populate sender and receiver for the response
    await message.populate('sender', 'name role');
    await message.populate('receiver', 'name role');
    
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get conversation thread
// @route   GET /api/messages/thread/:studentId/:subject/:otherUserId
// @access  Private (Parent, Teacher)
const getThread = async (req, res) => {
  try {
    const { studentId, subject, otherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      student: studentId,
      subject: subject,
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name role');

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching thread' });
  }
};

// @desc    Get unique teacher threads
// @route   GET /api/messages/threads/teacher
// @access  Private (Teacher)
const getTeacherThreads = async (req, res) => {
  try {
    const myId = req.user._id;

    // Find all messages where the teacher is either the sender or receiver
    const allMessages = await Message.find({
      $or: [{ receiver: myId }, { sender: myId }]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .populate('student', 'name')
    .sort({ createdAt: -1 });

    const threadMap = new Map();

    allMessages.forEach(msg => {
      // Identity the parent. If I am the receiver, the sender is the parent. 
      // If I am the sender, the receiver is the parent.
      const isTeacherSender = msg.sender._id.toString() === myId.toString();
      const parentUser = isTeacherSender ? msg.receiver : msg.sender;
      
      const threadKey = `${msg.student._id.toString()}_${msg.subject}_${parentUser._id.toString()}`;

      if (!threadMap.has(threadKey)) {
        threadMap.set(threadKey, {
          parent: { _id: parentUser._id, name: parentUser.name },
          student: { _id: msg.student._id, name: msg.student.name },
          subject: msg.subject,
          latestMessage: msg.text,
          updatedAt: msg.createdAt,
          unreadCount: (!msg.read && msg.receiver._id.toString() === myId.toString()) ? 1 : 0
        });
      } else {
        const existing = threadMap.get(threadKey);
        if (!msg.read && msg.receiver._id.toString() === myId.toString()) {
            existing.unreadCount += 1;
        }
      }
    });

    const threads = Array.from(threadMap.values());
    res.json(threads);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching teacher threads' });
  }
};

// @desc    Mark thread as read
// @route   POST /api/messages/read
// @access  Private
const markRead = async (req, res) => {
  try {
    const { studentId, subject, otherUserId } = req.body;
    const myId = req.user._id;

    await Message.updateMany({
      student: studentId,
      subject: subject,
      sender: otherUserId,
      receiver: myId,
      read: false
    }, {
      $set: { read: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error marking messages read' });
  }
};

module.exports = {
  sendMessage,
  getThread,
  getTeacherThreads,
  markRead
};
