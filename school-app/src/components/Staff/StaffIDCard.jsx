import React from 'react';
import { School, QrCode, Phone, Mail, Printer, X, Shield, Award } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatDate } from '../../utils/helpers';

export const StaffIDCard = ({ staffMember, onClose }) => {
  const { schoolInfo } = useSchool();

  if (!staffMember) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 overflow-hidden animate-scale-in">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <span className="text-sm font-bold text-slate-800">Faculty & Staff Identity Card</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Card Design */}
        <div className="printable-badge-target mt-4 p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden border-2 border-emerald-500/30">
          
          {/* Top School Bar */}
          <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              {schoolInfo.logo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-white/20 flex items-center justify-center shrink-0">
                  <img src={schoolInfo.logo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30 shrink-0">
                  <School className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold tracking-tight text-white">{schoolInfo.name}</div>
                <div className="text-[9px] text-emerald-300 tracking-wider uppercase font-semibold">Faculty / Staff Official ID</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400 text-slate-950">
              STAFF
            </span>
          </div>

          {/* Body */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={staffMember.avatar}
                alt=""
                className="w-24 h-28 object-cover rounded-xl border-2 border-emerald-400 shadow-md"
              />
              <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                VERIFIED
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="text-base font-bold text-white truncate">
                {staffMember.firstName} {staffMember.lastName}
              </h3>
              <div className="text-xs text-emerald-300 font-semibold truncate">
                {staffMember.designation || staffMember.role}
              </div>
              <div className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {staffMember.role?.toUpperCase() || 'TEACHER'}
              </div>
              
              <div className="pt-1 text-[10px] space-y-0.5 text-slate-300">
                <div><span className="text-slate-400 font-semibold">Staff ID:</span> {staffMember.id}</div>
                <div><span className="text-slate-400 font-semibold">Department:</span> {staffMember.department}</div>
                <div><span className="text-slate-400 font-semibold">Joined Date:</span> {formatDate(staffMember.joiningDate)}</div>
                <div><span className="text-slate-400 font-semibold">Type:</span> {staffMember.employmentType || 'Full-time'}</div>
              </div>
            </div>
          </div>

          {/* Footer Card Info */}
          <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-[9px] text-slate-300">
            <div>
              <div className="font-semibold text-white">Emergency Contact:</div>
              <div className="truncate max-w-[200px]">{staffMember.emergencyContact || staffMember.phone}</div>
            </div>

            {/* QR Simulation */}
            <div className="w-12 h-12 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded flex items-center justify-center">
                <QrCode className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-400">
            <span>Authorizing Signatory: {schoolInfo.principal}</span>
            <span>Oakridge ERP System</span>
          </div>

        </div>

      </div>
    </div>
  );
};
