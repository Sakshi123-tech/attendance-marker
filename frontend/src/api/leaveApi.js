// MOCK API LAYER FOR LEAVE MANAGEMENT
// Replace this with real axiosInstance calls once backend is implemented

const mockLeaves = [
  { id: '1', employeeId: 'emp1', employeeName: 'John Doe', type: 'SICK', startDate: '2026-07-15', endDate: '2026-07-16', status: 'PENDING', reason: 'Flu and fever' },
  { id: '2', employeeId: 'emp2', employeeName: 'Jane Smith', type: 'CASUAL', startDate: '2026-07-20', endDate: '2026-07-25', status: 'APPROVED', reason: 'Family vacation' },
  { id: '3', employeeId: 'emp3', employeeName: 'Alice Johnson', type: 'WFH', startDate: '2026-07-10', endDate: '2026-07-10', status: 'REJECTED', reason: 'Need to be in office for client meeting' },
];

const mockBalances = [
  { employeeId: 'emp1', employeeName: 'John Doe', CASUAL: 10, SICK: 5, PAID: 15, WFH: 20, MATERNITY: 0 },
  { employeeId: 'emp2', employeeName: 'Jane Smith', CASUAL: 8, SICK: 7, PAID: 10, WFH: 15, MATERNITY: 0 },
  { employeeId: 'emp3', employeeName: 'Alice Johnson', CASUAL: 12, SICK: 4, PAID: 20, WFH: 5, MATERNITY: 90 },
];

export const fetchLeaveRequests = async () => {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve([...mockLeaves]), 500));
};

export const updateLeaveStatus = async (id, status) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const leave = mockLeaves.find(l => l.id === id);
      if (leave) leave.status = status;
      resolve({ success: true });
    }, 500);
  });
};

export const fetchLeaveBalances = async () => {
  return new Promise(resolve => setTimeout(() => resolve([...mockBalances]), 500));
};

export const submitLeaveRequest = async (data) => {
  return new Promise(resolve => {
    setTimeout(() => {
      mockLeaves.push({
        id: Math.random().toString(),
        ...data,
        status: 'PENDING'
      });
      resolve({ success: true });
    }, 500);
  });
};
