import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { StudentCard, TrackCategory, CardStatus } from '../types';
import { INITIAL_CARDS } from '../data/mockData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface CardsContextType {
  cards: StudentCard[];
  visibleCards: StudentCard[];
  selectedCategory: TrackCategory | 'all';
  setSelectedCategory: (category: TrackCategory | 'all') => void;
  selectedStudentFilter: string; // 'all' or student_id
  setSelectedStudentFilter: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addCard: (cardData: Omit<StudentCard, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateCard: (id: string, updates: Partial<StudentCard>) => Promise<boolean>;
  deleteCard: (id: string) => Promise<boolean>;
  moveCardStatus: (id: string, newStatus: CardStatus) => Promise<boolean>;
  addAdminRemarks: (id: string, remarks: string) => Promise<boolean>;
  categoryCounts: Record<TrackCategory | 'all', number>;
  statusCounts: Record<CardStatus, number>;
  uniqueStudents: { id: string; name: string; email: string; roll_no?: string; department?: string }[];
}

const CardsContext = createContext<CardsContextType | undefined>(undefined);

const CARDS_STORAGE_KEY = 'sec_prime_cards_v2';

export const CardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  const [cards, setCards] = useState<StudentCard[]>(() => {
    const saved = localStorage.getItem(CARDS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cards from localStorage', e);
      }
    }
    return INITIAL_CARDS;
  });

  const [selectedCategory, setSelectedCategory] = useState<TrackCategory | 'all'>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist local changes
  useEffect(() => {
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  // Sync with Supabase if configured
  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const fetchCards = async () => {
        try {
          let query = client.from('student_cards').select('*');
          // If not admin, RLS and query scope to current user
          if (!isAdmin && currentUser?.email) {
            query = query.eq('student_email', currentUser.email);
          }
          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            setCards(data as StudentCard[]);
          }
        } catch (err) {
          console.warn('Could not fetch student_cards from Supabase:', err);
        }
      };
      fetchCards();
    }
  }, [currentUser?.email, isAdmin]);

  // List of unique students across cards
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string; roll_no?: string; department?: string }>();
    cards.forEach(c => {
      if (!map.has(c.student_email)) {
        map.set(c.student_email, {
          id: c.student_id,
          name: c.student_name,
          email: c.student_email,
          roll_no: c.roll_no,
          department: c.department,
        });
      }
    });
    return Array.from(map.values());
  }, [cards]);

  // User permission filtering (Requirement #2: students can only see their own progress!)
  const userPermittedCards = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) {
      return cards;
    }
    // Student can ONLY view their own records
    const userEmail = currentUser.email.toLowerCase();
    const userRoll = currentUser.roll_no ? currentUser.roll_no.toLowerCase() : '';

    return cards.filter(
      c =>
        c.student_email.toLowerCase() === userEmail ||
        (userRoll && c.roll_no && c.roll_no.toLowerCase() === userRoll)
    );
  }, [cards, isAdmin, currentUser]);

  // Secondary filters (Category, Student Filter, Search)
  const visibleCards = useMemo(() => {
    return userPermittedCards.filter(card => {
      // Category filter
      if (selectedCategory !== 'all' && card.category !== selectedCategory) {
        return false;
      }

      // Student filter (for Admins only, as students are already restricted to themselves)
      if (isAdmin && selectedStudentFilter !== 'all') {
        if (card.student_id !== selectedStudentFilter && card.student_email !== selectedStudentFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = card.title.toLowerCase().includes(query);
        const matchDesc = card.description.toLowerCase().includes(query);
        const matchEvent = card.organization_or_event.toLowerCase().includes(query);
        const matchStudent = card.student_name.toLowerCase().includes(query);
        const matchRoll = card.roll_no?.toLowerCase().includes(query);
        const matchOutcome = card.metrics_or_outcome?.toLowerCase().includes(query);

        if (!matchTitle && !matchDesc && !matchEvent && !matchStudent && !matchRoll && !matchOutcome) {
          return false;
        }
      }

      return true;
    });
  }, [userPermittedCards, selectedCategory, isAdmin, selectedStudentFilter, searchQuery]);

  // Counts for tabs & badges
  const categoryCounts = useMemo(() => {
    const counts: Record<TrackCategory | 'all', number> = {
      all: userPermittedCards.length,
      academic: 0,
      hackathon: 0,
      competition: 0,
      internship: 0,
      project: 0,
    };

    userPermittedCards.forEach(card => {
      if (counts[card.category] !== undefined) {
        counts[card.category]++;
      }
    });

    return counts;
  }, [userPermittedCards]);

  const statusCounts = useMemo(() => {
    const counts: Record<CardStatus, number> = {
      planned: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
    };

    visibleCards.forEach(card => {
      if (counts[card.status] !== undefined) {
        counts[card.status]++;
      }
    });

    return counts;
  }, [visibleCards]);

  // Add card
  const addCard = async (cardData: Omit<StudentCard, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!currentUser) return false;
    // If student is submitting, strictly enforce their identity
    const sanitizedStudentId = isAdmin ? cardData.student_id : currentUser.id;
    const sanitizedStudentName = isAdmin ? cardData.student_name : currentUser.name;
    const sanitizedStudentEmail = isAdmin ? cardData.student_email : currentUser.email;
    const sanitizedRollNo = isAdmin ? cardData.roll_no : currentUser.roll_no;
    const sanitizedDept = isAdmin ? cardData.department : currentUser.department;

    const newCard: StudentCard = {
      ...cardData,
      id: 'card-' + Date.now(),
      student_id: sanitizedStudentId,
      student_name: sanitizedStudentName,
      student_email: sanitizedStudentEmail,
      roll_no: sanitizedRollNo,
      department: sanitizedDept,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCards(prev => [newCard, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('student_cards').insert([
          {
            student_id: newCard.student_id,
            student_name: newCard.student_name,
            student_email: newCard.student_email,
            roll_no: newCard.roll_no,
            department: newCard.department,
            category: newCard.category,
            title: newCard.title,
            organization_or_event: newCard.organization_or_event,
            status: newCard.status,
            description: newCard.description,
            metrics_or_outcome: newCard.metrics_or_outcome,
            proof_link: newCard.proof_link,
            date: newCard.date,
            admin_remarks: newCard.admin_remarks,
          }
        ]);
      } catch (err) {
        console.error('Failed to insert card to Supabase:', err);
      }
    }

    return true;
  };

  // Update card
  const updateCard = async (id: string, updates: Partial<StudentCard>): Promise<boolean> => {
    const existing = cards.find(c => c.id === id);
    if (!existing) return false;

    // Student can only update their own card!
    if (!isAdmin && (!currentUser || existing.student_email.toLowerCase() !== currentUser.email.toLowerCase())) {
      alert('Unauthorized: You can only edit your own cards.');
      return false;
    }

    // Students cannot modify admin remarks
    const sanitizedUpdates = { ...updates };
    if (!isAdmin) {
      delete sanitizedUpdates.admin_remarks;
    }

    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, ...sanitizedUpdates, updated_at: new Date().toISOString() } : c))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('student_cards')
          .update({
            ...sanitizedUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.error('Failed to update card in Supabase:', err);
      }
    }

    return true;
  };

  // Delete card
  const deleteCard = async (id: string): Promise<boolean> => {
    const existing = cards.find(c => c.id === id);
    if (!existing) return false;

    if (!isAdmin && (!currentUser || existing.student_email.toLowerCase() !== currentUser.email.toLowerCase())) {
      alert('Unauthorized: You can only delete your own cards.');
      return false;
    }

    setCards(prev => prev.filter(c => c.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('student_cards').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete card from Supabase:', err);
      }
    }

    return true;
  };

  // Move status column
  const moveCardStatus = async (id: string, newStatus: CardStatus): Promise<boolean> => {
    return updateCard(id, { status: newStatus });
  };

  // Add/edit admin remarks (Dr. Karthika RN, Dr. Rajesh, Dr. Karthi Govindaraju)
  const addAdminRemarks = async (id: string, remarks: string): Promise<boolean> => {
    if (!isAdmin) {
      alert('Only Faculty Incharge, Director, or HOD can add admin remarks.');
      return false;
    }
    const facultyName = currentUser ? currentUser.name : 'Faculty Mentor';
    const stamp = `[${facultyName} - ${new Date().toLocaleDateString()}]: ${remarks.trim()}`;
    return updateCard(id, { admin_remarks: stamp });
  };

  return (
    <CardsContext.Provider
      value={{
        cards,
        visibleCards,
        selectedCategory,
        setSelectedCategory,
        selectedStudentFilter,
        setSelectedStudentFilter,
        searchQuery,
        setSearchQuery,
        addCard,
        updateCard,
        deleteCard,
        moveCardStatus,
        addAdminRemarks,
        categoryCounts,
        statusCounts,
        uniqueStudents,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardsContext);
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider');
  }
  return context;
};
