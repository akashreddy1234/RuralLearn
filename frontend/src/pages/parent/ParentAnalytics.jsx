import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, Clock, Target, CheckCircle, BarChart2, BookOpen, MessageCircle } from 'lucide-react';
import ChatModal from '../../components/ChatModal';
import api from '../../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ParentAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatSubject, setActiveChatSubject] = useState('');
  const [activeTeacher, setActiveTeacher] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard/parent');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch parent analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
     return (
       <div className="flex justify-center items-center h-96">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
       </div>
     );
  }

  if (!data?.child) {
     return (
       <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center">
         <h2 className="text-2xl font-bold text-slate-800 mb-4">No Child Linked</h2>
         <p className="text-slate-500 mb-6">Your parent account is not currently linked to a student.</p>
         <Link to="/parent/dashboard" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl">Return to Dashboard</Link>
       </div>
     );
  }

  const { child, metrics, charts } = data;

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } }
    }
  };

  const lineData = {
    labels: charts?.activityLabels || [],
    datasets: [
      {
        label: 'Lessons/Quizzes Completed',
        data: charts?.activity || [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
         <div className="flex items-center gap-4">
            <Link to="/parent/dashboard" className="p-3 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition">
               <ChevronLeft size={24} />
            </Link>
            <div>
               <h1 className="text-3xl font-extrabold text-slate-800">{child.name}'s Analytics</h1>
               <p className="text-slate-500 font-medium tracking-wide">Detailed performance & engagement tracking</p>
            </div>
         </div>
      </header>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl"><Clock size={28} /></div>
          <div>
            <p className="text-sm font-bold text-slate-400">Hours Studied</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.totalHoursStudied}h</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl"><BookOpen size={28} /></div>
          <div>
            <p className="text-sm font-bold text-slate-400">Total Quizzes</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.totalQuizzesAttempted}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-teal-50 text-teal-500 rounded-2xl"><Target size={28} /></div>
          <div>
            <p className="text-sm font-bold text-slate-400">Avg. Accuracy</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.avgAccuracy}%</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl"><CheckCircle size={28} /></div>
          <div>
            <p className="text-sm font-bold text-slate-400">Overall Score</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{metrics.overallScore}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (Study Activity) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <BarChart2 className="text-indigo-500" /> Weekly Study Activity
               </h2>
             </div>
             <div className="h-72 w-full">
               <Line data={lineData} options={lineOptions} />
             </div>
           </div>
        </div>

        {/* Sidebar Structure (Subject-wise Analysis) */}
        <div className="space-y-6">
           <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Target className="text-purple-500" /> Subject Mastery
             </h2>
             <div className="space-y-5">
                {charts?.subjectAnalysis && charts.subjectAnalysis.length > 0 ? (
                  charts.subjectAnalysis.map((sub, i) => (
                    <div key={i}>
                       <div className="flex justify-between items-end mb-1">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-700">{sub.subject}</span>
                             {sub.teacher && (
                               <button 
                                 onClick={() => {
                                   setActiveTeacher(sub.teacher);
                                   setActiveChatSubject(sub.subject);
                                   setChatOpen(true);
                                 }}
                                 className="text-indigo-500 hover:bg-indigo-50 p-1 rounded-full transition group relative"
                                 title={`Message ${sub.teacher.name}`}
                               >
                                 <MessageCircle size={16} />
                               </button>
                             )}
                           </div>
                           <span className="text-sm font-black text-slate-400">{sub.percentage}%</span>
                       </div>
                       {sub.teacher && (
                          <div className="text-xs text-slate-500 mb-2">Teacher: {sub.teacher.name}</div>
                       )}
                       <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                             className={`h-2.5 rounded-full ${sub.percentage >= 80 ? 'bg-emerald-500' : sub.percentage >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`} 
                             style={{ width: `${sub.percentage}%` }}
                          ></div>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic">No subjects attempted yet.</p>
                )}
             </div>
           </div>
        </div>
      </div>

      <ChatModal 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        currentUser={user}
        otherUser={activeTeacher}
        student={child}
        subject={activeChatSubject}
      />
    </div>
  );
};

export default ParentAnalytics;
