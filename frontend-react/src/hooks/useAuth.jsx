import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * Provides user auth state across the app.
 * After login, call `login(userData)` with the user object from the API.
 * The user object should have at minimum: { name, email, role }
 * `role` determines Navbar visibility (e.g. 'Admin' shows the Admin tab).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('slotwise_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('slotwise_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('slotwise_user');
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
