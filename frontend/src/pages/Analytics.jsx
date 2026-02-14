import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Calendar, Clock, Zap, Target, Activity, ArrowUpRight, ChevronRight, BarChart3, Filter, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { sessionService } from '../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await sessionService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Analytics Telemetry Link Failed');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-[600px] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
    </div>
  );

  // Filter and process data based on timeRange (mocked for demo)
  const chartData = [
    { name: 'Mon', score: 85, time: 120 },
    { name: 'Tue', score: 72, time: 240 },
    { name: 'Wed', score: 91, time: 180 },
    { name: 'Thu', score: 65, time: 300 },
    { name: 'Fri', score: 88, time: 150 },
    { name: 'Sat', score: 95, time: 90 },
    { name: 'Sun', score: 82, time: 60 },
  ];

  const radarData = [
    { subject: 'Visual Focus', A: 120, fullMark: 150 },
    { subject: 'Attention Span', A: 98, fullMark: 150 },
    { subject: 'Retention', A: 86, fullMark: 150 },
    { subject: 'Consistency', A: 99, fullMark: 150 },
    { subject: 'Resistance', A: 85, fullMark: 150 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card !rounded-2xl p-4 border-white/10 bg-black/80 shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">{label}</p>
          <p className="text-xl font-black text-white">{payload[0].value}% Focus</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Global Performance Synthesis</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter"> Focus <span className="text-primary-500">Analytics</span></h1>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl backdrop-blur-md">
          {['WEEK', 'MONTH', 'ANNUAL'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r.toLowerCase())}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${timeRange === r.toLowerCase() ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Neural Efficiency', value: `${Math.round(stats?.avgFocusScore || 0)}%`, icon: Zap, color: 'text-primary-400', delta: '+4%' },
          { label: 'Intercept Time', value: `${Math.round((stats?.totalStudyTime || 0) / 60)}h`, icon: Clock, color: 'text-accent-purple', delta: '+12h' },
          { label: 'Breach Resistance', value: 'ULTRA', icon: ShieldCheck, color: 'text-green-400', delta: 'STABLE' },
          { label: 'Cognitive Load', value: '4.2', icon: Activity, color: 'text-accent-pink', delta: '-0.8' }
        ].map((m, i) => (
          <div key={i} className="premium-card p-8 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl bg-white/[0.03] ${m.color} group-hover:bg-primary-500/10 transition-colors`}>
                <m.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{m.delta}</span>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{m.label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{m.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Temporal Trajectory */}
        <div className="lg:col-span-8 premium-card !p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary-400" />
              Temporal Flow Trajectory
            </h3>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Efficiency Index by Cycle</p>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cognitive Balance Radar */}
        <div className="lg:col-span-4 premium-card !p-10 flex flex-col items-center justify-between">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-10">Sensory Signal Balance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 8, fontWeight: 900 }} />
                <Radar
                  name="Balance"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  animationDuration={2000}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4 w-full">
            <div className="glass-card !rounded-2xl p-4 flex justify-between items-center border-white/5 bg-white/[0.02]">
              <span className="text-[10px] font-black text-gray-500 uppercase">Focus Consistency</span>
              <span className="text-sm font-black text-white">OPTIMIZED</span>
            </div>
            <div className="glass-card !rounded-2xl p-4 flex justify-between items-center border-white/5 bg-white/[0.02]">
              <span className="text-[10px] font-black text-gray-500 uppercase">Input Retention</span>
              <span className="text-sm font-black text-primary-400">89%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Insight Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="premium-card !p-10 space-y-8">
          <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent-purple" />
            Neural Load Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                <Bar
                  dataKey="time"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card !p-10 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <ShieldCheck className="w-12 h-12 text-primary-500/20" />
          </div>
          <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em] mb-4">Core Observation</p>
          <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-6">
            Systemic Growth <br />
            Detected in <span className="text-gradient">Sector 7.</span>
          </h3>
          <p className="text-gray-500 text-lg font-medium max-w-md leading-relaxed">
            Your focus patterns indicate a 14% increase in deep work endurance compared to the previous cycle. Recommend shifting high-intensity tasks to the morning window.
          </p>
          <div className="mt-10 flex gap-4">
            <button className="btn-primary py-4 px-10">View Recovery Strategy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;