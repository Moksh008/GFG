import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi, clearSession, DEMO_CREDENTIALS, getSession, onSessionChange } from '../api';
import { updateSessionUser } from '../api/http';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSession);

  // Keep React state in sync with token refreshes / expiry handled inside the API client.
  useEffect(() => onSessionChange(setSession), []);

  const login = useCallback((email, password) => authApi.login(email, password), []);
  const register = useCallback((data) => authApi.register(data), []);
  const loginDemo = useCallback(() => authApi.login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password), []);
  const logout = useCallback(() => clearSession(), []);
  const updateProfile = useCallback(async (patch) => {
    const user = await authApi.updateProfile(patch);
    updateSessionUser(user);
    return user;
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.access),
      login,
      register,
      loginDemo,
      logout,
      updateProfile
    }),
    [session, login, register, loginDemo, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
