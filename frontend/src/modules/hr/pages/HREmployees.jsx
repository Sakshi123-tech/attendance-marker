import React from 'react';
import EmployeeManagement from '../../../components/EmployeeManagement';

const HREmployees = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EmployeeManagement 
        title="Employee Directory" 
        description="Register and manage staff personnel profiles."
        allowedRolesToManage={['EMPLOYEE']}
      />
    </div>
  );
};

export default HREmployees;
