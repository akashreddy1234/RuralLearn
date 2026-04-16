import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, Settings, ShieldCheck, Activity, Database, Award } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">System Admin Portal</h1>
            <p className="text-slate-300 text-lg">Manage platforms users, security, and global gamification settings.</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-3 shadow-sm">
             <ShieldCheck className="text-emerald-400" size={24} />
             <div>
               <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Active Session</p>
               <p className="text-sm font-medium">{user?.name}</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 opacity-20 rounded-full blur-3xl -translate-y-12 translate-x-1/3"></div>
      </div>

      {/* Quick Stats (Static layout for visual presence) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Activity size={28} /></div>
          <div>
            <p className="text-sm font-bold text-slate-400">System Status</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Healthy</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><Database size={28} /></div>
          <div>
            <p className="text-sm font-bold text-slate-400">Database Load</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Optimal</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl"><Users size={28} /></div>
          <div>
            <p className="text-sm font-bold text-slate-400">User Growth</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">+14%</h3>
          </div>
        </div>
      </div>

      {/* Core Admin Actions */}
      <h2 className="text-xl font-bold text-slate-800 mb-4 px-2 pt-4">Administrative Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col items-start relative overflow-hidden cursor-pointer">
          <div className="absolute -right-6 -bottom-6 text-indigo-50 opacity-50 transform group-hover:scale-110 transition-transform duration-500">
             <Users size={160} />
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 relative z-10 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Manage Users</h3>
          <p className="text-slate-500 mb-8 relative z-10 max-w-sm">Create, edit, suspend, or remove Students, Teachers, and Parents from the global roster.</p>
          <Link to="/admin/users" className="mt-auto relative z-10 w-full text-center py-3 bg-slate-50 text-indigo-600 font-bold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-slate-100 group-hover:border-transparent">
            Access Directory
          </Link>
        </div>

        <div className="group bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col items-start relative overflow-hidden cursor-pointer">
          <div className="absolute -right-6 -bottom-6 text-amber-50 opacity-50 transform group-hover:scale-110 transition-transform duration-500">
             <Award size={160} />
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl mb-4 relative z-10 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <Settings size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Reward Settings</h3>
          <p className="text-slate-500 mb-8 relative z-10 max-w-sm">Configure gamification rules, modify point allocations per action, and adjust badge unlock thresholds globally.</p>
          <Link to="/admin/settings" className="mt-auto relative z-10 w-full text-center py-3 bg-slate-50 text-amber-600 font-bold rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors border border-slate-100 group-hover:border-transparent">
            Configure Logic
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
