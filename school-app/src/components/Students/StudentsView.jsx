import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Printer,
  LayoutGrid,
  List,
  Phone,
  CheckCircle2,
  UserCheck,
  Award
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { StudentEnrollModal } from './StudentEnrollModal';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentIDCard } from './StudentIDCard';
import { formatDate } from '../../utils/helpers';

export const StudentsView = () => {
  const { students, getStudentAttendanceRate, schoolInfo, currentRole, permissions } = useSchool();

  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [studentForIDCard, setStudentForIDCard] = useState(null);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(search.toLowerCase()));

      const matchGrade = selectedGrade === 'All' || s.grade === selectedGrade;
      const matchSection = selectedSection === 'All' || s.section === selectedSection;
      const matchStatus = selectedStatus === 'All' || s.status === selectedStatus;

      return matchSearch && matchGrade && matchSection && matchStatus;
    });
  }, [students, search, selectedGrade, selectedSection, selectedStatus]);

  // Export CSV helper
  const handleExportCSV = () => {
    const headers = ['Student ID', 'First Name', 'Last Name', 'Grade', 'Section', 'Roll No', 'Gender', 'DOB', 'Guardian Name', 'Guardian Phone', 'Status', 'Admission Date'];
    const rows = filteredStudents.map(s => [
      s.id,
      s.firstName,
      s.lastName,
      s.grade,
      s.section,
      s.rollNumber,
      s.gender,
      s.dob,
      `"${s.guardianName || ''}"`,
      `"${s.guardianPhone || ''}"`,
      s.status,
      s.admissionDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oakridge_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grades = [
    'All', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Student Enrollment & Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage student profiles, academic classes, attendance records & extracurricular activities
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentRole !== 'teacher' && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          {permissions?.canEnrollStudents && (
            <button
              onClick={() => {
                setStudentToEdit(null);
                setIsEnrollModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 transition-all hover:shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
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
              placeholder="Search by student name, roll number, ID, or parent name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
            >
              {grades.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Grades' : g}</option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Alumni">Alumni</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-400 hover:text-slate-600'
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
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-indigo-600 hover:underline font-medium"
            >
              Clear search
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
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Grade & Sec</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Guardian & Phone</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Activities</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">No students match the criteria</p>
                      <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stud) => {
                    const attRate = getStudentAttendanceRate(stud.id);
                    return (
                      <tr
                        key={stud.id}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        {/* Student Name & Avatar */}
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setSelectedStudentForProfile(stud)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <img
                              src={stud.avatar}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:border-indigo-400 transition-colors"
                            />
                            <div>
                              <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {stud.firstName} {stud.lastName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {stud.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Grade & Section */}
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {stud.grade} <span className="text-slate-400 font-normal">({stud.section})</span>
                        </td>

                        {/* Roll Number */}
                        <td className="py-3 px-3 font-bold text-slate-800">
                          #{stud.rollNumber}
                        </td>

                        {/* Guardian Info */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{stud.guardianName}</div>
                          <div className="text-[11px] text-slate-500">{stud.guardianPhone}</div>
                        </td>

                        {/* Attendance Rate */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{attRate}%</span>
                            <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  attRate >= 90 ? 'bg-emerald-500' : attRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${attRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Activities */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(stud.activities || []).slice(0, 2).map((act, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100"
                              >
                                {act}
                              </span>
                            ))}
                            {(stud.activities || []).length > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{(stud.activities || []).length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stud.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {stud.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedStudentForProfile(stud)}
                              title="View Full Profile"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setStudentForIDCard(stud)}
                              title="Print ID Card"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {permissions?.canEditStudents && (
                              <button
                                onClick={() => {
                                  setStudentToEdit(stud);
                                  setIsEnrollModalOpen(true);
                                }}
                                title="Edit Student"
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
          {filteredStudents.map((stud) => {
            const attRate = getStudentAttendanceRate(stud.id);
            return (
              <div
                key={stud.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={stud.avatar}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">
                          {stud.firstName} {stud.lastName}
                        </h3>
                        <p className="text-xs text-indigo-600 font-semibold">
                          {stud.grade} • Sec {stud.section}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Roll #{stud.rollNumber} • {stud.id}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {stud.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 py-2 border-y border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Guardian:</span>
                      <span className="font-semibold text-slate-800">{stud.guardianName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span>{stud.guardianPhone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Attendance:</span>
                      <span className="font-bold text-emerald-600">{attRate}%</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Clubs & Teams
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(stud.activities || []).map((act, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setStudentForIDCard(stud)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> ID Card
                  </button>

                  <div className="flex items-center gap-2">
                    {permissions?.canEditStudents && (
                      <button
                        onClick={() => {
                          setStudentToEdit(stud);
                          setIsEnrollModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedStudentForProfile(stud)}
                      className="px-3 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-2xs cursor-pointer"
                    >
                      360° Profile
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
        <StudentEnrollModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          studentToEdit={studentToEdit}
        />
      )}

      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          isOpen={!!selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onEdit={(s) => {
            setStudentToEdit(s);
            setIsEnrollModalOpen(true);
          }}
        />
      )}

      {studentForIDCard && (
        <StudentIDCard
          student={studentForIDCard}
          onClose={() => setStudentForIDCard(null)}
        />
      )}

    </div>
  );
};
