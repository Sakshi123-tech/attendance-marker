const employeeService = require('../services/employeeService');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Register a new user and trigger email onboarding
 * @route   POST /api/v1/employees/create
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const createEmployee = catchAsync(async (req, res, next) => {
  // req.user contains the authenticated creator from protect middleware
  const newEmployee = await employeeService.createEmployee(req.user, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newEmployee
    }
  });
});

/**
 * @desc    Update employee profile fields
 * @route   PUT /api/v1/employees/update/:id
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const updateEmployee = catchAsync(async (req, res, next) => {
  const updatedEmployee = await employeeService.updateEmployee(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedEmployee
    }
  });
});

/**
 * @desc    Deactivate an employee account (soft-delete)
 * @route   PUT /api/v1/employees/deactivate/:id
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const deactivateEmployee = catchAsync(async (req, res, next) => {
  // req.user contains the authenticated actor deactivating the account
  const deactivatedUser = await employeeService.deactivateEmployee(req.user._id, req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User account successfully deactivated.',
    data: {
      user: deactivatedUser
    }
  });
});

/**
 * @desc    List all active employee profiles
 * @route   GET /api/v1/employees/list
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const listEmployees = catchAsync(async (req, res, next) => {
  const employees = await employeeService.listEmployees();

  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: {
      employees
    }
  });
});

/**
 * @desc    Permanently delete an employee account
 * @route   DELETE /api/v1/employees/delete/:id
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const deleteEmployee = catchAsync(async (req, res, next) => {
  await employeeService.deleteEmployeePermanent(req.user._id, req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User account successfully deleted permanently.'
  });
});

module.exports = {
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  listEmployees,
  deleteEmployee
};
