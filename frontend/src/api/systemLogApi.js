import axiosInstance from './axios';

/**
 * Fetch system logs with optional filters
 * @param {Object} params { type, search, page, limit }
 * @returns {Promise<Object>} Object containing { logs, pagination }
 */
export const fetchSystemLogs = async (params = {}) => {
  const response = await axiosInstance.get('/system-logs', { params });
  return {
    logs: response.data.data.logs,
    pagination: response.data.pagination
  };
};
