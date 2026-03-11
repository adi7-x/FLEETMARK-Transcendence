// ── Mock Data for Fleetmark Passenger Dashboard ──

// Passenger profile
export const passengerProfile = {
  id: 'U-002',
  name: 'Ahmed Benali',
  initials: 'AB',
  email: 'abenali@student.1337.ma',
  phone: '+212 6 12 34 56 78',
  organizationType: 'School' as const,
  organizationName: '1337 School — Ben Guerir',
  defaultRoute: 'Night Shuttle — Route 1',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ahmed&backgroundColor=b6e3f4&top=shortHair',
};

// Stats
export const passengerStats = {
  totalRides: { value: 47, label: 'Total Rides Taken' },
  upcomingReservations: { value: 3, label: 'Upcoming Reservations' },
  cancelledRides: { value: 2, label: 'Cancelled Rides' },
  favoriteRoute: { value: 'Route 1', label: 'Favorite Route' },
};

// Next ride
export const nextRide = {
  route: 'Night Shuttle — Route 1',
  departureTime: '10:00 PM',
  seat: '14A',
  bus: '1337 Night Shuttle — Bus 1',
  date: 'Tonight, Feb 20',
  stop: 'OCP Saka',
};

// Reservations
export interface Reservation {
  id: string;
  route: string;
  bus: string;
  seat: string;
  date: string;
  departureTime: string;
  stop: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  rating?: number;
}

export const passengerReservations: Reservation[] = [
  { id: 'R-001', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '14A', date: 'Feb 20, 2026', departureTime: '10:00 PM', stop: 'OCP Saka', status: 'Confirmed' },
  { id: 'R-002', route: 'Night Shuttle — Route 2', bus: 'Bus 2', seat: '8C', date: 'Feb 21, 2026', departureTime: '11:00 PM', stop: 'Coin Bleu', status: 'Pending' },
  { id: 'R-003', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '6D', date: 'Feb 22, 2026', departureTime: '10:00 PM', stop: 'Nakhil', status: 'Confirmed' },
  { id: 'R-004', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '3A', date: 'Feb 18, 2026', departureTime: '12:00 AM', stop: 'La Gare', status: 'Completed', rating: 5 },
  { id: 'R-005', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '10B', date: 'Feb 17, 2026', departureTime: '10:00 PM', stop: 'Kentra', status: 'Completed', rating: 4 },
  { id: 'R-006', route: 'Night Shuttle — Route 2', bus: 'Bus 2', seat: '22B', date: 'Feb 16, 2026', departureTime: '11:00 PM', stop: 'BMCE', status: 'Completed' },
  { id: 'R-007', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '11B', date: 'Feb 15, 2026', departureTime: '01:00 AM', stop: 'Posto Gosto', status: 'Cancelled' },
  { id: 'R-008', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '2A', date: 'Feb 14, 2026', departureTime: '10:00 PM', stop: 'Al Fadl', status: 'Completed', rating: 5 },
  { id: 'R-009', route: 'Night Shuttle — Route 2', bus: 'Bus 2', seat: '17C', date: 'Feb 13, 2026', departureTime: '10:00 PM', stop: 'Café Al Mouhajir', status: 'Cancelled' },
  { id: 'R-010', route: 'Night Shuttle — Route 1', bus: 'Bus 1', seat: '14A', date: 'Feb 12, 2026', departureTime: '10:00 PM', stop: 'OCP Saka', status: 'Completed', rating: 4 },
];

// Browsable routes for passenger
export interface AvailableRoute {
  id: string;
  name: string;
  stops: string[];
  departureTimes: string[];
  availableSeats: number;
  totalSeats: number;
  status: 'Active' | 'Inactive';
  assignedBus: string;
  organization: '1337 School';
}

export const availableRoutes: AvailableRoute[] = [
  {
    id: 'RT-001',
    name: 'Night Shuttle — Route 1',
    stops: [
      'OCP Saka', 'OCP 6', 'Nakhil', 'Chaaibat (Lhayat Pharmacy)',
      'Posto Gosto', 'Mesk Lil', 'Jnane Lkhir', 'Lhamriti (Ben Salem)',
      'Al Fadl', 'Kentra', 'Jnane Lkhir', 'Pharmacie Ibn Sina',
      'Al Qods', 'Sissane', 'La Gare', 'Dyour Chouhada',
      'Chtayba', 'Ibn Tofail', 'Green Oil Station',
    ],
    departureTimes: ['10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'],
    availableSeats: 32,
    totalSeats: 50,
    status: 'Active',
    assignedBus: '1337 Night Shuttle — Bus 1',
    organization: '1337 School',
  },
  {
    id: 'RT-002',
    name: 'Night Shuttle — Route 2',
    stops: [
      'Coin Bleu', 'BMCE', 'Café Al Mouhajir', 'Café Al Akhawayne',
      'Posto Gosto', 'Chaaibat', 'Café Grind',
    ],
    departureTimes: ['10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'],
    availableSeats: 38,
    totalSeats: 50,
    status: 'Active',
    assignedBus: '1337 Night Shuttle — Bus 2',
    organization: '1337 School',
  },
];

// Seat map for reservation flow
export type SeatStatus = 'available' | 'reserved' | 'selected';

export interface Seat {
  id: string;
  row: number;
  col: 'A' | 'B' | 'C' | 'D';
  status: SeatStatus;
}

export const generateSeatMap = (): Seat[] => {
  const seats: Seat[] = [];
  const cols: Seat['col'][] = ['A', 'B', 'C', 'D'];
  for (let row = 1; row <= 12; row++) {
    for (const col of cols) {
      seats.push({
        id: `${row}${col}`,
        row,
        col,
        status: Math.random() > 0.35 ? 'available' : 'reserved',
      });
    }
  }
  return seats;
};

// Passenger notifications
export interface PassengerNotification {
  id: string;
  type: 'reservation' | 'route_change' | 'delay' | 'cancellation' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const passengerNotifications: PassengerNotification[] = [
  { id: 'PN-001', type: 'reservation', title: '🚌 Reminder: Bus departs in 1 hour', message: 'Your bus departs at 10:00 PM tonight. Don\'t forget!', time: '5 min ago', read: false },
  { id: 'PN-002', type: 'reservation', title: '⏰ Bus departs in 30 minutes!', message: 'Your bus departs at 10:00 PM. Head to school now.', time: '35 min ago', read: false },
  { id: 'PN-003', type: 'system', title: '🟢 11:00 PM slot now open', message: 'The 11:00 PM departure is now open for reservation!', time: '1 hour ago', read: false },
  { id: 'PN-004', type: 'route_change', title: 'Break Reminder', message: 'Nightly break 2:00 AM — 3:00 AM. No service during this period.', time: '3 hours ago', read: true },
  { id: 'PN-005', type: 'system', title: '🌙 Night shuttle is now active', message: 'You can reserve up to 3 trips tonight. Service runs 10 PM — 6 AM.', time: '5 hours ago', read: true },
  { id: 'PN-006', type: 'cancellation', title: 'Reservation Cancelled', message: 'Your 1:00 AM reservation for Feb 20 has been cancelled per your request.', time: 'Yesterday', read: true },
  { id: 'PN-007', type: 'reservation', title: '🚫 Reservation limit reached', message: 'You\'ve used all 3 reservations for tonight. Resets tomorrow at 10 PM.', time: 'Yesterday', read: true },
  { id: 'PN-008', type: 'system', title: 'Welcome to Fleetmark!', message: 'Your 1337 account has been set up. Start reserving trips on the night shuttle.', time: '3 days ago', read: true },
  { id: 'PN-009', type: 'delay', title: 'Bus 1 Inspection', message: 'Bus 1 passed its scheduled inspection. Service unaffected.', time: '4 days ago', read: true },
  { id: 'PN-010', type: 'route_change', title: 'Stops Updated', message: 'Official shuttle stops are revised once per year at la rentrée.', time: '1 week ago', read: true },
];
