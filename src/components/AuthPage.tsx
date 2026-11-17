import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Sparkles, 
  Lock, 
  UserCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register, checkRegNoEligible } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regNo, setRegNo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Real-time verification state during registration
  const [lookupResult, setLookupResult] = useState<{
    eligible: boolean;
    name?: string;
    department?: string;
    email?: string;
    role?: string;
  } | null>(null);

  // Handle register number lookup on blur or change
  const handleRegNoChange = (val: string) => {
    setRegNo(val);
    setRegisterError('');
    if (val.trim().length >= 4) {
      const res = checkRegNoEligible(val);
      setLookupResult(res);
      if (res.eligible && res.email) {
        setRegEmail(res.email);
      }
    } else {
      setLookupResult(null);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const res = await login(loginIdentifier, loginPassword);
    setLoginLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (regPassword !== regConfirmPassword) {
      setRegisterError('Passwords do not match. Please verify.');
      return;
    }
    if (regPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }

    setRegisterLoading(true);
    const res = await register(regNo, regEmail, regPassword);
    setRegisterLoading(false);

    if (res.success) {
      setRegisterSuccess(res.message);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 900);
    } else {
      setRegisterError(res.message);
    }
  };

  const fillQuickLogin = (id: string, pass: string) => {
    setMode('login');
    setLoginIdentifier(id);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-8 selection:bg-amber-100 selection:text-amber-900">
      
      {/* College & Prime Branding */}
      <div className="text-center mb-6 max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 text-amber-300 shadow-sm mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Saveetha Engineering College</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles className="w-2.5 h-2.5 mr-1" /> PRIME
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Prime Project Student Performance & Milestone Portal
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-[#E8E2D5] rounded-2xl w-full max-w-md p-6 shadow-sm">
        
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] border border-[#ECE6DB] rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegisterError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            First-Time Register
          </button>
        </div>

        {/* ---------------- LOGIN FORM ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Student Register Number / Faculty ID
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="Students: 212224040269  |  Faculty: FAC-CSE-001"
                className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900 placeholder:text-stone-400"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Enter your 12-digit student Register Number or Faculty ID
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-xs p-2.5 pr-10 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <span>{loginLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-amber-800 hover:text-amber-950 font-medium hover:underline"
              >
                First time logging in? Click here to register your password →
              </button>
            </div>
          </form>
        )}

        {/* ---------------- REGISTER FORM ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            <div className="bg-[#FAF8F5] border border-[#ECE6DB] rounded-xl p-3 text-xs text-stone-600 leading-relaxed">
              <strong className="text-stone-900">Whitelist Access Check:</strong> Only students and faculty approved by Dr. Karthika RN, Dr. Rajesh, and Dr. Karthi Govindaraju can register.
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Register Number / Faculty ID *
              </label>
              <input
                type="text"
                required
                value={regNo}
                onChange={e => handleRegNoChange(e.target.value)}
                placeholder="e.g. 212224040269 or FAC-CSE-001"
                className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900 uppercase"
              />
            </div>

            {/* Whitelist verification badge feedback */}
            {lookupResult && (
              <div>
                {lookupResult.eligible ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">✓ Whitelist Verified</div>
                      <div className="text-[11px] text-emerald-800 mt-0.5">
                        {lookupResult.name} • {lookupResult.department} ({lookupResult.role === 'admin' ? 'Faculty Leader' : 'Prime Scholar'})
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Access Denied</div>
                      <div className="text-[11px] mt-0.5">
                        This Register Number is not whitelisted by Dr. Karthika RN or Dr. Rajesh.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Institutional Email ID *
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="e.g. 212224040269@saveetha.ac.in"
                className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Create Secure Password (Min. 6 chars) *
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Set your password"
                  className="w-full text-xs p-2.5 pr-10 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={e => setRegConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900"
              />
            </div>

            {registerError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{registerError}</span>
              </div>
            )}

            {registerSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{registerSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={registerLoading || (lookupResult !== null && !lookupResult.eligible)}
              className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{registerLoading ? 'Creating Account...' : 'Complete Registration & Sign In'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-stone-600 hover:text-stone-900 font-medium hover:underline"
              >
                Already registered? Sign in here →
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Quick Demo Credentials Panel */}
      <div className="mt-6 w-full max-w-md bg-white/70 border border-[#ECE5D8] rounded-xl p-4 text-xs">
        <div className="font-semibold text-stone-700 mb-2 flex items-center justify-between">
          <span>⚡ Quick Test Credentials:</span>
          <span className="text-[10px] text-stone-400 font-mono">(Click to autofill)</span>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE2D3] transition">
            <div>
              <span className="font-semibold text-stone-900">Dr. Karthika RN</span>
              <span className="text-stone-400 text-[10px] ml-1">(Faculty Incharge)</span>
              <div className="text-[10px] text-stone-500 font-mono">ID: FAC-CSE-001 | Pass: Faculty@2026</div>
            </div>
            <button
              type="button"
              onClick={() => fillQuickLogin('FAC-CSE-001', 'Faculty@2026')}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-900 hover:text-white text-[10px] font-medium transition"
            >
              Fill
            </button>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE2D3] transition">
            <div>
              <span className="font-semibold text-stone-900">Dr. Rajesh</span>
              <span className="text-stone-400 text-[10px] ml-1">(Director)</span>
              <div className="text-[10px] text-stone-500 font-mono">ID: FAC-DIR-001 | Pass: Faculty@2026</div>
            </div>
            <button
              type="button"
              onClick={() => fillQuickLogin('FAC-DIR-001', 'Faculty@2026')}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-900 hover:text-white text-[10px] font-medium transition"
            >
              Fill
            </button>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE2D3] transition">
            <div>
              <span className="font-semibold text-stone-900">Dr. Karthi Govindaraju</span>
              <span className="text-stone-400 text-[10px] ml-1">(HOD)</span>
              <div className="text-[10px] text-stone-500 font-mono">ID: FAC-HOD-001 | Pass: Faculty@2026</div>
            </div>
            <button
              type="button"
              onClick={() => fillQuickLogin('FAC-HOD-001', 'Faculty@2026')}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-900 hover:text-white text-[10px] font-medium transition"
            >
              Fill
            </button>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE2D3] transition">
            <div>
              <span className="font-semibold text-stone-900">A. Ranen Joseph Solomon</span>
              <span className="text-stone-400 text-[10px] ml-1">(Student)</span>
              <div className="text-[10px] text-stone-500 font-mono">Reg: 212224040269 | Pass: Prime@123</div>
            </div>
            <button
              type="button"
              onClick={() => fillQuickLogin('212224040269', 'Prime@123')}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-900 hover:text-white text-[10px] font-medium transition"
            >
              Fill
            </button>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded hover:bg-[#FAF8F5] border border-transparent hover:border-[#EAE2D3] transition">
            <div>
              <span className="font-semibold text-stone-900">Aadithya R</span>
              <span className="text-stone-400 text-[10px] ml-1">(Student)</span>
              <div className="text-[10px] text-stone-500 font-mono">Reg: 212223240001 | Pass: Prime@123</div>
            </div>
            <button
              type="button"
              onClick={() => fillQuickLogin('212223240001', 'Prime@123')}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-900 hover:text-white text-[10px] font-medium transition"
            >
              Fill
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
