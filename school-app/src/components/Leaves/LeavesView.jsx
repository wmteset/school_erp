import React, { useState } from 'react';
import {
  Palmtree,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Filter,
  Search,
  Users,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatDate } from '../../utils/helpers';
import { ApplyLeaveModal } from './ApplyLeaveModal';

export const LeavesView = () => {
  const {
    leaveRequests,
    reviewLeaveRequest,
    staff,
    currentRole,
    permissions
  } = useSchool();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'balances'
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Review Remarks modal state
  const [reviewModalData, setReviewModalData] = useState(null); // { id, newStatus, remarks }

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(req => {
    const matchSearch = req.staffName.toLowerCase().includes(search.toLowerCase()) ||
                        req.department.toLowerCase().includes(search.toLowerCase()) ||
                        req.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(l => l.status === 'Rejected').length;

  const handleOpenReview = (id, newStatus) => {
    setReviewModalData({
      id,
      newStatus,
      remarks: newStatus === 'Approved' ? 'Approved by Administration' : 'Declined due to academic scheduling constraints'
    });
  };

  const handleConfirmReview = () => {
    if (reviewModalData) {
      reviewLeaveRequest(reviewModalData.id, reviewModalData.newStatus, reviewModalData.remarks);
      setReviewModalData(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm">
              <Palmtree className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Staff Leave Management & Quota
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Process faculty time-off requests, substitute allocations, and statutory leave balance accounts
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-100 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Staff Leave</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{pendingCount} Requests</div>
          <div className="text-xs text-slate-500 mt-1">Requires supervisor review</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Leaves</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{approvedCount} Recorded</div>
          <div className="text-xs text-slate-500 mt-1">Synced to attendance registry</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff Pool</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{staff.length} Faculty</div>
          <div className="text-xs text-slate-500 mt-1">Tracking Casual, Sick & Annual quota</div>
        </div>

      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-slate-200 px-2 bg-white rounded-t-2xl">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Leave Applications & Workflow</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'balances'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Staff Leave Quota & Balances</span>
          <span className="text-[10px] text-slate-400">({staff.length} staff)</span>
        </button>
      </div>

      {/* TAB 1: Requests & Workflow */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by staff name, department, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-700"
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-3">Leave Category</th>
                    <th className="py-3 px-3">Duration & Dates</th>
                    <th className="py-3 px-3">Reason & Substitute</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <Palmtree className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">No leave applications found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const isPending = req.status === 'Pending';
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Staff Name */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800">{req.staffName}</div>
                            <div className="text-[11px] text-slate-500">{req.department} • {req.staffId}</div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800">{req.leaveType}</span>
                            <div className="text-[10px] text-slate-400">Applied: {formatDate(req.appliedDate)}</div>
                          </td>

                          {/* Duration & Dates */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                                {req.daysCount} Day{req.daysCount > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {formatDate(req.startDate)} → {formatDate(req.endDate)}
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-3 px-3 max-w-xs">
                            <p className="text-xs text-slate-700 line-clamp-2 italic">"{req.reason}"</p>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Sub: {req.substituteTeacher}
                            </div>
                            {req.reviewRemarks && (
                              <div className="text-[10px] text-indigo-600 mt-0.5 font-medium">
                                Review: {req.reviewRemarks}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'Pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {isPending ? (
                              permissions?.canReviewLeave ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenReview(req.id, 'Approved')}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenReview(req.id, 'Rejected')}
                                    className="px-2.5 py-1 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                  Pending Review
                                </span>
                              )
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Reviewed by {req.reviewedBy || 'Admin'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Staff Quota & Balances */}
      {activeTab === 'balances' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Faculty Annual Leave Balance Accounts</h3>
            <p className="text-xs text-slate-500">Statutory yearly allocations for Casual, Sick and Annual leave</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Casual Leave (CL)</th>
                  <th className="py-3 px-3">Sick Leave (SL)</th>
                  <th className="py-3 px-3">Annual Leave (AL)</th>
                  <th className="py-3 px-3">Total Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {staff.map((st) => {
                  const b = st.leaveBalance || {
                    casualTotal: 12, casualUsed: 0,
                    sickTotal: 10, sickUsed: 0,
                    annualTotal: 15, annualUsed: 0
                  };
                  const clLeft = b.casualTotal - (b.casualUsed || 0);
                  const slLeft = b.sickTotal - (b.sickUsed || 0);
                  const alLeft = b.annualTotal - (b.annualUsed || 0);
                  const totalTaken = (b.casualUsed || 0) + (b.sickUsed || 0) + (b.annualUsed || 0);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{st.firstName} {st.lastName}</div>
                        <div className="text-[11px] text-slate-400">{st.role}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {st.department}
                      </td>

                      {/* CL */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{clLeft} <span className="text-[11px] text-slate-400 font-normal">/ {b.casualTotal} left</span></div>
                        <div className="text-[10px] text-amber-600 font-medium">{b.casualUsed || 0} used</div>
                      </td>

                      {/* SL */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{slLeft} <span className="text-[11px] text-slate-400 font-normal">/ {b.sickTotal} left</span></div>
                        <div className="text-[10px] text-amber-600 font-medium">{b.sickUsed || 0} used</div>
                      </td>

                      {/* AL */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{alLeft} <span className="text-[11px] text-slate-400 font-normal">/ {b.annualTotal} left</span></div>
                        <div className="text-[10px] text-amber-600 font-medium">{b.annualUsed || 0} used</div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                          {totalTaken} Days Total
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <ApplyLeaveModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}

      {/* Review Remarks Modal */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-2">
              {reviewModalData.newStatus === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add optional administrative remarks or conditions for the applicant:
            </p>

            <textarea
              rows="3"
              value={reviewModalData.remarks}
              onChange={(e) => setReviewModalData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4 resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReviewModalData(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReview}
                className={`px-4 py-1.5 text-white rounded-xl text-xs font-bold ${
                  reviewModalData.newStatus === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {reviewModalData.newStatus}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
