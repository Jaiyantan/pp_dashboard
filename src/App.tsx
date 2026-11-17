import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CardsProvider, useCards } from './context/CardsContext';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { StudentSummaryHeader } from './components/StudentSummaryHeader';
import { CardModal } from './components/CardModal';
import { AccessControlModal } from './components/AccessControlModal';
import { SupabaseModal } from './components/SupabaseModal';
import { EmailLoginModal } from './components/EmailLoginModal';
import { AuthPage } from './components/AuthPage';
import type { CardStatus, StudentCard } from './types';
import { 
  GraduationCap
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentUser, isAdmin, isAuthenticated } = useAuth();
  const { cards, categoryCounts } = useCards();

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<StudentCard | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<CardStatus>('in_progress');

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // If user is not authenticated, render login & registration page
  if (!isAuthenticated || !currentUser) {
    return <AuthPage />;
  }

  const handleOpenNewCard = (status: CardStatus = 'in_progress') => {
    setCardToEdit(null);
    setDefaultStatus(status);
    setIsCardModalOpen(true);
  };

  const handleEditCard = (card: StudentCard) => {
    setCardToEdit(card);
    setIsCardModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onOpenAccessControl={() => setIsAccessModalOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenNewCard={() => handleOpenNewCard('in_progress')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Dynamic Header: Student Summary vs Faculty Admin Hub */}
        {isAdmin ? (
          <div className="bg-white border border-[#EBE6DC] rounded-2xl p-5 mb-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Executive / Faculty Leadership Hub
                  </span>
                  <span className="text-xs text-stone-400">• Full Read / Write / Endorsement Access</span>
                </div>
                
                <h1 className="text-xl font-bold text-stone-900 mt-1.5 tracking-tight">
                  Prime Project Student Review & Progress Hub
                </h1>
                
                <p className="text-xs text-stone-500 mt-1">
                  Active Faculty: <strong className="text-stone-800">{currentUser.name}</strong> ({currentUser.designation})
                  <span className="hidden sm:inline"> • Designated Leaders: Dr. Karthika RN, Dr. Rajesh (Director), Dr. Karthi Govindaraju (HOD)</span>
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-[#FAF8F5] border border-[#ECE6DB] rounded-xl px-3 py-2 text-center min-w-[90px]">
                  <div className="text-sm font-bold text-stone-800">{cards.length}</div>
                  <div className="text-[10px] text-stone-500 font-medium">Total Records</div>
                </div>
                <div className="bg-[#FAF8F5] border border-[#ECE6DB] rounded-xl px-3 py-2 text-center min-w-[90px]">
                  <div className="text-sm font-bold text-purple-700">{categoryCounts.hackathon}</div>
                  <div className="text-[10px] text-stone-500 font-medium">Hackathons</div>
                </div>
                <div className="bg-[#FAF8F5] border border-[#ECE6DB] rounded-xl px-3 py-2 text-center min-w-[90px]">
                  <div className="text-sm font-bold text-emerald-700">{categoryCounts.internship}</div>
                  <div className="text-[10px] text-stone-500 font-medium">Internships</div>
                </div>
                <div className="bg-[#FAF8F5] border border-[#ECE6DB] rounded-xl px-3 py-2 text-center min-w-[90px]">
                  <div className="text-sm font-bold text-rose-700">{categoryCounts.project}</div>
                  <div className="text-[10px] text-stone-500 font-medium">Prime Projects</div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <StudentSummaryHeader />
        )}

        {/* Kanban Board Component */}
        <KanbanBoard
          onOpenNewCard={handleOpenNewCard}
          onEditCard={handleEditCard}
        />

      </main>

      {/* Minimalist Whitish Ivory Footer */}
      <footer className="mt-auto border-t border-[#E8E2D5] bg-[#FAF8F5] py-5 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <GraduationCap className="w-4 h-4 text-stone-700" />
            <span className="font-semibold text-stone-800">Saveetha Engineering College (Autonomous)</span>
            <span>— Prime Project Initiative</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Coordinated by Dr. Karthika RN • Approved by Director Dr. Rajesh & HOD Dr. Karthi Govindaraju
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        cardToEdit={cardToEdit}
        defaultStatus={defaultStatus}
      />

      <AccessControlModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <EmailLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <CardsProvider>
        <DashboardContent />
      </CardsProvider>
    </AuthProvider>
  );
}

export default App;
