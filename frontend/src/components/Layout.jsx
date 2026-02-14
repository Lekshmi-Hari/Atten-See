import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Brain, Mic, BarChart3, Calendar, Settings as SettingsIcon, LogOut, TrendingUp, User as UserIcon, Sparkles } from 'lucide-react';
import { sessionService } from '../services/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'User' });
  const [avgFocus, setAvgFocus] = useState(0);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const stats = await sessionService.getStats();
        if (stats && stats.avgFocusScore) {
          setAvgFocus(Math.round(stats.avgFocusScore));
        }
      } catch (err) {
        console.error('Layout: Failed to fetch stats');
      }
    };
    fetchGlobalStats();
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', icon: Brain, label: 'Dashboard' },
    { path: '/study', icon: Eye, label: 'Study Mode' },
    { path: '/lecture', icon: Mic, label: 'Lecture AI' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/planner', icon: Calendar, label: 'Commitment' },
    { path: '/settings', icon: SettingsIcon, label: 'Configuration' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-dark-base text-gray-200 overflow-hidden font-sans">
      <div className="glow-mesh" />

      {/* Sidebar */}
      <aside className="w-72 bg-dark-surface/80 backdrop-blur-3xl border-r border-white/[0.05] flex flex-col z-50 relative">
        <div className="p-8">
          <Link to="/dashboard" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-purple rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                <Eye className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-1">
                ATTEN<span className="text-primary-400 tracking-normal font-light">SEE</span>
              </h1>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Core Engine v2.0</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 group relative ${isActive
                  ? 'bg-white/[0.05] text-white border border-white/10 shadow-lg'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.02] border border-transparent'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-primary-500 rounded-r-full blur-[2px]" />
                )}
                <Icon className={`w-5 h-5 transition-all duration-500 ${isActive ? 'text-primary-400 scale-110' : 'text-gray-600 group-hover:scale-110'}`} />
                <span className={`font-semibold text-sm tracking-tight ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1 transition-transform'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <Sparkles className="w-3.5 h-3.5 ml-auto text-primary-400 opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          {/* User Profile Summary */}
          <div className="glass-card !rounded-[1.5rem] p-5 mb-6 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-dark-card border border-white/10 flex items-center justify-center font-bold text-primary-400">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black">Pro Scholar</p>
              </div>
            </div>
            <div className="bg-dark-base/50 rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-gray-500">AVG FOCUS</span>
                <span className="text-primary-400 font-mono text-[10px]">{avgFocus}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${avgFocus}%` }} />
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">System Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />
        <div className="p-10 relative z-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;