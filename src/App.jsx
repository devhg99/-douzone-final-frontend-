import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import TeacherLoginPage from './pages/TeacherLoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendancePage from './pages/AttendancePage';
import GradesPage from './pages/GradesPage';
import ReportsPage from './pages/ReportsPage';
import BehaviorPage from './pages/BehaviorPage';
import CounselingPage from './pages/CounselingPage';
import LetterPage from './pages/LetterPage';
import SchedulePage from './pages/SchedulePage';
import EventsPage from './pages/EventsPage';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TeacherLoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttendancePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <Layout>
                  <GradesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/behavior"
            element={
              <ProtectedRoute>
                <Layout>
                  <BehaviorPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/counseling"
            element={
              <ProtectedRoute>
                <Layout>
                  <CounselingPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/letter"
            element={
              <ProtectedRoute>
                <Layout>
                  <LetterPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Layout>
                  <SchedulePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Layout>
                  <EventsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
