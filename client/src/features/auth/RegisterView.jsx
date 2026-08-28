import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Clock } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

/**
 * RegisterView — Public page for creating a new account.
 * On success, user is logged in automatically and redirected to /dashboard.
 */
export default function RegisterView() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});

  // ── Field change handler ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!form.username.trim()) {
      errs.username = 'Username is required.';
    } else if (form.username.length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      errs.username = 'Only letters, numbers, and underscores allowed.';
    }

    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch {
      // Error already stored in authStore.error
    }
  };

  // ── Password strength indicator ─────────────────────────────────────────────
  const getPasswordStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Too short', color: 'bg-danger-500', width: '25%' };
    if (pw.length < 10) return { label: 'Weak', color: 'bg-warning-500', width: '50%' };
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Fair', color: 'bg-warning-400', width: '70%' };
    return { label: 'Strong', color: 'bg-success-500', width: '100%' };
  };
  const strength = getPasswordStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 py-10">
      <div className="w-full max-w-md space-y-8 animate-fade-in">

        {/* ── Brand mark ─────────────────────────────────────────────────── */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-primary-500 text-white mb-4 shadow-lg">
            <Clock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-surface-100">Create your account</h1>
          <p className="mt-1 text-sm text-surface-400">Start tracking your time with ChronoCraft</p>
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

            {/* Username */}
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe"
                className={`input ${fieldErrors.username ? 'border-danger-500 focus:border-danger-500' : ''}`}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-danger-400">{fieldErrors.username}</p>
              )}
            </div>

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
                className={`input ${fieldErrors.email ? 'border-danger-500 focus:border-danger-500' : ''}`}
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={`input pr-10 ${fieldErrors.password ? 'border-danger-500 focus:border-danger-500' : ''}`}
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
              {/* Strength bar */}
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-surface-500">{strength.label}</p>
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-danger-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`input pr-10 ${fieldErrors.confirmPassword ? 'border-danger-500 focus:border-danger-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-surface-500 hover:text-surface-300 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-danger-400">{fieldErrors.confirmPassword}</p>
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
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2"><UserPlus size={16} /> Create account</span>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
