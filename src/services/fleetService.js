import database from "./database";

// ==========================================
// Rich Mock Data (Fallbacks)
// ==========================================

export const mockVehicles = [
  { id: 'VEH-001', name: 'Heavy Duty Semi-Truck', type: 'Truck', capacity: '15 Tons', region: 'North', fuel_efficiency: '6.2 km/l', status: 'Active', license_plate: 'TX-982-PL' },
  { id: 'VEH-002', name: 'Express Delivery Van', type: 'Van', capacity: '2 Tons', region: 'East', fuel_efficiency: '11.5 km/l', status: 'Active', license_plate: 'NY-441-TR' },
  { id: 'VEH-003', name: 'Urban Shuttle Bus', type: 'Bus', capacity: '5 Tons', region: 'South', fuel_efficiency: '8.0 km/l', status: 'Maintenance', license_plate: 'CA-102-SH' },
  { id: 'VEH-004', name: 'Compact Electric Mini', type: 'Mini', capacity: '500 kg', region: 'West', fuel_efficiency: '22.0 km/l', status: 'Active', license_plate: 'WA-707-EL' },
  { id: 'VEH-005', name: 'Refrigerated Cargo Truck', type: 'Truck', capacity: '8 Tons', region: 'North', fuel_efficiency: '7.1 km/l', status: 'In Shop', license_plate: 'IL-819-RF' },
  { id: 'VEH-006', name: 'High-Capacity Cargo Van', type: 'Van', capacity: '3.5 Tons', region: 'East', fuel_efficiency: '10.2 km/l', status: 'Off Duty', license_plate: 'FL-302-CV' },
  { id: 'VEH-007', name: 'Intercity Coach Bus', type: 'Bus', capacity: '12 Tons', region: 'South', fuel_efficiency: '5.8 km/l', status: 'Active', license_plate: 'NV-550-CO' },
  { id: 'VEH-008', name: 'Rapid Dispatch Mini', type: 'Mini', capacity: '750 kg', region: 'West', fuel_efficiency: '18.5 km/l', status: 'In Shop', license_plate: 'OR-119-RD' }
];

export const mockDrivers = [
  { id: 'DRV-001', name: 'Alex Johnson', license_number: 'DL-TEX-892', safety_score: 96, status: 'Active', phone: '+1-555-0192' },
  { id: 'DRV-002', name: 'Sarah Martinez', license_number: 'DL-NYY-402', safety_score: 98, status: 'Active', phone: '+1-555-0187' },
  { id: 'DRV-003', name: 'Marcus Vance', license_number: 'DL-CAL-110', safety_score: 82, status: 'Active', phone: '+1-555-0104' },
  { id: 'DRV-004', name: 'Elena Rostova', license_number: 'DL-WAS-701', safety_score: 95, status: 'Off Duty', phone: '+1-555-0177' },
  { id: 'DRV-005', name: 'David Kim', license_number: 'DL-ILL-881', safety_score: 89, status: 'On Leave', phone: '+1-555-0155' },
  { id: 'DRV-006', name: 'Jordan Brooks', license_number: 'DL-FLA-309', safety_score: 91, status: 'Active', phone: '+1-555-0123' }
];

export const mockTrips = [
  { id: 'TRIP-801', vehicle_id: 'VEH-001', driver_id: 'DRV-001', status: 'Active', start_time: new Date(Date.now() - 3 * 3600000).toISOString(), end_time: null, region: 'North', route_name: 'Dallas Main Depot -> Houston Hub' },
  { id: 'TRIP-802', vehicle_id: 'VEH-002', driver_id: 'DRV-002', status: 'Active', start_time: new Date(Date.now() - 1 * 3600000).toISOString(), end_time: null, region: 'East', route_name: 'Queens Warehouse -> Brooklyn Local' },
  { id: 'TRIP-803', vehicle_id: 'VEH-004', driver_id: 'DRV-003', status: 'On Time', start_time: new Date(Date.now() - 5 * 3600000).toISOString(), end_time: new Date(Date.now() - 600000).toISOString(), region: 'West', route_name: 'Seattle Metro -> Bellevue Dispatch' },
  { id: 'TRIP-804', vehicle_id: 'VEH-007', driver_id: 'DRV-006', status: 'Delayed', start_time: new Date(Date.now() - 4 * 3600000).toISOString(), end_time: null, region: 'South', route_name: 'Miami Terminal -> Orlando Station' },
  { id: 'TRIP-805', vehicle_id: 'VEH-006', driver_id: 'DRV-004', status: 'Completed', start_time: new Date(Date.now() - 24 * 3600000).toISOString(), end_time: new Date(Date.now() - 20 * 3600000).toISOString(), region: 'East', route_name: 'Newark Cargo -> Philadelphia Depot' }
];

export const mockMaintenance = [
  { id: 'MNT-001', vehicle_id: 'VEH-003', issue: 'Transmission Fluid Leak & Gear slippage', priority: 'High', status: 'In Progress', cost: 850.00, date: '2026-07-10' },
  { id: 'MNT-002', vehicle_id: 'VEH-005', issue: 'Brake Pad Replacement & Rotor resurfacing', priority: 'Medium', status: 'Pending', cost: 320.00, date: '2026-07-11' },
  { id: 'MNT-003', vehicle_id: 'VEH-008', issue: 'Engine Tune-Up & Oil Filter change', priority: 'Low', status: 'Completed', cost: 180.00, date: '2026-07-07' },
  { id: 'MNT-004', vehicle_id: 'VEH-001', issue: 'Windshield Wiper Motor replacement', priority: 'Low', status: 'Pending', cost: 75.00, date: '2026-07-12' }
];

export const mockExpenses = [
  { id: 'EXP-001', vehicle_id: 'VEH-001', type: 'Fuel', amount: 420.50, description: 'Full Diesel Tank refuel', date: '2026-07-11' },
  { id: 'EXP-002', vehicle_id: 'VEH-002', type: 'Fuel', amount: 85.00, description: 'Regular Unleaded gasoline refuel', date: '2026-07-11' },
  { id: 'EXP-003', vehicle_id: 'VEH-001', type: 'Tolls', amount: 45.00, description: 'I-45 Highway Toll Fees', date: '2026-07-10' },
  { id: 'EXP-004', vehicle_id: 'VEH-003', type: 'Maintenance', amount: 850.00, description: 'Transmission repair', date: '2026-07-10' },
  { id: 'EXP-005', vehicle_id: 'VEH-004', type: 'Other', amount: 25.00, description: 'Vehicle Wash & Detailing', date: '2026-07-09' }
];

// Helper to check if a table is empty or query fails
async function safeList(client, table, fallbackData) {
  try {
    const data = await database.list(client, table);
    if (data && data.length > 0) {
      return data;
    }
    return fallbackData;
  } catch (error) {
    console.warn(`Querying ${table} failed, falling back to mock data:`, error.message);
    return fallbackData;
  }
}

// Helper to write to database or fallback to mock (simulate local write)
async function safeCreate(client, table, data, fallbackList) {
  try {
    const result = await database.create(client, table, data);
    return result;
  } catch (error) {
    console.warn(`Creating record in ${table} failed, simulating locally:`, error.message);
    const newRecord = { ...data, id: data.id || `${table.toUpperCase().substring(0, 3)}-${Math.floor(Math.random() * 1000)}` };
    fallbackList.unshift(newRecord);
    return newRecord;
  }
}

// ==========================================
// Service API
// ==========================================

export default {
  async getVehicles(supabase) {
    return safeList(supabase, 'vehicles', mockVehicles);
  },

  async getDrivers(supabase) {
    return safeList(supabase, 'drivers', mockDrivers);
  },

  async getTrips(supabase) {
    return safeList(supabase, 'trips', mockTrips);
  },

  async getMaintenance(supabase) {
    return safeList(supabase, 'maintenance', mockMaintenance);
  },

  async getExpenses(supabase) {
    return safeList(supabase, 'expenses', mockExpenses);
  },

  async createVehicle(supabase, vehicleData) {
    return safeCreate(supabase, 'vehicles', vehicleData, mockVehicles);
  },

  async createDriver(supabase, driverData) {
    return safeCreate(supabase, 'drivers', driverData, mockDrivers);
  },

  async createTrip(supabase, tripData) {
    return safeCreate(supabase, 'trips', tripData, mockTrips);
  },

  async createMaintenance(supabase, maintenanceData) {
    return safeCreate(supabase, 'maintenance', maintenanceData, mockMaintenance);
  },

  async createExpense(supabase, expenseData) {
    return safeCreate(supabase, 'expenses', expenseData, mockExpenses);
  }
};
