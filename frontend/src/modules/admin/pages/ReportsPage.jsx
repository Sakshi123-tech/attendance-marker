import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, CalendarDays, Download, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, Info
} from 'lucide-react';
import { downloadCSV, downloadPDF, fetchWeeklyReport, fetchMonthlyReport } from '../../../api/reportApi';
import EmptyState from '../../../components/common/EmptyState';
import toast from 'react-hot-toast';

const MONTHS = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR];

/* ── Tab Button ── */
const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      active
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
    }`}
  >
    <Icon size={15} />
    {label}
  </button>
);

/* ── Month Year Picker ── */
const MonthYearPicker = ({ selectedMonth, selectedYear, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedYear);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label = selectedMonth
    ? `${MONTHS.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
    : 'Select Month & Year';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
          selectedMonth
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
        }`}
      >
        <CalendarDays size={15} />
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 w-72 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setPickerYear(y => y - 1)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-slate-900 text-sm">{pickerYear}</span>
            <button
              onClick={() => setPickerYear(y => y + 1)}
              disabled={pickerYear >= new Date().getFullYear()}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS.map(m => {
              const isSelected = m.value === selectedMonth && pickerYear === selectedYear;
              const isFuture = pickerYear === new Date().getFullYear() && m.value > new Date().getMonth() + 1;
              return (
                <button
                  key={m.value}
                  disabled={isFuture}
                  onClick={() => {
                    onSelect(m.value, pickerYear);
                    setOpen(false);
                  }}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isFuture
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {m.label.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Download button in table row ── */
const DownloadBtn = ({ onCsv, onPdf, loading }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 transition-colors"
      >
        <Download size={13} />
        Download
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 w-36 py-1 text-sm">
          <button
            onClick={() => { onCsv(); setOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={() => { onPdf(); setOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
          >
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Skeleton ── */
const SkeletonRow = ({ cols }) => (
  <tr>
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-100 animate-pulse rounded w-24" />
      </td>
    ))}
  </tr>
);

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'monthly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  /* Load weekly by default */
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'weekly') {
        const data = await fetchWeeklyReport();
        setWeeklyData(data);
      } else {
        if (!selectedMonth) {
          toast.error('Please select a month first.');
          return;
        }
        const data = await fetchMonthlyReport({ month: selectedMonth, year: selectedYear });
        setMonthlyData(data);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (activeTab === 'monthly' && !selectedMonth) {
      toast('Please select a month first.', { icon: '⚠️' });
      return;
    }
    loadData();
  };

  const handleExportAll = async (format) => {
    try {
      setExporting(true);
      if (format === 'csv') {
        const filters = activeTab === 'monthly' ? { month: selectedMonth, year: selectedYear } : {};
        await downloadCSV(filters);
        toast.success('CSV downloaded!');
      } else {
        await downloadPDF();
        toast.success('PDF downloaded!');
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleRowDownload = async (row, format) => {
    try {
      if (format === 'csv') {
        await downloadCSV({ employeeId: row.employeeId || row.employee?._id });
        toast.success('CSV downloaded!');
      } else {
        await downloadPDF({ employeeId: row.employeeId || row.employee?._id });
        toast.success('PDF downloaded!');
      }
    } catch {
      toast.error('Export failed.');
    }
  };

  /* ── Weekly table ── */
  const WeeklyTable = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-[420px] flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse h-full">
          {(loading || weeklyData.length > 0) && (
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Late Count</th>
                <th className="px-6 py-3">Last Late Date</th>
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={4} />)
            ) : weeklyData.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className="flex items-center justify-center min-h-[360px]">
                    <EmptyState title="No Late Arrivals" message="No late arrivals this week. Great job!" />
                  </div>
                </td>
              </tr>
            ) : (
              weeklyData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">
                        {(row.employeeName || row.employee?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-slate-900 font-medium text-sm">{row.employeeName || row.employee?.fullName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{row.department || row.employee?.department || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                      {row.lateCount || row.count || 1}×
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {row.lastLateDate ? new Date(row.lastLateDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ── Monthly table ── */
  const MonthlyTable = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-[420px] flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse h-full">
          {(loading || (selectedMonth && monthlyData.length > 0)) && (
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Days Present</th>
                <th className="px-6 py-3">Days Late</th>
                <th className="px-6 py-3">Days Absent</th>
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={5} />)
            ) : !selectedMonth ? (
              <tr>
                <td colSpan={5}>
                  <div className="flex items-center justify-center min-h-[360px]">
                    <div className="flex flex-col items-center gap-3">
                      <Info size={36} className="text-blue-300" />
                      <p className="text-sm font-semibold text-slate-600">Please select a month to view data.</p>
                      <p className="text-xs text-slate-400">Use the filter above to choose a month.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : monthlyData.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="flex items-center justify-center min-h-[360px]">
                    <EmptyState title="No Data" message="No attendance data found for this month." />
                  </div>
                </td>
              </tr>
            ) : (
              monthlyData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {(row.employeeName || row.employee?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-slate-900 font-medium text-sm">{row.employeeName || row.employee?.fullName || '\u2014'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{row.department || row.employee?.department || '\u2014'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                      {row.presentDays ?? row.daysPresent ?? '\u2014'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                      {row.lateDays ?? row.daysLate ?? '\u2014'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">
                      {row.absentDays ?? row.daysAbsent ?? '\u2014'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Filter and export attendance data by period.</p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">

          {/* Tab toggle */}
          <TabBtn active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')} icon={TrendingUp} label="Weekly Late Arrivals" />
          <TabBtn active={activeTab === 'monthly'} onClick={() => setActiveTab('monthly')} icon={Calendar} label="Monthly Summary" />

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Monthly selectors — only show when monthly tab active */}
          {activeTab === 'monthly' ? (
            <MonthYearPicker
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onSelect={(month, year) => { setSelectedMonth(month); setSelectedYear(year); }}
            />
          ) : (
            /* Weekly hint */
            <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
              <AlertCircle size={13} />
              Showing last 7 days. Switch to Monthly for month-wise data.
            </div>
          )}

          <button
            onClick={handleApply}
            className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Apply
          </button>
        </div>

        {/* Warning if monthly but no month selected */}
        {activeTab === 'monthly' && !selectedMonth && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle size={13} />
            Please select a month before applying the filter.
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {activeTab === 'weekly' ? <WeeklyTable /> : <MonthlyTable />}

    </div>
  );
};

export default ReportsPage;
