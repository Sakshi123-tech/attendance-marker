const mongoose = require('mongoose');

const superAdminFixture = {
  _id: new mongoose.Types.ObjectId().toString(),
  name: 'Test Super Admin',
  email: 'superadmin@test.local',
  password: 'HashedPassword123!',
  role: 'SUPER_ADMIN',
  isActive: true,
};

const adminFixture = {
  _id: new mongoose.Types.ObjectId().toString(),
  name: 'Test Admin',
  email: 'admin@test.local',
  password: 'HashedPassword123!',
  role: 'ADMIN',
  isActive: true,
};

const employeeFixture = {
  _id: new mongoose.Types.ObjectId().toString(),
  name: 'Test Employee',
  email: 'employee@test.local',
  password: 'HashedPassword123!',
  role: 'EMPLOYEE',
  isActive: true,
};

module.exports = { superAdminFixture, adminFixture, employeeFixture };
