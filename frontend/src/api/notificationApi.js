// MOCK API LAYER FOR NOTIFICATIONS

let mockNotifications = [
  { id: '1', title: 'Leave Approved', message: 'Your casual leave request for Jul 20-25 has been approved.', type: 'SUCCESS', isRead: false, createdAt: new Date().toISOString() },
  { id: '2', title: 'Attendance Marked', message: 'You successfully checked in at 09:02 AM today.', type: 'INFO', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'System Announcement', message: 'The office will be closed this Friday for maintenance.', type: 'WARNING', isRead: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export const fetchNotifications = async () => {
  return new Promise(resolve => setTimeout(() => resolve([...mockNotifications]), 400));
};

export const markAsRead = async (id) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const notif = mockNotifications.find(n => n.id === id);
      if (notif) notif.isRead = true;
      resolve({ success: true });
    }, 200);
  });
};

export const markAllAsRead = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      mockNotifications.forEach(n => (n.isRead = true));
      resolve({ success: true });
    }, 300);
  });
};
