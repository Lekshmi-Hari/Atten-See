import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Brain, Mic, BarChart3, Calendar, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Brain, label: 'Dashboard' },
    { path: '/study', icon: Eye, label: 'Study Mode' },
    { path: '/lecture', icon: Mic, label: 'Lecture' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/planner', icon: Calendar, label: 'Planner' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AttenSee</h1>
              <p className="text-xs text-gray-500">Master your attention</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900">Focus Score</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">87%</p>
            <p className="text-xs text-gray-600 mt-2">This week's average</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;