import axiosInstance from './axios';

/**
 * Fetch all kiosks
 */
export const fetchKiosks = async () => {
  const response = await axiosInstance.get('/kiosks');
  return response.data.data.kiosks || [];
};

/**
 * Create a new kiosk
 */
export const createKiosk = async (kioskData) => {
  const response = await axiosInstance.post('/kiosks/create', kioskData);
  return response.data.data.kiosk;
};

/**
 * Update an existing kiosk
 */
export const updateKiosk = async (id, kioskData) => {
  const response = await axiosInstance.put(`/kiosks/${id}`, kioskData);
  return response.data.data.kiosk;
};

/**
 * Delete a kiosk
 */
export const deleteKiosk = async (id) => {
  const response = await axiosInstance.delete(`/kiosks/${id}`);
  return response.data;
};

/**
 * Verify if the current device is authorized as a kiosk
 */
export const verifyDevice = async () => {
  // In a real app, this would verify hardware heartbeat, here we mock response since heartbeat is periodic
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, kioskId: 'K-001', location: 'Main Reception' });
    }, 800);
  });
};

/**
 * Send face descriptor to backend to check-in an employee
 */
export const checkIn = async (descriptor) => {
  try {
    const response = await axiosInstance.post('/attendance/check-in', {
      liveEmbedding: descriptor
    });
    
    // Convert to expected UI format
    return {
      status: response.data.data.attendance.attendanceStatus === 'ON_TIME' ? 'SUCCESS' : 'LATE', // For UI mapping
      employee: response.data.data.employee,
      time: new Date(response.data.data.attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.message === 'Attendance already marked') {
      return { 
        status: 'ALREADY_MARKED', 
        error: 'Attendance already marked for today',
        employee: error.response.data.data?.employee 
      };
    }
    throw new Error(error.response?.data?.message || 'Check-in failed');
  }
};
