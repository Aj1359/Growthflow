import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { currentBrand, GrowthFlowLogo } from '../brands';
import {
  MessageSquare,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isGrowthFlow = currentBrand.id === 'growthflow';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!businessName.trim()) {
          setError('Please provide your business or brand name.');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, businessName.trim());
      } else {
        await signIn(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#062621] via-[#0C3C37] to-[#081E1B] flex items-center justify-center p-4 lg:p-12 relative overflow-hidden font-sans">
      {/* Ambient background glows in teal & amber */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Grid Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Hero Brand & Feature Showcase */}
        <div className="lg:col-span-7 text-white space-y-7 px-2 sm:px-6">
          
          {/* Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl border border-white/20 flex items-center justify-center">
              <img
                src={currentBrand.logoSrc}
                alt={currentBrand.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl font-black tracking-tight text-white">Growth</span>
                <span className="text-3xl font-black tracking-tight text-amber-400">Flow</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300 block mt-0.5">
                {currentBrand.tagline}
              </span>
            </div>
          </div>

          {/* Hero Copy */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Grow customer engagement on{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                WhatsApp
              </span>
            </h1>
            <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
              {currentBrand.loginSubheading}
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {[
              {
                icon: TrendingUp,
                title: 'High-Volume Broadcasts',
                desc: 'Meta Cloud API v21.0 engine with rate-limiting & auto-retry.',
              },
              {
                icon: MessageSquare,
                title: '2-Way Replies Inbox',
                desc: 'Capture inbound customer chats and reply within 24h window.',
              },
              {
                icon: Zap,
                title: 'Multi-Tenant Scoping',
                desc: 'Strict organization boundary with dedicated access control.',
              },
              {
                icon: Sparkles,
                title: 'Verified Meta Templates',
                desc: 'Live approval status, dynamic variables, and media headers.',
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3 shadow-sm hover:bg-white/10 transition"
              >
                <div className="p-2 rounded-xl bg-teal-500/20 text-amber-400 shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{title}</h4>
                  <p className="text-[11px] text-teal-200/80 leading-normal mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Inline SVG Growth Illustration */}
          <div className="pt-2">
            <svg
              className="w-full max-w-md h-24 text-teal-300/40"
              viewBox="0 0 400 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 65 Q 100 60, 180 35 T 380 15"
                stroke="url(#chartGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M10 70 Q 120 68, 200 48 T 380 25"
                stroke="url(#chartGrad2)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="380" cy="15" r="5" fill="#F59E0B" />
              <defs>
                <linearGradient id="chartGrad" x1="10" y1="65" x2="380" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0D9488" />
                  <stop offset="1" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="chartGrad2" x1="10" y1="70" x2="380" y2="25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0F766E" />
                  <stop offset="1" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-gray-100 text-gray-900">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-100 pb-4 mb-6 justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {mode === 'signin'
                    ? `Sign in to access your ${currentBrand.name} workspace`
                    : `Start growing your business with ${currentBrand.name}`}
                </p>
              </div>
              <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="label">Business / Workspace Name</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Acme Retail"
                      className="input pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Work Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember me</span>
                </label>
                {mode === 'signin' && (
                  <a href="#forgot" className="text-teal-700 hover:underline font-semibold">
                    Forgot password?
                  </a>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold rounded-xl shadow-md transition-all mt-2 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Free Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
