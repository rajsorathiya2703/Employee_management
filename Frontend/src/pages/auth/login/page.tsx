import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, X, User, Phone, ShieldCheck, QrCode, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { forgotPassword, verifyOtp, resetPassword } from '../../../service/auth.service';
import bgImage from '../../../assets/Sidebar_bg.png';
import logo from '../../../assets/logo.png';

// ── Types ─────────────────────────────────────────────────────────────────────

type LoginTab = 'password' | 'otp' | 'qr';
type ForgotStep = 'email' | 'otp' | 'reset' | null;

// ── Forgot Password Modal ─────────────────────────────────────────────────────

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    try {
      setLoading(true);
      await forgotPassword(email.trim());
      setSuccess('OTP sent to your email.');
      setStep('otp');
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Please enter the OTP.'); return; }
    try {
      setLoading(true);
      await verifyOtp(email, otp.trim());
      setStep('reset');
      setSuccess('');
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    try {
      setLoading(true);
      await resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully! You can now log in.');
      setStep(null);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {step === 'email' && 'Forgot Password'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'reset' && 'Set New Password'}
            {step === null && 'Password Reset'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Success final screen */}
          {step === null && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-500" />
              </div>
              <p className="text-slate-700 font-medium text-center">{success}</p>
              <button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                Back to Login
              </button>
            </div>
          )}

          {/* Step: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <p className="text-sm text-slate-500">Enter your registered email address. We'll send you a 6-digit OTP.</p>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              {success && <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}
              <p className="text-sm text-slate-500">Enter the 6-digit OTP sent to <strong>{email}</strong>.</p>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center text-xl font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                maxLength={6}
              />
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('email')} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium transition">Back</button>
                <button type="submit" disabled={loading || otp.length < 6} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Verifying...</> : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step: Reset */}
          {step === 'reset' && (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <p className="text-sm text-slate-500">Choose a new secure password for your account.</p>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className={inputCls} />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Resetting...</> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Admin Modal ────────────────────────────────────────────────────────

function CreateAdminModal({ onClose }: { onClose: () => void }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await register(form.name.trim(), form.email.trim(), form.password, form.phone.trim() || undefined);
      setDone(true);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition';

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
            <ShieldCheck size={28} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Account Created!</h3>
          <p className="text-sm text-slate-500 text-center">Your account has been created successfully. You can now log in.</p>
          <button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold transition">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Create Admin Account</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
            </div>
          </div>

          {/* Admin Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@company.com" className={inputCls} />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Mobile Number</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 shrink-0">
                <span className="text-base">🇮🇳</span>
                <span>+91</span>
              </div>
              <div className="relative flex-1">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-600">Secure Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition mt-1">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [tab, setTab] = useState<LoginTab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
      navigate('/employee/dashboard', { replace: true });
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Login failed. Please try again.'
      );
    }
  };

  const tabs: { id: LoginTab; icon: React.ReactNode; label: string }[] = [
    { id: 'password', icon: <Lock size={14} />, label: 'Password' },
    { id: 'otp', icon: <ShieldCheck size={14} />, label: 'OTP' },
    { id: 'qr', icon: <QrCode size={14} />, label: 'QR' },
  ];

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      {showCreateAdmin && <CreateAdminModal onClose={() => setShowCreateAdmin(false)} />}

      {/* Full-screen background */}
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#1c2438',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/50" />

        {/* Card */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm px-8 py-8 flex flex-col items-center gap-5">
          {/* Logo */}
          <img src={logo} alt="MineHR Solutions" className="h-14 w-auto object-contain" />

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-1">
              Access your MineHR Solutions Pvt. Ltd. Dashboard
            </p>
          </div>

          {/* Tabs */}
          <div className="flex w-full bg-slate-100 rounded-xl p-1 gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Password Tab */}
          {tab === 'password' && (
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full bg-slate-50 border border-indigo-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold tracking-wide transition mt-1"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In →</>
                )}
              </button>
            </form>
          )}

          {/* OTP Tab */}
          {tab === 'otp' && (
            <div className="w-full flex flex-col items-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <ShieldCheck size={26} className="text-amber-500" />
              </div>
              <p className="text-sm text-slate-500 text-center">
                OTP login is available through the <strong>Forgot Password</strong> flow.<br />
                Click below to receive an OTP.
              </p>
              <button
                onClick={() => setShowForgot(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-sm font-semibold transition"
              >
                Send OTP to Email
              </button>
            </div>
          )}

          {/* QR Tab */}
          {tab === 'qr' && (
            <div className="w-full flex flex-col items-center gap-3 py-4">
              <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                <QrCode size={64} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 text-center">
                QR login is coming soon. Use <strong>Password</strong> login for now.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="w-full border-t border-slate-100 pt-4 flex flex-col items-center gap-1">
            <p className="text-xs text-slate-400">
              Secure Access Portal • MineHR Solutions Pvt. Ltd.
            </p>
            <button
              onClick={() => setShowCreateAdmin(true)}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 transition"
            >
              ⚙ Create First Admin Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
