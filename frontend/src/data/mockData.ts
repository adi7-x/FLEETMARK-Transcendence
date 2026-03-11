// ── Mock Data for Fleetmark Admin Dashboard ──

// Stats
export const dashboardStats = {
  totalBuses: { value: 2, change: 0, label: 'Total Buses' },
  activeRoutes: { value: 2, change: 0, label: 'Active Routes' },
  totalUsers: { value: 1_284, change: +5.3, label: 'Total Users' },
  todayReservations: { value: 387, change: -2.1, label: "Today's Reservations" },
};

// Daily reservations (last 30 days)
export const dailyReservations = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 29 + i);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reservations: Math.floor(200 + Math.random() * 250),
  };
});

// Bus capacity donut
export const capacityData = [
  { name: 'Available', value: 38, fill: '#22C55E' },
  { name: 'Reserved', value: 52, fill: '#3B82F6' },
  { name: 'Overcapacity', value: 10, fill: '#EF4444' },
];

// Recent activity
export interface Activity {
  id: string;
  user: string;
  route: string;
  bus: string;
  seat: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  time: string;
}

export const recentActivities: Activity[] = [
  { id: 'A001', user: 'Ahmed Benali', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '14A', status: 'Confirmed', time: '2 min ago' },
  { id: 'A002', user: 'Sara Oufkir', route: 'Night Shuttle — Route 2', bus: 'Bus 2', seat: '8C', status: 'Pending', time: '5 min ago' },
  { id: 'A003', user: 'Youssef El Amrani', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '22B', status: 'Confirmed', time: '8 min ago' },
  { id: 'A004', user: 'Fatima Zahra', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '6D', status: 'Cancelled', time: '12 min ago' },
  { id: 'A005', user: 'Omar Tazi', route: 'Night Shuttle — Route 2', bus: 'Bus 2', seat: '3A', status: 'Confirmed', time: '18 min ago' },
  { id: 'A006', user: 'Leila Mansouri', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '11B', status: 'Pending', time: '25 min ago' },
  { id: 'A007', user: 'Karim Idrissi', route: 'Night Shuttle — Route 2', bus: 'Bus 2', seat: '17C', status: 'Confirmed', time: '30 min ago' },
  { id: 'A008', user: 'Nadia Chraibi', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '9A', status: 'Cancelled', time: '45 min ago' },
];

// Buses
export interface Bus {
  id: string;
  name: string;
  plateNumber: string;
  capacity: number;
  assignedRoute: string;
  driver: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
}

export const buses: Bus[] = [
  { id: 'BUS-001', name: '1337 Night Shuttle — Bus 1', plateNumber: 'X-0001-NS', capacity: 50, assignedRoute: 'Night Shuttle — Route 1', driver: 'Karim El Amrani', status: 'Active' },
  { id: 'BUS-002', name: '1337 Night Shuttle — Bus 2', plateNumber: 'X-0002-NS', capacity: 50, assignedRoute: 'Night Shuttle — Route 2', driver: 'Hassan Moukhtari', status: 'Active' },
];

// Routes
export interface Stop {
  name: string;
  arrivalTime: string;
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  assignedBus: string;
  startTime: string;
  endTime: string;
  status: 'Active' | 'Inactive';
}

export const routes: Route[] = [
  {
    id: 'RT-001', name: 'Night Shuttle — Route 1',
    stops: [
      { name: 'OCP Saka', arrivalTime: '22:00' },
      { name: 'OCP 6', arrivalTime: '22:04' },
      { name: 'Nakhil', arrivalTime: '22:08' },
      { name: 'Chaaibat (Lhayat Pharmacy)', arrivalTime: '22:12' },
      { name: 'Posto Gosto', arrivalTime: '22:16' },
      { name: 'Mesk Lil', arrivalTime: '22:20' },
      { name: 'Jnane Lkhir', arrivalTime: '22:24' },
      { name: 'Lhamriti (Ben Salem)', arrivalTime: '22:28' },
      { name: 'Al Fadl', arrivalTime: '22:32' },
      { name: 'Kentra', arrivalTime: '22:36' },
      { name: 'Jnane Lkhir', arrivalTime: '22:40' },
      { name: 'Pharmacie Ibn Sina', arrivalTime: '22:44' },
      { name: 'Al Qods', arrivalTime: '22:48' },
      { name: 'Sissane', arrivalTime: '22:52' },
      { name: 'La Gare', arrivalTime: '22:56' },
      { name: 'Dyour Chouhada', arrivalTime: '23:00' },
      { name: 'Chtayba', arrivalTime: '23:04' },
      { name: 'Ibn Tofail', arrivalTime: '23:08' },
      { name: 'Green Oil Station', arrivalTime: '23:12' },
    ],
    assignedBus: '1337 Night Shuttle — Bus 1', startTime: '22:00', endTime: '06:00', status: 'Active',
  },
  {
    id: 'RT-002', name: 'Night Shuttle — Route 2',
    stops: [
      { name: 'Coin Bleu', arrivalTime: '22:00' },
      { name: 'BMCE', arrivalTime: '22:06' },
      { name: 'Café Al Mouhajir', arrivalTime: '22:12' },
      { name: 'Café Al Akhawayne', arrivalTime: '22:18' },
      { name: 'Posto Gosto', arrivalTime: '22:24' },
      { name: 'Chaaibat', arrivalTime: '22:30' },
      { name: 'Café Grind', arrivalTime: '22:36' },
    ],
    assignedBus: '1337 Night Shuttle — Bus 2', startTime: '22:00', endTime: '06:00', status: 'Active',
  },
];

// Users
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Student' | 'Driver';
  organization: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
}

export const users: User[] = [
  { id: 'U-001', name: 'Adil Bourji', email: 'adil@fleetmark.com', role: 'Admin', organization: 'Fleetmark HQ', status: 'Active', joinedDate: 'Jan 5, 2025' },
  { id: 'U-002', name: 'Ahmed Benali', email: 'abenali@student.1337.ma', role: 'Student', organization: '1337 School', status: 'Active', joinedDate: 'Feb 12, 2025' },
  { id: 'U-003', name: 'Hassan Moukhtari', email: 'hassan.m@fleetmark.com', role: 'Driver', organization: 'Fleetmark HQ', status: 'Active', joinedDate: 'Jan 20, 2025' },
  { id: 'U-004', name: 'Sara Oufkir', email: 'soufkir@student.1337.ma', role: 'Student', organization: '1337 School', status: 'Active', joinedDate: 'Mar 3, 2025' },
  { id: 'U-005', name: 'Khalid Bennani', email: 'khalid.b@fleetmark.com', role: 'Driver', organization: 'Fleetmark HQ', status: 'Active', joinedDate: 'Jan 15, 2025' },
  { id: 'U-006', name: 'Fatima Zahra', email: 'fzahra@student.1337.ma', role: 'Student', organization: '1337 School', status: 'Inactive', joinedDate: 'Apr 1, 2025' },
  { id: 'U-007', name: 'Youssef El Amrani', email: 'yelamrani@student.1337.ma', role: 'Student', organization: '1337 School', status: 'Active', joinedDate: 'Feb 28, 2025' },
  { id: 'U-008', name: 'Leila Mansouri', email: 'lmansouri@student.1337.ma', role: 'Student', organization: '1337 School', status: 'Active', joinedDate: 'Mar 15, 2025' },
  { id: 'U-009', name: 'Rachid Alami', email: 'rachid.a@fleetmark.com', role: 'Driver', organization: 'Fleetmark HQ', status: 'Active', joinedDate: 'Jan 10, 2025' },
  { id: 'U-010', name: 'Mohamed Lahrech', email: 'mohamed@fleetmark.com', role: 'Admin', organization: 'Fleetmark HQ', status: 'Active', joinedDate: 'Jan 5, 2025' },
];

// Schedule
export interface ScheduleSlot {
  id: string;
  route: string;
  bus: string;
  time: string;
  color: string;
}

export interface DaySchedule {
  day: string;
  date: string;
  slots: ScheduleSlot[];
}

// Active days: Sunday → Thursday (1337 school schedule)
const nightSlots = [
  { id: 'S1', route: 'Route 1', bus: 'Bus 1', time: '10:00 PM - 6:00 AM', color: 'bg-primary-500' },
  { id: 'S2', route: 'Route 2', bus: 'Bus 2', time: '10:00 PM - 6:00 AM', color: 'bg-accent-500' },
];
const emptySlots: ScheduleSlot[] = [];

export const weeklySchedule: DaySchedule[] = [
  { day: 'Sunday', date: 'Feb 15', slots: nightSlots },
  { day: 'Monday', date: 'Feb 16', slots: nightSlots },
  { day: 'Tuesday', date: 'Feb 17', slots: nightSlots },
  { day: 'Wednesday', date: 'Feb 18', slots: nightSlots },
  { day: 'Thursday', date: 'Feb 19', slots: nightSlots },
  { day: 'Friday', date: 'Feb 20', slots: emptySlots },
  { day: 'Saturday', date: 'Feb 21', slots: emptySlots },
];

// Reports
export const ridesPerRoute = [
  { route: 'Route 1', rides: 2_340 },
  { route: 'Route 2', rides: 1_712 },
];

export const weeklyRidership = [
  { week: 'Week 1', riders: 1850 },
  { week: 'Week 2', riders: 2100 },
  { week: 'Week 3', riders: 1920 },
  { week: 'Week 4', riders: 2350 },
  { week: 'Week 5', riders: 2180 },
  { week: 'Week 6', riders: 2500 },
];

export const reportStats = {
  totalRides: 4_052,
  averageOccupancy: 78,
  mostUsedRoute: 'Night Shuttle — Route 1',
  peakHours: '10:00 PM - 12:00 AM',
};

// Notifications
export interface Notification {
  id: string;
  icon: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  message: string;
  time: string;
  status: 'Read' | 'Unread';
  type: 'received' | 'sent';
}

export const notifications: Notification[] = [
  { id: 'N-001', icon: 'success', title: 'Route 1 Updated', message: 'Night Shuttle Route 1 schedule has been confirmed for this week.', time: '5 min ago', status: 'Unread', type: 'received' },
  { id: 'N-002', icon: 'warning', title: 'Bus 1 Maintenance', message: 'Bus 1 is scheduled for inspection on Feb 25.', time: '1 hour ago', status: 'Unread', type: 'received' },
  { id: 'N-003', icon: 'info', title: 'New Student Registered', message: 'Leila Mansouri registered as a Student.', time: '2 hours ago', status: 'Read', type: 'received' },
  { id: 'N-004', icon: 'alert', title: 'Overcapacity Alert', message: 'Route 1 bus approaching full capacity for tonight.', time: '3 hours ago', status: 'Unread', type: 'received' },
  { id: 'N-005', icon: 'info', title: 'Schedule Published', message: 'You published the night shuttle schedule for this week.', time: '5 hours ago', status: 'Read', type: 'sent' },
  { id: 'N-006', icon: 'success', title: 'Report Generated', message: 'Monthly ridership report has been generated.', time: 'Yesterday', status: 'Read', type: 'received' },
  { id: 'N-007', icon: 'warning', title: 'Break Reminder', message: 'Nightly break 2:00 AM — 3:00 AM applies to both routes.', time: 'Yesterday', status: 'Read', type: 'received' },
  { id: 'N-008', icon: 'info', title: 'System Update', message: 'Fleetmark v2.1 deployed with new features.', time: '2 days ago', status: 'Read', type: 'sent' },
];
