import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

const RewardSettings = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings/rewards');
      setRules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleUpdate = async (id, field, value) => {
    try {
      // Optimistic update over the frontend node
      setRules(rules.map(r => r._id === id ? { ...r, [field]: value } : r));
      await api.put(`/admin/settings/rewards/${id}`, { [field]: value });
    } catch (err) {
      alert('Failed to update config rule boundary on server.');
      fetchRules(); // Restore structural consistency
    }
  };

  return (
    <div className="p-6 h-full max-w-5xl mx-auto">
      <header className="mb-10 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-3xl shadow-xl border border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gamification Rules</h1>
          <p className="text-indigo-200 font-medium mt-2">Adjust automated threshold algorithms validating Student badge injections.</p>
        </div>
        <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
           <ShieldAlert size={36} />
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 font-bold text-indigo-500 animate-pulse">Establishing Rule Matrix Link...</div>
      ) : (
        <div className="space-y-8">
          {rules.map(rule => (
            <div key={rule._id} className={`bg-white rounded-3xl shadow-sm border transition-all duration-500 ${rule.isEnabled ? 'border-slate-200 hover:shadow-lg' : 'border-slate-300 border-dashed opacity-75 bg-slate-50 grayscale'}`}>
              <div className="p-8 flex items-start justify-between">
                <div className="flex gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${rule.isEnabled ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {/* Render basic native icon mapping placeholder */}
                    {rule.icon === 'Flame' ? '🔥' : rule.icon === 'BookOpen' ? '📖' : '🏆'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{rule.name}</h3>
                    <p className="text-slate-500 mt-1 font-medium">{rule.description}</p>
                    <div className="mt-5 flex items-center gap-4">
                      <span className="bg-slate-100 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm">
                        {rule.type.replace('_', ' ')} logic hook
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                   <button 
                     onClick={() => handleUpdate(rule._id, 'isEnabled', !rule.isEnabled)}
                     className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm ${rule.isEnabled ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:shadow-rose-100' : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:shadow-emerald-100'}`}
                   >
                     {rule.isEnabled ? <XCircle size={20} strokeWidth={2.5}/> : <CheckCircle2 size={20} strokeWidth={2.5} />}
                     {rule.isEnabled ? 'Halt Automation' : 'Engage Automation'}
                   </button>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-8 py-5 rounded-b-3xl flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">Threshold Required Validator:</label>
                  <div className="flex items-center gap-2 relative">
                    <input 
                      type="number" 
                      className="w-24 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-black text-center text-lg text-indigo-700 shadow-sm transition-all"
                      value={rule.threshold}
                      disabled={!rule.isEnabled}
                      onChange={(e) => {
                        const newRules = rules.map(r => r._id === rule._id ? { ...r, threshold: Number(e.target.value) } : r);
                        setRules(newRules);
                      }}
                      onBlur={(e) => handleUpdate(rule._id, 'threshold', Number(e.target.value))}
                    />
                    <span className="text-slate-500 font-bold">
                      {rule.type === 'streak' ? 'Consecutive Days' : ''}
                      {rule.type === 'lessons_completed' ? 'Total Lessons' : ''}
                      {rule.type === 'quiz_score' ? '% Completion Benchmark' : ''}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 bg-slate-200/50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Settings size={14} /> Synchronized on Blur
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardSettings;
