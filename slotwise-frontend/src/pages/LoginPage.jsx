import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // If already logged in, redirect immediately
  if (user) {
    const dest = user.role === 'ADMIN' ? '/admin' : '/dashboard';
    navigate(dest, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const userData = res.data;
      login(userData);
      // Role-based redirect
      if (userData.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.status === 401 ? 'Invalid email or password' :
          err.response?.status === 403 ? 'Your account has been deactivated' :
            err.response?.data || 'Login failed. Please try again.'
      );
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <img src="/slogo.png" style={{ height: '200px', width: 'auto' }} alt="SlotWise" />
          </div>
          <span className="navbar-brand-text">SlotWise</span>
        </div>
      </header>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-icon-wrap">
          <div className="login-icon">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Enter your institutional credentials to access the scheduling system.
          </p>
        </div>

        {error && (
          <div className="login-error">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <span className="material-symbols-outlined">alternate_email</span>
              Email
            </label>
            <input
              id="login-email" type="email" className="form-input"
              placeholder="e.g., john.doe@university.edu"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="login-password">
                <span className="material-symbols-outlined">key</span>
                Password
              </label>
              <span className="form-forgot">Forgot password?</span>
            </div>
            <div className="password-wrap">
              <input
                id="login-password" type={showPw ? 'text' : 'password'}
                className="form-input" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                style={{ paddingRight: 48 }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing In...</>
            ) : (
              <>Sign In <span className="material-symbols-outlined">arrow_forward</span></>
            )}
          </button>
        </form>

        <p className="login-footer-text">
          Don't have an account?<a href="#">Request Access</a>
        </p>
      </div>

      {/* Glow */}
      <div className="login-glow" />
    </div>
  );
}
