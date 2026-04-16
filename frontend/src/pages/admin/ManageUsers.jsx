import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, UserPlus, Search, Edit } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Teachers');
  
  // Teacher modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [teacherData, setTeacherData] = useState({ name: '', email: '', subject: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.users || []);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This action destroys their database map.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: teacherData.name,
        email: teacherData.email,
        subjects: teacherData.subject ? [teacherData.subject] : []
      };
      await api.post('/admin/users/teacher', payload);
      setShowAddModal(false);
      setTeacherData({ name: '', email: '', subject: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add teacher');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!u || !u.role) return false;
    const role = u.role.toLowerCase();
    if (activeTab === 'Teachers') return role === 'teacher';
    if (activeTab === 'Students') return role === 'student';
    if (activeTab === 'Parents') return role === 'parent';
    return false;
  });

  return (
    <div className="p-6 h-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manage Users</h1>
        {activeTab === 'Teachers' && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold font-medium shadow-md transition-colors hover:shadow-lg hover:-translate-y-0.5">
            <UserPlus size={20} />
            <span className="hidden sm:inline">Add Teacher</span>
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200">
        {['Teachers', 'Students', 'Parents'].map(tab => (
          <button 
            key={tab}
            className={`pb-4 px-4 font-bold tracking-wide border-b-2 transition-all duration-300 ${activeTab === tab ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-indigo-400 font-bold animate-pulse">Synchronizing database vectors...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm tracking-wider uppercase">
                <th className="p-5 font-bold">Display Name</th>
                <th className="p-5 font-bold">Contact Root</th>
                <th className="p-5 font-bold">Role Bound Details</th>
                <th className="p-5 font-bold">Date Instantiated</th>
                <th className="p-5 font-bold text-right">Sanctions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-12 text-slate-400 font-medium">No {activeTab.toLowerCase()} populated in current namespace.</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-800">{user.name}</td>
                    <td className="p-5 text-slate-600">{user.email}</td>
                    <td className="p-5 text-slate-500 text-sm">
                      {activeTab === 'Teachers' && <span className="bg-indigo-100/50 border border-indigo-200 text-indigo-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">{user.subjects?.[0] || 'General Allocation'}</span>}
                      {activeTab === 'Students' && <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Parent Node: {user.parentEmail || 'Unlinked Fault'}</span>}
                      {activeTab === 'Parents' && <span className="text-blue-600 font-bold">Mapping Anchor</span>}
                    </td>
                    <td className="p-5 text-slate-500 text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-5 text-right">
                      <button onClick={() => handleDelete(user._id)} className="text-rose-400 flex items-center justify-end w-full hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Teacher Modal Injector */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-black tracking-tight text-slate-800 mb-2">Initialize Teacher</h2>
            <p className="text-slate-500 mb-8 font-medium">Bypass registration locks to securely push an authorized explicit instructor onto the active platform matrix.</p>
            
            <form onSubmit={handleAddTeacher} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Teacher Name</label>
                <input type="text" required value={teacherData.name} onChange={e => setTeacherData({...teacherData, name: e.target.value})} className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <input type="email" required value={teacherData.email} onChange={e => setTeacherData({...teacherData, email: e.target.value})} className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <input type="text" required list="subject-suggestions" value={teacherData.subject} onChange={e => setTeacherData({...teacherData, subject: e.target.value})} placeholder="e.g. Physics" className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium" />
                <datalist id="subject-suggestions">
                  <option value="Maths" />
                  <option value="Physics" />
                  <option value="Biology" />
                  <option value="English" />
                </datalist>
              </div>
              
              <div className="flex justify-between items-center mt-10">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel Operations</button>
                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">Add Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
