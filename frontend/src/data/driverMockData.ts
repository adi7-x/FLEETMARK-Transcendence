// ── Mock Data for Fleetmark Driver Dashboard ──

// Driver profile
export const driverProfile = {
  id: 'D-001',
  name: 'Karim El Amrani',
  initials: 'KA',
  email: 'karim.a@fleetmark.io',
  phone: '+212 6 55 44 33 22',
  licenseNumber: 'DL-2024-MAR-08821',
  yearsOfExperience: 8,
  assignedBus: '1337 Night Shuttle — Bus 1',
  assignedRoute: 'Night Shuttle — Route 1',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Karim&backgroundColor=c0aede&top=shortHair',
};

// Driver stats
export const driverStats = {
  assignedRoute: { value: 'Route 1', subtext: '19 stops', label: 'Assigned Route' },
  passengersToday: { value: 34, label: 'Students Tonight' },
  nextDeparture: { value: '10:00 PM', subtext: 'Tonight', label: 'Next Departure' },
  busInfo: { value: 'Bus 1', subtext: 'X-0001-NS · 50 seats', label: 'Bus Info' },
};

// Current shift
export const currentShift = {
  status: 'on-duty' as 'on-duty' | 'off-duty',
  startTime: '10:00 PM',
  endTime: '06:00 AM',
  routeName: 'Night Shuttle — Route 1',
};

// Trips for today
export interface Trip {
  id: string;
  departureTime: string;
  route: string;
  stops: number;
  passengers: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

export const todaysTrips: Trip[] = [
  { id: 'T-001', departureTime: '10:00 PM', route: 'Night Shuttle Route 1', stops: 19, passengers: 42, status: 'Completed' },
  { id: 'T-002', departureTime: '11:00 PM', route: 'Night Shuttle Route 1', stops: 19, passengers: 38, status: 'Completed' },
  { id: 'T-003', departureTime: '12:00 AM', route: 'Night Shuttle Route 1', stops: 19, passengers: 35, status: 'In Progress' },
  { id: 'T-004', departureTime: '01:00 AM', route: 'Night Shuttle Route 1', stops: 19, passengers: 28, status: 'Upcoming' },
  { id: 'T-005', departureTime: '03:00 AM', route: 'Night Shuttle Route 1', stops: 19, passengers: 15, status: 'Upcoming' },
  { id: 'T-006', departureTime: '04:00 AM', route: 'Night Shuttle Route 1', stops: 19, passengers: 10, status: 'Upcoming' },
  { id: 'T-007', departureTime: '05:00 AM', route: 'Night Shuttle Route 1', stops: 19, passengers: 8, status: 'Upcoming' },
];

// Route details
export interface RouteStop {
  id: string;
  name: string;
  estimatedArrival: string;
  passengerCount: number;
  status: 'completed' | 'current' | 'upcoming';
}

export const driverRouteInfo = {
  name: 'Night Shuttle — Route 1',
  status: 'Active' as const,
  totalDistance: '24 km',
  totalStops: 19,
  estimatedDuration: '75 min',
  assignedBus: '1337 Night Shuttle — Bus 1',
};

export const routeStops: RouteStop[] = [
  { id: 'S-01', name: 'OCP Saka', estimatedArrival: '10:00 PM', passengerCount: 8, status: 'completed' },
  { id: 'S-02', name: 'OCP 6', estimatedArrival: '10:04 PM', passengerCount: 5, status: 'completed' },
  { id: 'S-03', name: 'Nakhil', estimatedArrival: '10:08 PM', passengerCount: 6, status: 'completed' },
  { id: 'S-04', name: 'Chaaibat (Lhayat Pharmacy)', estimatedArrival: '10:12 PM', passengerCount: 3, status: 'completed' },
  { id: 'S-05', name: 'Posto Gosto', estimatedArrival: '10:16 PM', passengerCount: 4, status: 'completed' },
  { id: 'S-06', name: 'Mesk Lil', estimatedArrival: '10:20 PM', passengerCount: 7, status: 'current' },
  { id: 'S-07', name: 'Jnane Lkhir', estimatedArrival: '10:24 PM', passengerCount: 3, status: 'upcoming' },
  { id: 'S-08', name: 'Lhamriti (Ben Salem)', estimatedArrival: '10:28 PM', passengerCount: 5, status: 'upcoming' },
  { id: 'S-09', name: 'Al Fadl', estimatedArrival: '10:32 PM', passengerCount: 4, status: 'upcoming' },
  { id: 'S-10', name: 'Kentra', estimatedArrival: '10:36 PM', passengerCount: 2, status: 'upcoming' },
  { id: 'S-11', name: 'Jnane Lkhir', estimatedArrival: '10:40 PM', passengerCount: 3, status: 'upcoming' },
  { id: 'S-12', name: 'Pharmacie Ibn Sina', estimatedArrival: '10:44 PM', passengerCount: 2, status: 'upcoming' },
  { id: 'S-13', name: 'Al Qods', estimatedArrival: '10:48 PM', passengerCount: 1, status: 'upcoming' },
  { id: 'S-14', name: 'Sissane', estimatedArrival: '10:52 PM', passengerCount: 2, status: 'upcoming' },
  { id: 'S-15', name: 'La Gare', estimatedArrival: '10:56 PM', passengerCount: 4, status: 'upcoming' },
  { id: 'S-16', name: 'Dyour Chouhada', estimatedArrival: '11:00 PM', passengerCount: 1, status: 'upcoming' },
  { id: 'S-17', name: 'Chtayba', estimatedArrival: '11:04 PM', passengerCount: 1, status: 'upcoming' },
  { id: 'S-18', name: 'Ibn Tofail', estimatedArrival: '11:08 PM', passengerCount: 2, status: 'upcoming' },
  { id: 'S-19', name: 'Green Oil Station', estimatedArrival: '11:12 PM', passengerCount: 0, status: 'upcoming' },
];

// Passengers for the driver's route
export interface RoutePassenger {
  id: string;
  name: string;
  initials: string;
  seat: string;
  stop: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  avatar?: string;
}

export const routePassengers: RoutePassenger[] = [
  { id: 'P-01', name: 'Ahmed Benali', initials: 'AB', seat: '1A', stop: 'OCP Saka', status: 'Confirmed', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ahmed&backgroundColor=b6e3f4' },
  { id: 'P-02', name: 'Sara Idrissi', initials: 'SI', seat: '1B', stop: 'OCP Saka', status: 'Confirmed', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sara&backgroundColor=ffd5dc' },
  { id: 'P-03', name: 'Youssef Tazi', initials: 'YT', seat: '2A', stop: 'OCP 6', status: 'Confirmed' },
  { id: 'P-04', name: 'Fatima Zahra', initials: 'FZ', seat: '2B', stop: 'Nakhil', status: 'Pending' },
  { id: 'P-05', name: 'Omar Meknassi', initials: 'OM', seat: '3A', stop: 'Chaaibat (Lhayat Pharmacy)', status: 'Confirmed', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Omar&backgroundColor=c0aede' },
  { id: 'P-06', name: 'Laila Bennani', initials: 'LB', seat: '3B', stop: 'Posto Gosto', status: 'Cancelled' },
  { id: 'P-07', name: 'Hassan Ouazzani', initials: 'HO', seat: '4A', stop: 'Mesk Lil', status: 'Confirmed' },
  { id: 'P-08', name: 'Nadia Chraibi', initials: 'NC', seat: '4B', stop: 'Jnane Lkhir', status: 'Confirmed', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nadia&backgroundColor=ffd5dc' },
  { id: 'P-09', name: 'Rachid Fassi', initials: 'RF', seat: '5A', stop: 'Al Fadl', status: 'Pending' },
  { id: 'P-10', name: 'Amina Kadiri', initials: 'AK', seat: '5B', stop: 'Kentra', status: 'Confirmed' },
  { id: 'P-11', name: 'Mouad Sebti', initials: 'MS', seat: '6A', stop: 'Pharmacie Ibn Sina', status: 'Confirmed', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mouad&backgroundColor=b6e3f4' },
  { id: 'P-12', name: 'Zineb Alaoui', initials: 'ZA', seat: '6B', stop: 'Al Qods', status: 'Confirmed' },
  { id: 'P-13', name: 'Hamza Bouazza', initials: 'HB', seat: '7A', stop: 'Sissane', status: 'Pending' },
  { id: 'P-14', name: 'Kenza Rhali', initials: 'KR', seat: '7B', stop: 'La Gare', status: 'Confirmed', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Kenza&backgroundColor=ffd5dc' },
  { id: 'P-15', name: 'Adil Bourji', initials: 'AB', seat: '8A', stop: 'Dyour Chouhada', status: 'Confirmed' },
  { id: 'P-16', name: 'Salma Naciri', initials: 'SN', seat: '8B', stop: 'Chtayba', status: 'Cancelled' },
  { id: 'P-17', name: 'Badr Mansouri', initials: 'BM', seat: '9A', stop: 'Ibn Tofail', status: 'Confirmed' },
  { id: 'P-18', name: 'Houda Talbi', initials: 'HT', seat: '9B', stop: 'Green Oil Station', status: 'Confirmed', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Houda&backgroundColor=c0aede' },
];

// Driver notifications
export interface DriverNotification {
  id: string;
  type: 'new_passenger' | 'cancellation' | 'route_change' | 'schedule_update' | 'maintenance';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const driverNotifications: DriverNotification[] = [
  { id: 'DN-01', type: 'new_passenger', title: 'New Reservation', message: 'Ahmed Benali reserved seat 1A for the 10:00 PM trip.', time: '5 min ago', read: false },
  { id: 'DN-02', type: 'cancellation', title: 'Passenger Cancelled', message: 'Laila Bennani cancelled her reservation for seat 3B.', time: '18 min ago', read: false },
  { id: 'DN-03', type: 'route_change', title: 'Break Reminder', message: 'Nightly break 2:00 AM — 3:00 AM. Park bus safely.', time: '1 hr ago', read: false },
  { id: 'DN-04', type: 'schedule_update', title: 'Schedule Confirmed', message: 'Night shuttle schedule Sun–Thu confirmed for this week.', time: '2 hrs ago', read: true },
  { id: 'DN-05', type: 'maintenance', title: 'Maintenance Alert', message: 'Bus 1 is due for oil change on Feb 25. Contact fleet manager.', time: '3 hrs ago', read: true },
  { id: 'DN-06', type: 'new_passenger', title: 'New Reservation', message: 'Fatima Zahra reserved seat 2B for the 11:00 PM trip.', time: '5 hrs ago', read: true },
  { id: 'DN-07', type: 'schedule_update', title: 'Stops Reminder', message: 'No pick-up or drop-off outside official stops.', time: 'Yesterday', read: true },
  { id: 'DN-08', type: 'maintenance', title: 'Tire Inspection', message: 'Bus 1 passed tire inspection. Report available in admin portal.', time: 'Yesterday', read: true },
];
