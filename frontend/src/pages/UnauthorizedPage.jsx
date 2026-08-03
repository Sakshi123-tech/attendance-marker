import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * UnauthorizedPage
 * Display access warning when user role is not permitted on a route
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleReturn = () => {
    // Navigate user back to their dashboard based on role, or to login
    if (!role) {
      navigate('/login');
      return;
    }
    switch (role) {
      case 'SUPER_ADMIN':
        navigate('/super-admin');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'HR':
        navigate('/hr');
        break;
      case 'EMPLOYEE':
        navigate('/employee');
        break;
      case 'KIOSK':
        navigate('/kiosk');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Diagnostic messages */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Access Prohibited</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your current security profile does not hold permissions to view this endpoint or interface.
          </p>
        </div>

        {/* Details card */}
        <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl text-left text-xs space-y-1.5 font-medium text-slate-400">
          <p>Request Endpoint Status: <span className="text-red-400 font-bold font-mono">BLOCKED (403)</span></p>
          <p>My Role Profile: <span className="text-slate-200 font-bold font-mono uppercase">{role || 'UNAUTHENTICATED'}</span></p>
        </div>

        {/* Button link to return to portal */}
        <button
          onClick={handleReturn}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

      </div>
    </div>
  );
};

export default UnauthorizedPage;
