import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Clock, Eye, Phone, AlertCircle, Calendar } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'all'

  // Mock data for charts
  const focusScoreData = [
    { date: 'Mon', score: 85, studyTime: 120 },
    { date: 'Tue', score: 78, studyTime: 95 },
    { date: 'Wed', score: 92, studyTime: 140 },
    { date: 'Thu', score: 88, studyTime: 110 },
    { date: 'Fri', score: 75, studyTime: 85 },
    { date: 'Sat', score: 90, studyTime: 150 },
    { date: 'Sun', score: 82, studyTime: 100 }
  ];

  const hourlyFocusData = [
    { hour: '6 AM', focus: 65 },
    { hour: '7 AM', focus: 72 },
    { hour: '8 AM', focus: 78 },
    { hour: '9 AM', focus: 88 },
    { hour: '10 AM', focus: 92 },
    { hour: '11 AM', focus: 90 },
    { hour: '12 PM', focus: 75 },
    { hour: '1 PM', focus: 70 },
    { hour: '2 PM', focus: 68 },
    { hour: '3 PM', focus: 82 },
    { hour: '4 PM', focus: 85 },
    { hour: '5 PM', focus: 78 },
    { hour: '6 PM', focus: 72 },
    { hour: '7 PM', focus: 68 },
    { hour: '8 PM', focus: 65 },
    { hour: '9 PM', focus: 60 }
  ];

  const behaviorData = [
    { metric: 'Sustained Focus', value: 85 },
    { metric: 'Quick Recovery', value: 72 },
    { metric: 'Distraction Resistance', value: 68 },
    { metric: 'Digital Discipline', value: 78 },
    { metric: 'Eye Strain Management', value: 82 }
  ];

  const distractionBreakdown = [
    { type: 'Phone', count: 12, avgDuration: 8 },
    { type: 'Looking Away', count: 28, avgDuration: 15 },
    { type: 'Tab Switching', count: 45, avgDuration: 5 },
    { type: 'Away from Desk', count: 8, avgDuration: 120 }
  ];

  const subjectPerformance = [
    { subject: 'Quantum Mechanics', focusScore: 92, sessions: 8, totalTime: 480 },
    { subject: 'Linear Algebra', focusScore: 78, sessions: 6, totalTime: 360 },
    { subject: 'Computer Architecture', focusScore: 85, sessions: 5, totalTime: 300 },
    { subject: 'Data Structures', focusScore: 88, sessions: 7, totalTime: 420 }
  ];

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Deep insights into your learning behavior and patterns</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Focus Score</p>
                <p className="text-2xl font-bold text-gray-900">84%</p>
              </div>
            </div>
            <p className="text-xs text-green-600">↑ 6% from last week</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900">20.7h</p>
              </div>
            </div>
            <p className="text-xs text-green-600">↑ 2.3h from last week</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Distractions</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
            <p className="text-xs text-green-600">↓ 45% from last week</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Peak Focus Time</p>
                <p className="text-lg font-bold text-gray-900">9-11 AM</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">Your best hours</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Focus Score Trend */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Focus Score Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={focusScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Focus Score"
                  dot={{ fill: '#0ea5e9', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Study Time Distribution */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Study Time Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={focusScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="studyTime" fill="#10b981" name="Minutes" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circadian Rhythm Analysis */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Circadian Rhythm Mapping</h3>
              <p className="text-sm text-gray-600">Your focus performance throughout the day</p>
            </div>
            <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">Peak: 9:00 AM - 11:00 AM</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyFocusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="focus"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Focus Level"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900">
              <strong>💡 Insight:</strong> You focus 22% better between 9:00 AM and 11:00 AM than during evening hours.
              Consider scheduling your most challenging subjects during this peak window.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Behavior Radar Chart */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Behavioral Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={behaviorData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Distraction Analysis */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Distraction Breakdown</h3>
            <div className="space-y-4">
              {distractionBreakdown.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.type}</span>
                    <span className="text-sm text-gray-600">{item.count} occurrences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(item.count / 50) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">Avg: {item.avgDuration}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Subject Performance Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Focus Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Sessions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subjectPerformance.map((subject, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{subject.subject}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-primary-500"
                            style={{ width: `${subject.focusScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{subject.focusScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{subject.sessions}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {Math.floor(subject.totalTime / 60)}h {subject.totalTime % 60}m
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-green-600 font-medium">↑ Improving</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-2 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-primary-50 border-primary-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Eye Strain Alert</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Your blink rate decreased by 35% during long sessions. Consider using the 20-20-20 rule: 
                  Every 20 minutes, look at something 20 feet away for 20 seconds.
                </p>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Set Reminders →
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Optimal Study Schedule</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Based on your circadian rhythm data, schedule Quantum Mechanics (your hardest subject) 
                  between 9-11 AM for 26% better retention.
                </p>
                <button className="text-sm font-medium text-green-600 hover:text-green-700">
                  Update Planner →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;