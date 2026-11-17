import React, { useState } from 'react';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  isSupabaseConfigured, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials 
} from '../lib/supabase';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCHEMA_SNIPPET = `-- SAVEETHA ENGINEERING COLLEGE — PRIME DASHBOARD SCHEMA
CREATE TABLE IF NOT EXISTS public.access_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    designation TEXT,
    department TEXT,
    roll_no TEXT,
    added_by TEXT DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    roll_no TEXT,
    department TEXT,
    category TEXT NOT NULL CHECK (category IN ('academic', 'hackathon', 'competition', 'internship', 'project')),
    title TEXT NOT NULL,
    organization_or_event TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'review', 'completed')),
    description TEXT NOT NULL,
    metrics_or_outcome TEXT,
    proof_link TEXT,
    date DATE DEFAULT CURRENT_DATE,
    admin_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES FOR DR. KARTHIKA RN, DR. RAJESH, DR. KARTHI GOVINDARAJU
ALTER TABLE public.student_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access" ON public.student_cards
FOR ALL USING (
  LOWER(auth.jwt()->>'email') IN ('karthika.rn@saveetha.ac.in', 'rajesh.director@saveetha.ac.in', 'karthi.govindaraju@saveetha.ac.in')
);

CREATE POLICY "Students manage own progress only" ON public.student_cards
FOR ALL USING (LOWER(student_email) = LOWER(auth.jwt()->>'email'));
`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(SUPABASE_URL || '');
  const [key, setKey] = useState(SUPABASE_ANON_KEY || '');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      alert('Please fill in both Supabase URL and Anon Key');
      return;
    }
    saveSupabaseCredentials(url, key);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleClear = () => {
    if (window.confirm('Clear saved Supabase configuration and revert to local sandbox?')) {
      clearSupabaseCredentials();
      window.location.reload();
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SCHEMA_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E2DBD0] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#ECE6DB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Supabase Database Setup
              </h3>
              <p className="text-xs text-stone-500">
                PostgreSQL + Row-Level Security for Saveetha Prime Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#EFE9DE] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700">
          
          {/* Status banner */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isSupabaseConfigured
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <div className="mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs">
                {isSupabaseConfigured ? 'Supabase Connection Active' : 'Operating in Persistent Local Sandbox'}
              </div>
              <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                {isSupabaseConfigured
                  ? 'All Prime progress cards and access control whitelist records sync directly to your PostgreSQL database with Row-Level Security.'
                  : 'The dashboard is currently running in local mode with pre-seeded data for Dr. Karthika RN, Dr. Rajesh, Dr. Karthi Govindaraju, and Prime scholars. Enter your Supabase credentials below to connect your cloud instance.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3.5 bg-[#FAF8F5] border border-[#EBE5D8] rounded-xl p-4">
            <div className="font-semibold text-stone-800 text-xs">Supabase Credentials</div>
            
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Project Anon API Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={e => setKey(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {isSupabaseConfigured ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-rose-600 hover:text-rose-800 font-medium text-xs"
                >
                  Disconnect & Use Sandbox
                </button>
              ) : (
                <span className="text-[11px] text-stone-400">Can also be set in <code className="bg-stone-200 px-1 py-0.5 rounded">.env</code></span>
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Save & Connect</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* SQL Schema Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-800">
                SQL Schema & RLS Policies (`supabase_schema.sql`)
              </span>
              <button
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F2ECE1] hover:bg-[#EAE2D3] text-stone-800 font-medium text-[11px] transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>

            <pre className="bg-[#1C1A17] text-[#EDE8DC] p-3.5 rounded-xl font-mono text-[10px] overflow-x-auto max-h-48 leading-relaxed border border-stone-800">
              {SCHEMA_SNIPPET}
            </pre>
            <p className="text-[11px] text-stone-500 mt-2">
              Note: The full file is saved at <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">/supabase_schema.sql</code> in this project with pre-seeded values.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#ECE6DB] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
