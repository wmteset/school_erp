import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Printer,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Building
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { StaffEnrollModal } from './StaffEnrollModal';
import { StaffProfileModal } from './StaffProfileModal';
import { StaffIDCard } from './StaffIDCard';
import { formatDate, formatCurrency, calculateTenure } from '../../utils/helpers';

export const StaffView = () => {
  const { staff, getStaffAttendanceRate, schoolInfo, currentRole, permissions } = useSchool();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState(null);
  const [staffForIDCard, setStaffForIDCard] = useState(null);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter(st => {
      const matchSearch =
        `${st.firstName} ${st.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        st.id.toLowerCase().includes(search.toLowerCase()) ||
        (st.role && st.role.toLowerCase().includes(search.toLowerCase())) ||
        (st.designation && st.designation.toLowerCase().includes(search.toLowerCase())) ||
        (st.department && st.department.toLowerCase().includes(search.toLowerCase())) ||
        (st.subject && st.subject.toLowerCase().includes(search.toLowerCase()));

      const matchDept = selectedDept === 'All' || st.department === selectedDept;
      const matchType = selectedType === 'All' || st.employmentType === selectedType;
      const matchRole = selectedRole === 'All' || 
        (selectedRole === 'support_staff' ? (st.role?.toLowerCase() === 'support_staff' || st.role?.toLowerCase() === 'support') : st.role?.toLowerCase() === selectedRole.toLowerCase());

      return matchSearch && matchDept && matchType && matchRole;
    });
  }, [staff, search, selectedDept, selectedType, selectedRole]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Staff ID', 'First Name', 'Last Name', 'Role Category', 'Designation', 'Department',
      'Joining Date', 'Employment Type', 'Base Salary', 'HRA',
      'Net Salary', 'Phone', 'Email'
    ];
    const rows = filteredStaff.map(st => {
      const base = st.salary?.baseSalary || 4500;
      const hra = st.salary?.hra || 1000;
      const trans = st.salary?.transportAllowance || 350;
      const spec = st.salary?.specialAllowance || 250;
      const pf = st.salary?.pfDeduction || 300;
      const tax = st.salary?.taxDeduction || 400;
      const net = (base + hra + trans + spec) - (pf + tax);

      return [
        st.id,
        st.firstName,
        st.lastName,
        `"${st.role?.toLowerCase() === 'support_staff' ? 'SUPPORT STAFF' : (st.role?.toUpperCase() || 'TEACHER')}"`,
        `"${st.designation || st.role}"`,
        st.department,
        st.joiningDate,
        st.employmentType || 'Full-time',
        base,
        hra,
        net,
        `"${st.phone}"`,
        st.email
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oakridge_faculty_staff_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departments = [
    'All', 'Science', 'Mathematics', 'Computer Science', 'Humanities',
    'Languages', 'Physical Education', 'Fine Arts', 'Administration',
    'Finance', 'Support & Facilities', 'Housekeeping & Maintenance', 'Transport & Logistics', 'Campus Security', 'Cafeteria & Dining'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Faculty & Staff Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage teaching faculty, administration, and support staff profiles, official designations, wages & attendance
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {permissions?.canHireStaff && (
            <button
              onClick={() => {
                setStaffToEdit(null);
                setIsEnrollModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 flex items-center gap-2 transition-all hover:shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Onboard Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, designation (e.g. Peon, Teacher), department, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
            >
              <option value="All">All Staff Roles</option>
              <option value="teacher">Teachers / Faculty</option>
              <option value="principal">Principals / Admin</option>
              <option value="accountant">Accountants / Finance</option>
              <option value="support_staff">Support Staff (Peons, Cleaning, Transport)</option>
            </select>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>

            {/* Employment Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
            >
              <option value="All">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Quick Result Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
          {(search || selectedDept !== 'All' || selectedRole !== 'All' || selectedType !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDept('All');
                setSelectedRole('All');
                setSelectedType('All');
              }}
              className="text-emerald-600 hover:underline font-medium cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3">Role & Department</th>
                  <th className="py-3 px-3">Joining Date & Tenure</th>
                  <th className="py-3 px-3">Compensation (Net)</th>
                  <th className="py-3 px-3">Leave Balance</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No staff members found</p>
                      <p className="text-xs text-slate-400">Adjust filters or search parameters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((st) => {
                    const attRate = getStaffAttendanceRate(st.id);
                    const tenure = calculateTenure(st.joiningDate);

                    const base = st.salary?.baseSalary || 4500;
                    const hra = st.salary?.hra || 1000;
                    const trans = st.salary?.transportAllowance || 350;
                    const spec = st.salary?.specialAllowance || 250;
                    const pf = st.salary?.pfDeduction || 300;
                    const tax = st.salary?.taxDeduction || 400;
                    const net = (base + hra + trans + spec) - (pf + tax);

                    const leaves = st.leaveBalance || { casualTotal: 12, casualUsed: 0, sickTotal: 10, sickUsed: 0 };
                    const remainingCasual = leaves.casualTotal - (leaves.casualUsed || 0);

                    const isSupport = st.role?.toLowerCase() === 'support_staff' || st.role?.toLowerCase() === 'support';

                    return (
                      <tr
                        key={st.id}
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setSelectedStaffForProfile(st)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <img
                              src={st.avatar}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:border-emerald-500 transition-colors"
                            />
                            <div>
                              <div className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                {st.firstName} {st.lastName}
                              </div>
                              <div className="text-xs text-indigo-700 font-medium">
                                {st.designation || st.role}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {st.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Department */}
                        <td className="py-3 px-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border mb-1 ${
                            st.role?.toLowerCase() === 'principal' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            st.role?.toLowerCase() === 'accountant' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            isSupport ? 'bg-slate-100 text-slate-700 border-slate-300' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isSupport ? 'SUPPORT STAFF' : (st.role?.toUpperCase() || 'TEACHER')}
                          </span>
                          <div className="text-[11px] text-slate-600 font-medium">{st.department}</div>
                        </td>

                        {/* Joining Date & Tenure */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(st.joiningDate)}</span>
                          </div>
                          <div className="text-[11px] text-emerald-600 font-semibold">{tenure}</div>
                        </td>

                        {/* Net Salary */}
                        <td className="py-3 px-3">
                          {permissions?.canViewCompensation ? (
                            <>
                              <div className="font-bold text-slate-900">
                                {formatCurrency(net, schoolInfo.currency)}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Base: {formatCurrency(base, schoolInfo.currency)}
                              </div>
                            </>
                          ) : (
                            <div className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded w-max">
                              •••••• (Confidential)
                            </div>
                          )}
                        </td>

                        {/* Leave Balance */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-[10px] font-bold">
                            {remainingCasual} CL left
                          </span>
                        </td>

                        {/* Attendance Rate */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{attRate}%</span>
                            <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${attRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {st.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedStaffForProfile(st)}
                              title="View Full Profile"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setStaffForIDCard(st)}
                              title="Print Staff Badge"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {permissions?.canEditStaff && (
                              <button
                                onClick={() => {
                                  setStaffToEdit(st);
                                  setIsEnrollModalOpen(true);
                                }}
                                title="Edit Staff Member"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((st) => {
            const attRate = getStaffAttendanceRate(st.id);
            const tenure = calculateTenure(st.joiningDate);

            const base = st.salary?.baseSalary || 4500;
            const hra = st.salary?.hra || 1000;
            const trans = st.salary?.transportAllowance || 350;
            const spec = st.salary?.specialAllowance || 250;
            const pf = st.salary?.pfDeduction || 300;
            const tax = st.salary?.taxDeduction || 400;
            const net = (base + hra + trans + spec) - (pf + tax);

            const isSupport = st.role?.toLowerCase() === 'support_staff' || st.role?.toLowerCase() === 'support';

            return (
              <div
                key={st.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">
                          {st.firstName} {st.lastName}
                        </h3>
                        {/* Designation displayed below staff member name */}
                        <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                          {st.designation || st.role}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                            st.role?.toLowerCase() === 'principal' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            st.role?.toLowerCase() === 'accountant' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            isSupport ? 'bg-slate-100 text-slate-700 border-slate-300' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isSupport ? 'SUPPORT STAFF' : (st.role?.toUpperCase() || 'TEACHER')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {st.department} • {st.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {st.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 py-2 border-y border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Joining Date:</span>
                      <span className="font-semibold text-slate-800">{formatDate(st.joiningDate)} ({tenure})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Net Salary:</span>
                      <span className="font-bold text-emerald-600">
                        {permissions?.canViewCompensation ? formatCurrency(net, schoolInfo.currency) : '••••••'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Attendance:</span>
                      <span className="font-semibold text-slate-800">{attRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setStaffForIDCard(st)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> ID Badge
                  </button>

                  <div className="flex items-center gap-2">
                    {permissions?.canEditStaff && (
                      <button
                        onClick={() => {
                          setStaffToEdit(st);
                          setIsEnrollModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedStaffForProfile(st)}
                      className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs cursor-pointer"
                    >
                      Dossier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isEnrollModalOpen && (
        <StaffEnrollModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          staffToEdit={staffToEdit}
        />
      )}

      {selectedStaffForProfile && (
        <StaffProfileModal
          staffMember={selectedStaffForProfile}
          isOpen={!!selectedStaffForProfile}
          onClose={() => setSelectedStaffForProfile(null)}
          onEdit={(st) => {
            setStaffToEdit(st);
            setIsEnrollModalOpen(true);
          }}
        />
      )}

      {staffForIDCard && (
        <StaffIDCard
          staffMember={staffForIDCard}
          onClose={() => setStaffForIDCard(null)}
        />
      )}

    </div>
  );
};
