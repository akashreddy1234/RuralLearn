const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');

dotenv.config({ path: './.env' });

async function checkData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB.');
  
  try {
    const teachers = await User.find({ role: 'Teacher' });
    console.log(`Found ${teachers.length} teachers.`);
    for (let t of teachers) {
      console.log(`\nTeacher: ${t.name} (${t._id})`);
      const lessons = await Lesson.find({ uploadedBy: t._id });
      console.log(` - Lessons count: ${lessons.length}`);
      
      const lessonIds = lessons.map(l => l._id);
      const quizzes = await Quiz.countDocuments({ lessonId: { $in: lessonIds } });
      console.log(` - Quizzes count (via lessonIds param): ${quizzes}`);
      
      const allQuizzes = await Quiz.find();
      console.log(` - Total quizzes in DB: ${allQuizzes.length}. Mapped to lessons:`);
      allQuizzes.forEach(q => console.log(`   * Quiz ID: ${q._id}, LessonID in quiz: ${q.lessonId}, Type of lessonId: ${typeof q.lessonId}`));
      
      lessonIds.forEach(id => console.log(`   * Lesson ID: ${id}, Type: ${typeof id}`));
    }
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}

checkData();
