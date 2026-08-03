import React from 'react';
import EmployeeManagement from '../../../components/EmployeeManagement';

const EmployeeListPage = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EmployeeManagement 
        title="Employee Management"
        description="Create, update, and manage employee profiles and their access within the system."
        allowedRolesToManage={['HR', 'EMPLOYEE']}
      />
    </div>
  );
};

export default EmployeeListPage;
