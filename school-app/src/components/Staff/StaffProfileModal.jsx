import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Printer,
  Briefcase,
  Calendar,
  DollarSign,
  Palmtree,
  CalendarCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Award,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatDate, formatCurrency, calculateTenure } from '../../utils/helpers';
import { StaffIDCard } from './StaffIDCard';

export const StaffProfileModal = ({ staffMember, isOpen, onClose, onEdit }) => {
  const { deleteStaff, getStaffAttendanceRate, schoolInfo, leaveRequests } = useSchool();
  const [showIDCard, setShowIDCard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !staffMember) return null;

  const attendanceRate = getStaffAttendanceRate(staffMember.id);
  const tenure = calculateTenure(staffMember.joiningDate);

  // Leave balance
  const leaves = staffMember.leaveBalance || {
    casualTotal: 12, casualUsed: 0,
    sickTotal: 10, sickUsed: 0,
    annualTotal: 15, annualUsed: 0,
    maternityTotal: 0, maternityUsed: 0
  };

  // Staff specific leave history
  const staffLeaves = leaveRequests.filter(l => l.staffId === staffMember.id);

  // Financial calculations
  const base = staffMember.salary?.baseSalary || 4500;
  const hra = staffMember.salary?.hra || 1000;
  const trans = staffMember.salary?.transportAllowance || 350;
  const spec = staffMember.salary?.specialAllowance || 250;
  const gross = base + hra + trans + spec;

  const pf = staffMember.salary?.pfDeduction || 300;
  const tax = staffMember.salary?.taxDeduction || 400;
  const totalDeductions = pf + tax;
  const netPay = gross - totalDeductions;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${staffMember.firstName} ${staffMember.lastName} from the faculty registry?`)) {
      deleteStaff(staffMember.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-scale-in">
          
          {/* Header Profile Hero */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={staffMember.avatar}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold border border-white">
                  {staffMember.status || 'Active'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {staffMember.firstName} {staffMember.lastName}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    staffMember.role?.toLowerCase() === 'support_staff' || staffMember.role?.toLowerCase() === 'support'
                      ? 'bg-slate-700 text-slate-200 border border-slate-600'
                      : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                  }`}>
                    {staffMember.role?.toLowerCase() === 'support_staff' || staffMember.role?.toLowerCase() === 'support' ? 'SUPPORT STAFF' : (staffMember.role?.toUpperCase() || 'TEACHER')}
                  </span>
                </div>

                <div className="text-sm font-semibold text-emerald-300 mb-1">
                  {staffMember.designation || staffMember.role}
                </div>

                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                  <span>Dept: <strong className="text-white">{staffMember.department}</strong></span>
                  <span>•</span>
                  <span>ID: <strong className="text-white font-mono">{staffMember.id}</strong></span>
                  <span>•</span>
                  <span>Joined: <strong className="text-emerald-300">{formatDate(staffMember.joiningDate)} ({tenure})</strong></span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowIDCard(true)}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Staff ID Badge</span>
                  </button>

                  <button
                    onClick={() => {
                      onEdit(staffMember);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/20"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-rose-400/30 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="flex border-b border-slate-200 px-6 bg-slate-50/70">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Overview & Tenure
            </button>
            <button
              onClick={() => setActiveTab('salary')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'salary'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Salary & Benefits ({formatCurrency(netPay, schoolInfo.currency)}/mo)
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'leaves'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Leave Balances & History
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-fade-in">
                
                {/* Joining Milestone Callout */}
                <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950">
                        Official Joining Date: {formatDate(staffMember.joiningDate)}
                      </div>
                      <div className="text-xs text-emerald-800">
                        Total School Tenure: <strong>{tenure}</strong> with {schoolInfo.name}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    {staffMember.employmentType || 'Full-time'}
                  </span>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">{attendanceRate}%</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Active turnout</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">{staffMember.experienceYears || 5} Yrs</div>
                    <div className="text-[11px] text-slate-500">Total teaching</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject / Role</span>
                    <div className="text-xs font-bold text-slate-800 mt-1 truncate">{staffMember.subject || 'Faculty'}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold">{staffMember.department}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Monthly Pay</span>
                    <div className="text-base font-bold text-slate-800 mt-1">{formatCurrency(netPay, schoolInfo.currency)}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Disbursed monthly</div>
                  </div>
                </div>

                {/* Contact & Qualifications Info */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contact & Professional Information
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Email Address:</span>
                      <p className="font-bold text-slate-800">{staffMember.email}</p>
                    </div>

                    <div>
                      <span className="text-slate-400">Phone Number:</span>
                      <p className="font-bold text-slate-800">{staffMember.phone}</p>
                    </div>

                    <div>
                      <span className="text-slate-400">Qualifications:</span>
                      <p className="font-semibold text-slate-800">{staffMember.qualification || 'M.Sc., B.Ed.'}</p>
                    </div>

                    <div>
                      <span className="text-slate-400">Emergency Contact:</span>
                      <p className="font-semibold text-slate-800">{staffMember.emergencyContact || 'Available on file'}</p>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-slate-400">Residential Address:</span>
                      <p className="font-semibold text-slate-800">{staffMember.address || 'Campus Staff Quarters'}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SALARY TAB */}
            {activeTab === 'salary' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Salary Package Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Earnings */}
                  <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="text-xs font-bold text-emerald-900 uppercase">Gross Earnings</span>
                      <span className="text-sm font-bold text-emerald-700">{formatCurrency(gross, schoolInfo.currency)}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Base Salary:</span>
                        <span className="font-bold text-slate-800">{formatCurrency(base, schoolInfo.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">House Rent Allowance (HRA):</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(hra, schoolInfo.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transport Allowance:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(trans, schoolInfo.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Special Allowance:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(spec, schoolInfo.currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                      <span className="text-xs font-bold text-rose-900 uppercase">Total Deductions</span>
                      <span className="text-sm font-bold text-rose-700">{formatCurrency(totalDeductions, schoolInfo.currency)}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Provident Fund (PF):</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(pf, schoolInfo.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Income Tax (Withholding):</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(tax, schoolInfo.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Unpaid Leave Deductions:</span>
                        <span className="font-semibold text-emerald-600">{schoolInfo.currency}0</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Net Pay Highlight */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Net Monthly Salary Disbursement</span>
                    <div className="text-xs text-slate-300">
                      Bank: {staffMember.salary?.bankName || 'Chase'} ({staffMember.salary?.accountNumber || '•••• 0000'})
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(netPay, schoolInfo.currency)}
                  </div>
                </div>

              </div>
            )}

            {/* LEAVES TAB */}
            {activeTab === 'leaves' && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Leave Quota Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  
                  {/* Casual Leave */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Casual Leave (CL)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-800">{leaves.casualTotal - leaves.casualUsed}</span>
                      <span className="text-xs text-slate-500">/ {leaves.casualTotal} left</span>
                    </div>
                    <div className="text-[11px] text-amber-600 mt-1">{leaves.casualUsed} days used</div>
                  </div>

                  {/* Sick Leave */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sick Leave (SL)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-800">{leaves.sickTotal - leaves.sickUsed}</span>
                      <span className="text-xs text-slate-500">/ {leaves.sickTotal} left</span>
                    </div>
                    <div className="text-[11px] text-amber-600 mt-1">{leaves.sickUsed} days used</div>
                  </div>

                  {/* Annual / Earned Leave */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Leave (AL)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-slate-800">{leaves.annualTotal - leaves.annualUsed}</span>
                      <span className="text-xs text-slate-500">/ {leaves.annualTotal} left</span>
                    </div>
                    <div className="text-[11px] text-amber-600 mt-1">{leaves.annualUsed} days used</div>
                  </div>

                </div>

                {/* History of Leave Requests */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Recorded Leave Applications ({staffLeaves.length})
                  </h4>

                  <div className="space-y-2">
                    {staffLeaves.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No formal leave requests filed this session.</p>
                    ) : (
                      staffLeaves.map(req => (
                        <div key={req.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {req.leaveType} ({req.daysCount} Day{req.daysCount > 1 ? 's' : ''})
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {formatDate(req.startDate)} to {formatDate(req.endDate)} • "{req.reason}"
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* ID Card Modal */}
      {showIDCard && (
        <StaffIDCard staffMember={staffMember} onClose={() => setShowIDCard(false)} />
      )}
    </>
  );
};
