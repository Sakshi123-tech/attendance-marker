import axiosInstance from './axios';

/**
 * Fetch all active employees
 * @returns {Promise<Array>} Array of employee objects
 */
export const fetchEmployees = async () => {
  const response = await axiosInstance.get('/employees/list');
  return response.data.data.employees;
};

/**
 * Create a new employee/user
 * @param {Object} employeeData - { fullName, email, role, department, employeeId }
 * @returns {Promise<Object>} Created user object
 */
export const createEmployee = async (employeeData) => {
  const response = await axiosInstance.post('/employees/create', employeeData);
  return response.data.data.user;
};

/**
 * Update an existing employee
 * @param {String} id - Employee ID (_id)
 * @param {Object} updateData - { fullName, department, employeeId }
 * @returns {Promise<Object>} Updated user object
 */
export const updateEmployee = async (id, updateData) => {
  const response = await axiosInstance.put(`/employees/update/${id}`, updateData);
  return response.data.data.user;
};

/**
 * Deactivate (soft delete) an employee
 * @param {String} id - Employee ID (_id)
 * @returns {Promise<Object>} Deactivated user object
 */
export const deactivateEmployee = async (id) => {
  const response = await axiosInstance.put(`/employees/deactivate/${id}`);
  return response.data.data.user;
};

/**
 * Permanently delete an employee
 * @param {String} id - Employee ID (_id)
 * @returns {Promise<Object>}
 */
export const deleteEmployeePermanent = async (id) => {
  const response = await axiosInstance.delete(`/employees/delete/${id}`);
  return response.data;
};
