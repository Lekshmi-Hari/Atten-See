import React, { useState } from 'react';
import { User, Bell, Eye, Database, Shield, Trash2, Download } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Notifications
    focusReminders: true,
    breakReminders: true,
    phoneAlerts: true,
    weeklyReports: true,
    achievementNotifs: true,
    
    // Privacy
    saveFocusData: true,
    shareAnonymousData: false,
    
    // Focus Detection
    gazeThreshold: 15,
    phoneConfidenceThreshold: 60,
    awayTimeout: 10,
    distractionTimeout: 5,
    
    // Study Sessions
    defaultSessionLength: 90,
    breakInterval: 25,
    breakDuration: 5,
  });

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const exportData = () => {
    // Simulate data export
    const data = {
      sessions: [],
      analytics: {},
      goals: [],
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attensee-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      // Clear data from Firebase/localStorage
      console.log('Clearing all data...');
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your AttenSee experience</p>
        </div>

        {/* Profile Section */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              JS
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  defaultValue="John Student"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="john.student@university.edu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Focus Reminders</p>
                <p className="text-sm text-gray-600">Get notified when you lose focus</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.focusReminders}
                  onChange={(e) => updateSetting('focusReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Break Reminders</p>
                <p className="text-sm text-gray-600">20-20-20 rule notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.breakReminders}
                  onChange={(e) => updateSetting('breakReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Phone Alerts</p>
                <p className="text-sm text-gray-600">Alert when phone is detected</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.phoneAlerts}
                  onChange={(e) => updateSetting('phoneAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Weekly Reports</p>
                <p className="text-sm text-gray-600">Receive weekly analytics summary</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => updateSetting('weeklyReports', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Achievement Notifications</p>
                <p className="text-sm text-gray-600">Get notified about unlocked achievements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.achievementNotifs}
                  onChange={(e) => updateSetting('achievementNotifs', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Focus Detection Settings */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Focus Detection</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900">Gaze Threshold (degrees)</label>
                <span className="text-sm text-gray-600">{settings.gazeThreshold}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={settings.gazeThreshold}
                onChange={(e) => updateSetting('gazeThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">Head rotation tolerance for focused state</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900">Phone Detection Confidence</label>
                <span className="text-sm text-gray-600">{settings.phoneConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={settings.phoneConfidenceThreshold}
                onChange={(e) => updateSetting('phoneConfidenceThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum confidence to trigger phone alert</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900">Away Timeout (seconds)</label>
                <span className="text-sm text-gray-600">{settings.awayTimeout}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.awayTimeout}
                onChange={(e) => updateSetting('awayTimeout', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">Time before marking as "away"</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-gray-900">Distraction Timeout (seconds)</label>
                <span className="text-sm text-gray-600">{settings.distractionTimeout}s</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                value={settings.distractionTimeout}
                onChange={(e) => updateSetting('distractionTimeout', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-xs text-gray-500 mt-1">Time before marking as "distracted"</p>
            </div>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Privacy & Data</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Save Focus Data</p>
                <p className="text-sm text-gray-600">Store analytics and session history</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.saveFocusData}
                  onChange={(e) => updateSetting('saveFocusData', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Share Anonymous Analytics</p>
                <p className="text-sm text-gray-600">Help improve AttenSee</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shareAnonymousData}
                  onChange={(e) => updateSetting('shareAnonymousData', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🔒 Privacy Guarantee</h3>
            <p className="text-sm text-blue-800">
              All video processing happens locally in your browser. No webcam footage is ever uploaded or stored. 
              Only numerical focus metrics are saved.
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={exportData}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Export All Data</p>
                  <p className="text-sm text-gray-600">Download your complete data as JSON</p>
                </div>
              </div>
              <span className="text-primary-600 font-medium">Export →</span>
            </button>

            <button
              onClick={clearAllData}
              className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition border border-red-200"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium text-red-900">Delete All Data</p>
                  <p className="text-sm text-red-700">Permanently remove all sessions and analytics</p>
                </div>
              </div>
              <span className="text-red-600 font-medium">Delete →</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="btn-primary px-8">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;