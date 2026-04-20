"use client";

import { useAuth } from "@/context/auth-context";
import LoginScreen from "@/components/auth/login-screen";
import Dashboard from "@/components/dashboard/dashboard";

export type UserRole = "student" | "professor" | "admin";

export default function Home() {
  const { isLoggedIn, userRole, username } = useAuth();

  const progress = {
    virtual: 80,
    course1: 65,
    course2: 45,
  };

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <Dashboard
      progress={progress}
      userRole={userRole}
      username={username}
    />
  );
}
