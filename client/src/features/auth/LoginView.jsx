import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Clock } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

/**
 * LoginView — Public page for authenticating existing users.
 * On success, redirects to /dashboard.
 */
export default function LoginView() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Field change handler ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on typing
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({ email: form.email, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch {
      // Error already stored in authStore.error — displayed below
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900 px-4 py-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">

        {/* ── Brand mark ─────────────────────────────────────────────────── */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-3xl
                          bg-primary-500/10 border border-primary-500/30 overflow-hidden mb-3 shadow-warm-md">
            <img
              src="/logo.jpg"
              alt="ChronoCraft"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <Clock size={28} className="absolute text-primary-400 -z-10" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 font-sans tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Sign in to your ChronoCraft account</p>
        </div>

        {/* ── Card ────────────────────────────────────────────────────────── */}
        <div className="card p-8 space-y-6">

          {/* API error banner */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-500/10
                            border border-danger-500/30 text-danger-400 text-sm animate-fade-in">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input ${fieldErrors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-danger-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input pr-10 ${fieldErrors.password ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-surface-500 hover:text-surface-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-danger-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2"><LogIn size={16} /> Sign in</span>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-surface-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
