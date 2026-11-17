import { createClient } from '@supabase/supabase-js';

// Environment variables or localStorage saved keys
const getEnvOrStorage = (key: string): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(key);
    if (local) return local;
  }
  return (import.meta.env[key] as string) || '';
};

export const SUPABASE_URL = getEnvOrStorage('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvOrStorage('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('your-supabase-url')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  localStorage.setItem('VITE_SUPABASE_URL', url.trim());
  localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey.trim());
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('VITE_SUPABASE_URL');
  localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
};
