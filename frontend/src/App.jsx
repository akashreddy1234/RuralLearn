import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { initOfflineSync } from './services/offlineSyncService';
import api from './services/api';

import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import ParentAnalytics from './pages/parent/ParentAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import RewardSettings from './pages/admin/RewardSettings';
import NotFound from './pages/NotFound';

import LessonsPage from './pages/LessonsPage';
import LessonViewer from './pages/LessonViewer';
import QuizPage from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CreateLesson from './pages/teacher/CreateLesson';
import CreateQuiz from './pages/teacher/CreateQuiz';
import StudentAnalytics from './pages/teacher/StudentAnalytics';
import ManageLessons from './pages/teacher/ManageLessons';
import ManageQuizzes from './pages/teacher/ManageQuizzes';

// ----------------------------------------------------
// STRICT ROUTE GUARDS
// ----------------------------------------------------

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Student') {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }
  return children;
};

const TeacherRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Teacher' && user.role !== 'Admin') {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }
  return children;
};

const ParentRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Parent' && user.role !== 'Admin') {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    initOfflineSync(api);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-200">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<div className="p-8 text-center text-rose-600 font-bold text-2xl h-screen bg-slate-900 shadow-inner flex items-center justify-center">403 - Unauthorized Access</div>} />
          
          {/* 
            STRICT ROLE SUB-ROUTING
            Utilizing nested hierarchy so React Router inherently preserves URLs on hydration requests.
          */}

          {/* STUDENT ROUTES */}
          <Route path="/student/*" element={
            <StudentRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="lessons" element={<LessonsPage />} />
                  <Route path="lesson/:lessonId" element={<LessonViewer />} />
                  <Route path="quiz/:lessonId" element={<QuizPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </StudentRoute>
          } />

          {/* TEACHER ROUTES */}
          <Route path="/teacher/*" element={
            <TeacherRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="create-lesson" element={<CreateLesson />} />
                  <Route path="create-quiz" element={<CreateQuiz />} />
                  <Route path="manage-lessons" element={<ManageLessons />} />
                  <Route path="manage-quizzes" element={<ManageQuizzes />} />
                  <Route path="analytics" element={<StudentAnalytics />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </TeacherRoute>
          } />

          {/* PARENT ROUTES */}
          <Route path="/parent/*" element={
            <ParentRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<ParentDashboard />} />
                  <Route path="analytics" element={<ParentAnalytics />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ParentRoute>
          } />

        {/* ADMIN ROUTES */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<ManageUsers />} /> 
                  <Route path="content" element={<AdminDashboard />} /> 
                  <Route path="settings" element={<RewardSettings />} /> 
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </AdminRoute>
          } />

          {/* DEPRECATED CATCHALL REDIRECT (Prevents arbitrary unmapped dashboard hits) */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
