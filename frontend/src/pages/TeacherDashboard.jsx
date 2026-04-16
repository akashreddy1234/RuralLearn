import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { FilePlus, Edit3, BarChart2, Users, BookOpen, Clock, Activity, Target, MessageCircle } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeThread, setActiveThread] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/teacher');
        setDashboardData(data);
        const threadRes = await api.get('/messages/threads/teacher');
        setThreads(threadRes.data);
      } catch (err) {
        console.error('Error fetching teacher dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboard();
  }, [user, location.pathname]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { borderDash: [4, 4] } },
      x: { grid: { display: false } }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '75%'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Use dynamic data or fallback
  const dData = dashboardData || { stats: {}, charts: { performance: {}, difficulty: {} }, recentActivity: [] };

  const dynamicPerformanceData = {
    labels: dData.charts.performance.labels || [],
    datasets: [
      {
        label: 'Average Score (%)',
        data: dData.charts.performance.data || [],
        backgroundColor: 'rgba(56, 189, 248, 0.8)',
        borderRadius: 8,
      }
    ]
  };

  const dynamicDifficultyData = {
    labels: dData.charts.difficulty.labels || [],
    datasets: [
      {
        data: dData.charts.difficulty.data || [],
        backgroundColor: ['#34d399', '#fbbf24', '#f87171'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Teacher Portal</h1>
            <p className="text-slate-300 text-lg">Manage your classroom, track progress, and author content, {user?.name}.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Link to="/teacher/create-lesson" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
              + New Lesson
            </Link>
            <Link to="/teacher/create-quiz" className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
              + New Quiz
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl -translate-y-12 translate-x-1/3"></div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Total Lessons</h3>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><BookOpen size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.totalLessons || 0}</p>
          <div className="mt-2 text-sm text-slate-400 font-medium">Platform content</div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Total Quizzes</h3>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-xl"><Edit3 size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.totalQuizzes || 0}</p>
          <div className="mt-2 text-sm text-slate-400 font-medium">Assessments mapped</div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Active Students</h3>
            <div className="p-2 bg-teal-50 text-teal-500 rounded-xl"><Users size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.totalActiveStudents || 0}</p>
          <div className="mt-2 text-sm text-slate-400 font-medium">Students enrolled</div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Avg. Class Score</h3>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Target size={24} /></div>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{dData.stats.avgScore || 0}%</p>
          <div className="mt-2 text-sm text-slate-400 font-medium">Overall accuracy</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Charts Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="text-blue-500" /> Class Performance by Unit
              </h2>
              <Link to="/teacher/analytics" className="text-blue-600 font-bold hover:underline text-sm">Full Analytics</Link>
            </div>
            <div className="h-72 w-full">
              <Bar data={dynamicPerformanceData} options={barOptions} />
            </div>
          </div>

          {/* Quick Actions / Content Management */}
          <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Content Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/teacher/manage-lessons" className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 flex items-start gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-100 transition-colors">
                <BookOpen size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Manage Lessons</h3>
                <p className="text-sm text-slate-500">Filter, edit, or delete existing lessons.</p>
              </div>
            </Link>
            
            <Link to="/teacher/manage-quizzes" className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 flex items-start gap-4">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-100 transition-colors">
                <Edit3 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Manage Quizzes</h3>
                <p className="text-sm text-slate-500">Edit, review, or remove quiz questions.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar Area (Right 1/3) */}
        <div className="space-y-6">
          
          {/* Difficulty Distribution Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="text-teal-500" /> Student CI Distribution
            </h2>
            <div className="h-48 w-full mb-4">
              <Doughnut data={dynamicDifficultyData} options={donutOptions} />
            </div>
            <p className="text-sm text-slate-500 text-center">Based on Competency Index (CI) engine</p>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="text-amber-500" /> Recent Activity
            </h2>
            <div className="space-y-4">
              {dData.recentActivity && dData.recentActivity.length > 0 ? (
                dData.recentActivity.map((act, index) => (
                  <div key={act.id || index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      act.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {act.studentName} {act.status === 'completed' ? 'completed' : 'started'} '{act.lessonTitle}'
                        {act.score !== undefined ? ` with score ${act.score}%` : null}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(act.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recent student activity found.</p>
              )}
            </div>
            <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
              View All Activity
            </button>
          </div>

          {/* Parent Messages */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageCircle className="text-indigo-500" /> Parent Messages
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {threads.length > 0 ? (
                threads.map((thread, index) => (
                  <div 
                    key={index} 
                    onClick={() => {
                       setActiveThread(thread);
                       setChatOpen(true);
                       
                       // Instantly clear unread badge locally
                       if (thread.unreadCount > 0) {
                           setThreads(prev => prev.map(t => 
                               t === thread ? { ...t, unreadCount: 0 } : t
                           ));
                       }
                    }}
                    className={`flex flex-col gap-1 p-3 rounded-xl cursor-pointer border transition ${
                      thread.unreadCount > 0 
                        ? 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50' 
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                       <span className={`text-sm ${thread.unreadCount > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                         {thread.parent.name}
                       </span>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] text-slate-400">
                           {new Date(thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {thread.unreadCount > 0 && (
                           <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                             🔴 {thread.unreadCount}
                           </span>
                         )}
                       </div>
                    </div>
                    <div className="text-xs text-indigo-600 font-semibold">{thread.subject} • {thread.student.name}</div>
                    <p className={`text-sm truncate ${thread.unreadCount > 0 ? 'font-medium text-slate-700' : 'text-slate-500'}`}>
                      {thread.latestMessage}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No messages from parents.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      <ChatModal 
        isOpen={chatOpen} 
        onClose={() => {
           setChatOpen(false);
           if(user){
               api.get('/messages/threads/teacher').then(res => setThreads(res.data)).catch(console.error);
           }
        }}
        currentUser={user}
        otherUser={activeThread?.parent}
        student={activeThread?.student}
        subject={activeThread?.subject}
      />
    </div>
  );
};

export default TeacherDashboard;
