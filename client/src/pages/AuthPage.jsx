import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { buttonClass, inputClass, labelClass } from '../components/ui/classes';
import { ErrorBanner } from '../components/ui/Feedback';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { isAuthenticated, login, register, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [busy, setBusy] = useState(null); // 'submit' | 'demo' | null
  const [error, setError] = useState(null);

  const destination = location.state?.from || '/dashboard';
  if (isAuthenticated) return <Navigate to={destination} replace />;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const run = async (kind, action) => {
    setBusy(kind);
    setError(null);
    try {
      await action();
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err);
      setBusy(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run('submit', () => (isRegister ? register(form) : login(form.email, form.password)));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#6F8FA3] via-[#A9C1CC] to-[#DCEBE8] flex items-center justify-center p-4 text-[#1F2A2E]">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#0F3B3F]">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">
            Dermora<span className="font-normal opacity-90">.ai</span>
          </span>
        </Link>

        <div className="bg-white/95 rounded-[28px] p-7 shadow-2xl border border-white/70">
          <h1 className="text-xl font-semibold tracking-tight">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-xs text-[#8A9AA0] mt-1">Because your skin feels what you feel.</p>

          <form onSubmit={handleSubmit} className="space-y-3 mt-5">
            {isRegister && (
              <div>
                <label className={labelClass} htmlFor="fullName">Full name</label>
                <input id="fullName" className={inputClass} value={form.fullName} onChange={update('fullName')} autoComplete="name" />
              </div>
            )}
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input id="email" type="email" required className={inputClass} value={form.email} onChange={update('email')} autoComplete="email" />
            </div>
            <div>
              <label className={labelClass} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={isRegister ? 8 : undefined}
                className={inputClass}
                value={form.password}
                onChange={update('password')}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              {isRegister && <p className="text-[10px] text-[#8A9AA0] mt-1">At least 8 characters.</p>}
            </div>

            <ErrorBanner error={error} />

            <button type="submit" disabled={Boolean(busy)} className={`${buttonClass.primary} w-full py-2.5`}>
              {busy === 'submit' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4 text-[10px] text-[#8A9AA0] uppercase tracking-wider">
            <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => run('demo', loginDemo)}
            className={`${buttonClass.pill} w-full py-2.5`}
          >
            {busy === 'demo' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#B98CE8]" />}
            Explore the demo account
          </button>

          <p className="text-xs text-center text-[#8A9AA0] mt-5">
            {isRegister ? 'Already have an account? ' : 'New to Dermora? '}
            <Link to={isRegister ? '/login' : '/register'} state={location.state} className="font-semibold text-[#0F3B3F] hover:underline">
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
