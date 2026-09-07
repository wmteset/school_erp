import React, { useState } from 'react';
import {
  DollarSign,
  Calendar,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  Building,
  CreditCard,
  Receipt,
  FileText,
  AlertCircle,
  Lock,
  CalendarClock
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { PayslipModal } from './PayslipModal';
import confetti from 'canvas-confetti';

export const PayrollView = () => {
  const {
    staff,
    payrollRecords,
    generateMonthlyPayroll,
    updateStaffPayrollRecord,
    disburseAllPayroll,
    schoolInfo,
    currentRole,
    permissions
  } = useSchool();

  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState(null);
  const [search, setSearch] = useState('');

  const months = ['August', 'September', 'October', 'November', 'December'];
  const currentActiveMonth = 'September';
  const currentActiveYear = 2026;

  const monthOrder = {
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12
  };

  const selectedMonthNum = monthOrder[selectedMonth] || 9;
  const currentMonthNum = monthOrder[currentActiveMonth] || 9;

  const isCurrentMonth = selectedMonth === currentActiveMonth && selectedYear === currentActiveYear;
  const isPastMonth = selectedYear < currentActiveYear || (selectedYear === currentActiveYear && selectedMonthNum < currentMonthNum);
  const isFutureMonth = selectedYear > currentActiveYear || (selectedYear === currentActiveYear && selectedMonthNum > currentMonthNum);

  // Find active payroll for selected month
  let currentPayroll = payrollRecords.find(p => p.month === selectedMonth && p.year === selectedYear);

  const handleGenerate = () => {
    if (!isPastMonth) return; // Only past months can be manually generated
    generateMonthlyPayroll(selectedMonth, selectedYear);
  };

  const handleDisburseAll = () => {
    if (!currentPayroll || !isCurrentMonth) return;
    disburseAllPayroll(currentPayroll.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const staffRecords = currentPayroll ? currentPayroll.staffRecords : [];

  // Filter staff records by search
  const filteredRecords = staffRecords.filter(r =>
    r.staffName.toLowerCase().includes(search.toLowerCase()) ||
    r.staffId.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase())
  );

  // Summary figures
  const totalGross = staffRecords.reduce((sum, r) => sum + (r.grossEarnings || 0), 0);
  const totalDeductions = staffRecords.reduce((sum, r) => sum + (r.totalDeductions || 0), 0);
  const totalNet = staffRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
  const paidCount = staffRecords.filter(r => r.paymentStatus === 'Paid').length;
  const pendingCount = staffRecords.length - paidCount;
  const isFullyPaid = staffRecords.length > 0 && paidCount === staffRecords.length;

  // Export CSV
  const handleExportCSV = () => {
    if (!currentPayroll) return;
    const headers = [
      'Staff ID', 'Staff Name', 'Department', 'Role', 'Base Salary',
      'HRA', 'Transport Allowance', 'Special Allowance', 'Gross Earnings',
      'PF Deduction', 'Tax Deduction', 'Total Deductions', 'Net Salary',
      'Status', 'Payment Method', 'Transaction Ref'
    ];

    const rows = staffRecords.map(r => [
      r.staffId,
      `"${r.staffName}"`,
      `"${r.department}"`,
      `"${r.role}"`,
      r.baseSalary,
      r.hra,
      r.transportAllowance,
      r.specialAllowance,
      r.grossEarnings,
      r.pfDeduction,
      r.taxDeduction,
      r.totalDeductions,
      r.netSalary,
      r.paymentStatus,
      r.paymentMethod,
      r.transactionRef
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `oakridge_payroll_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Staff Salaries & Payroll Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Monthly compensation processing, statutory tax & PF deductions, batch disbursements, and official payslips
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white shadow-2xs focus:outline-none text-slate-800"
          >
            {months.map(m => (
              <option key={m} value={m}>
                {m} {selectedYear} {m === currentActiveMonth ? '(Current Active)' : m === 'August' ? '(Past)' : '(Upcoming)'}
              </option>
            ))}
          </select>

          {currentPayroll ? (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              {/* Disburse all salaries button (disabled for past/upcoming months, unauthorized roles, or when fully paid) */}
              {permissions?.canDisbursePayroll && (
                <button
                  onClick={handleDisburseAll}
                  disabled={!isCurrentMonth || isFullyPaid}
                  title={
                    !isCurrentMonth
                      ? `Disbursements locked: ${selectedMonth} is not the current active billing cycle (${currentActiveMonth} 2026)`
                      : isFullyPaid
                      ? 'All staff salaries are already fully disbursed for this month'
                      : 'Disburse all salaries for current month'
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                    isCurrentMonth && !isFullyPaid
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 hover:shadow cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border border-slate-300/80 cursor-not-allowed shadow-none'
                  }`}
                >
                  {!isCurrentMonth ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isFullyPaid
                      ? 'All Salaries Disbursed'
                      : !isCurrentMonth
                      ? 'Disbursement Locked'
                      : 'Disburse All Salaries'}
                  </span>
                </button>
              )}
            </>
          ) : (
            /* Generate Button: ONLY visible for past months when payroll is NOT yet generated and role is authorized */
            isPastMonth && permissions?.canGeneratePayroll && (
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-100 flex items-center gap-2 transition-all hover:shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate {selectedMonth} {selectedYear} Payroll</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      {currentPayroll && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Payroll</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(totalNet, schoolInfo.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Gross: {formatCurrency(totalGross, schoolInfo.currency)}
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disbursement Progress</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {paidCount} / {staffRecords.length} Paid
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(paidCount / staffRecords.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statutory Deductions</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {formatCurrency(totalDeductions, schoolInfo.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              PF + Tax withholdings
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payroll Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                currentPayroll.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                currentPayroll.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {currentPayroll.status === 'Paid' ? 'Fully Disbursed' : currentPayroll.status}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Cycle: {selectedMonth} {selectedYear}
            </div>
          </div>

        </div>
      )}

      {/* Main Payroll Table or Empty State */}
      {!currentPayroll ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            {isPastMonth ? (
              <Receipt className="w-8 h-8 text-teal-600" />
            ) : (
              <CalendarClock className="w-8 h-8 text-slate-400" />
            )}
          </div>
          
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800">
              {isPastMonth
                ? `Past Cycle: ${selectedMonth} ${selectedYear} Payroll Not Yet Generated`
                : isCurrentMonth
                ? `Current Active Cycle: ${selectedMonth} ${selectedYear}`
                : `Upcoming Cycle: ${selectedMonth} ${selectedYear}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isPastMonth
                ? `You can generate and calculate the payroll ledger for this past completed month based on staff compensation packages.`
                : `Payroll generation is locked for ${selectedMonth} ${selectedYear}. The payroll run will open at the end of the billing period when monthly attendance and leaves are concluded.`}
            </p>
          </div>

          {/* Generate button ONLY shown for past months when not generated */}
          {isPastMonth ? (
            <button
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-100 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate {selectedMonth} {selectedYear} Payroll</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Payroll Generation Opens at Cycle Close</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Table Header Filter */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Filter staff by name or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none bg-slate-50/50 max-w-xs"
            />
            <div className="text-xs text-slate-500">
              Showing {filteredRecords.length} staff records • Cycle: <strong>{selectedMonth} {selectedYear}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3">Role & Dept</th>
                  <th className="py-3 px-3">Base Salary</th>
                  <th className="py-3 px-3">Allowances</th>
                  <th className="py-3 px-3">Deductions</th>
                  <th className="py-3 px-3">Net Payable</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.map((r) => {
                  const allowances = (r.hra || 0) + (r.transportAllowance || 0) + (r.specialAllowance || 0) + (r.bonus || 0);
                  const isPaid = r.paymentStatus === 'Paid';

                  return (
                    <tr key={r.staffId} className="hover:bg-teal-50/20 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{r.staffName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{r.staffId}</div>
                      </td>

                      {/* Role & Dept */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{r.role}</div>
                        <div className="text-[11px] text-slate-500">{r.department}</div>
                      </td>

                      {/* Base Salary */}
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {formatCurrency(r.baseSalary, schoolInfo.currency)}
                      </td>

                      {/* Allowances */}
                      <td className="py-3 px-3 text-emerald-700 font-medium">
                        +{formatCurrency(allowances, schoolInfo.currency)}
                      </td>

                      {/* Deductions */}
                      <td className="py-3 px-3 text-rose-600 font-medium">
                        -{formatCurrency(r.totalDeductions, schoolInfo.currency)}
                      </td>

                      {/* Net Salary */}
                      <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                        {formatCurrency(r.netSalary, schoolInfo.currency)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          disabled={!permissions?.canDisbursePayroll}
                          onClick={() => {
                            if (!permissions?.canDisbursePayroll) return;
                            if (!isCurrentMonth && isPaid) return;
                            const newStatus = isPaid ? 'Pending' : 'Paid';
                            updateStaffPayrollRecord(currentPayroll.id, r.staffId, newStatus, r.paymentMethod);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          } ${!permissions?.canDisbursePayroll ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{r.paymentStatus}</span>
                        </button>
                      </td>

                      {/* Action: Generate Payslip */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayslipRecord(r)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto border border-slate-200/80 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>View Payslip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {selectedPayslipRecord && (
        <PayslipModal
          staffRecord={selectedPayslipRecord}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setSelectedPayslipRecord(null)}
        />
      )}

    </div>
  );
};
