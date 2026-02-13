import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudyMode from './pages/StudyMode';
import LectureProcessor from './pages/LectureProcessor';
import Analytics from './pages/Analytics';
import WeeklyPlanner from './pages/WeeklyPlanner';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/study" element={<StudyMode />} />
          <Route path="/lecture" element={<LectureProcessor />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/planner" element={<WeeklyPlanner />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;