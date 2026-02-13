import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Mic, BarChart3, Calendar, TrendingUp, Award, Target, Clock } from 'lucide-react';

const Dashboard = () => {
  const [todayStats, setTodayStats] = useState({
    focusScore: 87,
    studyTime: 185, // minutes
    sessionsCompleted: 3,
    peakFocusTime: '9:00 AM - 11:00 AM'
  });

  const [weekStats, setWeekStats] = useState({
    totalStudyTime: 1240,
    avgFocusScore: 84,
    phoneDetections: 12,
    deepWorkSessions: 8
  });

  const [recentSessions] = useState([
    {
      id: 1,
      subject: 'Quantum Mechanics',
      duration: 75,
      focusScore: 92,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      subject: 'Linear Algebra',
      duration: 60,
      focusScore: 78,
      date: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: 3,
      subject: 'Computer Architecture',
      duration: 50,
      focusScore: 85,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const [achievements] = useState([
    { id: 1, title: 'Deep Diver', description: '2 hours continuous focus', icon: '🏊', unlocked: true },
    { id: 2, title: 'Phone-Free Week', description: 'No phone distractions for 7 days', icon: '📵', unlocked: false },
    { id: 3, title: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', unlocked: true },
    { id: 4, title: 'Early Bird', description: 'Study before 7 AM', icon: '🐦', unlocked: true }
  ]);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600">Here's your learning progress today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Focus Score</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.focusScore}%</p>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                style={{ width: `${todayStats.focusScore}%` }}
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(todayStats.studyTime)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Today's total</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.sessionsCompleted}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Completed today</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Peak Hours</p>
                <p className="text-sm font-bold text-gray-900">{todayStats.peakFocusTime}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Your best time</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="col-span-2 card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/study"
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center mb-4 transition">
                  <Play className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Start Study Session</h3>
                <p className="text-sm text-gray-600">Begin AI-powered focus tracking</p>
              </Link>

              <Link
                to="/lecture"
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center mb-4 transition">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Process Lecture</h3>
                <p className="text-sm text-gray-600">Transcribe and generate notes</p>
              </Link>

              <Link
                to="/analytics"
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center mb-4 transition">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
                <p className="text-sm text-gray-600">Analyze your study patterns</p>
              </Link>

              <Link
                to="/planner"
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center mb-4 transition">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Weekly Planner</h3>
                <p className="text-sm text-gray-600">Plan your study goals</p>
              </Link>
            </div>
          </div>

          {/* Week Overview */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">This Week</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(weekStats.totalStudyTime)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Avg Focus Score</p>
                <p className="text-2xl font-bold text-primary-600">{weekStats.avgFocusScore}%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Deep Work Sessions</p>
                <p className="text-2xl font-bold text-green-600">{weekStats.deepWorkSessions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sessions</h2>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{session.subject}</h3>
                    <span className="text-xs text-gray-500">{formatRelativeTime(session.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{formatDuration(session.duration)}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500"
                          style={{ width: `${session.focusScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{session.focusScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    achievement.unlocked
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{achievement.title}</h3>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insight Banner */}
        <div className="mt-6 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">💡 Today's Insight</h3>
          <p className="text-sm opacity-90">
            You focus 22% better between 9:00 AM and 11:00 AM than at night. 
            Consider scheduling your most challenging subjects during this time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;