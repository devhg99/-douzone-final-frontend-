import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import TeacherLoginPage from './components/TeacherLoginPage';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 기본 경로는 로그인으로 리다이렉트 */}
          <Route path="/" element={<TeacherLoginPage />} />
          
          {/* 대시보드 경로 */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 404 처리 - 존재하지 않는 경로는 로그인으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;