import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Trophy, Star, Activity, PlayCircle, Target, Award, Medal } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Chatbot from '../components/Chatbot';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const t = useTranslation(user);
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/student');
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch student dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboard();
  }, [user, location.pathname]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
      x: { grid: { display: false } }
    }
  };

  if (loading) {
     return (
       <div className="flex justify-center items-center h-96">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500"></div>
       </div>
     );
  }

  const dData = dashboardData || { stats: {}, charts: { activity: [] }, continueLearning: [], masteryProgress: [] };

  const dynamicActivityData = {
    labels: dData.charts.activityLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Real last 7 days or fallback
    datasets: [
      {
        label: 'Learning Flow Score',
        data: dData.charts.activity || [0,0,0,0,0,0,0],
        borderColor: '#0d9488', // teal-600
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{t('welcome_back')}, {user?.name}! 👋</h1>
          <p className="text-blue-100 text-lg max-w-xl">{t('streak_message', { streak: dData.stats.streak || 0 })}</p>
        </div>
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-64 h-64 bg-teal-300 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">{t('total_points')}</h3>
            <div className="p-2 bg-amber-100 text-amber-500 rounded-xl"><Star size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.totalPoints || 0}</p>
          <div className="mt-2 text-sm text-emerald-500 font-medium flex items-center gap-1">{t('wallet')}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">{t('daily_streak')}</h3>
            <div className="p-2 bg-rose-100 text-rose-500 rounded-xl"><Activity size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.streak || 0}</p>
          <div className="mt-2 text-sm text-slate-500 font-medium">{t('days_in_a_row')}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">{t('lessons_done')}</h3>
            <div className="p-2 bg-blue-100 text-blue-500 rounded-xl"><BookOpen size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.lessonsDone || 0}</p>
          <div className="mt-2 text-sm text-slate-500 font-medium">{t('completed_modules')}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">{t('quiz_accuracy')}</h3>
            <div className="p-2 bg-emerald-100 text-emerald-500 rounded-xl"><Target size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.avgAccuracy || 0}%</p>
          <div className="mt-2 text-sm text-slate-500 font-medium flex items-center gap-1">{t('average_score')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Charts Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="text-teal-500" /> {t('weekly_activity')}
            </h2>
            <div className="h-72 w-full">
              <Line data={dynamicActivityData} options={chartOptions} />
            </div>
          </div>

          {/* Continue Learning */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PlayCircle className="text-blue-500" /> {t('continue_learning')}
              </h2>
              <Link to="/student/lessons" className="text-blue-600 font-bold hover:underline text-sm">View all modules</Link>
            </div>
            
            <div className="space-y-4">
              {dData.continueLearning && dData.continueLearning.length > 0 ? (
                dData.continueLearning.map(lesson => (
                  <Link to={`/student/lesson/${lesson.id}`} key={lesson.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 p-3 rounded-xl text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{lesson.title}</h4>
                        <p className="text-sm text-slate-500">{lesson.subject} • Last accessed {new Date(lesson.lastUpdated).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-32 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${lesson.progressPct}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{lesson.progressPct}%</span>
                    </div>
                  </Link>
                ))
              ) : (
                 <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-500 mb-2">No in-progress lessons found.</p>
                    <Link to="/student/lessons" className="text-blue-500 font-bold hover:underline">Browse Lessons</Link>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Area (Right 1/3) */}
        <div className="space-y-6">
          
          {/* Subject Progress */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Trophy className="text-amber-500" /> {t('subject_mastery')}
            </h2>
            <div className="space-y-4">
              {dData.masteryProgress && dData.masteryProgress.length > 0 ? (
                dData.masteryProgress.map((subjectData, idx) => {
                  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-sky-500', 'bg-purple-500', 'bg-rose-500'];
                  const colorClass = colors[idx % colors.length];
                  return (
                    <div key={subjectData.subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-slate-700">{subjectData.subject}</span>
                        <span className="font-bold text-slate-500">{subjectData.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${Math.min(100, subjectData.percentage)}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">{t('no_mastery_data')}</p>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Award className="text-rose-500" /> {t('recent_badges')}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
               {dData.badgesList && dData.badgesList.length > 0 ? (
                 dData.badgesList.map(badge => (
                    <div key={badge.name} className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 shadow-sm border transition-all ${badge.earned ? 'bg-amber-100 text-amber-500 border-amber-200' : 'bg-slate-100 text-slate-300 border-slate-200 grayscale opacity-60'}`}>
                        {badge.icon === 'Award' ? <Medal size={32} /> : badge.icon === 'Flame' ? <Star size={32} /> : badge.icon === 'BookOpen' ? <BookOpen size={32} /> : <Trophy size={32} />}
                      </div>
                      <span className={`text-xs font-bold text-center ${badge.earned ? 'text-slate-600' : 'text-slate-400 font-medium line-through decoration-slate-300'}`}>{badge.name}</span>
                    </div>
                 ))
               ) : (
                 <p className="text-sm text-slate-500 col-span-3">No active reward rules mapped.</p>
               )}
            </div>
          </div>
        </div>
      </div>
      <Chatbot performanceContext={dData} />
    </div>
  );
};

export default StudentDashboard;
