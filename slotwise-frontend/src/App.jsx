import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
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
