import React, { useState, useEffect } from "react";
import { 
  Truck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert,
  Activity,
  Users
} from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function DashboardView({ role }) {
  const supabase = useSupabase();
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");

  useEffect(() => {
    if (!supabase) return;
    async function loadData() {
      try {
        const [v, t, m, d] = await Promise.all([
          fleetService.getVehicles(supabase),
          fleetService.getTrips(supabase),
          fleetService.getMaintenance(supabase),
          fleetService.getDrivers(supabase)
        ]);
        
        setVehicles(v || []);
        setTrips(t || []);
        setMaintenance(m || []);
        setDrivers(d || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);


  // Filter Logic
  const filteredVehicles = vehicles.filter(v => {
    const matchType = selectedType === "All" || v.type === selectedType;
    const matchStatus = selectedStatus === "All" || v.status === selectedStatus;
    const matchRegion = selectedRegion === "All" || v.region === selectedRegion;
    return matchType && matchStatus && matchRegion;
  });

  const filteredTrips = trips.filter(t => {
    const vehicle = vehicles.find(v => v.id === t.vehicle_id);
    if (!vehicle) return selectedType === "All" && selectedStatus === "All" && selectedRegion === "All";
    
    const matchType = selectedType === "All" || vehicle.type === selectedType;
    const matchStatus = selectedStatus === "All" || vehicle.status === selectedStatus;
    const matchRegion = selectedRegion === "All" || t.region === selectedRegion;
    return matchType && matchStatus && matchRegion;
  });

  // Calculate Metrics based on DB Check Constraints
  const totalVehiclesCount = filteredVehicles.length;
  
  // DB status check values: 'Available', 'On Trip', 'In Shop', 'Retired'
  const availableCount = filteredVehicles.filter(v => v.status === "Available").length;
  const onTripCount = filteredVehicles.filter(v => v.status === "On Trip").length;
  const inShopCount = filteredVehicles.filter(v => v.status === "In Shop").length;
  const retiredCount = filteredVehicles.filter(v => v.status === "Retired").length;

  // Trips matching DB check constraints: 'Draft', 'Dispatched', 'Completed', 'Cancelled'
  const activeTripsCount = filteredTrips.filter(t => t.status === "Dispatched").length;
  const draftTripsCount = filteredTrips.filter(t => t.status === "Draft").length;

  // Drivers matching DB check constraints: 'Available', 'On Trip', 'Off Duty', 'Suspended'
  const driversOnDuty = drivers.filter(d => d.status === "Available" || d.status === "On Trip").length;
  
  // Count active maintenance items for filtered vehicles
  const filteredVehicleIds = filteredVehicles.map(v => v.id);
  const activeMaintAlerts = maintenance.filter(m => 
    filteredVehicleIds.includes(m.vehicle_id) && m.status === "Active"
  ).length;

  // Real Utilization Rate = (Vehicles On Trip) / (Total Active Fleet [excluding Retired])
  const activeFleetSize = totalVehiclesCount - retiredCount;
  const utilizationRate = activeFleetSize > 0 
    ? Math.round((onTripCount / activeFleetSize) * 100) 
    : 0;

  // Status distributions in percentage for bar rendering
  const getPercentage = (count) => {
    if (totalVehiclesCount === 0) return 0;
    return Math.round((count / totalVehiclesCount) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
        <Activity className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider">Syncing Fleet Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-sm text-zinc-400">Real-time status of your fleet and active dispatches from the database.</p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-xl bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
        <div className="flex flex-col gap-1.5 min-w-[150px] flex-1">
          <label className="text-xs font-medium text-zinc-400">Vehicle Type</label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Truck">Trucks</option>
            <option value="Van">Vans</option>
            <option value="Mini">Minis</option>
            <option value="Bus">Buses</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[150px] flex-1">
          <label className="text-xs font-medium text-zinc-400">Vehicle Status</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[150px] flex-1">
          <label className="text-xs font-medium text-zinc-400">Region / Base</label>
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="All">All Regions</option>
            <option value="North">North Region</option>
            <option value="East">East Region</option>
            <option value="South">South Region</option>
            <option value="West">West Region</option>
            <option value="Global">Global Region</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Active Vehicles (On Trip) */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">On Trip</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{onTripCount}</div>
          <span className="text-[10px] text-zinc-500">Vehicles on road</span>
        </div>

        {/* Available Vehicles */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Available</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{availableCount}</div>
          <span className="text-[10px] text-zinc-500">Ready for dispatch</span>
        </div>

        {/* In Shop */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">In Shop</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{inShopCount}</div>
          <span className="text-[10px] text-zinc-500">Undergoing repairs</span>
        </div>

        {/* Active Dispatched Trips */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Dispatched</span>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{activeTripsCount}</div>
          <span className="text-[10px] text-zinc-500">Active dispatches</span>
        </div>

        {/* Draft Trips */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Draft Trips</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{draftTripsCount}</div>
          <span className="text-[10px] text-zinc-500">Pending dispatches</span>
        </div>

        {/* Drivers On Duty */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Drivers Duty</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{driversOnDuty}</div>
          <span className="text-[10px] text-zinc-500">Available + On Trip</span>
        </div>

        {/* Utilization Rate */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Utilization</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{utilizationRate}%</div>
          <span className="text-[10px] text-zinc-500">Fleet capacity used</span>
        </div>
      </div>

      {/* Main Section Grid: Distribution and Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Overall Vehicle Status Bars */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Overall Vehicle Status</h3>
            <p className="text-xs text-zinc-400">Status breakdown for filtered fleet ({totalVehiclesCount} vehicles).</p>
          </div>

          <div className="space-y-4">
            {/* Available Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Available
                </span>
                <span className="font-semibold">{availableCount} ({getPercentage(availableCount)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  style={{ width: `${getPercentage(availableCount)}%` }} 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* On Trip Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  On Trip
                </span>
                <span className="font-semibold">{onTripCount} ({getPercentage(onTripCount)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  style={{ width: `${getPercentage(onTripCount)}%` }} 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* In Shop Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  In Shop
                </span>
                <span className="font-semibold">{inShopCount} ({getPercentage(inShopCount)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  style={{ width: `${getPercentage(inShopCount)}%` }} 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Retired Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" />
                  Retired
                </span>
                <span className="font-semibold">{retiredCount} ({getPercentage(retiredCount)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  style={{ width: `${getPercentage(retiredCount)}%` }} 
                  className="h-full bg-zinc-600 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex justify-between">
            <span>Last Synced: Live from Supabase</span>
          </div>
        </div>

        {/* Right 2 Columns: Recent Trips Table */}
        <div className="lg:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Recent Trips</h3>
                <p className="text-xs text-zinc-400">Latest driver activities and delivery statuses.</p>
              </div>
              <span className="text-xs font-semibold text-zinc-500 bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Live
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-400 font-semibold">
                    <th className="py-3 px-2">Trip ID</th>
                    <th className="py-3 px-2">Vehicle</th>
                    <th className="py-3 px-2">Route</th>
                    <th className="py-3 px-2">Region</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
                  {filteredTrips.slice(0, 5).map((trip) => {
                    let badgeClass = "";
                    switch(trip.status) {
                      case "Dispatched":
                        badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        break;
                      case "Draft":
                        badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                        break;
                      case "Completed":
                        badgeClass = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                        break;
                      case "Cancelled":
                        badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                        break;
                      default:
                        badgeClass = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                    }

                    const vehicle = vehicles.find(v => v.id === trip.vehicle_id);

                    return (
                      <tr key={trip.id} className="hover:bg-zinc-850/40 transition-colors">
                        <td className="py-3.5 px-2 font-mono font-medium text-white" title={trip.id}>
                          {trip.id.substring(0, 8)}...
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{vehicle?.registration_number || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 max-w-[200px] truncate" title={`${trip.source} → ${trip.destination}`}>
                          {trip.source} &rarr; {trip.destination}
                        </td>
                        <td className="py-3.5 px-2">{trip.region}</td>
                        <td className="py-3.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${badgeClass}`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTrips.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-zinc-500">
                        No trips match the active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center text-[11px] text-zinc-500">
            <span>Showing {Math.min(filteredTrips.length, 5)} of {filteredTrips.length} recent logs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
