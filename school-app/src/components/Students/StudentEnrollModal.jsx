import React, { useState, useEffect } from 'react';
import { X, GraduationCap, User, Phone, MapPin, Heart, Bus, Sparkles, AlertCircle, Hash } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ImageUploader } from '../Common/ImageUploader';
import { api } from '../../api/client';

export const StudentEnrollModal = ({ isOpen, onClose, studentToEdit = null }) => {
  const { addStudent, updateStudent, students = [], showToast } = useSchool();

  const emptyStudentForm = {
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    bloodGroup: '',
    grade: '',
    section: '',
    rollNumber: '',
    admissionDate: '',
    status: 'Active',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    medicalNotes: '',
    transportRoute: '',
    avatar: ''
  };

  const [formData, setFormData] = useState(emptyStudentForm);
  const [activeTab, setActiveTab] = useState('personal');
  const [errors, setErrors] = useState({});

  const calculateNextRollNumber = () => {
    if (!students || students.length === 0) return '101';
    const numericRolls = students
      .map(s => parseInt(s.rollNumber, 10))
      .filter(num => !isNaN(num) && num > 0);
    const maxRoll = numericRolls.length > 0 ? Math.max(...numericRolls) : 100;
    return String(maxRoll + 1);
  };

  useEffect(() => {
    setErrors({});
    if (studentToEdit) {
      setFormData({
        firstName: studentToEdit.firstName || '',
        lastName: studentToEdit.lastName || '',
        gender: studentToEdit.gender || 'Male',
        dob: studentToEdit.dob || '',
        bloodGroup: studentToEdit.bloodGroup || 'O+',
        grade: studentToEdit.grade || '',
        section: studentToEdit.section || 'A',
        rollNumber: studentToEdit.rollNumber || '',
        admissionDate: studentToEdit.admissionDate || '',
        status: studentToEdit.status || 'Active',
        guardianName: studentToEdit.guardianName || '',
        guardianRelation: studentToEdit.guardianRelation || 'Father',
        guardianPhone: studentToEdit.guardianPhone || '',
        guardianEmail: studentToEdit.guardianEmail || '',
        address: studentToEdit.address || '',
        medicalNotes: studentToEdit.medicalNotes || '',
        transportRoute: studentToEdit.transportRoute || '',
        avatar: studentToEdit.avatar || ''
      });
    } else {
      const initialRoll = calculateNextRollNumber();
      setFormData({
        ...emptyStudentForm,
        rollNumber: initialRoll,
      });

      // Synchronize with backend API for exact database count
      api.students.getNextRollNumber()
        .then(res => {
          if (res?.nextRollNumber) {
            setFormData(prev => ({
              ...prev,
              rollNumber: res.nextRollNumber,
            }));
          }
        })
        .catch(() => {
          // Context fallback already set
        });
    }
  }, [studentToEdit, isOpen, students]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePersonalTab = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Student first name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Student last name is required';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'error');
      return false;
    }
    return true;
  };

  const validateAcademicTab = () => {
    const newErrors = {};
    if (!formData.grade) {
      newErrors.grade = 'Grade / Class is required';
    }
    if (!formData.section) {
      newErrors.section = 'Section is required';
    }
    if (!formData.rollNumber || !formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    }
    if (!formData.admissionDate) {
      newErrors.admissionDate = 'Admission date is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'error');
      return false;
    }
    return true;
  };

  const validateGuardianTab = () => {
    const newErrors = {};
    if (!formData.guardianName || !formData.guardianName.trim()) {
      newErrors.guardianName = 'Primary guardian name is required';
    }
    if (!formData.guardianPhone || !formData.guardianPhone.trim()) {
      newErrors.guardianPhone = 'Guardian phone number is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'error');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (activeTab === 'personal') {
      if (validatePersonalTab()) {
        setActiveTab('academic');
      }
    } else if (activeTab === 'academic') {
      if (validateAcademicTab()) {
        setActiveTab('guardian');
      }
    }
  };

  const handleTabClick = (targetTab) => {
    if (targetTab === 'personal') {
      setActiveTab('personal');
    } else if (targetTab === 'academic') {
      if (validatePersonalTab()) {
        setActiveTab('academic');
      }
    } else if (targetTab === 'guardian') {
      if (validatePersonalTab() && validateAcademicTab()) {
        setActiveTab('guardian');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePersonalTab()) {
      setActiveTab('personal');
      return;
    }
    if (!validateAcademicTab()) {
      setActiveTab('academic');
      return;
    }
    if (!validateGuardianTab()) {
      setActiveTab('guardian');
      return;
    }

    const payload = {
      ...formData,
      gender: formData.gender || 'Male',
      bloodGroup: formData.bloodGroup || 'O+',
      guardianRelation: formData.guardianRelation || 'Father',
      status: formData.status || 'Active'
    };

    try {
      if (studentToEdit) {
        await updateStudent(studentToEdit.id, payload);
      } else {
        await addStudent(payload);
      }
      onClose();
    } catch (err) {
      console.error('Student submission error:', err);
    }
  };

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                {studentToEdit ? 'Edit Student Details' : 'Student Enrollment Application'}
              </h3>
              <p className="text-xs text-slate-500">
                Register student credentials, class assignment, and guardian details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-white">
          <button
            type="button"
            onClick={() => handleTabClick('personal')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Student Profile</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('academic')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>2. Academic Placement</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('guardian')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guardian'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>3. Guardian & Health</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: Personal Info */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="e.g. Liam"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors.firstName && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="e.g. Sterling"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors.lastName && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth (DOB) *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.dob ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors.dob && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <ImageUploader
                label="Student Avatar / Photo"
                value={formData.avatar}
                onChange={(imgUrl) => setFormData(prev => ({ ...prev, avatar: imgUrl }))}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrollment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Active">Active (Currently Enrolled)</option>
                  <option value="On Leave">On Leave (Medical/Family)</option>
                  <option value="Alumni">Alumni / Graduated</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Academic Placement */}
          {activeTab === 'academic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Grade / Class *
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.grade ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium`}
                  >
                    <option value="">Select Grade / Class *</option>
                    {grades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  {errors.grade && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.grade}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Section *
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.section ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium`}
                  >
                    <option value="">Select Section *</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                  {errors.section && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.section}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Roll Number *</span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md">Auto-Incremented</span>
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    placeholder="e.g. 101"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.rollNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800`}
                  />
                  {errors.rollNumber && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.rollNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admission Date *
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border ${errors.admissionDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                />
                {errors.admissionDate && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.admissionDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transportation Mode & Route
                </label>
                <input
                  type="text"
                  name="transportRoute"
                  value={formData.transportRoute}
                  onChange={handleChange}
                  placeholder="e.g. School Bus Route #3, Self / Carpool"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Guardian & Health */}
          {activeTab === 'guardian' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    placeholder="e.g. Robert Taylor"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.guardianName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors.guardianName && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.guardianName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship
                  </label>
                  <select
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Parents">Both Parents</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Grandparent">Grandparent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian Phone *
                  </label>
                  <input
                    type="text"
                    name="guardianPhone"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.guardianPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                  {errors.guardianPhone && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.guardianPhone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guardian Email
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    placeholder="e.g. parent@example.com"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street address, City, State, Zip"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical Notes / Allergies
                </label>
                <input
                  type="text"
                  name="medicalNotes"
                  placeholder="e.g. Mild peanut allergy, carries inhaler, none"
                  value={formData.medicalNotes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'guardian' ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{studentToEdit ? 'Save Changes' : 'Complete Enrollment'}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
