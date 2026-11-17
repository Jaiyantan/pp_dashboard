import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface EmailLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailLoginModal: React.FC<EmailLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, whitelist } = useAuth();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await loginWithEmail(email);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const quickFill = (testEmail: string) => {
    setEmail(testEmail);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E2DBD0] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#ECE6DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn className="w-4 h-4 text-stone-700" />
            <h3 className="font-bold text-base text-stone-900">Email Verification Login</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#EFE9DE] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-500 leading-relaxed">
            Access to Saveetha Prime Dashboard is granted on an email-whitelist basis by <strong>Dr. Karthika RN</strong> (Faculty Incharge), <strong>Dr. Rajesh</strong> (Director), and <strong>Dr. Karthi Govindaraju</strong> (HOD).
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Enter Saveetha Email ID or Register Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 212224040269 or 212224040269@saveetha.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium text-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
            >
              Verify & Sign In
            </button>
          </form>

          {/* Quick-test helper buttons */}
          <div className="pt-3 border-t border-[#F2ECE1]">
            <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Quick Test Whitelisted Accounts:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => quickFill('karthika.rn@saveetha.ac.in')}
                className="text-[11px] px-2 py-1 rounded bg-[#F8F5EE] hover:bg-[#EFE9DD] border border-[#E4DECFA] text-stone-700 font-medium"
              >
                Dr. Karthika RN (Admin)
              </button>
              <button
                type="button"
                onClick={() => quickFill('rajesh.director@saveetha.ac.in')}
                className="text-[11px] px-2 py-1 rounded bg-[#F8F5EE] hover:bg-[#EFE9DD] border border-[#E4DECFA] text-stone-700 font-medium"
              >
                Dr. Rajesh (Director)
              </button>
              <button
                type="button"
                onClick={() => quickFill('karthi.govindaraju@saveetha.ac.in')}
                className="text-[11px] px-2 py-1 rounded bg-[#F8F5EE] hover:bg-[#EFE9DD] border border-[#E4DECFA] text-stone-700 font-medium"
              >
                Dr. Karthi (HOD)
              </button>
              <button
                type="button"
                onClick={() => quickFill('priya.k@saveetha.ac.in')}
                className="text-[11px] px-2 py-1 rounded bg-[#F8F5EE] hover:bg-[#EFE9DD] border border-[#E4DECFA] text-stone-700 font-medium"
              >
                K. Priya (Student)
              </button>
              <button
                type="button"
                onClick={() => quickFill('unauthorized.user@gmail.com')}
                className="text-[11px] px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium"
              >
                Test Unauthorized Email
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
