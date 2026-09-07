import React, { useState, useRef } from 'react';
import {
  Settings,
  School,
  Database,
  Download,
  Upload,
  RefreshCw,
  Printer,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ImageUploader } from '../Common/ImageUploader';

export const SettingsView = () => {
  const {
    schoolInfo,
    setSchoolInfo,
    resetToDefaultData,
    exportBackupJSON,
    importBackupJSON,
    showToast,
    students,
    staff,
    currentRole,
    permissions
  } = useSchool();

  const [formData, setFormData] = useState(schoolInfo);
  const fileInputRef = useRef(null);

  const academicYears = [
    '2024-2025',
    '2025-2026',
    '2026-2027',
    '2027-2028',
    '2028-2029'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSchoolInfo = (e) => {
    e.preventDefault();
    setSchoolInfo(formData);
    showToast('School profile, logo, and header subtitle updated successfully across the ERP!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        importBackupJSON(json);
      } catch (err) {
        showToast('Invalid JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleBatchPrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-slate-800 text-white rounded-2xl shadow-sm">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Settings & Administrative Data Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure school profile, logo branding, header subtitle, academic session, institutional currency, data backups, and reports
          </p>
        </div>
      </div>

      {/* School Profile Settings Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <School className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-base">Institution Profile & Academic Session</h2>
        </div>

        <form onSubmit={handleSaveSchoolInfo} className="space-y-5">
          
          {/* School Logo Image Uploader */}
          <div>
            <ImageUploader
              label="Official School Logo / Crest"
              value={formData.logo || ''}
              onChange={(imgUrl) => setFormData(prev => ({ ...prev, logo: imgUrl }))}
              isSchoolLogo={true}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This logo will be displayed on the top navigation bar, Student ID Cards, Faculty Badges, and Salary Payslips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institution / School Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Oakridge International Academy"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Affiliation / Header Subtitle (e.g. CBSE &amp; IB World School #04291) *
              </label>
              <input
                type="text"
                name="affiliation"
                placeholder="e.g. CBSE & IB World School #04291"
                value={formData.affiliation || formData.headerSubtitle || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({ ...prev, affiliation: val, headerSubtitle: val }));
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-800"
              />
              <span className="text-[10px] text-slate-400">
                Displayed directly below the school name in the top navbar and official student/staff identity cards.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                School Tagline / Motto
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleChange}
                placeholder="e.g. Excellence in Education & Character Building"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Principal / Head of School
              </label>
              <input
                type="text"
                name="principal"
                value={formData.principal || ''}
                onChange={handleChange}
                placeholder="e.g. Dr. Arthur Pendelton, Ph.D."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Session (Active Term) *
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold text-indigo-700"
              >
                {academicYears.map(yr => (
                  <option key={yr} value={yr}>
                    Session {yr} {yr === '2026-2027' ? '(Current Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Currency Symbol
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
              >
                <option value="$">$ (USD / International)</option>
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="AED">AED (Emirati Dirham)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrative Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Campus Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save School Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Backup Tools */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <Database className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-slate-800 text-base">Database Backup, Restore & Reset</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Backup */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="p-2 bg-teal-100 text-teal-700 rounded-xl w-max mb-2">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Export Full Backup</h3>
              <p className="text-xs text-slate-500 mt-1">
                Download JSON archive of all students, staff, attendance registers, leaves and payrolls.
              </p>
            </div>
            <button
              onClick={exportBackupJSON}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              Download JSON Backup
            </button>
          </div>

          {/* Restore */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl w-max mb-2">
                <Upload className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Restore from Backup</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload and apply a previously exported JSON backup file into the app state.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                Upload Backup JSON
              </button>
            </div>
          </div>

          {/* Reseed (Admin only) */}
          <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl w-max mb-2">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-rose-950 text-sm">Reset to Demo Dataset</h3>
              <p className="text-xs text-rose-800/80 mt-1">
                Restores factory pre-loaded students, teachers, payroll slips, and attendance records.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all current data back to default demo records?')) {
                  resetToDefaultData();
                }
              }}
              disabled={!permissions?.canResetDatabase}
              className={`w-full py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors ${
                permissions?.canResetDatabase
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {permissions?.canResetDatabase ? 'Reset to Default Demo Data' : 'Super Admin Only'}
            </button>
          </div>

        </div>
      </div>

      {/* Reports Print Center */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-base">Printable Institutional Reports</h2>
          </div>
          <button
            onClick={handleBatchPrint}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report View</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Official Student Registry Roll</h4>
              <p className="text-[11px] text-slate-500">Summary list of all {students.length} enrolled students</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">Printable</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Faculty & Staff Compensation Register</h4>
              <p className="text-[11px] text-slate-500">Breakdown for all {staff.length} staff members</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Printable</span>
          </div>
        </div>
      </div>

    </div>
  );
};
