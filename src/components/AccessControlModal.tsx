import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WhitelistUser, UserRole } from '../types';
import { X, UserPlus, Shield, Trash2, CheckCircle2, Lock, Search } from 'lucide-react';

interface AccessControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessControlModal: React.FC<AccessControlModalProps> = ({ isOpen, onClose }) => {
  const { whitelist, addToWhitelist, removeFromWhitelist, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [designation, setDesignation] = useState('Prime Scholar');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [rollNo, setRollNo] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!email.trim() || !name.trim()) {
      setErrorMsg('Please enter both name and email.');
      return;
    }

    const success = await addToWhitelist({
      email: email.trim(),
      name: name.trim(),
      role,
      designation: designation.trim() || (role === 'admin' ? 'Faculty Admin' : 'Prime Scholar'),
      department: department.trim(),
      roll_no: rollNo.trim() || undefined,
    });

    if (success) {
      setSuccessMsg(`Access successfully granted to ${name} (${email})!`);
      setEmail('');
      setName('');
      setRollNo('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(`Email ${email} is already whitelisted.`);
    }
  };

  const handleRemove = async (user: WhitelistUser) => {
    if (window.confirm(`Revoke access for ${user.name} (${user.email})?`)) {
      await removeFromWhitelist(user.id);
    }
  };

  const filteredWhitelist = whitelist.filter(w => {
    const q = search.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.email.toLowerCase().includes(q) ||
      (w.roll_no && w.roll_no.toLowerCase().includes(q)) ||
      w.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E2DBD0] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#ECE6DB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Email-Based Access Control
              </h3>
              <p className="text-xs text-stone-500">
                Managed by Dr. Karthika RN, Dr. Rajesh, and Dr. Karthi Govindaraju
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
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Add New Whitelisted Email Form */}
          <div className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-stone-700" />
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Grant New Student / Faculty Access
              </h4>
            </div>

            {successMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. M. Harish"
                    className="w-full text-xs p-2 bg-white border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Saveetha Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. harish.m@saveetha.ac.in"
                    className="w-full text-xs p-2 bg-white border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={e => {
                      const r = e.target.value as UserRole;
                      setRole(r);
                      setDesignation(r === 'admin' ? 'Faculty Admin' : 'Prime Scholar');
                    }}
                    className="w-full text-xs p-2 bg-white border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
                  >
                    <option value="student">Student (Only own progress)</option>
                    <option value="admin">Faculty Admin (View & Edit all)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AI & DS">AI & DS</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="Mech / Robotics">Mech / Robotics</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Roll Number (Students)
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                    placeholder="211421104050"
                    className="w-full text-xs p-2 bg-white border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
                >
                  + Whitelist Email
                </button>
              </div>
            </form>
          </div>

          {/* Whitelisted Users Directory */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Whitelisted Users ({filteredWhitelist.length})
              </h4>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search whitelist..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-xs pl-7 pr-3 py-1 bg-[#FAF8F5] border border-[#DDD6C8] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800"
                />
              </div>
            </div>

            <div className="border border-[#E2DBD0] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-stone-600 font-semibold border-b border-[#E2DBD0]">
                  <tr>
                    <th className="p-3">User & Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Dept / Roll No</th>
                    <th className="p-3">Authorized By</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE1]">
                  {filteredWhitelist.map(item => {
                    const isProtectedLeader = [
                      'karthika.rn@saveetha.ac.in',
                      'rajesh.director@saveetha.ac.in',
                      'karthi.govindaraju@saveetha.ac.in',
                    ].includes(item.email.toLowerCase());

                    return (
                      <tr key={item.id} className="hover:bg-[#FCFBF8] transition">
                        <td className="p-3">
                          <div className="font-semibold text-stone-900">{item.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{item.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {item.role === 'admin' ? 'Faculty Admin' : 'Student'}
                          </span>
                        </td>
                        <td className="p-3 text-stone-600">
                          <div>{item.department}</div>
                          {item.roll_no && (
                            <div className="text-[11px] text-stone-400 font-mono">
                              {item.roll_no}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-stone-500 text-[11px]">
                          {item.added_by}
                        </td>
                        <td className="p-3 text-right">
                          {isProtectedLeader ? (
                            <span className="text-[10px] text-stone-400 inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Core Admin
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemove(item)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                              title="Revoke Whitelist Access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#ECE6DB] flex items-center justify-between text-xs text-stone-500">
          <span>Active Admin Session: <strong>{currentUser?.name || 'Faculty Admin'}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
