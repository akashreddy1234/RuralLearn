import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trophy, Medal, Star } from 'lucide-react';

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        setLeaders(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return <Trophy size={28} className="text-yellow-400" />;
    if (index === 1) return <Medal size={28} className="text-slate-300" />;
    if (index === 2) return <Medal size={28} className="text-amber-600" />;
    return <span className="text-lg font-bold text-slate-400 w-7 text-center">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-100 text-yellow-600 rounded-full mb-4">
            <Trophy size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Global Leaderboard</h1>
          <p className="text-slate-500">Top rural learners based on completion and accuracy!</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {leaders.map((student, index) => (
            <div 
              key={student._id} 
              className={`flex items-center justify-between p-4 sm:p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-transparent to-yellow-50/30' : ''}`}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-10 flex justify-center">{getRankBadge(index)}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{student.name}</h3>
                  <p className="text-sm text-slate-500">School: {student.schoolCode || 'N/A'} • {student.streak} Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-xl text-teal-700 font-bold">
                <span>{student.totalPoints}</span>
                <Star size={18} />
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="p-8 text-center text-slate-500">Leaderboard is empty</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
