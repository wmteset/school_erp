import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, Calendar, Briefcase, Sparkles, Building, User, ShieldCheck, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ImageUploader } from '../Common/ImageUploader';

export const StaffEnrollModal = ({ isOpen, onClose, staffToEdit = null }) => {
  const { addStaff, updateStaff, schoolInfo, showToast } = useSchool();

  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);

  const normalizeRole = (r) => {
    if (!r) return 'teacher';
    const low = r.toLowerCase().trim();
    if (low === 'principal') return 'principal';
    if (low === 'accountant') return 'accountant';
    if (low === 'support_staff' || low === 'support' || low === 'support staff' || low === 'non-teaching') return 'support_staff';
    return 'teacher';
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    password: '',
    phone: '+1 (555) 000-0000',
    role: 'teacher',
    designation: '',
    department: 'Science',
    subject: 'General Science',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full-time',
    qualification: 'M.Sc. / B.Ed.',
    experienceYears: 5,
    status: 'Active',
    address: '100 Campus Ave, Suite 101',
    emergencyContact: 'Family Contact - +1 (555) 000-0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    salary: {
      baseSalary: 5000,
      hra: 1100,
      transportAllowance: 350,
      specialAllowance: 250,
      pfDeduction: 320,
      taxDeduction: 420,
      bankName: 'Chase National Bank',
      accountNumber: '•••• 1234',
      taxId: 'TAX-US-99000'
    }
  });

  const isSupportStaff = formData.role === 'support_staff';

  useEffect(() => {
    if (staffToEdit) {
      const normRole = normalizeRole(staffToEdit.role);
      setFormData({
        ...staffToEdit,
        password: '',
        role: normRole,
        designation: staffToEdit.designation || (staffToEdit.role && !['teacher', 'principal', 'accountant', 'admin', 'support_staff'].includes(staffToEdit.role.toLowerCase()) ? staffToEdit.role : ''),
        salary: {
          baseSalary: staffToEdit.salary?.baseSalary || (normRole === 'support_staff' ? 2500 : 5000),
          hra: staffToEdit.salary?.hra || (normRole === 'support_staff' ? 500 : 1100),
          transportAllowance: staffToEdit.salary?.transportAllowance || (normRole === 'support_staff' ? 200 : 350),
          specialAllowance: staffToEdit.salary?.specialAllowance || (normRole === 'support_staff' ? 100 : 250),
          pfDeduction: staffToEdit.salary?.pfDeduction || (normRole === 'support_staff' ? 150 : 320),
          taxDeduction: staffToEdit.salary?.taxDeduction || (normRole === 'support_staff' ? 50 : 420),
          bankName: staffToEdit.salary?.bankName || 'Chase National Bank',
          accountNumber: staffToEdit.salary?.accountNumber || '•••• 1234',
          taxId: staffToEdit.salary?.taxId || 'TAX-US-99000'
        }
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        gender: 'Male',
        email: '',
        password: '',
        phone: '+1 (555) 000-0000',
        role: 'teacher',
        designation: '',
        department: 'Science',
        subject: 'General Science',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'Full-time',
        qualification: 'M.Sc. / B.Ed.',
        experienceYears: 5,
        status: 'Active',
        address: '100 Campus Ave, Suite 101',
        emergencyContact: 'Family Contact - +1 (555) 000-0001',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        salary: {
          baseSalary: 5000,
          hra: 1100,
          transportAllowance: 350,
          specialAllowance: 250,
          pfDeduction: 320,
          taxDeduction: 420,
          bankName: 'Chase National Bank',
          accountNumber: '•••• 1234',
          taxId: 'TAX-US-99000'
        }
      });
    }
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // If switched to support_staff, auto adjust defaults
      if (name === 'role' && value === 'support_staff' && !staffToEdit) {
        if (prev.department === 'Science') updated.department = 'Support & Facilities';
        if (!prev.designation) updated.designation = 'Head Peon';
        if (prev.salary.baseSalary === 5000) {
          updated.salary = {
            ...prev.salary,
            baseSalary: 2500,
            hra: 500,
            transportAllowance: 200,
            specialAllowance: 100,
            pfDeduction: 150,
            taxDeduction: 50
          };
        }
      }
      return updated;
    });
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [name]: name.includes('Name') || name.includes('account') || name.includes('taxId') ? value : Number(value) || 0
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast('Please provide first and last name.', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Please provide an email or unique identifier.', 'error');
      return;
    }

    // Password required ONLY when creating staff with active portal roles (not support staff)
    if (!staffToEdit && !isSupportStaff && !formData.password?.trim()) {
      showToast('Please set an initial security password for portal login.', 'error');
      return;
    }

    const payload = {
      ...formData,
      role: normalizeRole(formData.role),
      designation: formData.designation.trim() || (isSupportStaff ? 'Support Staff' : `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} - ${formData.department}`),
      experienceYears: Number(formData.experienceYears) || 0,
    };

    try {
      if (staffToEdit) {
        await updateStaff(staffToEdit.id, payload);
      } else {
        await addStaff(payload);
      }
      onClose();
    } catch (err) {
      console.error('Staff submission error:', err);
    }
  };

  const departments = [
    'Science', 'Mathematics', 'Computer Science', 'Humanities',
    'Languages', 'Physical Education', 'Fine Arts', 'Administration',
    'Finance', 'Student Counseling', 'Library & Resource',
    'Support & Facilities', 'Housekeeping & Maintenance', 'Transport & Logistics', 'Campus Security', 'Cafeteria & Dining'
  ];

  // Live salary gross & net computation preview
  const gross = (Number(formData.salary.baseSalary) || 0) +
                (Number(formData.salary.hra) || 0) +
                (Number(formData.salary.transportAllowance) || 0) +
                (Number(formData.salary.specialAllowance) || 0);

  const deductions = (Number(formData.salary.pfDeduction) || 0) +
                     (Number(formData.salary.taxDeduction) || 0);

  const netPay = gross - deductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-scale-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                {staffToEdit ? 'Edit Faculty / Staff Member' : 'Staff Onboarding & Compensation Form'}
              </h3>
              <p className="text-xs text-slate-500">
                Register faculty, administration, or helping staff profiles, designations, joining dates, and wages
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
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Personal & Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('employment')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'employment'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>2. Role & Designation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'salary'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>3. Salary & Deductions</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: Personal & Contact */}
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
                    required
                    placeholder="e.g. Marcus / Ramesh"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="e.g. Vance / Kumar"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address / ID *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="staff@oakridge-academy.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password field / Support Staff Notice */}
              {!staffToEdit && (
                isSupportStaff ? (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-900">No Portal Login Access Required</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Support staff (Peons, Cleaning Staff, Security, Drivers) are managed administratively for daily roll call, salary payouts, and leaves without creating application user login accounts.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Account Security Password *</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Initial portal login password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required={!isSupportStaff}
                        placeholder="Set initial security password for staff portal"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Faculty / Staff Avatar Photo"
                    value={formData.avatar}
                    onChange={(imgUrl) => setFormData(prev => ({ ...prev, avatar: imgUrl }))}
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
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, City, Zip code"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Emergency Contact Details
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Contact Name (Relation) - Phone Number"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Employment, Role & Designation */}
          {activeTab === 'employment' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Role Category *</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Select Staff Type</span>
                  </label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-bold text-slate-800"
                  >
                    <option value="teacher">TEACHER (Classroom & Roll Call Access)</option>
                    <option value="principal">PRINCIPAL (Executive Academic Access)</option>
                    <option value="accountant">ACCOUNTANT (Finance & Payroll Access)</option>
                    <option value="support_staff">SUPPORT STAFF (Peons, Cleaning, Transport, Security - No Login)</option>
                  </select>
                </div>

                {/* Designation Text Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    name="designation"
                    required
                    placeholder={isSupportStaff ? "e.g. Head Peon / Cleaning Staff / Bus Driver" : "e.g. Senior Physics Teacher & HOD"}
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Joining Date *</span>
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    required
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Full-time">Full-time Permanent</option>
                    <option value="Part-time">Part-time Adjunct</option>
                    <option value="Contract">Fixed Term Contract</option>
                    <option value="Probationary">Probationary Period</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prior Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    min="0"
                    max="50"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isSupportStaff ? 'Skills / Certifications' : 'Academic Qualifications'}
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder={isSupportStaff ? "e.g. Commercial Driving License / Security Cert." : "e.g. Ph.D. Applied Physics, B.Ed."}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isSupportStaff ? 'Assigned Area / Shift' : 'Primary Subject / Responsibilities'}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={isSupportStaff ? "e.g. Main Admin Building & Campus Gate 1" : "e.g. AP Calculus & Grade 11 Math"}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Salary Breakdown & Deductions */}
          {activeTab === 'salary' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Earnings Breakdown */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Monthly Earnings Package ({schoolInfo.currency})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Base Salary * ({schoolInfo.currency})
                    </label>
                    <input
                      type="number"
                      name="baseSalary"
                      min="0"
                      value={formData.salary.baseSalary}
                      onChange={handleSalaryChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      HRA (Housing Allowance)
                    </label>
                    <input
                      type="number"
                      name="hra"
                      min="0"
                      value={formData.salary.hra}
                      onChange={handleSalaryChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transport Allowance
                    </label>
                    <input
                      type="number"
                      name="transportAllowance"
                      min="0"
                      value={formData.salary.transportAllowance}
                      onChange={handleSalaryChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Special / Uniform Allowance
                    </label>
                    <input
                      type="number"
                      name="specialAllowance"
                      min="0"
                      value={formData.salary.specialAllowance}
                      onChange={handleSalaryChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="p-4 bg-rose-50/50 border border-rose-200/60 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Statutory Deductions ({schoolInfo.currency})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Provident Fund (PF) / ESI
                    </label>
                    <input
                      type="number"
                      name="pfDeduction"
                      min="0"
                      value={formData.salary.pfDeduction}
                      onChange={handleSalaryChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Tax / Other Deductions
                    </label>
                    <input
                      type="number"
                      name="taxDeduction"
                      min="0"
                      value={formData.salary.taxDeduction}
                      onChange={handleSalaryChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bank & Tax Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.salary.bankName}
                    onChange={handleSalaryChange}
                    placeholder="e.g. Chase Bank / Cash"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Mask / Method
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.salary.accountNumber}
                    onChange={handleSalaryChange}
                    placeholder="•••• 4892 / Cash Voucher"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tax ID / SSN / PAN
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.salary.taxId}
                    onChange={handleSalaryChange}
                    placeholder="TAX-US-99120"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Live Computed Summary Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs text-slate-400">Gross: {schoolInfo.currency}{gross.toLocaleString()} | Deductions: {schoolInfo.currency}{deductions.toLocaleString()}</span>
                  <div className="text-sm font-semibold text-emerald-400">Net Take-Home Monthly Salary</div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {schoolInfo.currency}{netPay.toLocaleString()}
                </div>
              </div>

            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'salary' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'personal') setActiveTab('employment');
                    else if (activeTab === 'employment') setActiveTab('salary');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{staffToEdit ? 'Update Staff Member' : 'Complete Onboarding'}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
