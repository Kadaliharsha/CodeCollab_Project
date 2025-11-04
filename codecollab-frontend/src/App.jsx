import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import { getToken } from './utils/auth';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/auth" replace />;
  // const authToken = localStorage.getItem('authToken');
  // return authToken ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Routes>
        {/* Make homepage public so users can see landing/home even when not authenticated */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route 
          path="/room/:roomId" 
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          } 
        />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
