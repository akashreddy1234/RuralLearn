import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, BarChart2, Trophy } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from '../utils/translations';

const ParentDashboard = () => {
  const { user } = useAuth();
  const t = useTranslation(user);
  const [leaderboard, setLeaderboard] = useState([]);
  const [childInfo, setChildInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lbRes = await api.get('/leaderboard');
        setLeaderboard(lbRes.data);

        const parentRes = await api.get('/dashboard/parent');
        if (parentRes.data.child) {
           setChildInfo(parentRes.data.child);
        }
      } catch (err) {
        console.error('Failed to fetch parent dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  let childRank = null;
  if (childInfo) {
    const rankIndex = leaderboard.findIndex(u => u._id === childInfo.id);
    if (rankIndex !== -1) childRank = rankIndex + 1;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t('dashboard')}</h1>
          <p className="text-slate-500 font-medium mt-1">{t('welcome_back')}, {user?.name}</p>
        </div>
        <Link
          to="/parent/analytics"
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition"
        >
          <BarChart2 size={18} /> {t('analytics_button')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard Section */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                      <Trophy className="text-amber-500" size={28} /> {t('leaderboard')}
                   </h2>
                   <p className="text-slate-500 text-sm mt-1">{t('leaderboard_desc')}</p>
                </div>
              </div>

              {loading ? (
                 <div className="text-center py-12 text-slate-400">Loading standings...</div>
              ) : (
                <div className="space-y-4">
                  {/* Child Highlight Card */}
                  {childInfo && childRank ? (
                    <div className="mb-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white flex items-center justify-between transform hover:scale-[1.02] transition-transform">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black shadow-inner flex-shrink-0">
                            #{childRank}
                          </div>
                          <div>
                            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest">{t('your_child')}</p>
                            <h3 className="text-2xl font-bold">{childInfo.name}</h3>
                          </div>
                       </div>
                       <div className="text-right mt-4 sm:mt-0">
                          <p className="text-3xl font-black">{childInfo.totalPoints}</p>
                          <p className="text-indigo-100 text-sm font-medium">Total XP</p>
                       </div>
                    </div>
                  ) : childInfo ? (
                     <div className="mb-8 p-4 bg-indigo-50 text-indigo-700 rounded-xl font-medium border border-indigo-100">
                        Your child {childInfo.name} hasn't earned points yet.
                     </div>
                  ) : (
                     <div className="mb-8 p-4 bg-rose-50 text-rose-700 rounded-xl font-medium border border-rose-100">
                        No child is currently linked to your parent account. Ask an administrator to map your record.
                     </div>
                  )}

                  {/* Top Performers List */}
                  <h3 className="text-lg font-bold text-slate-700 mb-4 px-2">{t('top_performers')}</h3>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    {leaderboard.slice(0, 10).map((student, index) => {
                       const isChild = childInfo && student._id === childInfo.id;
                       return (
                         <div key={student._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 last:border-0 ${isChild ? 'bg-indigo-50' : 'bg-transparent'}`}>
                           <div className="flex items-center gap-4 mb-2 sm:mb-0">
                              <span className={`w-8 text-center font-black ${index === 0 ? 'text-amber-500 text-xl' : index === 1 ? 'text-slate-400 text-lg' : index === 2 ? 'text-orange-400 text-lg' : 'text-slate-500'}`}>
                                #{index + 1}
                              </span>
                              <span className={`font-bold ${isChild ? 'text-indigo-700' : 'text-slate-800'} break-all`}>
                                {student.name} {isChild && <span className="ml-1 text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full uppercase">{t('your_child')}</span>}
                              </span>
                           </div>
                           <span className="font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                             {student.totalPoints} XP
                           </span>
                         </div>
                       )
                    })}
                    {leaderboard.length === 0 && <div className="p-6 text-center text-slate-500">No students ranked yet.</div>}
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Deep Insights CTA */}
        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 bg-indigo-500 w-32 h-32 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
              <Activity size={48} className="mx-auto mb-6 text-indigo-200" />
              <h3 className="text-2xl font-bold mb-3 relative z-10">{t('deep_insights')}</h3>
              <p className="text-indigo-100 text-sm mb-6 relative z-10">
                 Explore detailed breakdown of subject mastery, daily study charts, and historical accuracy for {childInfo ? childInfo.name : 'your child'}.
              </p>
              <Link to="/parent/analytics" className="inline-block px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition w-full shadow-md relative z-10">
                 {t('open_analytics')}
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
