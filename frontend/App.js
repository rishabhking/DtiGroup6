import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProblemsPage from './pages/ProblemsPage';

function App() {
  return (
    <BrowserRouter basename="http://localhost:8080">
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/problems" />} />
            <Route path="/problems/*" element={<ProblemsPage />} />
            <Route path="*" element={<Navigate to="/problems" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
