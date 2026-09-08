import axiosInstance from './axios';

/**
 * Fetch the current authenticated user's own authentication activity.
 * Returns up to 20 most recent AUTH log entries (LOGIN, LOGOUT, PASSWORD_RESET, etc.)
 * Backend derives the user from the active session — no userId sent from frontend.
 *
 * @returns {Promise<Array>} Array of SystemLog objects
 */
export const fetchMyActivity = async () => {
  const response = await axiosInstance.get('/auth/my-activity');
  return response.data.data.logs;
};
