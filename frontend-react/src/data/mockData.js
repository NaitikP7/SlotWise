// Mock data for development - will be replaced with real API calls

export const mockVenues = [
  { id: 1, name: 'Main Auditorium', capacity: 500, departmentId: 1 },
  { id: 2, name: 'Conf Room 101', capacity: 12, departmentId: 1 },
  { id: 3, name: 'Lecture Hall C', capacity: 120, departmentId: 2 },
  { id: 4, name: 'Lab 3B', capacity: 30, departmentId: 2 },
  { id: 5, name: 'Meeting Room 4', capacity: 8, departmentId: 3 },
  { id: 6, name: 'North Atrium', capacity: null, departmentId: null },
];

export const mockEvents = [
  {
    id: 1, name: 'Q3 Quarterly Review', type: 'Internal Meeting',
    date: '2023-10-24', startTime: '14:00', endTime: '15:30',
    venue: 'Conference Room B', venueId: 2, status: 'Confirmed', host: 'Finance Dept'
  },
  {
    id: 2, name: 'Freshman Orientation', type: 'Public Event',
    date: '2023-10-25', startTime: '09:00', endTime: '12:00',
    venue: 'Main Auditorium', venueId: 1, status: 'Pending', host: 'Dean\'s Office'
  },
  {
    id: 3, name: 'Faculty Board Meeting', type: 'Internal Meeting',
    date: '2023-10-26', startTime: '10:00', endTime: '11:30',
    venue: 'Room 304', venueId: 5, status: 'Confirmed', host: 'Faculty'
  },
  {
    id: 4, name: 'Design Workshop', type: 'Workshop',
    date: '2023-10-27', startTime: '13:00', endTime: '16:00',
    venue: 'Creative Lab', venueId: 4, status: 'Confirmed', host: 'Design Dept'
  },
  {
    id: 5, name: 'Guest Lecture Series', type: 'Lecture',
    date: '2023-10-28', startTime: '11:00', endTime: '12:30',
    venue: 'Hall A', venueId: 1, status: 'Cancelled', host: 'Physics Dept'
  },
  {
    id: 6, name: 'Campus Safety Drill', type: 'Mandatory',
    date: '2023-10-29', startTime: '08:00', endTime: '08:30',
    venue: 'Campus Wide', venueId: null, status: 'Confirmed', host: 'Admin'
  },
];

export const mockGridEvents = [
  { id: 101, name: 'Town Hall Meeting', venueId: 1, startTime: '09:00', endTime: '11:30', host: "Dean's Office", locked: true },
  { id: 102, name: 'Admissions Sync', venueId: 2, startTime: '13:00', endTime: '14:00', host: 'Admin' },
  { id: 103, name: 'Physics 101', venueId: 4, startTime: '08:30', endTime: '10:30', host: 'Prof. Hawkins' },
  { id: 104, name: 'Interview', venueId: 5, startTime: '09:00', endTime: '10:00', host: 'HR' },
  { id: 105, name: 'Campus Career Fair', venueId: 6, startTime: '12:00', endTime: '17:00', host: 'Career Center', public: true },
];

export const mockVenueMaintenance = [3]; // venueId 3 is on maintenance
export const mockVenueReserved = [{ venueId: 5, startTime: '11:00', endTime: '12:00', label: 'Cleaning' }];

export const mockUsers = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh.kumar@inst.edu', department: 'Information Technology', role: 'Admin', active: true },
  { id: 2, name: 'Priya Sharma', email: 'priya.sharma@inst.edu', department: 'Administration', role: 'Staff', active: true },
  { id: 3, name: 'Arjun Patel', email: 'arjun.patel@inst.edu', department: 'Physics', role: 'Faculty', active: true },
  { id: 4, name: 'Aisha Khan', email: 'aisha.khan@inst.edu', department: 'Mathematics', role: 'Staff', active: false },
];

export const mockDepartments = [
  { id: 1, name: 'Information Technology', instituteId: 1 },
  { id: 2, name: 'Physics', instituteId: 1 },
  { id: 3, name: 'Mathematics', instituteId: 1 },
  { id: 4, name: 'Administration', instituteId: 1 },
];

export const mockInstitutes = [
  { id: 1, name: 'National Institute of Technology' },
];
