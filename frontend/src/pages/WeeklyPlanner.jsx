import React, { useState } from 'react';
import { Plus, Check, X, Clock, Target, TrendingUp } from 'lucide-react';

const WeeklyPlanner = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      subject: 'Quantum Mechanics',
      target: 'Study Chapter 5-6',
      hours: 8,
      priority: 'high',
      completed: false,
      sessionsCompleted: 2,
      totalSessions: 4
    },
    {
      id: 2,
      subject: 'Linear Algebra',
      target: 'Complete problem set 4',
      hours: 4,
      priority: 'medium',
      completed: false,
      sessionsCompleted: 1,
      totalSessions: 2
    },
    {
      id: 3,
      subject: 'Computer Architecture',
      target: 'Watch lecture recordings',
      hours: 3,
      priority: 'low',
      completed: true,
      sessionsCompleted: 2,
      totalSessions: 2
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    subject: '',
    target: '',
    hours: 0,
    priority: 'medium'
  });

  const [weeklyCommitment, setWeeklyCommitment] = useState({
    targetHours: 25,
    completedHours: 15,
    remainingDays: 3
  });

  const addGoal = () => {
    if (newGoal.subject && newGoal.target && newGoal.hours > 0) {
      setGoals([
        ...goals,
        {
          id: Date.now(),
          ...newGoal,
          completed: false,
          sessionsCompleted: 0,
          totalSessions: Math.ceil(newGoal.hours / 2) // Assume 2-hour sessions
        }
      ]);
      setNewGoal({ subject: '', target: '', hours: 0, priority: 'medium' });
      setShowAddGoal(false);
    }
  };

  const toggleGoalComplete = (id) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const completionPercentage = (weeklyCommitment.completedHours / weeklyCommitment.targetHours) * 100;

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Planner</h1>
          <p className="text-gray-600">Set your study goals and track your weekly commitment</p>
        </div>

        {/* Weekly Progress */}
        <div className="card mb-8 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">This Week's Commitment</h2>
              <p className="text-sm text-gray-600 mt-1">
                {weeklyCommitment.remainingDays} days remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-3xl font-bold text-primary-600">
                {Math.round(completionPercentage)}%
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="h-4 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {weeklyCommitment.completedHours}h / {weeklyCommitment.targetHours}h completed
            </span>
            <span className="text-gray-700">
              {weeklyCommitment.targetHours - weeklyCommitment.completedHours}h remaining
            </span>
          </div>

          {completionPercentage >= 80 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium">
                🎉 Great progress! You're on track to meet your weekly goal!
              </p>
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Study Goals</h2>
            <button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>

          {/* Add Goal Form */}
          {showAddGoal && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">New Study Goal</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newGoal.subject}
                    onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Quantum Mechanics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Hours
                  </label>
                  <input
                    type="number"
                    value={newGoal.hours}
                    onChange={(e) => setNewGoal({ ...newGoal, hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Description
                </label>
                <input
                  type="text"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Complete Chapter 5 and practice problems"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewGoal({ ...newGoal, priority })}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        newGoal.priority === priority
                          ? getPriorityColor(priority)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={addGoal} className="btn-primary">
                  Add Goal
                </button>
                <button
                  onClick={() => {
                    setShowAddGoal(false);
                    setNewGoal({ subject: '', target: '', hours: 0, priority: 'medium' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No goals set yet. Add your first study goal!</p>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    goal.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleGoalComplete(goal.id)}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                          goal.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        {goal.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {goal.subject}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(goal.priority)}`}>
                            {goal.priority}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${goal.completed ? 'text-gray-500' : 'text-gray-600'}`}>
                          {goal.target}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{goal.hours}h target</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{goal.sessionsCompleted}/{goal.totalSessions} sessions</span>
                          </div>
                        </div>
                        
                        {!goal.completed && goal.sessionsCompleted > 0 && (
                          <div className="mt-3">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 transition-all"
                                style={{ width: `${(goal.sessionsCompleted / goal.totalSessions) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="ml-4 p-1 text-gray-400 hover:text-red-600 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Behavioral Contract */}
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Behavioral Contract</h3>
              <p className="text-sm text-gray-700">
                Commit to your weekly goals to prevent productive procrastination. 
                Each study session must be linked to a specific goal.
              </p>
            </div>
          </div>
          
          <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-700 mb-3">
              <strong>My commitment:</strong> I will dedicate {weeklyCommitment.targetHours} hours this week 
              to achieve the goals listed above. Each study session will focus on one specific goal 
              to ensure meaningful progress.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <Check className="w-4 h-4" />
              <span>Contract active for this week</span>
            </div>
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Study Tip</h3>
            <p className="text-sm text-gray-700">
              Break your {weeklyCommitment.targetHours}h goal into {Math.ceil(weeklyCommitment.targetHours / 2)}-hour sessions. 
              Research shows 90-120 minute blocks maximize retention.
            </p>
          </div>
          
          <div className="card bg-green-50 border-green-200">
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Optimal Schedule</h3>
            <p className="text-sm text-gray-700">
              Based on your analytics, schedule high-priority goals during your peak focus hours 
              (9:00 AM - 11:00 AM) for better results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;