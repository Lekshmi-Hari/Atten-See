import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Monitor, CreditCard, LogOut, Trash2, ShieldCheck, Zap, Activity, Cloud, Save, ChevronRight, Sparkles } from 'lucide-react';

const Settings = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@nexus.system' });

  const settingSections = [
    {
      title: 'Neural Identity',
      icon: User,
      items: [
        { label: 'Profile Parameters', description: 'Modify your designation and biometric ID.', icon: Activity },
        { label: 'Cloud Synchronization', description: 'Manage sector data persistence.', icon: Cloud }
      ]
    },
    {
      title: 'Telemetry Alerts',
      icon: Bell,
      items: [
        { label: 'Neural Feed Notifications', description: 'Real-time focus breach warnings.', icon: Zap },
        { label: 'Synthesis Reports', description: 'Weekly performance trajectory summaries.', icon: Sparkles }
      ]
    },
    {
      title: 'System Security',
      icon: Shield,
      items: [
        { label: 'Sensor Permissions', description: 'Neural feed and biometric access.', icon: ShieldCheck },
        { label: 'Access Protocol', description: 'Update security keys and overrides.', icon: Shield }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">System Configuration Lab</p>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter"> Core <span className="text-primary-500">Parameters</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Synthesis Side */}
        <div className="lg:col-span-4 space-y-8">
          <div className="premium-card !p-10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-full h-full bg-dark-base border-2 border-primary-500/30 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white group-hover:border-primary-500 transition-colors uppercase">
                  {user.name.charAt(0)}
                </div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{user.name}</h3>
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mt-1 mb-8">Verified Scholar Node</p>
              <button className="btn-primary w-full py-4 text-xs tracking-widest uppercase">
                Modify Biometrics
              </button>
            </div>
          </div>

          <div className="glass-card p-10 space-y-6">
            <h4 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] mb-4">Termination Sector</h4>
            <button className="flex items-center gap-4 w-full p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all border border-red-500/10 group">
              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest">Terminate Account</span>
            </button>
          </div>
        </div>

        {/* Configurations Side */}
        <div className="lg:col-span-8 space-y-8">
          {settingSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <Icon className="w-5 h-5 text-gray-700" />
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em]">{section.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, i) => (
                    <button key={i} className="premium-card !p-8 text-left hover:bg-white/[0.03] transition-all flex flex-col justify-between group h-48">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-primary-500/10 group-hover:border-primary-500/20 transition-all">
                          <item.icon className="w-5 h-5 text-gray-500 group-hover:text-primary-400" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight mb-1 group-hover:text-primary-400 transition-colors uppercase">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="btn-primary flex items-center gap-3 px-10 py-5 rounded-3xl shadow-2xl shadow-primary-500/40">
          <Save className="w-6 h-6" />
          <span className="text-lg tracking-tighter">COMMIT CHANGES</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;