import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const RecognitionResult = ({ status, employee, time, errorMsg, snapshot }) => {
  const isSuccess = status === 'SUCCESS' || status === 'ON_TIME' || status === 'LATE';
  const isDuplicate = status === 'ALREADY_MARKED';
  const isError = status === 'ERROR' || !isSuccess && !isDuplicate;

  let Icon = isSuccess ? CheckCircle : (isDuplicate ? AlertCircle : XCircle);
  let colorTheme = isSuccess ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    (isDuplicate ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-red-600 bg-red-50 border-red-200');

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`p-10 rounded-[3rem] border shadow-2xl flex flex-col items-center justify-center max-w-xl w-full mx-4 text-center animate-in zoom-in-95 duration-500 ${colorTheme}`}>

        <Icon className="w-24 h-24 mb-6" />

        {/* Snapshot / Avatar (Rendered for all states if we have it) */}
        {(employee || snapshot) && (
          <div className="mb-6 relative">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto bg-slate-200 ${isError ? 'opacity-70' : ''}`}>
              {snapshot ? (
                <img src={snapshot} alt={employee?.fullName || 'User'} className="w-full h-full object-cover" />
              ) : employee ? (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                  {employee.fullName?.charAt(0)}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <XCircle size={40} />
                </div>
              )}
            </div>
            <div className={`absolute -bottom-2 -right-2 text-white p-2 rounded-full border-4 border-white ${isSuccess ? 'bg-emerald-500' : isDuplicate ? 'bg-amber-500' : 'bg-red-500'}`}>
              <Icon size={20} />
            </div>
          </div>
        )}

        {isSuccess && employee && !isDuplicate && (
          <>
            <h1 className="text-4xl font-black mb-2 text-slate-800">{employee.fullName}</h1>
            <p className="text-lg font-medium text-slate-600 mb-1">{employee.department} • {employee.employeeId}</p>
            <div className="flex items-center gap-2 text-slate-500 mb-6 font-mono">
              <span>{time}</span>
            </div>

            <div className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-emerald-600/30">
              Attendance Logged: {status === 'LATE' ? 'LATE' : 'ON TIME'}
            </div>
          </>
        )}

        {isDuplicate && employee && (
          <>
            <h1 className="text-4xl font-black mb-2 text-slate-800">{employee.fullName}</h1>
            <p className="text-lg font-medium text-amber-700 mb-6">{employee.department}</p>
            <div className="px-8 py-4 bg-amber-100/80 border border-amber-300 rounded-2xl flex flex-col items-center">
              <h2 className="text-xl font-black text-amber-900 uppercase tracking-widest mb-1">Already Checked In</h2>
              <p className="text-sm font-semibold text-amber-800 mb-4 text-center max-w-[250px]">
                You have already marked your attendance today! Have a great day ahead! ✨
              </p>
              <div className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold tracking-widest uppercase shadow-md shadow-amber-500/20 text-sm">
                No Action Required
              </div>
            </div>
          </>
        )}

        {isError && (
          <>
            <h1 className="text-4xl font-black mb-4 text-red-900 mt-2">Verification Failed</h1>
            <p className="text-lg text-red-800/80 mb-8 max-w-sm font-medium">{errorMsg || 'Face not recognized. Please try again or contact HR.'}</p>
            <div className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-red-600/30">
              Access Denied
            </div>
          </>
        )}

        <p className="mt-8 text-sm opacity-60 font-medium">Screen will reset automatically...</p>
      </div>
    </div>
  );
};

export default RecognitionResult;
