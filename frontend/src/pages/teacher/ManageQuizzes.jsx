import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit2, Search, X } from 'lucide-react';

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  
  // Edit Modal State
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes/me');
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this quiz question?")) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      alert("Failed to delete quiz.");
    }
  };

  const handleEditClick = (quiz) => {
    setEditingQuiz(quiz);
    setEditForm({
      difficultyLevel: quiz.difficultyLevel,
      question: quiz.question,
      options: quiz.options.join('\n'), // multi-line separation
      correctAnswer: quiz.correctAnswer
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        options: editForm.options.split('\n').map(o => o.trim()).filter(Boolean)
      };
      const { data } = await api.put(`/quizzes/${editingQuiz._id}`, payload);
      // Keep populated lesson info intact locally
      const updatedQuiz = { ...data, lessonId: editingQuiz.lessonId };
      setQuizzes(quizzes.map(q => (q._id === data._id ? updatedQuiz : q)));
      setEditingQuiz(null);
    } catch (err) {
      alert("Failed to update quiz.");
    }
  };

  const filteredQuizzes = filterText 
    ? quizzes.filter(q => 
        q.lessonId?.subject?.toLowerCase().includes(filterText.toLowerCase()) || 
        q.lessonId?.title?.toLowerCase().includes(filterText.toLowerCase()) ||
        q.question.toLowerCase().includes(filterText.toLowerCase())
      ) 
    : quizzes;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Manage Quizzes</h1>
            <p className="text-slate-500">Edit adaptive questions deployed across your modules.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Subject, Lesson, Question..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading your assessments...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Question & Difficulty</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Context (Subject → Lesson)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuizzes.map(quiz => (
                    <tr key={quiz._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 break-words max-w-sm">{quiz.question}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold uppercase ${quiz.difficultyLevel === 'hard' ? 'bg-rose-50 text-rose-600' : quiz.difficultyLevel === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {quiz.difficultyLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-sm">
                          <span className="font-bold text-indigo-600">{quiz.lessonId?.subject}</span>
                          <span className="text-slate-500">{quiz.lessonId?.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-3 mt-2">
                        <button onClick={() => handleEditClick(quiz)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(quiz._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredQuizzes.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                        No quiz questions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingQuiz && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setEditingQuiz(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Quiz Question</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Question</label>
                <input type="text" value={editForm.question} onChange={e => setEditForm({...editForm, question: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Difficulty</label>
                <select value={editForm.difficultyLevel} onChange={e => setEditForm({...editForm, difficultyLevel: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Options (One per line)</label>
                <textarea value={editForm.options} onChange={e => setEditForm({...editForm, options: e.target.value})} rows="4" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200" required></textarea>
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Correct Answer (Must match an option exactly)</label>
                 <input type="text" value={editForm.correctAnswer} onChange={e => setEditForm({...editForm, correctAnswer: e.target.value})} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200" required />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuizzes;
