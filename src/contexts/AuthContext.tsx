import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'patient' | 'admin' | 'nurse';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  hasSchedulingAccess: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const mockUsers: Record<string, { password: string; user: User }> = {
  'maria.garcia@hospital.com': {
    password: '123456',
    user: {
      id: '1',
      name: 'María García',
      email: 'maria.garcia@hospital.com',
      role: 'doctor'
    }
  },
  'juan.perez@hospital.com': {
    password: '123456',
    user: {
      id: '2',
      name: 'Juan Pérez',
      email: 'juan.perez@hospital.com',
      role: 'patient'
    }
  },
  'ana.lopez@hospital.com': {
    password: '123456',
    user: {
      id: '3',
      name: 'Ana López',
      email: 'ana.lopez@hospital.com',
      role: 'patient'
    }
  }
};

const rolesWithSchedulingAccess = ['doctor', 'admin', 'nurse', 'patient'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const hasSchedulingAccess = user ? rolesWithSchedulingAccess.includes(user.role) : false;

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = mockUsers[email];
    
    if (!mockUser || mockUser.password !== password) {
      setError('Credenciales inválidas. Por favor, verifique su email y contraseña.');
      return;
    }
    
    setUser(mockUser.user);
  };

  const logout = (): void => {
    setUser(null);
    setError(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    hasSchedulingAccess,
    error,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};