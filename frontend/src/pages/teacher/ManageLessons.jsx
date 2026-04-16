import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit2, Search, X } from 'lucide-react';

const ManageLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  
  // Edit Modal State
  const [editingLesson, setEditingLesson] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFile, setEditFile] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data } = await api.get('/lessons/me');
      setLessons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete the lesson and all mapped quizzes permanently.")) return;
    try {
      await api.delete(`/lessons/${id}`);
      setLessons(lessons.filter(l => l._id !== id));
    } catch (err) {
      alert("Failed to delete lesson.");
    }
  };

  const handleEditClick = (lesson) => {
    setEditingLesson(lesson);
    setEditForm({
      title: lesson.title || '',
      subject: lesson.subject || '',
      language: lesson.language || 'English',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      externalLink: lesson.externalLink || ''
    });
    setEditFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        formData.append(key, editForm[key]);
      });
      if (editFile) {
        formData.append('document', editFile);
      }

      const { data } = await api.put(`/lessons/${editingLesson._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLessons(lessons.map(l => (l._id === data._id ? data : l)));
      setEditingLesson(null);
    } catch (err) {
      alert("Failed to update lesson.");
    }
  };

  const filteredLessons = filterSubject 
    ? lessons.filter(l => l.subject.toLowerCase().includes(filterSubject.toLowerCase())) 
    : lessons;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Manage Lessons</h1>
            <p className="text-slate-500">View, edit, or delete your authored content.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by subject..." 
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading your lessons...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Language</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLessons.map(lesson => (
                    <tr key={lesson._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{lesson.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{lesson.subject}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{lesson.language}</td>
                      <td className="px-6 py-4 flex justify-end gap-3">
                        <button onClick={() => handleEditClick(lesson)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(lesson._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLessons.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        No lessons found. 
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
      {editingLesson && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative my-8">
            <button onClick={() => setEditingLesson(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 focus:outline-none">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Lesson</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                  <input type="text" value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Language</label>
                  <select value={editForm.language} onChange={e => setEditForm({...editForm, language: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" required>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Video URL (Optional)</label>
                  <input type="url" value={editForm.videoUrl} onChange={e => setEditForm({...editForm, videoUrl: e.target.value})} placeholder="https://youtube.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">External Link (Optional)</label>
                  <input type="url" value={editForm.externalLink} onChange={e => setEditForm({...editForm, externalLink: e.target.value})} placeholder="https://wikipedia.org/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Update Document (Optional)</label>
                <div className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center">
                   <input type="file" onChange={(e) => setEditFile(e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
                {editingLesson.documentUrl && <p className="text-xs text-slate-400 mt-2">Leave empty to keep existing document: {editingLesson.documentUrl.split('/').pop()}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Content Snippet</label>
                <textarea value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl"></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                 <button type="button" onClick={() => setEditingLesson(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">Cancel</button>
                 <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-500/30">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLessons;
