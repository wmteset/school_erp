import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Printer,
  GraduationCap,
  CalendarCheck,
  Trophy,
  Phone,
  Mail,
  MapPin,
  Heart,
  Bus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatDate } from '../../utils/helpers';
import { StudentIDCard } from './StudentIDCard';

export const StudentProfileModal = ({ student, isOpen, onClose, onEdit }) => {
  const { deleteStudent, getStudentAttendanceRate, attendance, activities } = useSchool();
  const [showIDCard, setShowIDCard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !student) return null;

  const attendanceRate = getStudentAttendanceRate(student.id);

  // Find all activities this student is part of
  const studentClubs = activities.filter(act =>
    act.enrolledStudents.some(e => e.studentId === student.id)
  );

  // Find past attendance logs for this student
  const attendanceHistory = Object.entries(attendance).map(([date, dayData]) => {
    const record = dayData.students?.[student.id];
    return {
      date,
      status: record?.status || 'P',
      note: record?.note || ''
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${student.firstName} ${student.lastName} from the school registry?`)) {
      deleteStudent(student.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-scale-in">
          
          {/* Header Profile Hero */}
          <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-indigo-200 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={student.avatar}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/80 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold border border-white">
                  {student.status || 'Active'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {student.firstName} {student.lastName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-950">
                    Roll #{student.rollNumber}
                  </span>
                </div>

                <p className="text-xs text-indigo-200 font-medium">
                  {student.grade} • Section {student.section} • ID: {student.id}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowIDCard(true)}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Student ID</span>
                  </button>

                  <button
                    onClick={() => {
                      onEdit(student);
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
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'attendance'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Attendance Track ({attendanceRate}%)
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'activities'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Clubs & Awards ({studentClubs.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-fade-in">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">{attendanceRate}%</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Exemplary record</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                    <div className="text-sm font-bold text-slate-800 mt-1">{formatDate(student.dob)}</div>
                    <div className="text-[11px] text-slate-500">Blood: {student.bloodGroup || 'O+'}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission Date</span>
                    <div className="text-sm font-bold text-slate-800 mt-1">{formatDate(student.admissionDate)}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold">Enrolled</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clubs Enrolled</span>
                    <div className="text-xl font-bold text-slate-800 mt-1">{studentClubs.length}</div>
                    <div className="text-[11px] text-purple-600 font-semibold">Extracurricular</div>
                  </div>
                </div>

                {/* Guardian & Emergency Information */}
                <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    <span>Parent / Guardian & Contact Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Guardian Name:</span>
                      <p className="font-bold text-slate-800 text-sm">{student.guardianName} ({student.guardianRelation || 'Parent'})</p>
                    </div>

                    <div>
                      <span className="text-slate-500">Phone Number:</span>
                      <p className="font-bold text-slate-800 text-sm">{student.guardianPhone}</p>
                    </div>

                    <div>
                      <span className="text-slate-500">Email Address:</span>
                      <p className="font-semibold text-slate-800">{student.guardianEmail || 'Not provided'}</p>
                    </div>

                    <div>
                      <span className="text-slate-500">Residential Address:</span>
                      <p className="font-semibold text-slate-800">{student.address || 'Standard District Zone'}</p>
                    </div>
                  </div>
                </div>

                {/* Health & Transport Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>Medical & Dietary Notes</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {student.medicalNotes || 'No reported allergies or chronic medical conditions.'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Bus className="w-4 h-4 text-amber-500" />
                      <span>Transportation & Route</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {student.transportRoute || 'School Bus Route #1'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Attendance Reliability Score</h4>
                    <p className="text-xs text-slate-500">Based on recent recorded school sessions</p>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">{attendanceRate}%</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Date Records</div>
                  {attendanceHistory.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-700">{formatDate(rec.date)}</span>
                        {rec.note && <span className="text-xs text-slate-400 italic">({rec.note})</span>}
                      </div>

                      <div>
                        {rec.status === 'P' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </span>
                        )}
                        {rec.status === 'L' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Tardy
                          </span>
                        )}
                        {rec.status === 'A' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </span>
                        )}
                        {rec.status === 'E' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Excused
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIVITIES & AWARDS TAB */}
            {activeTab === 'activities' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
                    Extracurricular Clubs & Teams ({studentClubs.length})
                  </h4>

                  {studentClubs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs">No extracurricular clubs assigned yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {studentClubs.map(c => {
                        const enrollment = c.enrolledStudents.find(e => e.studentId === student.id);
                        return (
                          <div key={c.id} className="p-3.5 bg-purple-50/50 border border-purple-200/70 rounded-2xl">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-purple-900">{c.name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                                {enrollment?.role || 'Member'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">Advisor: {c.facultyAdvisor}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{c.meetingSchedule}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Awards */}
                <div className="pt-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Honors & Achievements ({(student.awards || []).length})</span>
                  </h4>

                  <div className="space-y-2">
                    {(student.awards || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No awards logged yet.</p>
                    ) : (
                      student.awards.map((aw, idx) => (
                        <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-xs font-bold text-amber-950">{aw}</span>
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
        <StudentIDCard student={student} onClose={() => setShowIDCard(false)} />
      )}
    </>
  );
};
