import axiosInstance from './axios';

/**
 * Download CSV export from the backend API
 * @param {Object} filters - { startDate, endDate, department, status }
 */
export const downloadCSV = async (filters = {}) => {
  const response = await axiosInstance.get('/reports/export/csv', {
    params: filters,
    responseType: 'blob', // Important: tells axios to handle it as binary
  });

  const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `attendance_report_${date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download PDF export from the backend API
 * @param {Object} filters - { startDate, endDate, department, status }
 */
export const downloadPDF = async (filters = {}) => {
  const response = await axiosInstance.get('/reports/export/pdf', {
    responseType: 'blob',
  });

  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `attendance_report_${date}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Fetch weekly late arrival report data
 * @returns {Promise<Array>}
 */
export const fetchWeeklyReport = async () => {
  const response = await axiosInstance.get('/reports/weekly');
  return response.data.data || [];
};

/**
 * Fetch monthly attendance summary
 * @returns {Promise<Array>}
 */
export const fetchMonthlyReport = async () => {
  const response = await axiosInstance.get('/reports/monthly');
  return response.data.data || [];
};

/**
 * Fetch attendance analytics with optional filters
 * @param {Object} filters - { startDate, endDate, department }
 * @returns {Promise<Object>}
 */
export const fetchAnalytics = async (filters = {}) => {
  const response = await axiosInstance.get('/reports/analytics', { params: filters });
  return response.data.data || {};
};
