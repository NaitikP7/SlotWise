import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch user by email from the database
      const res = await userApi.getByEmail(form.email);
      const user = res.data;
      login(user);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No account found with that email. Please check and try again.');
      } else {
        setError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-display flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-5 lg:px-12 fixed top-0 left-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-9 bg-primary rounded-lg text-slate-900 shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-[20px] font-bold">bolt</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SlotWise</span>
        </div>
        <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Contact Support
        </a>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative w-full">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-lg p-10 md:p-12 z-10 relative">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="mb-6 p-4 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-500 text-sm leading-relaxed px-4">
              Enter your institutional credentials to access the scheduling system.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                Email Address
              </label>
              <input
                type="email" id="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full h-[52px] rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 font-medium"
                placeholder="e.g., john.doe@university.edu"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} id="password" required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full h-[52px] rounded-lg border border-slate-200 bg-slate-50 px-4 pr-12 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 font-medium tracking-wide"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full h-[52px] bg-primary hover:brightness-105 text-slate-900 font-bold rounded-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform font-semibold">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account?
            <a href="#" className="text-primary hover:text-primary-hover font-bold hover:underline transition-colors ml-1">
              Request Access
            </a>
          </p>
        </div>

        <footer className="mt-12 text-center space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            © 2024 SlotWise Institutional Systems. All Rights Reserved.
          </p>
          <div className="flex justify-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </footer>

        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-primary/10 rounded-full blur-[120px] opacity-70" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-primary/10 rounded-full blur-[120px] opacity-70" />
        </div>
      </main>
    </div>
  );
}
