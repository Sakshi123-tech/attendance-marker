// MOCK API LAYER FOR DOCUMENTS

const mockDocuments = [
  { id: '1', name: 'Offer Letter.pdf', type: 'OFFER_LETTER', size: '2.4 MB', uploadDate: '2025-01-15' },
  { id: '2', name: 'Appointment Letter.pdf', type: 'APPOINTMENT_LETTER', size: '1.8 MB', uploadDate: '2025-01-16' },
  { id: '3', name: 'Salary Slip - June 2026.pdf', type: 'PAYSLIP', size: '0.5 MB', uploadDate: '2026-06-30' },
  { id: '4', name: 'ISO Certification Course.pdf', type: 'CERTIFICATE', size: '5.1 MB', uploadDate: '2026-04-12' },
];

export const fetchDocuments = async () => {
  return new Promise(resolve => setTimeout(() => resolve([...mockDocuments]), 500));
};

export const downloadDocument = async (id) => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Downloading document with ID: ${id}`);
      resolve({ success: true, message: 'Download started' });
    }, 500);
  });
};
