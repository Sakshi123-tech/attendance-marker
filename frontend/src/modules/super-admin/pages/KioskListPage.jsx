import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Fingerprint, MapPin, Monitor, Key, Copy, CheckCheck, ExternalLink } from 'lucide-react';
import { fetchKiosks, createKiosk, updateKiosk, deleteKiosk } from '../../../api/kioskApi';
import Button from '../../../components/common/Button';
import FormInput from '../../../components/common/FormInput';
import ConfirmPopup from '../../../components/ConfirmPopup';
import toast from 'react-hot-toast';

const KioskListPage = () => {
  const [kiosks, setKiosks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Credentials Modal
  const [credentialsModal, setCredentialsModal] = useState({ isOpen: false, kiosk: null });
  const [copiedField, setCopiedField] = useState(null);

  // Confirm Popup State
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    kioskId: null,
    kioskName: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ipAddress: '',
    isActive: true
  });

  useEffect(() => {
    loadKiosks();
  }, []);

  const loadKiosks = async () => {
    try {
      setLoading(true);
      const data = await fetchKiosks();
      setKiosks(data);
    } catch (err) {
      console.error('Failed to load kiosks:', err);
      toast.error('Failed to load kiosks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (kiosk = null) => {
    if (kiosk) {
      setIsEditMode(true);
      setSelectedKiosk(kiosk);
      setFormData({
        name: kiosk.name,
        location: kiosk.location,
        ipAddress: kiosk.ipAddress || '',
        isActive: kiosk.isActive
      });
    } else {
      setIsEditMode(false);
      setSelectedKiosk(null);
      setFormData({
        name: '',
        location: '',
        ipAddress: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedKiosk(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (isEditMode) {
        await updateKiosk(selectedKiosk._id, formData);
        toast.success('Kiosk updated successfully');
      } else {
        const newKiosk = await createKiosk(formData);
        toast.success('Kiosk registered! Check the credentials panel.', { duration: 4000 });
        handleCloseModal();
        // Show credentials modal immediately after creation
        setCredentialsModal({ isOpen: true, kiosk: newKiosk });
        await loadKiosks();
        return;
      }
      await loadKiosks();
      handleCloseModal();
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(err.response?.data?.message || 'Failed to save kiosk');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (kiosk) => {
    setConfirmPopup({
      isOpen: true,
      kioskId: kiosk._id,
      kioskName: kiosk.name
    });
  };

  const confirmDelete = async () => {
    const id = confirmPopup.kioskId;
    setConfirmPopup({ isOpen: false, kioskId: null, kioskName: '' });

    try {
      await deleteKiosk(id);
      toast.success('Kiosk deleted successfully');
      await loadKiosks();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.response?.data?.message || 'Failed to delete kiosk');
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const hasKiosks = kiosks.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Kiosk Monitoring</h2>
        <p className="text-sm text-slate-500 mt-1">Monitor physical attendance terminals and their authentication status.</p>
      </div>

      {/* ─── Loading state ─────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* ─── Premium Empty State ───────── */}
      {!loading && !hasKiosks && (
        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/50 p-12 text-center shadow-2xl shadow-indigo-100/50 my-8">
          {/* Background decorative animated blobs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative flex flex-col items-center z-10">
            {/* Animated Icon Wrapper */}
            <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-indigo-100 rounded-full animate-pulse opacity-40"></div>
              <div className="relative w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200/50 -rotate-3 transition-transform hover:rotate-3 duration-300">
                <Fingerprint size={32} strokeWidth={1.5} />
              </div>
            </div>
            
            {/* Text Content */}
            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-cyan-600 mb-3 tracking-tight">
              No Kiosks Registered
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
              Set up your first physical attendance terminal to seamlessly track employee check-ins and check-outs across your organization.
            </p>
            
            {/* Premium Button */}
            <button
              onClick={() => handleOpenModal()}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 overflow-hidden"
            >
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
              <span className="relative flex items-center gap-2">
                <Plus size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                Register First Kiosk
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Kiosk card(s), centered ────────────────────────── */}
      {!loading && hasKiosks && (
        <div className="flex flex-wrap justify-center gap-6">
          {kiosks.map((row) => (
            <div
              key={row._id}
              className="group relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400"></div>

              {/* Identity */}
              <div className="flex items-start gap-3 px-6 pt-5 pb-5">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Monitor size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-900 font-semibold truncate">{row.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <MapPin size={12} />
                    <span className="truncate">{row.location}</span>
                  </div>
                </div>
                {row.isActive ? (
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 text-xs font-medium px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-100 text-xs font-medium px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Inactive
                  </span>
                )}
              </div>

              {/* Perforated divider, badge-stub style */}
              <div className="relative px-0">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border border-slate-200"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border border-slate-200"></div>
                <div className="mx-6 border-t border-dashed border-slate-200"></div>
              </div>

              {/* Technical details */}
              <div className="px-6 py-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">Network</span>
                  <span className="text-slate-700 font-mono text-xs">{row.ipAddress || 'Dynamic / Unrestricted'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">Device Secret</span>
                  <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                    <Key size={12} />
                    <span>{row.deviceSecret ? '••••••••' + row.deviceSecret.slice(-4) : '••••••••'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 px-4 py-3 bg-slate-50/60 border-t border-slate-100">
                <button
                  onClick={() => setCredentialsModal({ isOpen: true, kiosk: row })}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="View Credentials for Kiosk Setup"
                >
                  <Key size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Credentials Modal ─────────────────────────────── */}
      {credentialsModal.isOpen && credentialsModal.kiosk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Key size={20} className="text-indigo-600" />
                Kiosk Setup Credentials
              </h3>
              <button onClick={() => setCredentialsModal({ isOpen: false, kiosk: null })} className="text-slate-400 hover:text-slate-600 p-1">×</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
                Copy these credentials and enter them at <strong>localhost:5173/kiosk-setup</strong> on your kiosk device.
              </div>

              {/* Kiosk ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kiosk Device ID</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <span className="flex-1 font-mono text-sm text-slate-700 break-all">{credentialsModal.kiosk._id}</span>
                  <button
                    onClick={() => copyToClipboard(credentialsModal.kiosk._id, 'id')}
                    className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {copiedField === 'id' ? <CheckCheck size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Hardware Secret */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hardware Secret Token</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <span className="flex-1 font-mono text-sm text-slate-700 break-all">{credentialsModal.kiosk.deviceSecret}</span>
                  <button
                    onClick={() => copyToClipboard(credentialsModal.kiosk.deviceSecret, 'secret')}
                    className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {copiedField === 'secret' ? <CheckCheck size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Setup Link */}
              <a
                href="/kiosk-setup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold transition-colors mt-2"
              >
                <ExternalLink size={15} />
                Open Kiosk Setup Page (in new tab)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── Register / Edit Modal ─────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {isEditMode && <Edit2 size={20} className="text-indigo-600" />}
                {isEditMode ? 'Edit Kiosk Terminal' : 'Register New Kiosk'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <FormInput
                label="Kiosk Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Main Entrance Terminal"
              />
              <FormInput
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="e.g. Building A Lobby"
              />
              <FormInput
                label="IP Address (Optional)"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleInputChange}
                placeholder="e.g. 192.168.1.50"
                helpText="Restrict check-ins from this terminal to a specific IP address."
              />

              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-800 block">Active Status</label>
                  <p className="text-xs text-slate-500">Allow this terminal to process attendance check-ins.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" loading={formLoading}>
                  {isEditMode ? 'Save Changes' : 'Register Kiosk'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        title="Delete Kiosk"
        message={`Are you sure you want to permanently delete ${confirmPopup.kioskName}? This will instantly revoke access for this terminal.`}
        confirmText="Delete Kiosk"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmPopup({ isOpen: false, kioskId: null, kioskName: '' })}
      />
    </div>
  );
};

export default KioskListPage;