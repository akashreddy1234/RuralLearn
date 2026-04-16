const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Progress = require('./models/Progress');

dotenv.config({ path: './.env' });

async function seedData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB. Resetting clean database...');

  try {
    // 1. Delete ALL existing data natively dropping passwords and legacy structure
    await User.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Progress.deleteMany({});
    console.log('Database wiped completely.');

    // 2. Create Admin User
    await User.create({
      name: 'System Admin',
      email: 'akashreddybiyyam@gmail.com',
      role: 'Admin'
    });
    console.log('Admin account initialized.');

    // 3. Create Specific Default Teachers with Subject Mapping
    await User.create([
      {
        name: 'Prabhu Teacher',
        email: 'prabhudontireddy@gmail.com',
        role: 'Teacher',
        subjects: ['Maths']
      },
      {
        name: 'Koreabhi Teacher',
        email: 'koreabhi31@gmail.com',
        role: 'Teacher',
        subjects: ['Biology']
      },
      {
        name: 'Padigapati Teacher',
        email: 'padigapatiajithreddy@gmail.com',
        role: 'Teacher',
        subjects: ['Physics', 'Chemistry']
      }
    ]);
    console.log('Explicit Teacher accounts seeded with mapped subjects.');
    
    console.log('Database reset successfully finalized!');
  } catch(e) {
    console.error('Seed Error:', e);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
