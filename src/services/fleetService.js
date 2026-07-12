import database from "./database";

export default {
  // Vehicles
  async getVehicles(supabase) {
    return await database.list(supabase, 'vehicles');
  },
  async createVehicle(supabase, vehicleData) {
    return await database.create(supabase, 'vehicles', vehicleData);
  },
  async updateVehicle(supabase, id, updates) {
    return await database.update(supabase, 'vehicles', id, updates);
  },
  async deleteVehicle(supabase, id) {
    await database.deleteRecord(supabase, 'vehicles', id);
    return true;
  },

  // Drivers
  async getDrivers(supabase) {
    return await database.list(supabase, 'drivers');
  },
  async createDriver(supabase, driverData) {
    return await database.create(supabase, 'drivers', driverData);
  },
  async updateDriver(supabase, id, updates) {
    return await database.update(supabase, 'drivers', id, updates);
  },
  async deleteDriver(supabase, id) {
    await database.deleteRecord(supabase, 'drivers', id);
    return true;
  },

  // Trips
  async getTrips(supabase) {
    return await database.list(supabase, 'trips');
  },
  async createTrip(supabase, tripData) {
    return await database.create(supabase, 'trips', tripData);
  },
  async updateTrip(supabase, id, updates) {
    return await database.update(supabase, 'trips', id, updates);
  },
  async deleteTrip(supabase, id) {
    await database.deleteRecord(supabase, 'trips', id);
    return true;
  },

  // Maintenance (Mapped to maintenance_logs table)
  async getMaintenance(supabase) {
    return await database.list(supabase, 'maintenance_logs');
  },
  async createMaintenance(supabase, maintenanceData) {
    return await database.create(supabase, 'maintenance_logs', maintenanceData);
  },
  async updateMaintenance(supabase, id, updates) {
    return await database.update(supabase, 'maintenance_logs', id, updates);
  },
  async deleteMaintenance(supabase, id) {
    await database.deleteRecord(supabase, 'maintenance_logs', id);
    return true;
  },

  // Expenses
  async getExpenses(supabase) {
    return await database.list(supabase, 'expenses');
  },
  async createExpense(supabase, expenseData) {
    return await database.create(supabase, 'expenses', expenseData);
  },
  async updateExpense(supabase, id, updates) {
    return await database.update(supabase, 'expenses', id, updates);
  },
  async deleteExpense(supabase, id) {
    await database.deleteRecord(supabase, 'expenses', id);
    return true;
  },

  // Fuel Logs
  async getFuelLogs(supabase) {
    return await database.list(supabase, 'fuel_logs');
  },
  async createFuelLog(supabase, fuelLogData) {
    return await database.create(supabase, 'fuel_logs', fuelLogData);
  },
  async deleteFuelLog(supabase, id) {
    await database.deleteRecord(supabase, 'fuel_logs', id);
    return true;
  }
};
