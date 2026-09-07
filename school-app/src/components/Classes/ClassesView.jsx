import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Users,
  MapPin,
  Clock,
  Plus,
  Edit,
  GraduationCap,
  CalendarCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const ClassesView = () => {
  const { classes, students, staff, setActiveTab } = useSchool();
  const [selectedClass, setSelectedClass] = useState(classes[0] || null);
  const overviewRef = useRef(null);

  const activeClassObj = classes.find(c => c.id === selectedClass?.id) || classes[0];

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setTimeout(() => {
      overviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Students in selected class
  const classStudents = students.filter(s =>
    s.grade === activeClassObj?.grade && s.section === activeClassObj?.section
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Classes, Sections & Academic Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Grade division assignments, appointed class teachers, room numbers, and subject curricula
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Classes + Roster Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Classes List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Academic Grades ({classes.length})
          </div>

          <div className="space-y-2.5">
            {classes.map(c => {
              const isSelected = activeClassObj?.id === c.id;
              const count = students.filter(s => s.grade === c.grade && s.section === c.section).length;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectClass(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-1 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className={`font-bold text-base ${isSelected ? 'text-amber-950' : 'text-slate-800'}`}>
                      {c.grade} - Section {c.section}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      {count} Students
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Teacher: <strong className="text-slate-700">{c.classTeacherName}</strong></span>
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{c.roomNumber}</span>
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      View Schedule & Roster <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Class Roster & Subjects (with ref for smooth scrolling) */}
        {activeClassObj && (
          <div
            ref={overviewRef}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 scroll-mt-20"
          >
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Class Overview</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {activeClassObj.grade} • Section {activeClassObj.section}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Classroom: {activeClassObj.roomNumber} • Schedule: {activeClassObj.scheduleSummary}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Mark Class Attendance</span>
                </button>
              </div>
            </div>

            {/* Subjects Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Enrolled Subjects & Curriculum
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeClassObj.subjects.map((sub, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200/80"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Students Roster */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>Enrolled Class Roster ({classStudents.length} students)</span>
              </h3>

              {classStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">No students enrolled in this section yet</p>
                  <p className="text-xs text-slate-400 mt-1">Enroll students through the Students Directory tab.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {classStudents.map(stud => (
                    <div
                      key={stud.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={stud.avatar}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {stud.firstName} {stud.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Roll #{stud.rollNumber} • ID: {stud.id} • Guardian: {stud.guardianName}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                        {stud.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
