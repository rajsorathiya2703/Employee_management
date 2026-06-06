import { useState, useEffect, useRef } from 'react';
import { FileText, BarChart2, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SalarySlipCard from '../../component/common/SalarySlipCard';
import DetailDialog from '../../component/common/DetailDialog';
import { getSalarySlips } from '../../service/salary-slip.service';
import type { SalarySlipRaw, SalaryComponent } from '../../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (val: string | number) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtShort = (val: string | number) =>
  `₹${Number(val).toLocaleString('en-IN')}`;

const monthLabel = (salaryMonth: string) => {
  const [year, month] = salaryMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};

const monthYearLabel = (salaryMonth: string) => {
  const [year, month] = salaryMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return `${date.toLocaleString('en-US', { month: 'long' }).toUpperCase()}-${year}`;
};

function numberToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero';

  function helper(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + helper(n % 100);
    if (n < 100000) return helper(Math.floor(n / 1000)) + 'Thousand ' + helper(n % 1000);
    if (n < 10000000) return helper(Math.floor(n / 100000)) + 'Lakh ' + helper(n % 100000);
    return helper(Math.floor(n / 10000000)) + 'Crore ' + helper(n % 10000000);
  }

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = helper(rupees).trim() + ' Only';
  if (paise > 0) words += ` and ${helper(paise).trim()} Paise`;
  return words;
}

// ── Printable Salary Slip ─────────────────────────────────────────────────────

interface PrintableSlipProps {
  slip: SalarySlipRaw;
  employeeName: string;
  employeeId: number;
}

function PrintableSlip({ slip, employeeName, employeeId }: PrintableSlipProps) {
  const netPayNum = Number(slip.netPay);

  return (
    <div className="bg-white p-8 max-w-[800px] mx-auto font-sans text-sm text-slate-800" id="printable-slip">
      {/* Company Header */}
      <div className="flex items-start gap-4 pb-4 border-b-2 border-slate-300 mb-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">MineHR Solutions Private Limited</h1>
          <p className="text-xs text-slate-500 mt-1">509, Ananta Elysium, Hill Town Circle, Ankur Chokadi, New India Colony, Ankur Tenement, Nikol,</p>
          <p className="text-xs text-slate-500">Ahmedabad – 380049</p>
          <p className="text-xs text-slate-500">Email: info@minehrsolutions.com | Web: www.minehrsolutions.com</p>
        </div>
      </div>

      {/* Slip Title */}
      <div className="border border-slate-300 text-center py-2 font-bold text-base mb-6">
        SALARY SLIP FOR MONTH OF {monthYearLabel(slip.salaryMonth)}
      </div>

      {/* Employee Info Grid */}
      <div className="grid grid-cols-2 gap-x-8 mb-6">
        <div className="flex flex-col gap-2">
          {[
            ['Employee ID:', String(employeeId)],
            ['Employee Name:', employeeName],
            ['Department:', slip.department || '—'],
            ['Designation:', slip.designation || '—'],
            ['Month Working Days:', String(slip.monthWorkingDays)],
            ['Present Days:', String(slip.presentDays)],
            ['Paid Leaves:', Number(slip.paidLeaves).toFixed(2)],
            ['Unpaid Leaves:', Number(slip.unpaidLeaves).toFixed(2)],
            ['Joining Gross Salary:', fmt(slip.joiningGrossSalary)],
          ].map(([label, value]) => (
            <div key={label} className="flex border-b border-dotted border-slate-200 pb-1">
              <span className="w-48 font-semibold text-slate-600 text-xs">{label}</span>
              <span className="text-xs text-slate-800">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {[
            ['Bank Name:', slip.bankName || '—'],
            ['Account No:', slip.accountNo || '—'],
            ['Pan No:', slip.panNo || '—'],
            ['Salary Mode:', slip.salaryMode || 'Bank Transfer'],
          ].map(([label, value]) => (
            <div key={label} className="flex border-b border-dotted border-slate-200 pb-1">
              <span className="w-32 font-semibold text-slate-600 text-xs">{label}</span>
              <span className="text-xs text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings & Deductions Table */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Earnings */}
        <table className="w-full border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-center py-2 px-3 font-bold border-b border-slate-300" colSpan={2}>EARNINGS</th>
            </tr>
            <tr className="bg-slate-50">
              <th className="text-left py-1.5 px-3 font-semibold border-b border-slate-200">Component</th>
              <th className="text-right py-1.5 px-3 font-semibold border-b border-slate-200">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(slip.earnings as SalaryComponent[]).map((e, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5 px-3">{e.heading}</td>
                <td className="py-1.5 px-3 text-right">₹{Number(e.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold border-t border-slate-300">
              <td className="py-2 px-3">Gross Salary (A)</td>
              <td className="py-2 px-3 text-right">{fmt(slip.grossSalary)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Deductions */}
        <table className="w-full border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-center py-2 px-3 font-bold border-b border-slate-300" colSpan={2}>DEDUCTIONS</th>
            </tr>
            <tr className="bg-slate-50">
              <th className="text-left py-1.5 px-3 font-semibold border-b border-slate-200">Component</th>
              <th className="text-right py-1.5 px-3 font-semibold border-b border-slate-200">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(slip.deductions as SalaryComponent[]).map((d, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5 px-3">{d.heading}</td>
                <td className="py-1.5 px-3 text-right">₹{Number(d.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold border-t border-slate-300">
              <td className="py-2 px-3">Total Deductions (B)</td>
              <td className="py-2 px-3 text-right">{fmt(slip.totalDeductions)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Net Pay */}
      <div className="border border-slate-300 p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">NET PAY (A - B):</span>
          <span className="font-bold text-xl text-emerald-600">{fmt(slip.netPay)}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 italic">
          Amount in Words: {numberToWords(netPayNum)}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 mt-6">
        <p>Generated &amp; Checked By: MineHR Admin | Published By: MineHR Admin</p>
        <p>This is a computer generated salary slip, thus no signature is required.</p>
      </div>
    </div>
  );
}

// ── Summary Dialog ────────────────────────────────────────────────────────────

function SummaryDialog({ slips, year, onClose }: { slips: SalarySlipRaw[]; year: number; onClose: () => void }) {
  return (
    <DetailDialog open onClose={onClose} title={`Salary Slip Summary (${year})`} icon={<BarChart2 size={20} />} size="lg">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Month</th>
              <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Salary</th>
              <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Deductions</th>
              <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slips.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-2 font-medium text-slate-700">{monthLabel(s.salaryMonth)}</td>
                <td className="py-3 px-2 text-right text-slate-600">{fmtShort(s.grossSalary)}</td>
                <td className="py-3 px-2 text-right text-slate-600">{fmtShort(s.totalDeductions)}</td>
                <td className="py-3 px-2 text-right font-bold text-emerald-600">{fmtShort(s.netPay)}</td>
              </tr>
            ))}
            {slips.length === 0 && (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">No data for {year}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DetailDialog>
  );
}

// ── CTC Dialog ────────────────────────────────────────────────────────────────

function CTCDialog({ slips, year, onClose }: { slips: SalarySlipRaw[]; year: number; onClose: () => void }) {
  const allEarnings: Record<string, number> = {};
  const allDeductions: Record<string, number> = {};

  slips.forEach((s) => {
    (s.earnings as SalaryComponent[]).forEach((e) => {
      allEarnings[e.heading] = (allEarnings[e.heading] ?? 0) + e.amount;
    });
    (s.deductions as SalaryComponent[]).forEach((d) => {
      allDeductions[d.heading] = (allDeductions[d.heading] ?? 0) + d.amount;
    });
  });

  const latest = slips[0];
  const grossPerMonth = latest ? Number(latest.grossSalary) : 0;
  const deductionsPerMonth = latest ? Number(latest.totalDeductions) : 0;
  const netPerMonth = latest ? Number(latest.netPay) : 0;
  const annualCTC = grossPerMonth * 12;

  return (
    <DetailDialog open onClose={onClose} title={`Salary Break-Up (${year})`} icon={<Layers size={20} />} size="xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Earnings */}
        <div>
          <h3 className="text-sm font-bold text-indigo-600 mb-3">Earnings</h3>
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600 border-b border-slate-200">Salary Heading</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600 border-b border-slate-200">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(allEarnings).map(([heading, amount]) => (
                <tr key={heading}>
                  <td className="py-2 px-3 text-slate-700">{heading}</td>
                  <td className="py-2 px-3 text-right text-slate-700">
                    {Number(amount / (slips.length || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td className="py-2 px-3 text-slate-800">Gross Salary / Per Month</td>
                <td className="py-2 px-3 text-right text-slate-800">{grossPerMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-800">Salary (CTC) / Per Month</td>
                <td className="py-2 px-3 text-right text-slate-800">{grossPerMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-sm font-bold text-rose-500 mb-3">Deductions</h3>
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600 border-b border-slate-200">Salary Heading</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600 border-b border-slate-200">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(allDeductions).map(([heading, amount]) => (
                <tr key={heading}>
                  <td className="py-2 px-3 text-slate-700">{heading}</td>
                  <td className="py-2 px-3 text-right text-slate-700">
                    {Number(amount / (slips.length || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td className="py-2 px-3 text-slate-800">Total</td>
                <td className="py-2 px-3 text-right text-slate-800">{deductionsPerMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer summary */}
      <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 font-medium">Net Salary Monthly In Hand</p>
          <p className="text-lg font-bold text-indigo-600">{fmt(netPerMonth)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Total Salary (CTC)/ Per Year</p>
          <p className="text-lg font-bold text-indigo-600">₹{annualCTC.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    </DetailDialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SalarySlipPage() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;
  const EMPLOYEE_NAME = user?.name ?? '';

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [slips, setSlips] = useState<SalarySlipRaw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSummary, setShowSummary] = useState(false);
  const [showCTC, setShowCTC] = useState(false);
  const [printSlip, setPrintSlip] = useState<SalarySlipRaw | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // ref kept for potential future use with a print library
  const printRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchSlips = async (year: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSalarySlips(EMPLOYEE_ID, year);
      setSlips(res.data.data ?? []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load salary slips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlips(selectedYear); }, [selectedYear, EMPLOYEE_ID]);

  // ── Download / Print ─────────────────────────────────────────────────────

  const handleDownload = (slip: SalarySlipRaw) => {
    setPrintSlip(slip);
    setShowPrintDialog(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {showSummary && (
        <SummaryDialog slips={slips} year={selectedYear} onClose={() => setShowSummary(false)} />
      )}

      {showCTC && (
        <CTCDialog slips={slips} year={selectedYear} onClose={() => setShowCTC(false)} />
      )}

      {showPrintDialog && printSlip && (
        <DetailDialog
          open
          onClose={() => { setShowPrintDialog(false); setPrintSlip(null); }}
          title={`Salary Slip — ${monthYearLabel(printSlip.salaryMonth)}`}
          size="full"
          footer={
            <div className="flex gap-3">
              <button
                onClick={() => { setShowPrintDialog(false); setPrintSlip(null); }}
                className="px-5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Print / Download PDF
              </button>
            </div>
          }
        >
          <div ref={printRef}>
            <PrintableSlip slip={printSlip} employeeName={EMPLOYEE_NAME} employeeId={EMPLOYEE_ID} />
          </div>
        </DetailDialog>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-slip, #printable-slip * { visibility: visible !important; }
          #printable-slip { position: fixed; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="flex flex-col gap-6 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={26} className="text-indigo-600" strokeWidth={2.5} />
              <h1 className="text-2xl font-bold text-slate-800">Salary Slip</h1>
            </div>
            <p className="text-slate-500 mt-1 text-sm">Track, review, and download your monthly salary statements</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { if (slips.length) setShowSummary(true); }}
              disabled={slips.length === 0}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              VIEW SUMMARY
            </button>
            <button
              onClick={() => { if (slips.length) setShowCTC(true); }}
              disabled={slips.length === 0}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              VIEW CTC
            </button>
          </div>
        </div>

        {/* Year Filter */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-3 shrink-0">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-medium"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => fetchSlips(selectedYear)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            GET DATA
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm shrink-0">
            {error}
          </div>
        )}

        {/* Slip Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : slips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={40} strokeWidth={1.5} className="mb-3" />
            <p className="text-base font-medium">No salary slips found for {selectedYear}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {slips.map((slip) => (
              <SalarySlipCard
                key={slip.id}
                slip={slip}
                onView={handleDownload}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
