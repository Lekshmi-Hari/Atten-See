import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Mic, BarChart3, TrendingUp, Calendar, Clock, Zap, Target, Activity, ArrowUpRight, ChevronRight, Filter, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { sessionService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    focusScore: 0,
    studyTime: 0,
    sessionsCompleted: 0,
    phoneDistractions: 0
  });

  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sessionService.getStats();
        if (data && data.today) {
          setStats({
            focusScore: Math.round(data.today.focusScore) || 0,
            studyTime: data.today.studyTime || 0,
            sessionsCompleted: data.today.sessionsCompleted || 0,
            phoneDistractions: data.phoneDistractions || 0
          });
        }
        const sessions = await sessionService.getAll();
        setRecentSessions(sessions.slice(0, 5));
      } catch (err) {
        console.error('Dashboard: Data link failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins} m` : `${mins} m`;
  };

  const statCards = [
    { label: 'Deep Focus', value: `${stats.focusScore}% `, icon: Zap, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Time Invested', value: formatDuration(stats.studyTime), icon: Clock, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { label: 'Cycles Done', value: stats.sessionsCompleted, icon: Target, color: 'text-accent-pink', bg: 'bg-accent-pink/10' },
    { label: 'Digital Shield', value: stats.phoneDistractions === 0 ? 'ACTIVE' : `${stats.phoneDistractions} Hits`, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-purple/20 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative p-12 glass-card border-none flex flex-col md:flex-row justify-between items-center gap-10 overflow-hidden">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] animate-pulse-slow" />

          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Cognitive Performance Analytics</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter leading-tight">
              Optimize Your <span className="text-gradient">Focus.</span><br />
              Master Your Time.
            </h1>
            <p className="text-gray-400 text-lg max-w-xl font-medium leading-relaxed">
              Welcome back to the command center. Our AI engines are primed to track your behavioral patterns and unlock peak performance levels.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/study" className="btn-primary px-10 py-4 text-lg">
                <Play className="w-5 h-5 fill-white" />
                Initialize Session
              </Link>
              <Link to="/lecture" className="btn-secondary px-10 py-4 text-lg">
                <Mic className="w-5 h-5" />
                Capture Lecture
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 blur-[60px] opacity-20" />
              <div className="w-48 h-48 rounded-[3rem] border-2 border-primary-500/30 flex flex-col items-center justify-center bg-dark-base relative overflow-hidden group-hover:border-primary-500/50 transition-colors">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-float" />
                <p className="text-6xl font-black text-white tracking-tighter">{stats.focusScore}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Global Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="premium-card p-8 group">
            <div className="card-gloss" />
            <div className="flex items-center justify-between mb-4">
              <div className={`p - 4 rounded - 2xl ${stat.bg} ${stat.color} transition - transform group - hover: scale - 110 duration - 500`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-700 group-hover:text-primary-500 transition-colors" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
              <span className="text-[10px] font-bold text-green-500">+12%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary-500" />
              Recent Trajectories
            </h2>
            <Link to="/analytics" className="text-xs font-black text-primary-400 uppercase tracking-widest hover:text-white transition-colors">
              Full Telemetry
            </Link>
          </div>
          <div className="premium-card overflow-hidden">
            <div className="divide-y divide-white/[0.05]">
              {recentSessions.length > 0 ? recentSessions.map((session, idx) => (
                <div key={idx} className="p-6 hover:bg-white/[0.02] transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                      {session.subject.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg group-hover:text-primary-400 transition-colors tracking-tight">{session.subject}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.duration}m duration
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <span className="text-xs text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-black text-white tracking-tighter">{session.focusScore}%</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Focus Efficiency</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No data yet</h3>
                  <p className="text-gray-500 mt-2 max-w-xs mx-auto">Complete your first study session to populate your performance trajectory.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <div className="premium-card p-8 bg-gradient-to-br from-primary-600/10 to-transparent border-primary-500/20 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-500/10 rounded-full blur-[40px]" />
            <h3 className="text-xl font-black text-white mb-4 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-400 fill-primary-400" />
              Active Objectives
            </h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed font-medium">
              You have <span className="text-primary-400 font-bold">2 high-priority</span> goals for this week.
            </p>
            <Link to="/planner" className="btn-primary w-full shadow-none group-hover:shadow-primary-500/20 group-hover:shadow-xl transition-all">
              System Planner
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="font-black text-white uppercase tracking-widest text-[10px] border-b border-white/5 pb-4">Unlocked Trophies</h3>
            <div className="space-y-4">
              {[
                { icon: '🚀', title: 'Sonic Focus', desc: 'Maintained 95% focus' },
                { icon: '🌙', title: 'Night Owl', desc: '3AM study master' },
                { icon: '📵', title: 'Mono Mode', desc: 'No phone for 4 hours' }
              ].map((t, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all duration-500 border border-white/5 group-hover:border-primary-500/30">
                    {t.icon}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white text-sm truncate">{t.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black truncate">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;