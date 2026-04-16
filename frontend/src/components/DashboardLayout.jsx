import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, BookOpen, HelpCircle, Activity, 
  Trophy, User as UserIcon, LogOut, Menu, X, Bell, Settings 
} from 'lucide-react';
import { useTranslation, AVAILABLE_LANGUAGES } from '../utils/translations';
import api from '../services/api';

const DashboardLayout = ({ children }) => {
  const { user, logout, updateLanguagePreference } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const location = useLocation();
  const t = useTranslation(user);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (lang) => {
    try {
      updateLanguagePreference(lang);
      setProfileOpen(false);
      await api.put('/auth/language', { languagePreference: lang });
    } catch (error) {
      console.error('Failed to set language', error);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  const getLinks = () => {
    let baseLinks = [];
    if (user?.role === 'Student') {
      baseLinks.push(
        { name: t('dashboard'), path: '/student/dashboard', icon: LayoutDashboard },
        { name: t('lessons'), path: '/student/lessons', icon: BookOpen },
        { name: t('leaderboard'), path: '/student/leaderboard', icon: Trophy }
      );
    } else if (user?.role === 'Admin') {
      baseLinks.push(
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Manage Users', path: '/admin/users', icon: UserIcon },
        { name: 'Reward Settings', path: '/admin/settings', icon: Settings }
      );
    } else if (user?.role === 'Teacher') {
      baseLinks.push(
        { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { name: 'Create Lesson', path: '/teacher/create-lesson', icon: BookOpen },
        { name: 'Create Quiz', path: '/teacher/create-quiz', icon: HelpCircle },
        { name: 'Student Analytics', path: '/teacher/analytics', icon: Activity }
      );
    } else if (user?.role === 'Parent') {
      baseLinks.push(
        { name: 'Dashboard', path: '/parent/dashboard', icon: LayoutDashboard }
      );
    } else {
      baseLinks.push(
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
      );
    }
    return baseLinks;
  };

  const links = getLinks();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar background overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <Link to={user?.role ? `/${user.role.toLowerCase()}/dashboard` : "/dashboard"} className="text-2xl font-black bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            RuralLearn
          </Link>
          <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
          <nav className="space-y-1">
            {links.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 overflow-visible">
          <button 
            className="md:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1"></div>

          <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Avatar toggle button - OUTSIDE the dropdown ref */}
            <button
              ref={avatarRef}
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-500 font-medium">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white hover:ring-2 hover:ring-blue-300 transition-all">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>

            {/* Dropdown panel — separate from avatar button so no event conflict */}
            {profileOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-4 top-14 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-[100]"
              >
                {/* User info */}
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                {/* Language section - flat list, no nested toggle */}
                <div className="px-4 pt-2 pb-1 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span>Aअ</span> {t('language') || 'Language'}
                  </p>
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = (user?.languagePreference || 'English') === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-2 py-2 text-sm rounded-lg transition-colors flex items-center justify-between mb-0.5 ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {isSelected && <span className="text-blue-600 text-base leading-none">✔</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Logout */}
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors mt-1"
                >
                  <LogOut size={16} className="text-rose-500" /> {t('logout') || 'Logout'}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
