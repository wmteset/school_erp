import React, { useState } from 'react';
import { X, Palmtree, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const ApplyLeaveModal = ({ isOpen, onClose }) => {
  const { staff, applyLeaveRequest } = useSchool();

  const [formData, setFormData] = useState({
    staffId: staff[0]?.id || '',
    leaveType: 'Casual Leave',
    startDate: '2026-09-05',
    endDate: '2026-09-06',
    reason: '',
    substituteTeacher: 'Internal arrangement / Substitute'
  });

  if (!isOpen) return null;

  // Compute days count
  const calcDays = () => {
    if (!formData.startDate || !formData.endDate) return 1;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const daysCount = calcDays();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      alert('Please specify the reason for leave.');
      return;
    }

    applyLeaveRequest({
      ...formData,
      daysCount
    });

    onClose();
  };

  const leaveTypes = [
    'Casual Leave (CL)',
    'Sick Leave (SL)',
    'Annual / Earned Leave (AL)',
    'Maternity / Paternity Leave',
    'Special Academic Duty Leave',
    'Unpaid Leave'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col animate-scale-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Staff Leave Application</h3>
              <p className="text-xs text-slate-500">Submit request for administrative review & quota adjustment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Staff Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Faculty / Staff Member *
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.role} - {s.department})
                </option>
              ))}
            </select>
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Leave Category *
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              {leaveTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Total Days Indicator */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-900 font-medium">Total Duration Requested:</span>
            <span className="font-bold text-amber-950 text-sm">{daysCount} Day{daysCount > 1 ? 's' : ''}</span>
          </div>

          {/* Substitute Teacher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Substitute Teacher / Duty Coverage
            </label>
            <input
              type="text"
              placeholder="e.g. Science Dept Assistant or Study Hall"
              value={formData.substituteTeacher}
              onChange={(e) => setFormData(prev => ({ ...prev, substituteTeacher: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason for Leave *
            </label>
            <textarea
              rows="3"
              required
              placeholder="Explain the reason for absence..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-100 transition-all"
            >
              Submit Application
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
