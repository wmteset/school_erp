import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarCheck2,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Check,
  Sparkles,
  Table,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatDate } from '../../utils/helpers';

export const AttendanceView = () => {
  const {
    students,
    staff,
    attendance,
    selectedDate,
    setSelectedDate,
    markStudentAttendance,
    markStaffAttendance,
    bulkMarkStudents,
    bulkMarkStaff,
    leaveRequests,
    permissions
  } = useSchool();

  const [activeMode, setActiveMode] = useState('students'); // 'students' | 'staff'
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'

  const todayStr = '2026-09-02';
  const isSelectedDateToday = selectedDate === todayStr;
  const isPastDate = selectedDate < todayStr;
  const isFutureDate = selectedDate > todayStr;

  // Auto-sync approved leaves for staff on selectedDate
  useEffect(() => {
    if (activeMode === 'staff') {
      staff.forEach(st => {
        const approvedLeave = leaveRequests.find(l =>
          l.staffId === st.id &&
          l.status === 'Approved' &&
          selectedDate >= l.startDate &&
          selectedDate <= l.endDate
        );

        if (approvedLeave) {
          const currentRec = attendance[selectedDate]?.staff?.[st.id];
          if (!currentRec || currentRec.status !== 'E') {
            markStaffAttendance(selectedDate, st.id, 'E', `Approved ${approvedLeave.leaveType}`);
          }
        }
      });
    }
  }, [selectedDate, activeMode, leaveRequests, staff]);

  // Date Navigation
  const changeDateBy = (offset) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                          s.id.toLowerCase().includes(search.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(search.toLowerCase());
      const matchGrade = selectedGrade === 'All' || s.grade === selectedGrade;
      const matchSec = selectedSection === 'All' || s.section === selectedSection;
      return matchSearch && matchGrade && matchSec;
    });
  }, [students, search, selectedGrade, selectedSection]);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staff.filter(st => {
      const matchSearch = `${st.firstName} ${st.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                          st.id.toLowerCase().includes(search.toLowerCase()) ||
                          st.department.toLowerCase().includes(search.toLowerCase());
      const matchDept = selectedDept === 'All' || st.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [staff, search, selectedDept]);

  // Active records for selected date
  const currentDayData = attendance[selectedDate] || { students: {}, staff: {} };
  const currentStudentMap = currentDayData.students || {};
  const currentStaffMap = currentDayData.staff || {};

  // Compute daily stats for active list
  const currentList = activeMode === 'students' ? filteredStudents : filteredStaff;
  const currentMap = activeMode === 'students' ? currentStudentMap : currentStaffMap;

  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;
  let excusedCount = 0;

  currentList.forEach(item => {
    let status = currentMap[item.id]?.status || 'P';
    
    // For staff, check if on approved leave
    if (activeMode === 'staff') {
      const hasApprovedLeave = leaveRequests.some(l =>
        l.staffId === item.id &&
        l.status === 'Approved' &&
        selectedDate >= l.startDate &&
        selectedDate <= l.endDate
      );
      if (hasApprovedLeave) {
        status = 'E';
      }
    }

    if (status === 'P') presentCount++;
    else if (status === 'L') lateCount++;
    else if (status === 'A') absentCount++;
    else if (status === 'E') excusedCount++;
  });

  const totalCount = currentList.length;
  const attendanceRate = totalCount > 0
    ? Math.round(((presentCount + lateCount + (activeMode === 'staff' ? excusedCount : 0)) / totalCount) * 100)
    : 100;

  // Bulk Actions (only permitted if date is today and not locked)
  const handleBulkMark = (status) => {
    if (!isSelectedDateToday) return;
    const ids = currentList.map(item => item.id);
    if (activeMode === 'students') {
      bulkMarkStudents(selectedDate, ids, status);
    } else {
      bulkMarkStaff(selectedDate, ids, status);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const isStudent = activeMode === 'students';
    const headers = ['ID', 'Name', isStudent ? 'Grade & Sec' : 'Department', 'Date', 'Status', 'Notes'];
    const rows = currentList.map(item => {
      const record = currentMap[item.id] || { status: 'P', note: '' };
      const statusText = record.status === 'P' ? 'Present' : record.status === 'L' ? 'Late' : record.status === 'A' ? 'Absent' : 'Excused';
      return [
        item.id,
        `"${item.firstName} ${item.lastName}"`,
        isStudent ? `"${item.grade} (${item.section})"` : `"${item.department}"`,
        selectedDate,
        statusText,
        `"${record.note || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oakridge_attendance_${activeMode}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grades = ['All', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const departments = ['All', 'Science', 'Mathematics', 'Computer Science', 'Humanities', 'Physical Education', 'Fine Arts', 'Administration', 'Finance'];

  // Dynamic month calculation based on selectedDate
  const { monthTitle, dynamicMonthDays } = useMemo(() => {
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth(); // 0-indexed
    const mName = selectedDateObj.toLocaleString('default', { month: 'long' });
    const title = `${mName} ${year}`;
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = String(dayNum).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      const fullDateStr = `${year}-${monthStr}-${dayStr}`;
      const isToday = fullDateStr === todayStr;
      const isFuture = fullDateStr > todayStr;
      return {
        dayNum,
        dayStr,
        fullDateStr,
        isToday,
        isFuture
      };
    });

    return { monthTitle: title, dynamicMonthDays: days };
  }, [selectedDate, todayStr]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                School Attendance Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Daily roll call register, punctuality tracking, approved leaves auto-sync, and monthly matrix reports
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Student vs Staff Toggle */}
          <div className="flex p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setActiveMode('students')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'students'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Students ({students.length})</span>
            </button>

            <button
              onClick={() => setActiveMode('staff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'staff'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff & Faculty ({staff.length})</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Control & Summary KPI Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Date Selector & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Date Picker Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDateBy(-1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => changeDateBy(1)}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors ml-1 cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* View Mode Toggle: Daily Roll Call vs Monthly Register */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">View:</span>
            <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'daily' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Roll Call
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Register
              </button>
            </div>
          </div>

        </div>

        {/* Lock Status Banner */}
        {(!isSelectedDateToday || !permissions?.canMarkAttendance) && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Mode:</strong> {!permissions?.canMarkAttendance ? 'Your current role has view-only access to attendance records.' : `Attendance status toggles are locked for ${isPastDate ? 'past dates' : 'future dates'} (${formatDate(selectedDate)}).`}
              </span>
            </div>
            {isSelectedDateToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer"
              >
                Jump to Today (Sep 2)
              </button>
            )}
          </div>
        )}

        {/* Daily Stats Grid */}
        <div className={`grid gap-3 ${activeMode === 'students' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'}`}>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turnout Rate</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{attendanceRate}%</div>
            <div className="text-[11px] text-slate-500">{presentCount + lateCount} / {totalCount} in attendance</div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>Present</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">{presentCount}</div>
            <div className="text-[11px] text-emerald-700">On time</div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Late / Tardy</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">{lateCount}</div>
            <div className="text-[11px] text-amber-700">Tardy arrival</div>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-rose-800">
              <span>Absent</span>
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-bold text-rose-900 mt-0.5">{absentCount}</div>
            <div className="text-[11px] text-rose-700">Unexcused</div>
          </div>

          {/* Excused box is ONLY for Staff Mode */}
          {activeMode === 'staff' && (
            <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                <span>Excused (Leave)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-900 mt-0.5">{excusedCount}</div>
              <div className="text-[11px] text-blue-700">Approved Leave</div>
            </div>
          )}
        </div>

        {/* Bulk Action & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Search & Class/Dept Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${activeMode}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none bg-slate-50/50"
              />
            </div>

            {activeMode === 'students' ? (
              <>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
                >
                  {grades.map(g => (
                    <option key={g} value={g}>{g === 'All' ? 'All Grades' : g}</option>
                  ))}
                </select>

                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
                >
                  <option value="All">All Sections</option>
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                </select>
              </>
            ) : (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-xl bg-white"
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Bulk Marking Buttons (disabled if not today or unauthorized) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleBulkMark('P')}
              disabled={!isSelectedDateToday || !permissions?.canMarkAttendance}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isSelectedDateToday && permissions?.canMarkAttendance
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>

            <button
              onClick={() => handleBulkMark('A')}
              disabled={!isSelectedDateToday || !permissions?.canMarkAttendance}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isSelectedDateToday && permissions?.canMarkAttendance
                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              Mark All Absent
            </button>
          </div>

        </div>

      </div>

      {/* Main Table: Daily Roll Call Mode */}
      {viewMode === 'daily' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">{activeMode === 'students' ? 'Student' : 'Staff Member'}</th>
                  <th className="py-3 px-3">{activeMode === 'students' ? 'Class & Roll' : 'Department & Role'}</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Remarks / Absent Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      <CalendarCheck2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No records found for criteria</p>
                    </td>
                  </tr>
                ) : (
                  currentList.map((item) => {
                    const record = currentMap[item.id] || { status: 'P', note: '' };

                    // Auto-detect approved leave for staff
                    let isApprovedLeaveToday = false;
                    let approvedLeaveObj = null;

                    if (activeMode === 'staff') {
                      approvedLeaveObj = leaveRequests.find(l =>
                        l.staffId === item.id &&
                        l.status === 'Approved' &&
                        selectedDate >= l.startDate &&
                        selectedDate <= l.endDate
                      );
                      if (approvedLeaveObj) {
                        isApprovedLeaveToday = true;
                      }
                    }

                    const currentStatus = isApprovedLeaveToday ? 'E' : (record.status || 'P');
                    const currentNote = isApprovedLeaveToday
                      ? `On approved ${approvedLeaveObj.leaveType}: "${approvedLeaveObj.reason}"`
                      : (record.note || '');

                    // Locking rules:
                    // 1. If role doesn't have permission to mark attendance, locked.
                    // 2. If not today, toggles are disabled.
                    // 3. If already marked once in state, toggles are disabled with lock indicator.
                    const isMarkedOnce = !!currentMap[item.id];
                    const isLocked = !permissions?.canMarkAttendance || !isSelectedDateToday || isApprovedLeaveToday || isMarkedOnce;

                    const handleStatusChange = (newStatus) => {
                      if (isLocked) return;
                      if (activeMode === 'students') {
                        markStudentAttendance(selectedDate, item.id, newStatus, record.note || '');
                      } else {
                        markStaffAttendance(selectedDate, item.id, newStatus, record.note || '');
                      }
                    };

                    const handleNoteChange = (e) => {
                      if (isLocked) return;
                      const noteText = e.target.value;
                      if (activeMode === 'students') {
                        markStudentAttendance(selectedDate, item.id, currentStatus, noteText);
                      } else {
                        markStaffAttendance(selectedDate, item.id, currentStatus, noteText);
                      }
                    };

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Person Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.avatar}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>{item.firstName} {item.lastName}</span>
                                {isMarkedOnce && isSelectedDateToday && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                    Marked
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {item.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Class / Dept */}
                        <td className="py-3 px-3">
                          {activeMode === 'students' ? (
                            <div>
                              <span className="font-semibold text-slate-800">{item.grade} ({item.section})</span>
                              <div className="text-[11px] text-slate-500">Roll #{item.rollNumber}</div>
                            </div>
                          ) : (
                            <div>
                              <span className="font-semibold text-slate-800">{item.department}</span>
                              <div className="text-[11px] text-slate-500">{item.role}</div>
                            </div>
                          )}
                        </td>

                        {/* Status Toggle Buttons (Disabled when locked) */}
                        <td className="py-3 px-4">
                          <div className={`flex items-center justify-center gap-1.5 p-1 rounded-xl w-max mx-auto border ${
                            isLocked ? 'bg-slate-100/70 border-slate-200 opacity-90' : 'bg-slate-100 border-slate-200/80'
                          }`}>
                            
                            {/* [P] Present */}
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleStatusChange('P')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                currentStatus === 'P'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : isLocked
                                  ? 'text-slate-400 cursor-not-allowed'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* [L] Late */}
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleStatusChange('L')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                currentStatus === 'L'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : isLocked
                                  ? 'text-slate-400 cursor-not-allowed'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* [A] Absent */}
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleStatusChange('A')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                currentStatus === 'A'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : isLocked
                                  ? 'text-slate-400 cursor-not-allowed'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            {/* [E] Excused ONLY for Staff */}
                            {activeMode === 'staff' && (
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => handleStatusChange('E')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  currentStatus === 'E'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : isLocked
                                    ? 'text-slate-400 cursor-not-allowed'
                                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer'
                                }`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{isApprovedLeaveToday ? 'On Leave' : 'Excused'}</span>
                              </button>
                            )}

                          </div>
                        </td>

                        {/* Notes / Remarks Field */}
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder={isLocked ? 'Record locked' : 'Add reason note...'}
                            value={currentNote}
                            onChange={handleNoteChange}
                            readOnly={isLocked}
                            className={`w-full px-3 py-1.5 text-xs rounded-xl border transition-colors focus:outline-none ${
                              isApprovedLeaveToday
                                ? 'border-blue-200 bg-blue-50/70 text-blue-900 font-medium cursor-not-allowed'
                                : currentStatus === 'A'
                                ? 'border-rose-200 bg-rose-50/40 text-rose-900 focus:ring-1 focus:ring-rose-400'
                                : currentStatus === 'L'
                                ? 'border-amber-200 bg-amber-50/40 text-amber-900 focus:ring-1 focus:ring-amber-400'
                                : isLocked
                                ? 'border-slate-200 bg-slate-100/60 text-slate-600 cursor-not-allowed'
                                : 'border-slate-200 bg-slate-50/40 text-slate-700 focus:border-indigo-400'
                            }`}
                          />
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
        /* Monthly Matrix Register Mode (Dynamic Month & Future dates disabled) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Monthly Attendance Matrix ({monthTitle})
              </h3>
              <p className="text-xs text-slate-500">
                Generated dynamically for {monthTitle}. Dates after today ({formatDate(todayStr)}) are disabled.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present (P)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late (L)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent (A)</span>
              {activeMode === 'staff' && (
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Leave (E)</span>
              )}
              <span className="flex items-center gap-1 text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Future (—)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 text-left sticky left-0 bg-slate-100 z-10 min-w-[140px]">Name</th>
                  {dynamicMonthDays.map(dObj => (
                    <th
                      key={dObj.dayStr}
                      className={`py-2 px-1.5 font-mono text-[11px] ${
                        dObj.isToday
                          ? 'bg-indigo-100 text-indigo-900 font-black'
                          : dObj.isFuture
                          ? 'text-slate-400 bg-slate-50/50'
                          : ''
                      }`}
                    >
                      {dObj.dayStr}
                    </th>
                  ))}
                  <th className="py-2.5 px-3">Turnout %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.map(item => {
                  const todayRec = currentMap[item.id]?.status || 'P';

                  // Count present/absent for non-future days
                  let presentDays = 0;
                  let totalPastDays = 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-left font-semibold text-slate-800 sticky left-0 bg-white z-10 whitespace-nowrap shadow-2xs">
                        {item.firstName} {item.lastName}
                      </td>

                      {dynamicMonthDays.map(dObj => {
                        if (dObj.isFuture) {
                          return (
                            <td key={dObj.dayStr} className="py-2 px-1 bg-slate-50/40 opacity-40">
                              <span className="text-slate-400 font-mono text-[10px] select-none">—</span>
                            </td>
                          );
                        }

                        totalPastDays++;

                        // Check recorded day or fallback
                        const dayRecorded = attendance[dObj.fullDateStr]?.[activeMode]?.[item.id]?.status;
                        let st = dayRecorded || (dObj.isToday ? todayRec : 'P');

                        // Check staff leave
                        if (activeMode === 'staff') {
                          const hasApprovedLeave = leaveRequests.some(l =>
                            l.staffId === item.id &&
                            l.status === 'Approved' &&
                            dObj.fullDateStr >= l.startDate &&
                            dObj.fullDateStr <= l.endDate
                          );
                          if (hasApprovedLeave) st = 'E';
                        }

                        if (st === 'P' || st === 'L' || (activeMode === 'staff' && st === 'E')) {
                          presentDays++;
                        }

                        return (
                          <td
                            key={dObj.dayStr}
                            className={`py-2 px-1 ${dObj.isToday ? 'bg-indigo-50/50 font-bold' : ''}`}
                          >
                            <span className={`inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold ${
                              st === 'P' ? 'bg-emerald-100 text-emerald-800' :
                              st === 'L' ? 'bg-amber-100 text-amber-800' :
                              st === 'A' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {st}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 font-bold text-emerald-600">
                        {totalPastDays > 0 ? Math.round((presentDays / totalPastDays) * 100) : 100}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
