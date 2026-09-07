import React from 'react';
import { School, QrCode, Phone, MapPin, User, ShieldCheck, Printer, X } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const StudentIDCard = ({ student, onClose }) => {
  const { schoolInfo } = useSchool();

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 overflow-hidden animate-scale-in">
        
        {/* Top Control Bar (hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <span className="text-sm font-bold text-slate-800">Student Identity Card</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable ID Card Structure */}
        <div className="printable-badge-target mt-4 p-5 rounded-2xl bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-xl relative overflow-hidden border-2 border-indigo-500/30">
          
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              {schoolInfo.logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-white/20 flex items-center justify-center shrink-0">
                  <img src={schoolInfo.logo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20 shrink-0">
                  <School className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold tracking-tight text-white">{schoolInfo.name}</div>
                <div className="text-[9px] text-indigo-200 tracking-wider uppercase font-semibold">Student Identification</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-900 shadow-2xs">
              {schoolInfo.academicYear}
            </span>
          </div>

          {/* Card Body */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={student.avatar}
                alt=""
                className="w-24 h-28 object-cover rounded-xl border-2 border-white shadow-md"
              />
              <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                ACTIVE
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="text-base font-bold text-white truncate">
                {student.firstName} {student.lastName}
              </h3>
              <div className="text-xs text-amber-300 font-semibold">
                {student.grade} • Sec {student.section}
              </div>
              
              <div className="pt-1 text-[10px] space-y-0.5 text-indigo-200">
                <div><span className="text-indigo-400 font-semibold">Student ID:</span> {student.id}</div>
                <div><span className="text-indigo-400 font-semibold">Roll No:</span> {student.rollNumber}</div>
                <div><span className="text-indigo-400 font-semibold">Blood Group:</span> {student.bloodGroup || 'O+'}</div>
                <div><span className="text-indigo-400 font-semibold">DOB:</span> {student.dob}</div>
              </div>
            </div>
          </div>

          {/* Emergency & Guardian Bar */}
          <div className="mt-4 pt-3 border-t border-indigo-700/60 flex items-center justify-between text-[9px] text-indigo-200">
            <div>
              <div className="font-semibold text-white">Emergency Contact:</div>
              <div>{student.guardianName} ({student.guardianPhone})</div>
            </div>

            {/* QR Code Graphic Simulation */}
            <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center shadow-inner">
              <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center">
                <QrCode className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="mt-3 pt-2 border-t border-indigo-700/40 flex items-center justify-between text-[8px] text-indigo-300">
            <span>Principal: {schoolInfo.principal}</span>
            <span>Oakridge ERP System</span>
          </div>

        </div>

      </div>
    </div>
  );
};
