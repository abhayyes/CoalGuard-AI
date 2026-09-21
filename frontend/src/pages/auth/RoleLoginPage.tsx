import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const RoleLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let targetDashboard = '/mine/dashboard';
      if (email.includes('admin')) {
        localStorage.setItem('mock_role', 'admin');
        targetDashboard = '/admin/dashboard';
      } else if (email.includes('corporate')) {
        localStorage.setItem('mock_role', 'corporate');
        targetDashboard = '/corporate/dashboard';
      } else {
        localStorage.setItem('mock_role', 'mine_official');
        targetDashboard = '/mine/dashboard';
      }
      await fetchProfile();
      navigate(targetDashboard);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)' }}>

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.15) 0%, transparent 70%)', animation: 'glowPulse 6s ease-in-out infinite', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.1) 0%, transparent 70%)', animation: 'glowPulse 8s 2s ease-in-out infinite', filter: 'blur(50px)' }} />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,192,203,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,192,203,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Card */}
      <div className="relative w-full max-w-md animate-scale-in">
        {/* Glow border */}
        <div className="absolute -inset-0.5 rounded-3xl opacity-50 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,192,203,0.4), rgba(255,192,203,0.1), rgba(255,192,203,0.3))', filter: 'blur(8px)' }} />

        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(18,18,18,0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,192,203,0.2)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,192,203,0.08) inset',
          }}>

          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.6), transparent)' }} />

          <div className="p-8 md:p-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in-down">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFC0CB, #F9B8C3)', color: '#0a0a0a' }}>
                <span className="relative z-10">CG</span>
                <div className="absolute inset-0 shimmer-bg opacity-50" />
              </div>
              <div>
                <div className="font-black text-sm text-white tracking-widest">COALGUARD AI</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-pink-baby opacity-70" />
                  <span className="text-[9px] text-white/30 tracking-widest">Mine Governance Platform</span>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                Welcome back<span style={{ color: '#FFC0CB' }}>.</span>
              </h1>
              <p className="text-white/40 text-sm mt-1.5 font-medium">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <label htmlFor="email" className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@mine.com"
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 font-medium transition-all duration-200 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${focusedField === 'email' ? 'rgba(255,192,203,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(255,192,203,0.12), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <label htmlFor="password" className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm text-white placeholder:text-white/20 font-medium transition-all duration-200 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${focusedField === 'password' ? 'rgba(255,192,203,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(255,192,203,0.12), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 overflow-hidden active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FFC0CB, #F9B8C3)', color: '#0a0a0a', boxShadow: '0 8px 24px rgba(255,192,203,0.35)' }}
                >
                  <div className="absolute inset-0 shimmer-bg opacity-40 hover:opacity-60 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Footer links */}
            <div className="mt-6 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <button
                onClick={() => navigate('/register')}
                className="text-xs text-white/30 hover:text-pink-baby transition-colors font-medium underline underline-offset-4"
              >
                Create account
              </button>
              <button
                onClick={() => navigate('/mine/dashboard')}
                className="text-xs text-white/20 hover:text-white/50 transition-colors font-medium"
              >
                Skip →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


