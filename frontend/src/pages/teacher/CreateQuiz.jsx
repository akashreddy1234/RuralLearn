import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    lessonId: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    difficultyLevel: 'easy'
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get('/lessons/me');
        setLessons(res.data);
      } catch (err) {
        console.error('Failed to fetch lessons', err);
      }
    };
    fetchLessons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        lessonId: formData.lessonId, // ensure teacher enters valid lessonId for now
        difficultyLevel: formData.difficultyLevel,
        question: formData.question,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        correctAnswer: formData.correctAnswer
      };
      
      await api.post('/quizzes', payload);
      alert('Quiz Created Successfully! Attached to Lesson ID: ' + formData.lessonId);
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error('Submission error', err);
      alert(err.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Create Quiz</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Lesson</label>
            <select 
              name="lessonId" 
              value={formData.lessonId} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" 
              required 
            >
              <option value="" disabled>-- Select a Lesson --</option>
              {lessons.map(lesson => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title} ({lesson.subject})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Question</label>
            <input 
              type="text" 
              name="question" 
              value={formData.question} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" 
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Option 1</label>
              <input type="text" name="option1" value={formData.option1} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Option 2</label>
              <input type="text" name="option2" value={formData.option2} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Option 3</label>
              <input type="text" name="option3" value={formData.option3} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Option 4</label>
              <input type="text" name="option4" value={formData.option4} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correct Answer (Exact Text)</label>
              <input 
                type="text" 
                name="correctAnswer" 
                value={formData.correctAnswer} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty Level</label>
              <select 
                name="difficultyLevel" 
                value={formData.difficultyLevel} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/teacher/dashboard')} 
              className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-xl shadow-lg transition-colors"
            >
              Submit Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
