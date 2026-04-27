import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, Mail, Building, Key } from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../services/api';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = React.useState(false);
  const [role, setRole] = React.useState<'student' | 'coordinator'>('student');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    id: '',
    password: '',
    email: '',
    displayName: '',
    department: ''
  });

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const levels = [
      { label: 'Very Weak', color: 'bg-rose-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-amber-500' },
      { label: 'Good', color: 'bg-emerald-500' },
      { label: 'Strong', color: 'bg-indigo-600' }
    ];
    return { score, ...levels[score] };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user;
      if (isRegister) {
        user = await api.register({
          ...formData,
          role,
          studentId: role === 'student' ? formData.id : undefined,
          coordinatorId: role === 'coordinator' ? formData.id : undefined
        });
      } else {
        user = await api.login(formData.id, formData.password, role);
      }
      
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200"
      >
        <div className={cn("p-8 text-white relative", role === 'student' ? 'bg-indigo-600' : 'bg-orange-600')}>
          <Shield className="absolute top-8 right-8 h-12 w-12 text-white/20" />
          <h2 className="text-3xl font-bold mb-2">{isRegister ? 'Join Us' : 'Welcome Back'}</h2>
          <p className="text-white/80 text-sm">
            {isRegister ? 'Create your campus account' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-lg">
              {error}
            </div>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                role === 'student' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('coordinator')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                role === 'coordinator' ? "bg-white shadow-sm text-orange-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Coordinator
            </button>
          </div>

          <div className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={formData.displayName}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="email@university.edu"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                {role === 'student' ? 'Student ID' : 'Coordinator ID'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="text"
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder={role === 'student' ? "e.g. STU123" : "e.g. COORD456"}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              {isRegister && formData.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Strength: {pwdStrength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step}
                        className={cn(
                          "h-full flex-1 transition-all duration-500",
                          pwdStrength.score >= step ? pwdStrength.color : 'bg-slate-200'
                        )} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all transform active:scale-95 disabled:opacity-50",
              role === 'student' 
                ? "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700" 
                : "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700"
            )}
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className={cn(
                "font-bold hover:underline",
                role === 'student' ? "text-indigo-600" : "text-orange-600"
              )}
            >
              {isRegister ? 'Sign In' : 'Sign Up Now'}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
