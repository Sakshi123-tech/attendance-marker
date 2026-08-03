import axiosInstance from './axios';

/**
 * Fetch today's attendance records
 * @returns {Promise<Array>}
 */
export const fetchTodayAttendance = async () => {
  const response = await axiosInstance.get('/attendance/today');
  return response.data.data.records || [];
};

/**
 * Fetch all attendance records with optional filters
 * @param {Object} params - Query params e.g. { status, department, date }
 * @returns {Promise<Array>}
 */
export const fetchAllAttendance = async (params = {}) => {
  const response = await axiosInstance.get('/attendance/all', { params });
  return response.data.data.records || [];
};

/**
 * Fetch dashboard stats
 * @returns {Promise<Object>}
 */
export const fetchAttendanceStats = async () => {
  const response = await axiosInstance.get('/attendance/stats');
  return response.data.data;
};

/**
 * Fetch a specific employee's attendance history
 * @param {String} employeeId - Target user _id
 * @returns {Promise<Array>}
 */
export const fetchEmployeeAttendance = async (employeeId) => {
  const response = await axiosInstance.get(`/attendance/employee/${employeeId}`);
  // Assuming the backend returns { status: 'success', data: { records: [...] } }
  return response.data.data.records || [];
};

/**
 * Fetch the logged-in employee's own attendance history
 * @returns {Promise<Array>}
 */
export const fetchMyHistory = async () => {
  const response = await axiosInstance.get('/attendance/my-history');
  return response.data.data.records || [];
};
