import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Users, GraduationCap, Calendar, Award, BookOpen, ArrowRight } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const GlobalSearchModal = ({ isOpen, onClose, onSelectStudent, onSelectStaff }) => {
  const { students, staff, activities, classes, setActiveTab, rolePermissions } = useSchool();
  const [query, setQuery] = useState('');

  // Handle ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { students: [], staff: [], activities: [], classes: [] };
    const q = query.toLowerCase();

    const canSeeStudents = rolePermissions?.allowedTabs.includes('students');
    const canSeeStaff = rolePermissions?.allowedTabs.includes('staff');
    const canSeeActivities = rolePermissions?.allowedTabs.includes('activities');
    const canSeeClasses = rolePermissions?.allowedTabs.includes('classes');

    const matchedStudents = canSeeStudents ? students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(q))
    ).slice(0, 4) : [];

    const matchedStaff = canSeeStaff ? staff.filter(st =>
      `${st.firstName} ${st.lastName}`.toLowerCase().includes(q) ||
      st.id.toLowerCase().includes(q) ||
      st.department.toLowerCase().includes(q) ||
      st.role.toLowerCase().includes(q)
    ).slice(0, 4) : [];

    const matchedActivities = canSeeActivities ? activities.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.facultyAdvisor.toLowerCase().includes(q)
    ).slice(0, 3) : [];

    const matchedClasses = canSeeClasses ? classes.filter(c =>
      `${c.grade} ${c.section}`.toLowerCase().includes(q) ||
      c.classTeacherName.toLowerCase().includes(q)
    ).slice(0, 3) : [];

    return {
      students: matchedStudents,
      staff: matchedStaff,
      activities: matchedActivities,
      classes: matchedClasses
    };
  }, [query, students, staff, activities, classes, rolePermissions]);

  if (!isOpen) return null;

  const totalMatches = results.students.length + results.staff.length + results.activities.length + results.classes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-in">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 mr-3" />
          <input
            type="text"
            placeholder="Search students, staff, classes, clubs, ID numbers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            title="Press ESC to close"
            className="hidden sm:inline-block px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Quick School Search</p>
              <p className="text-xs text-slate-400">
                Type a name, roll number, department, grade or club to quickly jump to any record. Press ESC to close.
              </p>
            </div>
          ) : totalMatches === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-medium text-slate-600">No matching records found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by first name, grade, or staff department.</p>
            </div>
          ) : (
            <>
              {/* Students Section */}
              {results.students.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Students ({results.students.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.students.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveTab('students');
                          if (onSelectStudent) onSelectStudent(s);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-700">
                              {s.firstName} {s.lastName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {s.grade} • Sec {s.section} • Roll #{s.rollNumber} • ID: {s.id}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff Section */}
              {results.staff.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                    <Users className="w-3.5 h-3.5" />
                    Faculty & Staff ({results.staff.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.staff.map(st => (
                      <div
                        key={st.id}
                        onClick={() => {
                          setActiveTab('staff');
                          if (onSelectStaff) onSelectStaff(st);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-800 group-hover:text-emerald-700">
                              {st.firstName} {st.lastName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {st.role} • Dept: {st.department} • Joined {st.joiningDate}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities Section */}
              {results.activities.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                    <Award className="w-3.5 h-3.5" />
                    Clubs & Extracurriculars ({results.activities.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.activities.map(act => (
                      <div
                        key={act.id}
                        onClick={() => {
                          setActiveTab('activities');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 transition-all cursor-pointer group"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800 group-hover:text-purple-700">
                            {act.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Advisor: {act.facultyAdvisor} • {act.enrolledStudents.length} members
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes Section */}
              {results.classes.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Classes ({results.classes.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.classes.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveTab('classes');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition-all cursor-pointer group"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800 group-hover:text-amber-700">
                            {c.grade} - Section {c.section}
                          </div>
                          <div className="text-xs text-slate-500">
                            Teacher: {c.classTeacherName} • {c.roomNumber}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
