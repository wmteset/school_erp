import React from 'react';
import { School, Printer, X, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatCurrency, formatDate, numberToWords } from '../../utils/helpers';

export const PayslipModal = ({ staffRecord, month, year, onClose }) => {
  const { schoolInfo, staff } = useSchool();

  if (!staffRecord) return null;

  const staffDetails = staff.find(s => s.id === staffRecord.staffId) || {};

  const handlePrint = () => {
    window.print();
  };

  const grossEarnings = staffRecord.grossEarnings || (
    staffRecord.baseSalary + (staffRecord.hra || 0) + (staffRecord.transportAllowance || 0) + (staffRecord.specialAllowance || 0) + (staffRecord.bonus || 0)
  );

  const totalDeductions = staffRecord.totalDeductions || (
    (staffRecord.pfDeduction || 0) + (staffRecord.taxDeduction || 0) + (staffRecord.unpaidLeaveDeduction || 0)
  );

  const netPay = staffRecord.netSalary || (grossEarnings - totalDeductions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-scale-in">
        
        {/* Top Control Bar (Hidden when printed) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Faculty Salary Voucher / Payslip</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {staffRecord.paymentStatus || 'Paid'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Salary Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Official Payslip Structure (Wrapped in .printable-card-target) */}
        <div className="printable-card-target flex-1 overflow-y-auto p-4 sm:p-6 bg-white border border-slate-200 rounded-2xl mt-4 text-slate-800 space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              {schoolInfo.logo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <img src={schoolInfo.logo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold shrink-0">
                  <School className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">{schoolInfo.name}</h2>
                <p className="text-xs text-slate-500">{schoolInfo.address}</p>
                <p className="text-[11px] text-slate-400 font-mono">Affiliation: {schoolInfo.affiliation} | {schoolInfo.email}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-700">Official Payslip</div>
              <div className="text-sm font-black text-slate-900">{month} {year}</div>
              <div className="text-[11px] text-slate-500">Ref: {staffRecord.transactionRef || 'TXN-DISB-9810'}</div>
            </div>
          </div>

          {/* Employee Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">{staffRecord.staffName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Staff ID</span>
              <span className="font-mono font-bold text-slate-900">{staffRecord.staffId}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <span className="font-semibold text-slate-800">{staffRecord.department}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation</span>
              <span className="font-semibold text-slate-800">{staffRecord.role}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Joining Date</span>
              <span className="font-medium text-slate-800">{formatDate(staffDetails.joiningDate || '2019-08-01')}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
              <span className="font-medium text-slate-800">{staffDetails.salary?.bankName || 'Chase Bank'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Mask</span>
              <span className="font-mono font-medium text-slate-800">{staffDetails.salary?.accountNumber || '•••• 4892'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Disbursement Date</span>
              <span className="font-bold text-emerald-700">{formatDate(staffRecord.paidDate || '2026-08-31')}</span>
            </div>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left: Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-900 border-b border-emerald-100 flex justify-between">
                <span>Earnings & Allowances</span>
                <span>Amount ({schoolInfo.currency})</span>
              </div>
              <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">Base Salary:</span>
                  <span className="font-semibold">{formatCurrency(staffRecord.baseSalary, schoolInfo.currency)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">House Rent Allowance (HRA):</span>
                  <span className="font-semibold">{formatCurrency(staffRecord.hra || 0, schoolInfo.currency)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">Transport Allowance:</span>
                  <span className="font-semibold">{formatCurrency(staffRecord.transportAllowance || 0, schoolInfo.currency)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">Special / Subject Allowance:</span>
                  <span className="font-semibold">{formatCurrency(staffRecord.specialAllowance || 0, schoolInfo.currency)}</span>
                </div>
                {staffRecord.bonus > 0 && (
                  <div className="flex justify-between pt-1 text-emerald-700 font-semibold">
                    <span>Performance Bonus:</span>
                    <span>{formatCurrency(staffRecord.bonus, schoolInfo.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 font-bold text-emerald-900 text-sm bg-emerald-50/40 p-2 rounded">
                  <span>Gross Earnings:</span>
                  <span>{formatCurrency(grossEarnings, schoolInfo.currency)}</span>
                </div>
              </div>
            </div>

            {/* Right: Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-900 border-b border-rose-100 flex justify-between">
                <span>Deductions & Statutory</span>
                <span>Amount ({schoolInfo.currency})</span>
              </div>
              <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">Provident Fund (PF):</span>
                  <span className="font-semibold">{formatCurrency(staffRecord.pfDeduction || 0, schoolInfo.currency)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">Income Tax (Withholding):</span>
                  <span className="font-semibold">{formatCurrency(staffRecord.taxDeduction || 0, schoolInfo.currency)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">Unpaid Leave Deductions:</span>
                  <span className="font-semibold">{formatCurrency(staffRecord.unpaidLeaveDeduction || 0, schoolInfo.currency)}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-rose-900 text-sm bg-rose-50/40 p-2 rounded">
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(totalDeductions, schoolInfo.currency)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Net Salary in Numbers and Words */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Net Salary Payable</div>
              <div className="text-xs text-slate-300 italic">
                Amount in words: {numberToWords(netPay)}
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrency(netPay, schoolInfo.currency)}
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-600">
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-signature text-slate-800 font-semibold italic">
                C. Mendez (CPA)
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Bursar / Accountant</div>
            </div>

            {/* Official Stamp Simulation */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center text-center p-1 transform rotate-[-8deg] bg-indigo-50/30">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="text-[7px] font-bold text-indigo-800 uppercase tracking-tighter">OFFICIAL SEAL</span>
              <span className="text-[6px] text-indigo-600">{schoolInfo.academicYear}</span>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-slate-400 pb-1 mb-1 font-signature text-slate-800 font-semibold italic">
                Dr. A. Pendelton
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Principal / Authorized Signatory</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
