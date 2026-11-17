import React, { useState } from 'react';
import { StudentCard, CardStatus, TrackCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCards } from '../context/CardsContext';
import { 
  Award, 
  Briefcase, 
  Code2, 
  BookOpen, 
  FolderKanban, 
  ExternalLink, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  User,
  Calendar
} from 'lucide-react';

interface KanbanCardProps {
  card: StudentCard;
  onEdit: (card: StudentCard) => void;
}

const CATEGORY_CONFIG: Record<TrackCategory, { label: string; bg: string; text: string; border: string; icon: any }> = {
  academic: {
    label: 'Academic',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: BookOpen,
  },
  hackathon: {
    label: 'Hackathon',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: Code2,
  },
  competition: {
    label: 'Competition',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Award,
  },
  internship: {
    label: 'Internship',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: Briefcase,
  },
  project: {
    label: 'Project',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: FolderKanban,
  },
};

const STATUS_ORDER: CardStatus[] = ['planned', 'in_progress', 'review', 'completed'];

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onEdit }) => {
  const { isAdmin, currentUser } = useAuth();
  const { deleteCard, moveCardStatus, addAdminRemarks } = useCards();

  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [remarksText, setRemarksText] = useState(card.admin_remarks || '');

  const categoryMeta = CATEGORY_CONFIG[card.category] || CATEGORY_CONFIG.project;
  const CategoryIcon = categoryMeta.icon;

  const currentStatusIndex = STATUS_ORDER.indexOf(card.status);
  const canMoveLeft = currentStatusIndex > 0;
  const canMoveRight = currentStatusIndex < STATUS_ORDER.length - 1;

  const handleSaveRemarks = async () => {
    if (remarksText.trim()) {
      await addAdminRemarks(card.id, remarksText);
    }
    setIsEditingRemarks(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${card.title}"?`)) {
      await deleteCard(card.id);
    }
  };

  return (
    <div className="bg-white border border-[#E9E4D9] rounded-xl p-4 shadow-2xs hover:shadow-sm hover:border-[#DDD6C8] transition-all flex flex-col justify-between group">
      <div>
        {/* Top bar: Category and Date */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${categoryMeta.bg} ${categoryMeta.text} ${categoryMeta.border}`}>
            <CategoryIcon className="w-3 h-3" />
            {categoryMeta.label}
          </span>

          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            <Calendar className="w-3 h-3" />
            <span>{card.date}</span>
          </div>
        </div>

        {/* Student Name tag (Crucial for Admins like Dr. Karthika, Dr. Rajesh, Dr. Karthi Govindaraju) */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mb-1.5 bg-[#FAF8F5] px-2 py-1 rounded border border-[#EDE8DE] w-fit">
            <User className="w-3 h-3 text-stone-400" />
            <span className="font-semibold text-stone-800">{card.student_name}</span>
            {card.roll_no && <span className="text-[10px] text-stone-400 font-mono">({card.roll_no})</span>}
          </div>
        )}

        {/* Title & Organization */}
        <h4 className="text-sm font-semibold text-stone-900 leading-snug group-hover:text-stone-950 transition">
          {card.title}
        </h4>
        <p className="text-xs text-stone-500 font-medium mt-0.5">
          {card.organization_or_event}
        </p>

        {/* Outcome / Metric Badge if present */}
        {card.metrics_or_outcome && (
          <div className="mt-2.5 inline-block bg-[#FAF6EE] text-[#8C5E1E] border border-[#EADFCB] px-2.5 py-1 rounded-lg text-xs font-semibold">
            {card.metrics_or_outcome}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
          {card.description}
        </p>

        {/* Proof / Verification link */}
        {card.proof_link && (
          <div className="mt-2.5">
            <a
              href={card.proof_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 px-2 py-1 rounded border border-stone-200 transition"
            >
              <ExternalLink className="w-3 h-3 text-stone-500" />
              <span>View Proof / Repo</span>
            </a>
          </div>
        )}

        {/* Faculty Admin Remarks Block */}
        {card.admin_remarks && !isEditingRemarks && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E8DEC8] text-xs">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-900 mb-0.5">
              <MessageSquare className="w-3 h-3 text-amber-700" />
              <span>Faculty Assessment</span>
            </div>
            <p className="text-stone-700 text-[11px] leading-relaxed italic">
              "{card.admin_remarks}"
            </p>
          </div>
        )}

        {/* Admin Remarks Inline Editor (Admin Only) */}
        {isEditingRemarks && isAdmin && (
          <div className="mt-2.5 p-2 rounded-lg bg-[#FAF8F3] border border-amber-300">
            <label className="block text-[10px] font-semibold text-amber-900 uppercase tracking-wider mb-1">
              Add Faculty Endorsement / Input
            </label>
            <textarea
              value={remarksText}
              onChange={e => setRemarksText(e.target.value)}
              className="w-full text-xs p-1.5 border border-[#DECDB3] rounded bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              rows={2}
              placeholder="e.g. Verified paper presentation; eligible for prime travel grant."
            />
            <div className="flex justify-end gap-1.5 mt-1.5">
              <button
                onClick={() => setIsEditingRemarks(false)}
                className="px-2 py-0.5 text-[11px] rounded text-stone-600 hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemarks}
                className="px-2.5 py-0.5 text-[11px] rounded bg-stone-900 text-white font-medium hover:bg-stone-800"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-3 pt-2.5 border-t border-[#F2EDE2] flex items-center justify-between text-xs text-stone-500">
        
        {/* Left / Right Column Mover */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => canMoveLeft && moveCardStatus(card.id, STATUS_ORDER[currentStatusIndex - 1])}
            disabled={!canMoveLeft}
            className={`p-1 rounded transition ${
              canMoveLeft ? 'text-stone-600 hover:bg-stone-100 hover:text-stone-900' : 'text-stone-300 cursor-not-allowed'
            }`}
            title="Move to previous status"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => canMoveRight && moveCardStatus(card.id, STATUS_ORDER[currentStatusIndex + 1])}
            disabled={!canMoveRight}
            className={`p-1 rounded transition ${
              canMoveRight ? 'text-stone-600 hover:bg-stone-100 hover:text-stone-900' : 'text-stone-300 cursor-not-allowed'
            }`}
            title="Move to next status"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Actions (Edit, Admin Remarks, Delete) */}
        <div className="flex items-center gap-1.5">
          {isAdmin && !isEditingRemarks && (
            <button
              onClick={() => setIsEditingRemarks(true)}
              className="text-[11px] text-amber-800 hover:text-amber-950 font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-amber-50 transition"
              title="Add Faculty Incharge remarks"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Remark</span>
            </button>
          )}

          <button
            onClick={() => onEdit(card)}
            className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded transition"
            title="Edit Milestone"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDelete}
            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
            title="Delete Record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
