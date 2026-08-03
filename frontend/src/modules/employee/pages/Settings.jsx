import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Settings as SettingsIcon, Moon, Globe, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'English',
    emailNotifs: true,
    pushNotifs: true,
    profileVisibility: 'Internal Only'
  });

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-slate-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500">Manage your app preferences and account security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation/Tabs (Visual only for this layout) */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl px-4 py-3 font-semibold text-sm flex items-center justify-between">
            <span>General Preferences</span>
            <ChevronRight size={16} />
          </div>
          <div className="text-slate-600 hover:bg-slate-50 rounded-xl px-4 py-3 font-semibold text-sm flex items-center justify-between cursor-pointer transition-colors">
            <span>Security</span>
          </div>
          <div className="text-slate-600 hover:bg-slate-50 rounded-xl px-4 py-3 font-semibold text-sm flex items-center justify-between cursor-pointer transition-colors">
            <span>Billing & Legal</span>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Appearance & Locale */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Moon className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Appearance & Locale</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Dark Mode</h4>
                  <p className="text-xs text-slate-500 mt-1">Switch to a darker theme for better eye comfort.</p>
                </div>
                <ToggleSwitch checked={preferences.darkMode} onChange={() => handleToggle('darkMode')} />
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Language</h4>
                  <p className="text-xs text-slate-500 mt-1">Select your preferred interface language.</p>
                </div>
                <select 
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={preferences.language}
                  onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Notifications</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Email Notifications</h4>
                  <p className="text-xs text-slate-500 mt-1">Receive alerts for leave approvals and system updates via email.</p>
                </div>
                <ToggleSwitch checked={preferences.emailNotifs} onChange={() => handleToggle('emailNotifs')} />
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Push Notifications</h4>
                  <p className="text-xs text-slate-500 mt-1">Allow browser push notifications for real-time alerts.</p>
                </div>
                <ToggleSwitch checked={preferences.pushNotifs} onChange={() => handleToggle('pushNotifs')} />
              </div>
            </div>
          </div>

          {/* Privacy & Session */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Privacy & Session</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Profile Visibility</h4>
                  <p className="text-xs text-slate-500 mt-1">Who can view your contact details in the directory.</p>
                </div>
                <select 
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={preferences.profileVisibility}
                  onChange={(e) => setPreferences({...preferences, profileVisibility: e.target.value})}
                >
                  <option>Public</option>
                  <option>Internal Only</option>
                  <option>Private</option>
                </select>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 font-bold text-sm hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg"
                >
                  <LogOut size={16} />
                  <span>Logout from all devices</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
