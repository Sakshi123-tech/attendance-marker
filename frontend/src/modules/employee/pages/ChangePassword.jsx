import React, { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import FormInput from '../../../components/common/FormInput';
import Button from '../../../components/common/Button';
import axiosInstance from '../../../api/axios';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', {
        currentPassword: formData.currentPassword,
        password: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Change Password</h2>
        <p className="text-sm text-slate-500 mb-8">
          Ensure your account is using a long, random password to stay secure.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700">
            <CheckCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">Password updated successfully. You can now use it on your next login.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput 
            label="Current Password" 
            name="currentPassword" 
            type="password"
            value={formData.currentPassword} 
            onChange={handleChange} 
            required 
          />
          <div className="pt-4 border-t border-slate-100"></div>
          <FormInput 
            label="New Password" 
            name="newPassword" 
            type="password"
            value={formData.newPassword} 
            onChange={handleChange} 
            required 
          />
          <FormInput 
            label="Confirm New Password" 
            name="confirmPassword" 
            type="password"
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
          />

          <div className="pt-4">
            <Button 
              type="submit" 
              isLoading={loading} 
              variant="primary" 
              className="w-full sm:w-auto"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
