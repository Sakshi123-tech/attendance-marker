import React from 'react';
import EmployeeManagement from '../../../components/EmployeeManagement';

const AdminEmployees = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EmployeeManagement 
        title="Employee & HR Management" 
        description="Manage company employees and assign Human Resource personnel."
        allowedRolesToManage={['EMPLOYEE', 'HR']}
      />
    </div>
  );
};

export default AdminEmployees;
