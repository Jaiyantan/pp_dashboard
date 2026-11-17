import React from 'react';
import { CardStatus, StudentCard, TrackCategory } from '../types';
import { useCards } from '../context/CardsContext';
import { useAuth } from '../context/AuthContext';
import { KanbanCard } from './KanbanCard';
import { 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  Eye, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface KanbanBoardProps {
  onOpenNewCard: (defaultStatus?: CardStatus) => void;
  onEditCard: (card: StudentCard) => void;
}

const COLUMNS: { id: CardStatus; title: string; subtitle: string; color: string; badgeBg: string }[] = [
  {
    id: 'planned',
    title: 'Planned / Idea',
    subtitle: 'Upcoming applications & targets',
    color: 'border-stone-300',
    badgeBg: 'bg-stone-200 text-stone-700',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    subtitle: 'Currently building / participating',
    color: 'border-amber-300',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'review',
    title: 'Under Review',
    subtitle: 'Faculty mentor evaluation',
    color: 'border-purple-300',
    badgeBg: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'completed',
    title: 'Completed / Won',
    subtitle: 'Prizes, publications & offers',
    color: 'border-emerald-300',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
];

const CATEGORIES: { id: TrackCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Tracks' },
  { id: 'academic', label: 'Academics' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'competition', label: 'Competitions' },
  { id: 'internship', label: 'Internships' },
  { id: 'project', label: 'Prime Projects' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onOpenNewCard, onEditCard }) => {
  const { 
    visibleCards, 
    selectedCategory, 
    setSelectedCategory,
    selectedStudentFilter,
    setSelectedStudentFilter,
    searchQuery,
    setSearchQuery,
    categoryCounts,
    statusCounts,
    uniqueStudents
  } = useCards();

  const { isAdmin, allAvailableUsers } = useAuth();
  const allPrimeStudents = allAvailableUsers.filter(u => u.role === 'student');

  return (
    <div className="space-y-5">
      
      {/* Top Filter and Search Bar */}
      <div className="bg-white border border-[#EBE6DC] rounded-2xl p-4 shadow-2xs space-y-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id];
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-stone-600 hover:bg-[#F2ECE1] border border-[#ECE5D8]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-stone-800 text-stone-300' : 'bg-[#EAE4D7] text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Bar: Student Filter (Admins) + Search + Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-[#F2ECE1]">
          
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search milestone, event, student, roll no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E0D9CB] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 text-stone-800 placeholder-stone-400"
              />
            </div>

            {/* Student Filter Dropdown (Admins Only) */}
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500 font-medium">Filter Student:</span>
                <select
                  value={selectedStudentFilter}
                  onChange={e => setSelectedStudentFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 bg-[#FAF8F5] border border-[#E0D9CB] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 text-stone-800 font-medium max-w-[260px]"
                >
                  <option value="all">All Prime Scholars ({allPrimeStudents.length})</option>
                  {allPrimeStudents.map(student => (
                    <option key={student.email} value={student.email}>
                      {student.name} ({student.roll_no || student.department})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => onOpenNewCard()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Progress Entry</span>
          </button>
        </div>

      </div>

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map(column => {
          const columnCards = visibleCards.filter(c => c.status === column.id);

          return (
            <div
              key={column.id}
              className="bg-[#F8F5EE]/60 border border-[#EAE4D8] rounded-2xl p-3 flex flex-col min-h-[580px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E8E1D3]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-stone-800">{column.title}</h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${column.badgeBg}`}>
                      {columnCards.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-normal mt-0.5">{column.subtitle}</p>
                </div>

                <button
                  onClick={() => onOpenNewCard(column.id)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-[#EFE9DD] transition"
                  title={`Add card to ${column.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-0.5">
                {columnCards.length === 0 ? (
                  <div className="h-36 rounded-xl border border-dashed border-[#DFD8CB] flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-stone-400 font-medium">No records in this stage</p>
                    <button
                      onClick={() => onOpenNewCard(column.id)}
                      className="mt-2 text-[11px] text-stone-600 hover:text-stone-900 font-semibold"
                    >
                      + Add milestone
                    </button>
                  </div>
                ) : (
                  columnCards.map(card => (
                    <KanbanCard key={card.id} card={card} onEdit={onEditCard} />
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
