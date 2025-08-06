import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import TeacherLoginPage from './pages/TeacherLoginPage';
import DashboardPage from './pages/DashboardPage'; // 이게 핵심!

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TeacherLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <>
              <Header />
              <DashboardPage />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
