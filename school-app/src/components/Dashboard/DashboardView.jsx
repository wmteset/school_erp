import React from 'react';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  DollarSign,
  Palmtree,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const DashboardView = ({ onOpenEnrollStudent, onOpenHireStaff, onOpenApplyLeave }) => {
  const {
    schoolInfo,
    students,
    staff,
    attendance,
    selectedDate,
    leaveRequests,
    reviewLeaveRequest,
    activities,
    classes,
    setActiveTab,
    monthlyPayrollTotal,
    studentAttendanceRateToday,
    staffAttendanceRateToday,
    pendingLeavesCount,
    currentRole,
    permissions,
    rolePermissions
  } = useSchool();

  // Compute breakdown for today's attendance
  const todayStudentAtt = attendance[selectedDate]?.students || {};
  const studentAttVals = Object.values(todayStudentAtt);
  const studentsPresent = studentAttVals.filter(s => s.status === 'P').length;
  const studentsLate = studentAttVals.filter(s => s.status === 'L').length;
  const studentsAbsent = studentAttVals.filter(s => s.status === 'A').length;
  const studentsExcused = studentAttVals.filter(s => s.status === 'E').length;

  const todayStaffAtt = attendance[selectedDate]?.staff || {};
  const staffAttVals = Object.values(todayStaffAtt);
  const staffPresent = staffAttVals.filter(s => s.status === 'P').length;
  const staffLate = staffAttVals.filter(s => s.status === 'L').length;
  const staffAbsent = staffAttVals.filter(s => s.status === 'A').length;
  const staffExcused = staffAttVals.filter(s => s.status === 'E').length;

  // Pending leaves
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').slice(0, 3);

  // Department counts
  const departmentCounts = staff.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1;
    return acc;
  }, {});

  // Absentees today list
  const absentStudents = students.filter(s => todayStudentAtt[s.id]?.status === 'A');
  const lateStudents = students.filter(s => todayStudentAtt[s.id]?.status === 'L');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <GraduationCap className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Academic Session {schoolInfo.academicYear} • Perspective: {rolePermissions.title}</span>
          </div>

          <div className="flex items-center gap-3.5 mb-2">
            {schoolInfo.logo && (
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/10 shrink-0">
                <img src={schoolInfo.logo} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
              Welcome to {schoolInfo.name}
            </h1>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Role-governed administration with live Code-First database synchronization. You have active access to {rolePermissions.allowedTabs.length} ERP modules.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {permissions?.canEnrollStudents && (
              <button
                onClick={onOpenEnrollStudent}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>+ Enroll Student</span>
              </button>
            )}

            {permissions?.canHireStaff && (
              <button
                onClick={onOpenHireStaff}
                className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>+ Onboard Staff</span>
              </button>
            )}

            {permissions?.canMarkAttendance && (
              <button
                onClick={() => setActiveTab('attendance')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </button>
            )}

            {permissions?.canApplyLeave && (
              <button
                onClick={onOpenApplyLeave}
                className="px-4 py-2 bg-amber-500/80 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Palmtree className="w-4 h-4" />
                <span>+ Apply Leave</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Cards (Dynamically shown based on Allowed Modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Students Directory (if allowed) */}
        {rolePermissions.allowedTabs.includes('students') && (
          <div
            onClick={() => setActiveTab('students')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 100% Active
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{students.length}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Enrolled Students</span>
              <span className="text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
                Directory →
              </span>
            </div>
          </div>
        )}

        {/* Metric 2: Staff & Faculty (if allowed) */}
        {rolePermissions.allowedTabs.includes('staff') && (
          <div
            onClick={() => setActiveTab('staff')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {Object.keys(departmentCounts).length} Departments
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{staff.length}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Faculty & Staff Pool</span>
              <span className="text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
                View All →
              </span>
            </div>
          </div>
        )}

        {/* Metric 3: Attendance Hub (if allowed) */}
        {rolePermissions.allowedTabs.includes('attendance') && (
          <div
            onClick={() => setActiveTab('attendance')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Today: Sep 2
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">{studentAttendanceRateToday}%</span>
              <span className="text-xs text-slate-500 font-medium">({studentsPresent}/{students.length} present)</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Student Attendance</span>
              <span className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                Roll Call →
              </span>
            </div>
          </div>
        )}

        {/* Metric 4: Monthly Payroll (if allowed) */}
        {rolePermissions.allowedTabs.includes('payroll') && (
          <div
            onClick={() => setActiveTab('payroll')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                Monthly Budget
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(monthlyPayrollTotal, schoolInfo.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Faculty Net Payroll</span>
              <span className="text-teal-600 font-medium group-hover:translate-x-1 transition-transform">
                Payslips →
              </span>
            </div>
          </div>
        )}

        {/* Metric Alternate 1: Activities (for Teachers & Principals who don't have Payroll) */}
        {!rolePermissions.allowedTabs.includes('payroll') && rolePermissions.allowedTabs.includes('activities') && (
          <div
            onClick={() => setActiveTab('activities')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                Extracurricular
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{activities.length} Clubs</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Student Teams</span>
              <span className="text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                Hub →
              </span>
            </div>
          </div>
        )}

        {/* Metric Alternate 2: Classes (for Teachers who don't have Staff or Payroll) */}
        {!rolePermissions.allowedTabs.includes('staff') && rolePermissions.allowedTabs.includes('classes') && (
          <div
            onClick={() => setActiveTab('classes')}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Timetables
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-800">{classes.length} Sections</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Grade Divisions</span>
              <span className="text-amber-600 font-medium group-hover:translate-x-1 transition-transform">
                Schedules →
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Main Grid: Attendance Live Matrix & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Breakdown Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Daily Attendance Overview</h2>
              <p className="text-xs text-slate-500">Live summary for {formatDate(selectedDate)}</p>
            </div>
            {rolePermissions.allowedTabs.includes('attendance') && (
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Register</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Student Status Grid */}
          <div className="mb-6">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Students (Total: {students.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Present</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-emerald-900 mt-1">{studentsPresent}</div>
                <div className="text-[11px] text-emerald-700">On-time in class</div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800">Late / Tardy</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-amber-900 mt-1">{studentsLate}</div>
                <div className="text-[11px] text-amber-700">Admitted with slip</div>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-800">Absent</span>
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-xl font-bold text-rose-900 mt-1">{studentsAbsent}</div>
                <div className="text-[11px] text-rose-700">Requires follow-up</div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800">Excused</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-900 mt-1">{studentsExcused}</div>
                <div className="text-[11px] text-blue-700">Medical / Approved</div>
              </div>
            </div>
          </div>

          {/* Staff Status Grid */}
          <div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Staff & Faculty (Total: {staff.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">Present</span>
                <div className="text-lg font-bold text-slate-800 mt-1">{staffPresent} / {staff.length}</div>
                <div className="text-[11px] text-emerald-600 font-medium">{staffAttendanceRateToday}% turnout</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">Late</span>
                <div className="text-lg font-bold text-slate-800 mt-1">{staffLate}</div>
                <div className="text-[11px] text-slate-500">Documented</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">On Leave</span>
                <div className="text-lg font-bold text-slate-800 mt-1">{staffExcused}</div>
                <div className="text-[11px] text-indigo-600">Approved leaves</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">Unexcused</span>
                <div className="text-lg font-bold text-slate-800 mt-1">{staffAbsent}</div>
                <div className="text-[11px] text-slate-500">0 today</div>
              </div>
            </div>
          </div>

        </div>

        {/* Pending Leaves Approval Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Palmtree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Leave Approvals</h3>
                  <p className="text-xs text-slate-500">{pendingLeavesCount} pending review</p>
                </div>
              </div>
              {rolePermissions.allowedTabs.includes('leaves') && (
                <button
                  onClick={() => setActiveTab('leaves')}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-800 cursor-pointer"
                >
                  View all
                </button>
              )}
            </div>

            <div className="space-y-3">
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No pending leave requests</p>
                  <p className="text-[11px] text-slate-400">All faculty leave requests are up to date.</p>
                </div>
              ) : (
                pendingLeaves.map(req => (
                  <div
                    key={req.id}
                    className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{req.staffName}</div>
                        <div className="text-[11px] text-slate-500">{req.department} • {req.leaveType}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                        {req.daysCount} Day{req.daysCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 italic bg-white/70 p-1.5 rounded border border-slate-100">
                      "{req.reason}"
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400">
                        {formatDate(req.startDate)}
                      </span>
                      {permissions?.canReviewLeave ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => reviewLeaveRequest(req.id, 'Approved', 'Approved by Administration')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reviewLeaveRequest(req.id, 'Rejected', 'Declined due to schedule conflict')}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          Under Review
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {permissions?.canApplyLeave && (
            <button
              onClick={onOpenApplyLeave}
              className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
            >
              + Submit New Staff Leave Request
            </button>
          )}
        </div>

      </div>

      {/* Secondary Grid: Absentees Follow-up & Extracurricular Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Absentees Follow-up Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Today's Absent & Tardy Students</h3>
                <p className="text-xs text-slate-500">Requires guardian communication</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
              {absentStudents.length + lateStudents.length} Students
            </span>
          </div>

          <div className="space-y-2.5">
            {absentStudents.length === 0 && lateStudents.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-xs">100% attendance recorded today! No absentees.</p>
              </div>
            ) : (
              [...absentStudents, ...lateStudents].map(stud => {
                const status = todayStudentAtt[stud.id]?.status;
                const note = todayStudentAtt[stud.id]?.note;
                const isAbsent = status === 'A';

                return (
                  <div
                    key={stud.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={stud.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{stud.firstName} {stud.lastName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isAbsent ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isAbsent ? 'ABSENT' : 'LATE'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {stud.grade} • Sec {stud.section} • Guardian: {stud.guardianName}
                        </div>
                        {note && (
                          <div className="text-[10px] text-slate-400 italic">
                            Note: {note}
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href={`tel:${stud.guardianPhone}`}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                    >
                      <PhoneCall className="w-3 h-3 text-indigo-600" />
                      <span className="hidden sm:inline">Call Parent</span>
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Extracurricular Clubs & Achievements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Extracurricular Activities & Clubs</h3>
                <p className="text-xs text-slate-500">{activities.length} active programs</p>
              </div>
            </div>
            {rolePermissions.allowedTabs.includes('activities') && (
              <button
                onClick={() => setActiveTab('activities')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 cursor-pointer"
              >
                View Hub →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activities.slice(0, 4).map(act => (
              <div
                key={act.id}
                onClick={() => setActiveTab('activities')}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-purple-200 bg-slate-50/50 hover:bg-purple-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 truncate">{act.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">
                  Advisor: {act.facultyAdvisor}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-purple-700 font-semibold bg-purple-100/70 px-2 py-0.5 rounded">
                    {act.enrolledStudents.length} Members
                  </span>
                  <span className="text-slate-400 truncate max-w-[110px]">
                    {act.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
