import React from 'react';
import { Navigate } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';

export default function ProtectedRoute({ children }) {
  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
