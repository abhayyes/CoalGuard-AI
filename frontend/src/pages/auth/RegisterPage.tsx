import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0F5] via-[#FDF8FB] to-[#FFC0CB]/20 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-[#FFC0CB]/30 shadow-2xl rounded-3xl animate-fade-in-up">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold text-[#0a0a0a] tracking-tight">Create account</CardTitle>
          <p className="text-slate-500 text-sm">Join CoalGuard AI</p>
        </CardHeader>
        <CardContent className="p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-wider">Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5F0F5] border border-[#FFC0CB]/40 text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC0CB] transition-all" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-wider">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5F0F5] border border-[#FFC0CB]/40 text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC0CB] transition-all" placeholder="you@mine.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold text-[#0a0a0a] uppercase tracking-wider">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F5F0F5] border border-[#FFC0CB]/40 text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC0CB] transition-all" placeholder="••••••••" />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full py-3 bg-[#0a0a0a] hover:bg-[#FFC0CB] hover:text-[#0a0a0a] text-white font-bold rounded-xl shadow-xl shadow-[#FFC0CB]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? 'Creating...' : 'Register'}
            </Button>
          </form>
          <div className="flex items-center justify-between text-sm text-[#0a0a0a]">
            <button onClick={() => navigate('/login')} className="hover:text-[#FFC0CB] underline underline-offset-4">Already have an account?</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};