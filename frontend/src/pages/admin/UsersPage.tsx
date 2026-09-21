import React, { useEffect, useState } from 'react';
import { UserPlus, CheckCircle2, Shield, X, Mail, User as UserIcon, Lock } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User, UserRole } from '../../types';

const inputCls = "w-full text-xs px-3.5 py-2.5 rounded-xl text-coal placeholder:text-slate-300 transition-all duration-150 focus:outline-none";
const inputStyle = { background: 'rgba(253,248,251,0.7)', border: '1px solid rgba(255,192,203,0.25)', color: '#0a0a0a' };

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('safety_officer');

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', {
        email,
        full_name: fullName,
        role,
      });
      setIsModalOpen(false);
      setEmail('');
      setFullName('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const getRoleBadge = (r: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      admin: { bg: 'rgba(168,85,247,0.12)', color: '#9333EA' },
      corporate: { bg: 'rgba(59,130,246,0.12)', color: '#2563EB' },
      mine_official: { bg: 'rgba(99,102,241,0.12)', color: '#4F46E5' },
      safety_officer: { bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
      env_officer: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
      inspector: { bg: 'rgba(239,68,68,0.12)', color: '#DC2626' },
    };
    const style = map[r] || { bg: 'rgba(255,192,203,0.15)', color: '#C08090' };
    return (
      <span
        className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg"
        style={{ background: style.bg, color: style.color }}
      >
        {r.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFC0CB, #F9B8C3)' }} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Governance</span>
          </div>
          <h1 className="text-2xl font-black text-coal tracking-tight">User &amp; RBAC Access Management</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Provision safety officers, inspectors, environmental engineers, and corporate executives
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-coal transition-all duration-200 hover:shadow-pink-md hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 16px rgba(255,192,203,0.4)' }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Platform User
        </button>
      </div>

      {/* Main Table Card */}
      <div
        className="rounded-3xl overflow-hidden animate-fade-in-up"
        style={{
          background: 'rgba(253,248,251,0.9)',
          border: '1px solid rgba(255,192,203,0.2)',
          boxShadow: '0 8px 32px rgba(255,192,203,0.08)'
        }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,192,203,0.15)' }}>
          <div>
            <h2 className="text-base font-black text-coal">Provisioned Platform Personnel</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Role assignments and statutory enforcement scopes</p>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-xl"
            style={{ background: 'rgba(255,192,203,0.15)', color: '#C08090' }}
          >
            {users.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr style={{ background: 'rgba(255,192,203,0.05)', borderBottom: '1px solid rgba(255,192,203,0.15)' }}>
                {['Full Name', 'Email Identifier', 'Assigned Role', 'Account Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255,192,203,0.1)' }}>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors duration-150"
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
                          style={{ background: 'rgba(255,192,203,0.18)', color: '#C08090' }}
                        >
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-coal">{u.full_name || 'System User'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 font-medium">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="font-bold text-xs transition-colors duration-150"
                        style={{ color: '#C08090' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0a0a0a')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#C08090')}
                      >
                        Edit Scopes →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(255,192,203,0.1)' }}>
                        <Shield className="w-6 h-6" style={{ color: '#FFC0CB' }} />
                      </div>
                      <p className="text-sm font-bold text-coal">No users configured.</p>
                      <p className="text-xs text-slate-400">Click "Add Platform User" to provision credentials.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden animate-scale-in"
            style={{ background: 'rgba(253,248,251,0.98)', border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,192,203,0.8), transparent)' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-black text-coal">Provision New User Account</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Assign statutory roles and mine permissions</p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#94A3B8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text" required value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className={inputCls} style={inputStyle}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ananya.sharma@coalguard.gov.in"
                    className={inputCls} style={inputStyle}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role &amp; Statutory Permissions</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className={inputCls} style={inputStyle}
                  >
                    <option value="safety_officer">Mine Safety Officer</option>
                    <option value="mine_official">Mine Manager / Official</option>
                    <option value="env_officer">Environmental Officer</option>
                    <option value="inspector">DGMS Statutory Inspector</option>
                    <option value="corporate">Corporate / Executive Officer</option>
                    <option value="regulatory">Ministry Regulatory Auditor</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,192,203,0.2)' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 transition-all duration-150"
                    style={{ border: '1px solid rgba(255,192,203,0.25)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,192,203,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >Cancel</button>
                  <button type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-coal transition-all duration-150 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #FFC0CB, #FFD6DC)', boxShadow: '0 4px 14px rgba(255,192,203,0.4)' }}
                  >Create User Profile</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
