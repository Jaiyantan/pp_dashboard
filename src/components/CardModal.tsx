import React, { useState, useEffect } from 'react';
import { StudentCard, TrackCategory, CardStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCards } from '../context/CardsContext';
import { X, Sparkles, Check, Info } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: StudentCard | null;
  defaultStatus?: CardStatus;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  cardToEdit,
  defaultStatus = 'in_progress',
}) => {
  const { currentUser, isAdmin, allAvailableUsers } = useAuth();
  const { addCard, updateCard } = useCards();

  const primeStudents = allAvailableUsers.filter(u => u.role === 'student');

  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState<TrackCategory>('hackathon');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [status, setStatus] = useState<CardStatus>(defaultStatus);
  const [description, setDescription] = useState('');
  const [metrics, setMetrics] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminRemarks, setAdminRemarks] = useState('');

  // Populate state on open or cardToEdit change
  useEffect(() => {
    if (cardToEdit) {
      setStudentEmail(cardToEdit.student_email);
      setStudentName(cardToEdit.student_name);
      setRollNo(cardToEdit.roll_no || '');
      setDepartment(cardToEdit.department || '');
      setCategory(cardToEdit.category);
      setTitle(cardToEdit.title);
      setOrganization(cardToEdit.organization_or_event);
      setStatus(cardToEdit.status);
      setDescription(cardToEdit.description);
      setMetrics(cardToEdit.metrics_or_outcome || '');
      setProofLink(cardToEdit.proof_link || '');
      setDate(cardToEdit.date || new Date().toISOString().split('T')[0]);
      setAdminRemarks(cardToEdit.admin_remarks || '');
    } else {
      // New card
      if (!isAdmin && currentUser) {
        setStudentEmail(currentUser.email);
        setStudentName(currentUser.name);
        setRollNo(currentUser.roll_no || '');
        setDepartment(currentUser.department || '');
      } else {
        const first = primeStudents[0];
        setStudentEmail(first?.email || '212224040269@saveetha.ac.in');
        setStudentName(first?.name || 'A. Ranen Joseph Solomon');
        setRollNo(first?.roll_no || '212224040269');
        setDepartment(first?.department || 'CSE');
      }
      setCategory('hackathon');
      setTitle('');
      setOrganization('');
      setStatus(defaultStatus);
      setDescription('');
      setMetrics('');
      setProofLink('');
      setDate(new Date().toISOString().split('T')[0]);
      setAdminRemarks('');
    }
  }, [cardToEdit, defaultStatus, isOpen, isAdmin, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !organization.trim()) {
      alert('Please fill in the title and organization/event name.');
      return;
    }

    if (cardToEdit) {
      await updateCard(cardToEdit.id, {
        category,
        title: title.trim(),
        organization_or_event: organization.trim(),
        status,
        description: description.trim(),
        metrics_or_outcome: metrics.trim(),
        proof_link: proofLink.trim(),
        date,
        ...(isAdmin && adminRemarks ? { admin_remarks: adminRemarks } : {}),
      });
    } else {
      await addCard({
        student_id: isAdmin ? (primeStudents.find(s => s.email === studentEmail)?.id || 'student-custom') : currentUser!.id,
        student_name: isAdmin ? studentName : currentUser!.name,
        student_email: isAdmin ? studentEmail : currentUser!.email,
        roll_no: isAdmin ? rollNo : currentUser!.roll_no,
        department: isAdmin ? department : currentUser!.department,
        category,
        title: title.trim(),
        organization_or_event: organization.trim(),
        status,
        description: description.trim(),
        metrics_or_outcome: metrics.trim(),
        proof_link: proofLink.trim(),
        date,
        admin_remarks: isAdmin && adminRemarks ? adminRemarks : undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-white border border-[#E2DBD0] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#ECE6DB] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900">
              {cardToEdit ? 'Edit Milestone Entry' : 'Add Prime Milestone Entry'}
            </h3>
            <p className="text-xs text-stone-500">
              Saveetha Engineering College Prime Project Performance Tracker
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#EFE9DE] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Student selection (if admin) or Student indicator */}
          {isAdmin ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Student Assignee
              </label>
              <select
                value={studentEmail}
                onChange={e => {
                  const email = e.target.value;
                  setStudentEmail(email);
                  const matched = primeStudents.find(s => s.email === email);
                  if (matched) {
                    setStudentName(matched.name);
                    setRollNo(matched.roll_no || '');
                    setDepartment(matched.department || '');
                  }
                }}
                disabled={Boolean(cardToEdit)}
                className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
              >
                {primeStudents.map(s => (
                  <option key={s.email} value={s.email}>
                    {s.name} ({s.roll_no || s.department} - {s.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] border border-[#ECE6DB] rounded-lg p-2.5 flex items-center justify-between text-xs">
              <span className="text-stone-600">Submitting as: <strong className="text-stone-900">{currentUser.name}</strong></span>
              <span className="text-stone-400 font-mono text-[11px]">{currentUser.roll_no} • {currentUser.department}</span>
            </div>
          )}

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Track Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TrackCategory)}
                className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium"
              >
                <option value="academic">Academic (CGPA, Exams, Courses)</option>
                <option value="hackathon">Hackathon (SIH, collegiate hackathons)</option>
                <option value="competition">Competition (Paper, Coding, Robotics)</option>
                <option value="internship">Internship (Company, Stipend, PPO)</option>
                <option value="project">Prime Project (Capstone, R&D, Patent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kanban Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CardStatus)}
                className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 font-medium"
              >
                <option value="planned">Planned / Backlog</option>
                <option value="in_progress">In Progress / Active</option>
                <option value="review">Under Review / Mentor Review</option>
                <option value="completed">Completed / Won / Certified</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Title / Milestone Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Smart India Hackathon 2026 - Smart Irrigation System"
              className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
            />
          </div>

          {/* Organization / Event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Organization / Event / Company *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="e.g. AICTE / Ministry of Jal Shakti / Zoho Corp"
                className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Date / Target Deadline
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
              />
            </div>
          </div>

          {/* Key Metric / Outcome */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Outcome / Prize / Metric (Optional)
            </label>
            <input
              type="text"
              value={metrics}
              onChange={e => setMetrics(e.target.value)}
              placeholder="e.g. 🏆 1st Prize (₹1,00,000) OR CGPA: 9.32 OR Stipend: ₹35,000/mo"
              className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description & Current Progress Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context, architecture overview, deliverables completed, or upcoming sprint goals..."
              className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 leading-relaxed"
            />
          </div>

          {/* Proof URL */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Proof Link / GitHub Repository / Certificate URL
            </label>
            <input
              type="url"
              value={proofLink}
              onChange={e => setProofLink(e.target.value)}
              placeholder="https://github.com/saveetha-prime/... or Google Drive Link"
              className="w-full text-xs p-2 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
            />
          </div>

          {/* Faculty Remarks (Visible/Editable for Admins only) */}
          {isAdmin && (
            <div className="bg-[#FAF8F3] border border-[#E8DFC8] rounded-xl p-3">
              <label className="block text-xs font-semibold text-amber-900 mb-1">
                Faculty Incharge Endorsement / Remarks
              </label>
              <textarea
                rows={2}
                value={adminRemarks}
                onChange={e => setAdminRemarks(e.target.value)}
                placeholder="Endorsement notes, verification remarks, or recommended college sponsorship..."
                className="w-full text-xs p-2 bg-white border border-[#E0D4BA] rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                Signed by: Dr. Karthika RN / Dr. Rajesh / Dr. Karthi Govindaraju
              </span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#ECE6DB] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-xs"
            >
              {cardToEdit ? 'Save Changes' : 'Create Record'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
