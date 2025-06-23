import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and role on mount and when dependencies change
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      console.log('User role not allowed, redirecting to unauthorized');
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but role check is pending, show nothing
  if (!user) {
    return null;
  }

  // If user's role is not allowed, they will be redirected by the useEffect
  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 