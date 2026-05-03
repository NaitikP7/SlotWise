import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
import MainApp from './pages/MainApp';

function AuthGate() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-spinner" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <MainApp />;
}

function LoginGate() {
  const { user } = useAuth();
  // If already logged in, redirect based on role
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return <LoginPage />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginGate />} />
            <Route path="/*" element={<AuthGate />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
