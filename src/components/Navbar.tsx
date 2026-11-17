import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Database, 
  Users, 
  LogIn, 
  LogOut,
  ChevronDown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenAccessControl: () => void;
  onOpenSupabase: () => void;
  onOpenLogin: () => void;
  onOpenNewCard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAccessControl,
  onOpenSupabase,
  onOpenLogin,
  onOpenNewCard,
}) => {
  const { currentUser, isAdmin, switchUser, allAvailableUsers, logout } = useAuth();
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [switchSearch, setSwitchSearch] = useState('');

  const filteredStudents = allAvailableUsers
    .filter(u => u.role === 'student')
    .filter(s => {
      const q = switchSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q))
      );
    });

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and College Brand */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-[#FAF8F5] flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-stone-900 tracking-tight">Saveetha Engineering College</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles className="w-2.5 h-2.5 mr-1" /> PRIME
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">Prime Project Student Performance & Milestone Tracker</p>
            </div>
          </div>

          {/* Quick Add Button on Mobile */}
          <button
            onClick={onOpenNewCard}
            className="md:hidden px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition"
          >
            + New
          </button>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 justify-end w-full md:w-auto">
          
          {/* Supabase Status Chip */}
          <button
            onClick={onOpenSupabase}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D9CB] bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 transition shadow-2xs"
            title="Configure Supabase Database"
          >
            <Database className="w-3.5 h-3.5 text-stone-500" />
            <span>DB:</span>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center text-emerald-700 font-semibold gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase Live
              </span>
            ) : (
              <span className="inline-flex items-center text-stone-500 gap-1 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Local Sandbox
              </span>
            )}
          </button>

          {/* Access Control Button (Visible to Admins: Dr. Karthika RN, Dr. Rajesh, Dr. Karthi Govindaraju) */}
          {isAdmin && (
            <button
              onClick={onOpenAccessControl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D9CB] bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 transition shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Email Whitelist</span>
            </button>
          )}

          {/* Role / Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DDD5C5] bg-white text-xs font-medium text-stone-800 hover:bg-[#F9F7F3] transition shadow-2xs"
            >
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-600' : 'bg-blue-600'}`}></div>
              <div className="text-left">
                <span className="font-semibold">{currentUser.name}</span>
                <span className="text-[10px] text-stone-400 ml-1.5">
                  ({isAdmin ? 'Faculty Admin' : 'Student'})
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Dropdown Menu */}
            {showSwitchDropdown && (
              <div 
                className="absolute right-0 mt-1.5 w-72 rounded-xl bg-white border border-[#E2DBCF] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setShowSwitchDropdown(false)}
              >
                <div className="px-3 py-1.5 border-b border-[#F0EBE1] text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Faculty Admins (Full Edit & View)
                </div>
                {allAvailableUsers
                  .filter(u => u.role === 'admin')
                  .map(admin => (
                    <button
                      key={admin.id}
                      onClick={() => {
                        switchUser(admin.id);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#FAF8F4] transition ${
                        currentUser.id === admin.id ? 'bg-[#F6F2E9] font-semibold text-stone-900' : 'text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-[10px] text-stone-500">{admin.designation}</div>
                      </div>
                      {currentUser.id === admin.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  ))}

                <div className="px-3 pt-2 pb-1 border-t border-[#F0EBE1] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Prime Scholars ({allAvailableUsers.filter(u => u.role === 'student').length})
                  </span>
                </div>

                <div className="px-2.5 pb-1.5">
                  <input
                    type="text"
                    placeholder="Search name or reg no..."
                    value={switchSearch}
                    onChange={e => setSwitchSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="w-full text-xs px-2.5 py-1 bg-[#FAF8F5] border border-[#DDD6C8] rounded-md focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-[#F6F2E9]">
                  {filteredStudents.slice(0, 40).map(student => (
                    <button
                      key={student.id}
                      onClick={() => {
                        switchUser(student.id);
                        setShowSwitchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#FAF8F4] transition ${
                        currentUser.id === student.id ? 'bg-[#F6F2E9] font-semibold text-stone-900' : 'text-stone-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-stone-900">{student.name}</div>
                        <div className="text-[10px] text-stone-500 font-mono">{student.roll_no} • {student.department}</div>
                      </div>
                      {currentUser.id === student.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                  {filteredStudents.length > 40 && (
                    <div className="px-3 py-1 text-[10px] text-stone-400 italic text-center">
                      Showing top 40 of {filteredStudents.length} matching students. Type to narrow search.
                    </div>
                  )}
                </div>

                <div className="border-t border-[#F0EBE1] pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowSwitchDropdown(false);
                      onOpenLogin();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-50 flex items-center gap-1.5 transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-700" />
                    Sign in with another Email ID...
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (window.confirm('Sign out of Saveetha Prime Portal?')) {
                logout();
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E0D9CB] bg-white text-xs font-medium text-stone-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition shadow-2xs"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          {/* New Milestone / Record Button */}
          <button
            onClick={onOpenNewCard}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition shadow-xs"
          >
            <span>+ Add Entry</span>
          </button>
        </div>

      </div>
    </header>
  );
};
