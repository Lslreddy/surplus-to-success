
import React, { createContext, useState, useContext, useEffect } from 'react';

type UserRole = 'donor' | 'ngo' | 'volunteer' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('plateShareUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // For this demo, we'll simulate authentication with localStorage
  // In a real app, you would connect to a backend service
  const login = async (email: string, password: string) => {
    // Simulate API request with timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This is a mock authentication - would be replaced with actual backend call
    if (email && password) {
      // Mock user data
      const mockUser = {
        id: '1',
        name: email.split('@')[0],
        email,
        role: email.includes('donor') ? 'donor' : 
              email.includes('ngo') ? 'ngo' : 
              email.includes('volunteer') ? 'volunteer' : 'donor',
      } as User;
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('plateShareUser', JSON.stringify(mockUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API request with timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This is a mock registration - would be replaced with actual backend call
    if (name && email && password && role) {
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
        role,
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('plateShareUser', JSON.stringify(mockUser));
    } else {
      throw new Error('Please complete all fields');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('plateShareUser');
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
