import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTrainerAuth } from '../context/TrainerAuthContext';

export default function TrainerProtectedRoute({ children }) {
  const { isTrainerAuthenticated, loading } = useTrainerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(0, 184, 74, 0.2)',
            borderTopColor: '#00C952',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
            marginBottom: '16px',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 600 }}>
          Authenticating Trainer Portal...
        </p>
      </div>
    );
  }

  if (!isTrainerAuthenticated) {
    return <Navigate to="/trainer-login" state={{ from: location }} replace />;
  }

  return children;
}
