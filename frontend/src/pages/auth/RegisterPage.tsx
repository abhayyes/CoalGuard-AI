import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight, User, Mail, Lock } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      navigate('/mine/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldStyle = (field: string) => ({
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focused === field ? 'rgba(255,192,203,0.5)' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused === field
      ? '0 0 0 3px rgba(255,192,203,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
  });

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)' }}>

      {/* Ambient */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.12) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'glowPulse 7s ease-in-out infinite' }} />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,192,203,0.08) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'glowPulse 9s 1s ease-in-out infinite' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,192,203,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,192,203,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="absolute -inset-0.5 rounded-3xl opacity-40 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,192,203,0.4), rgba(255,192,203,0.1))', filter: 'blur(8px)' }} />

        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(18,18,18,0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,192,203,0.2)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.6), transparent)' }} />

          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8 animate-fade-in-down">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #FFC0CB, #F9B8C3)', color: '#0a0a0a' }}>
                CG
              </div>
              <div>
                <div className="font-black text-sm text-white tracking-widest">COALGUARD AI</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-pink-baby opacity-70" />
                  <span className="text-[9px] text-white/30 tracking-widest">Mine Governance Platform</span>
                </div>
              </div>
            </div>

            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Create account<span style={{ color: '#FFC0CB' }}>.</span>
              </h1>
              <p className="text-white/40 text-sm mt-1.5 font-medium">Join the CoalGuard AI platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: 'name', label: 'Full name', type: 'text', value: name, set: setName, placeholder: 'Your full name', Icon: User },
                { id: 'email', label: 'Email address', type: 'email', value: email, set: setEmail, placeholder: 'you@mine.com', Icon: Mail },
              ].map(({ id, label, type, value, set, placeholder, Icon }, i) => (
                <div key={id} className="space-y-1.5 animate-fade-in-up" style={{ animationDelay: `${150 + i * 50}ms` }}>
                  <label htmlFor={id} className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</label>
                  <div className="relative">
                    <input
                      id={id} type={type} required value={value}
                      onChange={(e) => set(e.target.value)}
                      onFocus={() => setFocused(id)}
                      onBlur={() => setFocused(null)}
                      placeholder={placeholder}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 font-medium transition-all duration-200 focus:outline-none"
                      style={fieldStyle(id)}
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                <label htmlFor="password" className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    id="password" type={showPw ? 'text' : 'password'} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm text-white placeholder:text-white/20 font-medium transition-all duration-200 focus:outline-none"
                    style={fieldStyle('password')}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <button
                  type="submit" disabled={isLoading}
                  className="w-full relative py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-200 overflow-hidden active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #FFC0CB, #F9B8C3)', color: '#0a0a0a', boxShadow: '0 8px 24px rgba(255,192,203,0.35)' }}
                >
                  <div className="absolute inset-0 shimmer-bg opacity-40" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating...</>
                    ) : (<>Create account <ArrowRight className="w-4 h-4" /></>)}
                  </span>
                </button>
              </div>
            </form>

            <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '350ms' }}>
              <button onClick={() => navigate('/login')}
                className="text-xs text-white/30 hover:text-pink-baby transition-colors font-medium underline underline-offset-4">
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
