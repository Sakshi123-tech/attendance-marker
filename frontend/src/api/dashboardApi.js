import axiosInstance from './axios';

export const fetchDashboardStats = async () => {
  const response = await axiosInstance.get('/attendance/stats');
  return response.data.data;
};
