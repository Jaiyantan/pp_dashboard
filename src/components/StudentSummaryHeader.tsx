import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCards } from '../context/CardsContext';
import { 
  Award, 
  Briefcase, 
  Code2, 
  BookOpen, 
  FolderKanban, 
  ShieldCheck, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export const StudentSummaryHeader: React.FC = () => {
  const { currentUser } = useAuth();
  const { categoryCounts, statusCounts } = useCards();

  if (!currentUser) return null;

  return (
    <div className="bg-white border border-[#EBE6DC] rounded-2xl p-5 mb-6 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Student Profile Info */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#F6F2E9] border border-[#E0D8CB] flex items-center justify-center text-stone-800 text-lg font-bold">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">{currentUser.name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-600" /> Saveetha Prime Scholar
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-1">
              <span><strong>Roll:</strong> {currentUser.roll_no || 'N/A'}</span>
              <span>•</span>
              <span><strong>Dept:</strong> {currentUser.department || 'Engineering'}</span>
              <span>•</span>
              <span><strong>Email:</strong> {currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Milestone Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#FAF8F5] border border-[#ECE7DD] rounded-xl px-3 py-2 text-center">
            <div className="text-base font-bold text-stone-800">{categoryCounts.all}</div>
            <div className="text-[11px] text-stone-500 font-medium">Total Entries</div>
          </div>
          <div className="bg-[#FAF8F5] border border-[#ECE7DD] rounded-xl px-3 py-2 text-center">
            <div className="text-base font-bold text-amber-700">{statusCounts.in_progress}</div>
            <div className="text-[11px] text-stone-500 font-medium">In Progress</div>
          </div>
          <div className="bg-[#FAF8F5] border border-[#ECE7DD] rounded-xl px-3 py-2 text-center">
            <div className="text-base font-bold text-purple-700">{statusCounts.review}</div>
            <div className="text-[11px] text-stone-500 font-medium">Under Review</div>
          </div>
          <div className="bg-[#FAF8F5] border border-[#ECE7DD] rounded-xl px-3 py-2 text-center">
            <div className="text-base font-bold text-emerald-700">{statusCounts.completed}</div>
            <div className="text-[11px] text-stone-500 font-medium">Completed / Won</div>
          </div>
        </div>

      </div>

      {/* Scope Clarification Notice */}
      <div className="mt-4 pt-3.5 border-t border-[#F1EBE0] flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Isolated Student View:</strong> You are viewing and managing only your own records. Other students cannot view your progress.
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] text-stone-400">
          Faculty Mentors: Dr. Karthika RN • Dr. Rajesh • Dr. Karthi Govindaraju
        </span>
      </div>
    </div>
  );
};
