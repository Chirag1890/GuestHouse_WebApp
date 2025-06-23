import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiLogin({ email, password });
      localStorage.setItem('token', response.token);
      
      // Create user object from login response
      const userData: User = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(response.role === UserRole.ADMIN);
      return userData;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      const newUser = await apiRegister(userData as any);
      setUser(newUser);
      setIsAuthenticated(true);
      setIsAdmin(newUser.role === UserRole.ADMIN);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn('Logout API call failed, but continuing with local cleanup');
    }
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setIsAdmin(updatedUser.role === UserRole.ADMIN);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role-based access control hook
export const useRequireRole = (allowedRoles: string[]) => {
  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user && !allowedRoles.includes(user.role)) {
      // Redirect to unauthorized page or show error
      window.location.href = '/unauthorized';
    }
  }, [isAuthenticated, user, allowedRoles]);

  return { user, isAuthenticated };
}; 