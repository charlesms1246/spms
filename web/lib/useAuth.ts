'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, logout as logoutApi } from './api';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    const userData = getUser();

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/auth/login');
    }
    setLoading(false);
  }, [router]);

  const logout = () => {
    logoutApi();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/login');
  };

  return {
    user,
    loading,
    isAuthenticated,
    logout,
  };
};

export const useRequireAuth = () => {
  const auth = useAuth();
  return auth;
};

export const useRequireRole = (roles: string[]) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user && !roles.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, roles, router]);

  return { user, isAuthenticated, loading };
};
