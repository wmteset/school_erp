import React, { useState, useRef } from 'react';
import {
  Trophy,
  Award,
  Users,
  Plus,
  Calendar,
  MapPin,
  Sparkles,
  Search,
  UserPlus,
  Trash2,
  X,
  CheckCircle2,
  Medal,
  ChevronRight
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatDate } from '../../utils/helpers';

export const ActivitiesView = () => {
  const {
    activities,
    students,
    staff,
    addActivity,
    enrollStudentInActivity,
    removeStudentFromActivity,
    addAchievementToActivity,
    currentRole
  } = useSchool();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState(activities[0] || null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isAddAchievementOpen, setIsAddAchievementOpen] = useState(false);
  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);

  const activityDetailRef = useRef(null);

  // New activity form
  const [newActivityData, setNewActivityData] = useState({
    name: '',
    category: 'STEM & Tech',
    facultyAdvisor: staff[0]?.firstName + ' ' + staff[0]?.lastName,
    meetingSchedule: 'Tuesdays & Thursdays, 3:30 PM - 5:00 PM',
    room: 'Activity Hall Room 101',
    capacity: 30,
    description: '',
    badgeColor: 'indigo'
  });

  // Achievement form
  const [achievementData, setAchievementData] = useState({
    title: '',
    recipient: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Student enroll form
  const [enrollData, setEnrollData] = useState({
    studentId: students[0]?.id || '',
    role: 'Member'
  });

  const categories = ['All', 'STEM & Tech', 'Leadership & Public Speaking', 'Sports & Athletics', 'Fine Arts & Music', 'Community & Sustainability'];

  const filteredActivities = activities.filter(a =>
    selectedCategory === 'All' || a.category === selectedCategory
  );

  const handleSelectActivity = (act) => {
    setSelectedActivity(act);
    setTimeout(() => {
      activityDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'Sports & Athletics') {
      const sportAct = activities.find(a => a.category === 'Sports & Athletics');
      if (sportAct) {
        setSelectedActivity(sportAct);
        setTimeout(() => {
          activityDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
    }
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!newActivityData.name.trim()) return;
    const created = addActivity(newActivityData);
    setSelectedActivity(created);
    setIsAddActivityOpen(false);
  };

  const handleCreateAchievement = (e) => {
    e.preventDefault();
    if (!selectedActivity || !achievementData.title.trim()) return;
    addAchievementToActivity(selectedActivity.id, achievementData);
    setIsAddAchievementOpen(false);
    setAchievementData({ title: '', recipient: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleEnrollStudent = (e) => {
    e.preventDefault();
    if (!selectedActivity || !enrollData.studentId) return;
    enrollStudentInActivity(selectedActivity.id, enrollData.studentId, enrollData.role);
    setIsEnrollStudentOpen(false);
  };

  // Keep selected activity in sync
  const currentActive = activities.find(a => a.id === selectedActivity?.id) || activities[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Student Activities, Clubs & Athletics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Extracurricular management, student club rosters, meeting schedules, and championship awards
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddActivityOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-100 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Club / Sport</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Club List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Activity Directory List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Programs ({filteredActivities.length})
          </div>

          <div className="space-y-2.5">
            {filteredActivities.map(act => {
              const isSelected = currentActive?.id === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => handleSelectActivity(act)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-300 shadow-sm ring-1 ring-purple-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>
                      {act.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {act.enrolledStudents.length} / {act.capacity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                    Advisor: <strong className="text-slate-700">{act.facultyAdvisor}</strong>
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="truncate max-w-[160px]">{act.room}</span>
                    <span className="text-purple-600 font-semibold flex items-center gap-1">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Activity Detail Pane (with ref for smooth scrolling) */}
        {currentActive && (
          <div
            ref={activityDetailRef}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 scroll-mt-20"
          >
            
            {/* Header of Active Club */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  {currentActive.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{currentActive.name}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{currentActive.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddAchievementOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>+ Record Award</span>
                </button>

                <button
                  onClick={() => setIsEnrollStudentOpen(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Assign Student</span>
                </button>
              </div>
            </div>

            {/* Quick Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty Advisor</span>
                <div className="text-xs font-bold text-slate-800 mt-1">{currentActive.facultyAdvisor}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meeting Schedule</span>
                <div className="text-xs font-bold text-slate-800 mt-1">{currentActive.meetingSchedule}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue / Ground</span>
                <div className="text-xs font-bold text-slate-800 mt-1">{currentActive.room}</div>
              </div>
            </div>

            {/* Enrolled Students Roster */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Enrolled Student Members ({currentActive.enrolledStudents.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentActive.enrolledStudents.map((enr) => {
                  const studObj = students.find(s => s.id === enr.studentId);
                  return (
                    <div
                      key={enr.studentId}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={studObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{enr.studentName}</div>
                          <div className="text-[10px] text-purple-700 font-semibold">{enr.role}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeStudentFromActivity(currentActive.id, enr.studentId)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements & Awards Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-500" />
                  <span>Honors, Competitions & Trophies ({(currentActive.achievements || []).length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {(currentActive.achievements || []).length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs">No competition awards recorded yet. Click "+ Record Award" above.</p>
                  </div>
                ) : (
                  currentActive.achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-start gap-3"
                    >
                      <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-950">{ach.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{formatDate(ach.date)}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">Recipient: <strong>{ach.recipient}</strong></p>
                        {ach.notes && <p className="text-xs text-amber-900/80 italic mt-1">{ach.notes}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal: Add New Activity */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Create Extracurricular Program</h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Club / Sport Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chess & Strategic Thought Club"
                  value={newActivityData.name}
                  onChange={(e) => setNewActivityData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newActivityData.category}
                    onChange={(e) => setNewActivityData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Advisor</label>
                  <select
                    value={newActivityData.facultyAdvisor}
                    onChange={(e) => setNewActivityData(prev => ({ ...prev, facultyAdvisor: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    {staff.map(st => (
                      <option key={st.id} value={`${st.firstName} ${st.lastName}`}>
                        {st.firstName} {st.lastName} ({st.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Wednesdays, 3:30 PM - 5:00 PM"
                  value={newActivityData.meetingSchedule}
                  onChange={(e) => setNewActivityData(prev => ({ ...prev, meetingSchedule: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Library Seminar Room 2"
                  value={newActivityData.room}
                  onChange={(e) => setNewActivityData(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Overview of the club goals and activities..."
                  value={newActivityData.description}
                  onChange={(e) => setNewActivityData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-100"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Achievement */}
      {isAddAchievementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Record Honor or Competition Award</h3>
              <button onClick={() => setIsAddAchievementOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAchievement} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Award Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Place - Regional Debate Championship"
                  value={achievementData.title}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient / Winning Team</label>
                <input
                  type="text"
                  placeholder="e.g. Oakridge MUN Delegation / Student Name"
                  value={achievementData.recipient}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Award Date</label>
                <input
                  type="date"
                  value={achievementData.date}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Citation</label>
                <textarea
                  rows="2"
                  placeholder="Citation or event details..."
                  value={achievementData.notes}
                  onChange={(e) => setAchievementData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAchievementOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-100"
                >
                  Record Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student */}
      {isEnrollStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Assign Student to {currentActive.name}</h3>
              <button onClick={() => setIsEnrollStudentOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={enrollData.studentId}
                  onChange={(e) => setEnrollData(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.grade} - Sec {s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Position in Club</label>
                <select
                  value={enrollData.role}
                  onChange={(e) => setEnrollData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Member">General Member</option>
                  <option value="President / Captain">President / Captain</option>
                  <option value="Vice Captain / Vice President">Vice Captain / Vice President</option>
                  <option value="Secretary / Lead">Secretary / Lead</option>
                  <option value="Treasurer">Treasurer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollStudentOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
