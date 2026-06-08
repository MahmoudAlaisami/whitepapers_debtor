import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, loginDebtor, logoutDebtor } from '@/api/debtorClient';
import type { Debtor } from '@/types';
import {
  clearDebtorSession,
  getStoredUser,
  persistDebtorSession,
  updateStoredUser,
} from '@/utils/session';

type AuthContextValue = {
  user: Debtor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<Debtor>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Debtor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStoredUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginDebtor(username.trim(), password);
    await persistDebtorSession(data);
    const { token: _t, ...rest } = data;
    setUser(rest);
  }, []);

  const logout = useCallback(async () => {
    if (user?._id) {
      try {
        await logoutDebtor(user._id);
      } catch (err) {
        if (!(err instanceof ApiError)) throw err;
      }
    }
    await clearDebtorSession();
    setUser(null);
  }, [user?._id]);

  const updateUser = useCallback(async (partial: Partial<Debtor>) => {
    await updateStoredUser(partial);
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
