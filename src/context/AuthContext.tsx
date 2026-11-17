import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, WhitelistUser, AuthCredential } from '../types';
import { INITIAL_ADMINS, INITIAL_STUDENTS, INITIAL_WHITELIST, INITIAL_CREDENTIALS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { hashPassword, verifyPassword, generateToken } from '../lib/authCrypto';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (regNoOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  register: (regNo: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkRegNoEligible: (regNo: string) => { eligible: boolean; name?: string; department?: string; email?: string; role?: string };
  whitelist: WhitelistUser[];
  addToWhitelist: (entry: Omit<WhitelistUser, 'id' | 'created_at' | 'added_by'>) => Promise<boolean>;
  removeFromWhitelist: (id: string) => Promise<boolean>;
  isAdmin: boolean;
  switchUser: (idOrEmail: string) => void;
  allAvailableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WHITELIST_STORAGE_KEY = 'sec_prime_whitelist_v3';
const CREDENTIALS_STORAGE_KEY = 'sec_prime_credentials_v3';
const SESSION_STORAGE_KEY = 'sec_prime_session_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const allAvailableUsers: UserProfile[] = [...INITIAL_ADMINS, ...INITIAL_STUDENTS];

  // Whitelist state
  const [whitelist, setWhitelist] = useState<WhitelistUser[]>(() => {
    const saved = localStorage.getItem(WHITELIST_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse whitelist from localStorage', e);
      }
    }
    return INITIAL_WHITELIST;
  });

  // Credentials state
  const [credentials, setCredentials] = useState<AuthCredential[]>(() => {
    const saved = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse credentials from localStorage', e);
      }
    }
    return INITIAL_CREDENTIALS;
  });

  // Current logged in user (starts from saved session or default admin)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session && session.user) {
          return session.user;
        }
      } catch (e) {
        console.error('Failed to parse session from localStorage', e);
      }
    }
    // Default to Dr. Karthika RN for initial review, or user can log out to see Login screen
    return INITIAL_ADMINS[0];
  });

  const isAuthenticated = currentUser !== null;

  // Persist state
  useEffect(() => {
    localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(whitelist));
  }, [whitelist]);

  useEffect(() => {
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ user: currentUser, token: generateToken() })
      );
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [currentUser]);

  // Sync with Supabase access_whitelist if configured
  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const fetchWhitelist = async () => {
        try {
          const { data, error } = await client.from('access_whitelist').select('*');
          if (!error && data && data.length > 0) {
            setWhitelist(data as WhitelistUser[]);
          }
        } catch (err) {
          console.warn('Could not fetch whitelist from Supabase:', err);
        }
      };
      fetchWhitelist();
    }
  }, []);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' || [
        'karthika.rn@saveetha.ac.in',
        'rajesh.director@saveetha.ac.in',
        'karthi.govindaraju@saveetha.ac.in',
        'FAC-CSE-001',
        'FAC-DIR-001',
        'FAC-HOD-001'
      ].includes(currentUser.email.toLowerCase()) || 
      (currentUser.roll_no && ['FAC-CSE-001', 'FAC-DIR-001', 'FAC-HOD-001'].includes(currentUser.roll_no))
    )
  );

  const loginWithEmail = async (email: string) => {
    return login(email, 'Prime@123');
  };

  // Check if a Register Number is eligible to register (i.e. whitelisted)
  const checkRegNoEligible = (regNo: string) => {
    const normalized = regNo.trim().toUpperCase();
    if (!normalized) return { eligible: false };

    // Check whitelist by roll_no or email prefix
    const matched = whitelist.find(
      w =>
        (w.roll_no && w.roll_no.toUpperCase() === normalized) ||
        w.email.toUpperCase().startsWith(normalized + '@') ||
        w.email.toUpperCase() === normalized
    );

    if (matched) {
      return {
        eligible: true,
        name: matched.name,
        department: matched.department,
        email: matched.email,
        role: matched.role,
      };
    }

    return { eligible: false };
  };

  // Login handler: Authenticates Student (by Reg No + Password) or Faculty (by Faculty ID / Reg No + Password)
  const login = async (
    regNoOrEmail: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const raw = regNoOrEmail.trim();
    if (!raw || !password) {
      return { success: false, message: 'Please enter both your Register Number/ID and password.' };
    }

    const normalized = raw.toUpperCase();
    const normalizedEmail = raw.toLowerCase();

    // Find credential by reg_no, email, or user_id
    let cred = credentials.find(
      c =>
        c.reg_no.toUpperCase() === normalized ||
        c.email.toLowerCase() === normalizedEmail ||
        (normalized.startsWith('FAC') && c.reg_no.toUpperCase() === normalized) ||
        (normalizedEmail.includes('karthika') && c.reg_no === 'FAC-CSE-001') ||
        (normalizedEmail.includes('rajesh') && c.reg_no === 'FAC-DIR-001') ||
        (normalizedEmail.includes('karthi') && c.reg_no === 'FAC-HOD-001')
    );

    // If not found in credentials but present in whitelist, allow auto-initialization with Prime@123
    if (!cred) {
      const isWhitelisted = whitelist.find(
        w => (w.roll_no && w.roll_no.toUpperCase() === normalized) || w.email.toLowerCase() === normalizedEmail
      );
      if (isWhitelisted) {
        const defaultHash = isWhitelisted.role === 'admin'
          ? '8634fdb56bedafe3bf9dac79ea1f69836cb0418c31526ec02d0c78dd6a4a1af0' // Faculty@2026
          : '0015339fcd0f6ff3a2144b33a7f94700e2f62f8cd6ec001cf1f7a39b08772fa9'; // Prime@123
        
        cred = {
          id: 'cred-' + Date.now(),
          reg_no: isWhitelisted.roll_no || isWhitelisted.email,
          email: isWhitelisted.email,
          password_hash: defaultHash,
          user_id: isWhitelisted.roll_no ? `sec-${isWhitelisted.roll_no}` : isWhitelisted.id,
          role: isWhitelisted.role,
          is_registered: true,
        };
        setCredentials(prev => [...prev, cred!]);
      }
    }

    if (!cred) {
      return {
        success: false,
        message: 'Account not found. If you are a first-time user, please click "Register First".',
      };
    }

    // Verify password hash
    const isValid = await verifyPassword(password, cred.password_hash);
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid password. (Default initial password for students is Prime@123 or register your own).',
      };
    }

    // Find profile
    let profile = allAvailableUsers.find(
      u =>
        u.email.toLowerCase() === cred!.email.toLowerCase() ||
        (u.roll_no && u.roll_no.toUpperCase() === cred!.reg_no.toUpperCase())
    );

    if (!profile) {
      const wl = whitelist.find(w => w.email.toLowerCase() === cred!.email.toLowerCase());
      profile = {
        id: cred.user_id,
        email: cred.email,
        name: wl ? wl.name : cred.reg_no,
        role: cred.role,
        designation: cred.role === 'admin' ? 'Faculty Admin' : 'Prime Scholar',
        department: wl ? wl.department : 'Engineering',
        roll_no: cred.reg_no,
      };
    }

    setCurrentUser(profile);
    return { success: true, message: `Welcome back, ${profile.name}!` };
  };

  // Register handler: For first-time students or faculty
  const register = async (
    regNo: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const rawReg = regNo.trim().toUpperCase();
    const rawEmail = email.trim().toLowerCase();

    if (!rawReg) {
      return { success: false, message: 'Register Number or Faculty ID is required.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // 1. Verify that user is whitelisted
    const matchedWhitelist = whitelist.find(
      w =>
        (w.roll_no && w.roll_no.toUpperCase() === rawReg) ||
        w.email.toLowerCase() === rawEmail ||
        w.email.toLowerCase().startsWith(rawReg.toLowerCase() + '@')
    );

    if (!matchedWhitelist) {
      return {
        success: false,
        message: 'Access Denied: Register Number is not whitelisted by Dr. Karthika RN, Dr. Rajesh, or Dr. Karthi Govindaraju.',
      };
    }

    // 2. Hash password
    const hashed = await hashPassword(password);

    // 3. Update or create credential
    const newCred: AuthCredential = {
      id: 'cred-' + Date.now(),
      reg_no: matchedWhitelist.roll_no || rawReg,
      email: matchedWhitelist.email || rawEmail,
      password_hash: hashed,
      user_id: matchedWhitelist.roll_no ? `sec-${matchedWhitelist.roll_no}` : `user-${Date.now()}`,
      role: matchedWhitelist.role,
      is_registered: true,
      registered_at: new Date().toISOString(),
    };

    setCredentials(prev => {
      const filtered = prev.filter(c => c.reg_no.toUpperCase() !== rawReg && c.email.toLowerCase() !== rawEmail);
      return [...filtered, newCred];
    });

    // 4. Log in immediately
    let profile = allAvailableUsers.find(
      u =>
        (u.roll_no && u.roll_no.toUpperCase() === rawReg) ||
        u.email.toLowerCase() === matchedWhitelist.email.toLowerCase()
    );

    if (!profile) {
      profile = {
        id: newCred.user_id,
        email: matchedWhitelist.email,
        name: matchedWhitelist.name,
        role: matchedWhitelist.role,
        designation: matchedWhitelist.designation || (matchedWhitelist.role === 'admin' ? 'Faculty Admin' : 'Prime Scholar'),
        department: matchedWhitelist.department,
        roll_no: matchedWhitelist.roll_no,
      };
    }

    setCurrentUser(profile);
    return { success: true, message: `Registration successful! Welcome to Saveetha Prime, ${matchedWhitelist.name}.` };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Add new email to whitelist (Admin only)
  const addToWhitelist = async (entry: Omit<WhitelistUser, 'id' | 'created_at' | 'added_by'>): Promise<boolean> => {
    const emailNormalized = entry.email.trim().toLowerCase();
    
    if (whitelist.some(w => w.email.toLowerCase() === emailNormalized)) {
      return false;
    }

    const newEntry: WhitelistUser = {
      id: 'wl-' + Date.now(),
      ...entry,
      email: emailNormalized,
      added_by: currentUser ? currentUser.name : 'Dr. Karthika RN',
      created_at: new Date().toISOString(),
    };

    setWhitelist(prev => [newEntry, ...prev]);

    // Create a default initial credential
    const defaultHash = entry.role === 'admin'
      ? '8634fdb56bedafe3bf9dac79ea1f69836cb0418c31526ec02d0c78dd6a4a1af0' // Faculty@2026
      : '0015339fcd0f6ff3a2144b33a7f94700e2f62f8cd6ec001cf1f7a39b08772fa9'; // Prime@123

    const newCred: AuthCredential = {
      id: 'cred-' + Date.now(),
      reg_no: entry.roll_no || emailNormalized,
      email: emailNormalized,
      password_hash: defaultHash,
      user_id: entry.roll_no ? `sec-${entry.roll_no}` : `usr-${Date.now()}`,
      role: entry.role,
      is_registered: false,
    };
    setCredentials(prev => [...prev, newCred]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('access_whitelist').insert([newEntry]);
      } catch (err) {
        console.error('Failed to sync whitelist with Supabase:', err);
      }
    }

    return true;
  };

  // Remove email from whitelist (Admin only)
  const removeFromWhitelist = async (id: string): Promise<boolean> => {
    const item = whitelist.find(w => w.id === id);
    if (!item) return false;

    if ([
      'karthika.rn@saveetha.ac.in',
      'rajesh.director@saveetha.ac.in',
      'karthi.govindaraju@saveetha.ac.in'
    ].includes(item.email.toLowerCase())) {
      alert('Core administrative leaders cannot be removed.');
      return false;
    }

    setWhitelist(prev => prev.filter(w => w.id !== id));
    return true;
  };

  const switchUser = (idOrEmail: string) => {
    const found = allAvailableUsers.find(
      u => u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()
    );
    if (found) {
      setCurrentUser(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        loginWithEmail,
        register,
        logout,
        checkRegNoEligible,
        whitelist,
        addToWhitelist,
        removeFromWhitelist,
        isAdmin,
        switchUser,
        allAvailableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
