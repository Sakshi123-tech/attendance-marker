import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User, Phone, MapPin, Mail, Briefcase, Calendar, Shield, Save, Camera } from 'lucide-react';
import FormInput from '../../../components/common/FormInput';

const MyProfile = () => {
  const { user, role } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || 'Not provided',
    address: user?.address || 'Not provided',
    emergencyContact: user?.emergencyContact || 'Not provided'
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call to update profile
    await new Promise(res => setTimeout(res, 1000));
    setSaving(false);
    setEditMode(false);
    // Normally we would update the user context here if phone/address were stored there
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your personal information and contact details.</p>
        </div>
        <button 
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {editMode ? <Save size={16} /> : <User size={16} />}
          <span>{saving ? 'Saving...' : editMode ? 'Save Profile' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center p-8">
          <div className="relative w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg mb-6 flex items-center justify-center">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <User className="w-16 h-16 text-slate-400" />
            )}
            {editMode && (
              <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-indigo-700 transition-colors">
                <Camera size={14} />
              </button>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
          <p className="text-sm font-semibold text-indigo-600 mt-1">{user?.designation || 'Staff Member'}</p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest">
            {role.replace('_', ' ')}
          </div>

          <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="font-mono">ID: {user?.employeeId || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{user?.department || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Col - Editable Info */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Contact & Emergency Details</h3>
          
          <div className="space-y-6 max-w-lg">
            {editMode ? (
              <>
                <FormInput 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  icon={Phone} 
                />
                <FormInput 
                  label="Residential Address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  icon={MapPin} 
                />
                <FormInput 
                  label="Emergency Contact (Name & Number)" 
                  name="emergencyContact" 
                  value={formData.emergencyContact} 
                  onChange={handleChange} 
                  icon={Phone} 
                />
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    {formData.phone}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Residential Address</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    {formData.address}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Emergency Contact</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    {formData.emergencyContact}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyProfile;
