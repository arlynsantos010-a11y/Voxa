
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UserRole } from '@/app/page';

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: UserRole | null;
  username: string | null;
  theme: 'light' | 'dark';
  enrolledLanguages: string[];
  selectedLanguage: string | null;
  onLogin: (role: UserRole, username: string, languages?: string[]) => void;
  onLogout: () => void;
  toggleTheme: () => void;
  setSelectedLanguage: (lang: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [enrolledLanguages, setEnrolledLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const handleLogin = (role: UserRole, name: string, languages: string[] = []) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUsername(name);
    setEnrolledLanguages(languages);
    // Si solo tiene uno, seleccionarlo por defecto
    if (languages.length === 1) {
      setSelectedLanguage(languages[0]);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUsername(null);
    setEnrolledLanguages([]);
    setSelectedLanguage(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    isLoggedIn,
    userRole,
    username,
    theme,
    enrolledLanguages,
    selectedLanguage,
    onLogin: handleLogin,
    onLogout: handleLogout,
    toggleTheme,
    setSelectedLanguage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
