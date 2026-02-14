import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Clock, Target, TrendingUp, Loader2 } from 'lucide-react';
import { goalService } from '../services/api';

const WeeklyPlanner = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    subject: '',
    target: '',
    hours: 0,
    priority: 'medium'
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await goalService.getAll();
        setGoals(data);
      } catch (err) {
        console.error('Error fetching goals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const addGoal = async () => {
    if (!newGoal.subject || !newGoal.target || newGoal.hours <= 0) {
      alert('Please fill in all fields correctly');
      return;
    }
    
    try {
      console.log('📝 Adding goal:', newGoal);
      const totalSessions = Math.ceil(newGoal.hours / 2);
      const goalData = {
        ...newGoal,
        totalSessions
      };
      console.log('Sending to API:', goalData);
      
      const createdGoal = await goalService.create(goalData);
      console.log('✅ Goal created:', createdGoal);
      
      setGoals([...goals, createdGoal]);
      setNewGoal({ subject: '', target: '', hours: 0, priority: 'medium' });
      setShowAddGoal(false);
    } catch (err) {
      console.error('❌ Error adding goal:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (err.response?.data?.message) {
        alert(`Failed to add goal: ${err.response.data.message}`);
      } else {
        alert('Failed to add goal. Check console for details.');
      }
    }
  };

  const toggleGoalComplete = async (goal) => {
    try {
      const updatedGoal = await goalService.update(goal._id, {
        completed: !goal.completed,
        completedSessions: !goal.completed ? (goal.completedSessions || 0) + 1 : Math.max(0, (goal.completedSessions || 1) - 1),
        progress: !goal.completed ? 100 : 0
      });
      setGoals(goals.map(g => g._id === goal._id ? updatedGoal : g));
      // Update weekly stats
      const totalCompleted = goals.reduce((acc, g) => acc + (g._id === goal._id ? (!goal.completed ? 1 : 0) : (g.completedSessions || 0)), 0);
      setWeeklyCommitment(prev => ({
        ...prev,
        completedHours: totalCompleted * 2
      }));
    } catch (err) {
      console.error('Error updating goal:', err);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.delete(id);
        setGoals(goals.filter(goal => goal._id !== id));
      } catch (err) {
        console.error('Error deleting goal:', err);
      }
    }
  };

  const [weeklyCommitment, setWeeklyCommitment] = useState({
    targetHours: 25,
    completedHours: 15,
    remainingDays: 3
  });



  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-white/10 text-gray-300 border-white/20';
    }
  };

  const completionPercentage = (weeklyCommitment.completedHours / weeklyCommitment.targetHours) * 100;

  return (
    <div className="h-full overflow-auto bg-dark-base">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Weekly <span className="text-primary-400">Commitment</span></h1>
          <p className="text-gray-400">Set your study goals and track your weekly progress</p>
        </div>

        {/* Weekly Progress */}
        <div className="card mb-8 bg-gradient-to-br from-primary-600/10 to-transparent border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">This Week's Target</h2>
              <p className="text-sm text-gray-400 mt-2">
                {weeklyCommitment.remainingDays} days remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Progress</p>
              <p className="text-5xl font-black text-primary-400">
                {Math.round(completionPercentage)}%
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-primary-300 font-semibold">
              {weeklyCommitment.completedHours}h / {weeklyCommitment.targetHours}h completed
            </span>
            <span className="text-gray-400">
              {weeklyCommitment.targetHours - weeklyCommitment.completedHours}h remaining
            </span>
          </div>

          {completionPercentage >= 80 && (
            <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-300 font-semibold">
                🎉 Great progress! You're on track to meet your weekly goal!
              </p>
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Study Goals</h2>
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
            <div className="mb-6 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="font-black text-white mb-6 text-lg tracking-tight">New Study Goal</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newGoal.subject}
                    onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="e.g., Quantum Mechanics"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                    Target Hours
                  </label>
                  <input
                    type="number"
                    value={newGoal.hours}
                    onChange={(e) => setNewGoal({ ...newGoal, hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                  Goal Description
                </label>
                <input
                  type="text"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="e.g., Complete Chapter 5 and practice problems"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                  Priority
                </label>
                <div className="flex gap-3">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewGoal({ ...newGoal, priority })}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                        newGoal.priority === priority
                          ? priority === 'high'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={addGoal} className="btn-primary px-6 py-3 text-xs font-black uppercase tracking-widest">
                  Add Goal
                </button>
                <button
                  onClick={() => {
                    setShowAddGoal(false);
                    setNewGoal({ subject: '', target: '', hours: 0, priority: 'medium' });
                  }}
                  className="btn-secondary px-6 py-3 text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-16">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No goals set yet. Add your first study goal!</p>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal._id}
                  className={`p-5 rounded-2xl border-2 transition ${
                    goal.completed
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:border-primary-400/50'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => toggleGoalComplete(goal)}
                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                          goal.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-primary-400/50 hover:border-primary-400'
                          }`}
                      >
                        {goal.completed && <Check className="w-4 h-4 text-white" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-bold text-lg ${
                            goal.completed ? 'text-gray-500 line-through' : 'text-white'
                            }`}>
                            {goal.subject}
                          </h3>
                          <span className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${getPriorityColor(goal.priority)}`}>
                            {goal.priority}
                          </span>
                        </div>
                        <p className={`text-sm mb-4 ${
                          goal.completed ? 'text-gray-600' : 'text-gray-300'
                          }`}>
                          {goal.target}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary-400" />
                            <span>{goal.hours}h target</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary-400" />
                            <span>{goal.sessionsCompleted}/{goal.totalSessions} sessions</span>
                          </div>
                        </div>

                        {!goal.completed && goal.sessionsCompleted > 0 && (
                          <div className="mt-4">
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                              <div
                                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all"
                                style={{ width: `${(goal.sessionsCompleted / goal.totalSessions) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="ml-4 p-2 text-gray-600 hover:text-red-400 transition hover:bg-red-500/10 rounded-lg"
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
        <div className="card p-8 bg-gradient-to-br from-accent-purple/10 to-primary-500/5 border border-accent-purple/20">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-accent-purple/20 rounded-xl flex items-center justify-center text-accent-purple">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight mb-2">Behavioral Contract</h3>
              <p className="text-sm text-gray-400">
                Commit to your weekly goals to prevent procrastination. Each study session must be linked to a specific goal.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              <span className="font-bold text-primary-300">My commitment:</span> I will dedicate <span className="text-primary-300 font-black">{weeklyCommitment.targetHours} hours</span> this week
              to achieve the goals listed above. Each study session will focus on one specific goal
              to ensure meaningful progress.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-300 font-semibold">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
              <span>Contract active for this week</span>
            </div>
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <h3 className="font-black text-white mb-3 text-lg">💡 Study Tip</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Break your <span className="text-primary-300 font-bold">{weeklyCommitment.targetHours}h</span> goal into <span className="text-primary-300 font-bold">{Math.ceil(weeklyCommitment.targetHours / 2)}-hour</span> sessions.
              Research shows 90-120 minute blocks maximize retention.
            </p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
            <h3 className="font-black text-white mb-3 text-lg">🎯 Optimal Schedule</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Based on your analytics, schedule high-priority goals during your peak focus hours
              <span className="text-primary-300 font-bold">(9:00 AM - 11:00 AM)</span> for better results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;