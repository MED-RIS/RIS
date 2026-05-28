import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RisWorklistPanel from './RisWorklist/RisWorklist';
import LoginForm from './auth/Login';

const ProtectedRoute = ({ children }) => {
  const localStr = localStorage.getItem('usuario');
  const session = localStr ? JSON.parse(localStr) : null;
  const authSessionStr = localStorage.getItem('authSession');
  const authSession = authSessionStr ? JSON.parse(authSessionStr) : null;

  if (!session || !session.token) {
    return <Navigate to="/login" replace />;
  }

  // Enforce session expiration check (24 hours)
  if (authSession && authSession.expiresAt && Date.now() > authSession.expiresAt) {
    localStorage.removeItem('usuario');
    localStorage.removeItem('authSession');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const mockServicesManager = {};

  return (
    <div className="w-full h-screen bg-black">
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <RisWorklistPanel servicesManager={mockServicesManager} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
