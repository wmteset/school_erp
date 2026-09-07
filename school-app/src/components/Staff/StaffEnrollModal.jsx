import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, Calendar, Briefcase, Sparkles, Building, User, ShieldCheck, Eye, EyeOff, Lock, ShieldAlert, AlertCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ImageUploader } from '../Common/ImageUploader';

export const StaffEnrollModal = ({ isOpen, onClose, staffToEdit = null }) => {
  const { addStaff, updateStaff, schoolInfo, showToast } = useSchool();

  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const normalizeRole = (r) => {
    if (!r) return '';
    const low = r.toLowerCase().trim();
    if (low === 'principal') return 'principal';
    if (low === 'accountant') return 'accountant';
    if (low === 'support_staff' || low === 'support' || low === 'support staff' || low === 'non-teaching') return 'support_staff';
    if (low === 'teacher') return 'teacher';
    return low;
  };

  const getDepartmentsForRole = (role) => {
    const norm = normalizeRole(role);
    switch (norm) {
      case 'principal':
        return ['Administration'];
      case 'accountant':
        return ['Finance & Accounts', 'Administration'];
      case 'support_staff':
        return [
          'Support & Facilities',
          'Housekeeping & Maintenance',
          'Transport & Logistics',
          'Campus Security',
          'Cafeteria & Dining'
        ];
      case 'teacher':
        return [
          'Science',
          'Mathematics',
          'Computer Science',
          'Humanities',
          'Languages',
          'Physical Education',
          'Fine Arts',
          'Student Counseling',
          'Library & Resource'
        ];
      default:
        return [];
    }
  };

  const emptyForm = {
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    designation: '',
    department: '',
    subject: '',
    joiningDate: '',
    employmentType: '',
    qualification: '',
    experienceYears: '',
    status: 'Active',
    address: '',
    emergencyContact: '',
    avatar: '',
    salary: {
      baseSalary: '',
      hra: '',
      transportAllowance: '',
      specialAllowance: '',
      pfDeduction: '',
      taxDeduction: '',
      bankName: '',
      accountNumber: '',
      taxId: ''
    }
  };

  const [formData, setFormData] = useState(emptyForm);

  const isSupportStaff = formData.role === 'support_staff';
  const availableDepartments = getDepartmentsForRole(formData.role);

  useEffect(() => {
    setErrors({});
    if (staffToEdit) {
      const normRole = normalizeRole(staffToEdit.role);
      const validDepts = getDepartmentsForRole(normRole);
      const initialDept = validDepts.includes(staffToEdit.department) ? staffToEdit.department : (validDepts[0] || '');

      setFormData({
        firstName: staffToEdit.firstName || '',
        lastName: staffToEdit.lastName || '',
        gender: staffToEdit.gender || 'Male',
        email: staffToEdit.email || '',
        password: '',
        phone: staffToEdit.phone || '',
        role: normRole,
        department: initialDept,
        designation: staffToEdit.designation || '',
        subject: staffToEdit.subject || '',
        joiningDate: staffToEdit.joiningDate || '',
        employmentType: staffToEdit.employmentType || 'Full-time',
        qualification: staffToEdit.qualification || '',
        experienceYears: staffToEdit.experienceYears !== undefined && staffToEdit.experienceYears !== null ? staffToEdit.experienceYears : '',
        status: staffToEdit.status || 'Active',
        address: staffToEdit.address || '',
        emergencyContact: staffToEdit.emergencyContact || '',
        avatar: staffToEdit.avatar || '',
        salary: {
          baseSalary: staffToEdit.salary?.baseSalary !== undefined ? staffToEdit.salary.baseSalary : '',
          hra: staffToEdit.salary?.hra !== undefined ? staffToEdit.salary.hra : '',
          transportAllowance: staffToEdit.salary?.transportAllowance !== undefined ? staffToEdit.salary.transportAllowance : '',
          specialAllowance: staffToEdit.salary?.specialAllowance !== undefined ? staffToEdit.salary.specialAllowance : '',
          pfDeduction: staffToEdit.salary?.pfDeduction !== undefined ? staffToEdit.salary.pfDeduction : '',
          taxDeduction: staffToEdit.salary?.taxDeduction !== undefined ? staffToEdit.salary.taxDeduction : '',
          bankName: staffToEdit.salary?.bankName || '',
          accountNumber: staffToEdit.salary?.accountNumber || '',
          taxId: staffToEdit.salary?.taxId || ''
        }
      });
    } else {
      setFormData(emptyForm);
    }
  }, [staffToEdit, isOpen]);

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

    if (name === 'role') {
      const normRole = normalizeRole(value);
      
      setFormData(prev => ({
        ...prev,
        role: normRole,
        department: '', // always reset to empty on role select/change
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [name]: name.includes('Name') || name.includes('account') || name.includes('taxId') ? value : value
      }
    }));
  };

  const validatePersonalTab = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'error');
      return false;
    }
    return true;
  };

  const validateEmploymentTab = () => {
    const newErrors = {};
    if (!formData.role) {
      newErrors.role = 'Please select a role category';
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }
    if (!staffToEdit && !isSupportStaff && (!formData.password || !formData.password.trim())) {
      newErrors.password = 'Account security password is required for portal login';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, 'error');
      return false;
    }
    return true;
  };

  const validateSalaryTab = () => {
    const newErrors = {};
    if (formData.salary.baseSalary === '' || Number(formData.salary.baseSalary) < 0) {
      newErrors.baseSalary = 'Base salary is required';
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
        setActiveTab('employment');
      }
    } else if (activeTab === 'employment') {
      if (validateEmploymentTab()) {
        setActiveTab('salary');
      }
    }
  };

  const handleTabClick = (targetTab) => {
    if (targetTab === 'personal') {
      setActiveTab('personal');
    } else if (targetTab === 'employment') {
      if (validatePersonalTab()) {
        setActiveTab('employment');
      }
    } else if (targetTab === 'salary') {
      if (validatePersonalTab() && validateEmploymentTab()) {
        setActiveTab('salary');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePersonalTab()) {
      setActiveTab('personal');
      return;
    }

    if (!validateEmploymentTab()) {
      setActiveTab('employment');
      return;
    }

    if (!validateSalaryTab()) {
      setActiveTab('salary');
      return;
    }

    const payload = {
      ...formData,
      gender: formData.gender || 'Male',
      employmentType: formData.employmentType || 'Full-time',
      role: normalizeRole(formData.role),
      designation: formData.designation.trim() || (isSupportStaff ? 'Support Staff' : `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} - ${formData.department}`),
      experienceYears: Number(formData.experienceYears) || 0,
      salary: {
        baseSalary: Number(formData.salary.baseSalary) || 0,
        hra: Number(formData.salary.hra) || 0,
        transportAllowance: Number(formData.salary.transportAllowance) || 0,
        specialAllowance: Number(formData.salary.specialAllowance) || 0,
        pfDeduction: Number(formData.salary.pfDeduction) || 0,
        taxDeduction: Number(formData.salary.taxDeduction) || 0,
        bankName: formData.salary.bankName || 'Direct Transfer',
        accountNumber: formData.salary.accountNumber || '',
        taxId: formData.salary.taxId || ''
      }
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

  // Live salary gross & net computation preview
  const baseSalaryNum = Number(formData.salary.baseSalary) || 0;
  const hraNum = Number(formData.salary.hra) || 0;
  const transportNum = Number(formData.salary.transportAllowance) || 0;
  const specialNum = Number(formData.salary.specialAllowance) || 0;
  const pfNum = Number(formData.salary.pfDeduction) || 0;
  const taxNum = Number(formData.salary.taxDeduction) || 0;

  const gross = baseSalaryNum + hraNum + transportNum + specialNum;
  const deductions = pfNum + taxNum;
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
            onClick={() => handleTabClick('personal')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
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
            onClick={() => handleTabClick('employment')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
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
            onClick={() => handleTabClick('salary')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
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
                    placeholder="e.g. Marcus / Ramesh"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
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
                    placeholder="e.g. Vance / Kumar"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                  />
                  {errors.lastName && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address / Login ID *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. staff@oakridge-academy.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                </div>
              </div>

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
                    <option value="">Select Gender</option>
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
                  placeholder="Street address, City, State, Zip"
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

          {/* TAB 2: Employment, Role & Designation (Includes Account Security Password) */}
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
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.role ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-bold text-slate-800`}
                  >
                    <option value="">Select Role Category *</option>
                    <option value="teacher">TEACHER (Classroom & Roll Call Access)</option>
                    <option value="principal">PRINCIPAL (Executive Academic Access)</option>
                    <option value="accountant">ACCOUNTANT (Finance & Payroll Access)</option>
                    <option value="support_staff">SUPPORT STAFF (Peons, Cleaning, Transport, Security - No Login)</option>
                  </select>
                  {errors.role && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.role}</p>}
                </div>

                {/* Designation Text Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    name="designation"
                    placeholder={isSupportStaff ? "e.g. Head Peon / Cleaning Staff / Bus Driver" : "e.g. Senior Physics Teacher & HOD"}
                    value={formData.designation}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.designation ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium`}
                  />
                  {errors.designation && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.designation}</p>}
                </div>

              </div>

              {/* Account Security Password / Support Staff Notice */}
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
                  formData.role ? (
                    <div className={`p-3.5 bg-slate-50 border ${errors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'} rounded-2xl`}>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Account Security Password *</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Initial portal login password for {formData.role.toUpperCase()}</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder={`Set initial security password for ${formData.role} portal login`}
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full pl-3 pr-10 py-2 text-sm bg-white border ${errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
                    </div>
                  ) : null
                )
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Department *</span>
                    {formData.role && <span className="text-[10px] text-slate-400 font-normal">Filtered for {formData.role.toUpperCase()}</span>}
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.department ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium`}
                  >
                    <option value="">{formData.role ? 'Select Department *' : 'Select Role Category First'}</option>
                    {availableDepartments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Joining Date *</span>
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 text-sm border ${errors.joiningDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800`}
                  />
                  {errors.joiningDate && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.joiningDate}</p>}
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
                    <option value="">Select Employment Type</option>
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
                    placeholder="e.g. 5"
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
                    placeholder={isSupportStaff ? "e.g. Heavy Vehicle License, Maintenance Certificate" : "e.g. M.Sc. Physics, B.Ed."}
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
                      placeholder="e.g. 5000"
                      value={formData.salary.baseSalary}
                      onChange={handleSalaryChange}
                      className={`w-full px-3 py-2 text-sm border ${errors.baseSalary ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold`}
                    />
                    {errors.baseSalary && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.baseSalary}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      HRA (Housing Allowance)
                    </label>
                    <input
                      type="number"
                      name="hra"
                      min="0"
                      placeholder="0"
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
                      placeholder="0"
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
                      placeholder="0"
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
                      placeholder="0"
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
                      placeholder="0"
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
                  onClick={handleNextStep}
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
