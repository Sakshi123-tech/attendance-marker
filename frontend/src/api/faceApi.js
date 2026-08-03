import axiosInstance from './axios';

/**
 * Fetch the logged-in user's face registration status
 * @returns {Promise<Object>}
 */
export const fetchFaceStatus = async () => {
  const response = await axiosInstance.get('/face/status');
  return response.data.data;
};

/**
 * Register the logged-in user's face
 * @param {Object} faceData - Face descriptors or image data
 * @returns {Promise<Object>}
 */
export const registerFace = async (faceData) => {
  const response = await axiosInstance.post('/face/register', faceData);
  return response.data.data;
};

/**
 * Register a specific employee's face (Admin/HR)
 * @param {String} employeeId 
 * @param {Object} faceData 
 * @returns {Promise<Object>}
 */
export const registerEmployeeFace = async (employeeId, faceData) => {
  const response = await axiosInstance.post(`/face/register/${employeeId}`, faceData);
  return response.data.data;
};
