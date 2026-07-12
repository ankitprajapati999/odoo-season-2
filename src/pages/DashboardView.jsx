import React, { useState, useEffect } from "react";
import { 
  Truck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert,
  Activity
} from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function DashboardView() {
  const supabase = useSupabase();
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  
  // Filter States
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");

  useEffect(() => {
    async function loadData() {
      const v = await fleetService.getVehicles(supabase);
      const t = await fleetService.getTrips(supabase);
      const m = await fleetService.getMaintenance(supabase);
      
      setVehicles(v);
      setTrips(t);
      setMaintenance(m);
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
    // Find associated vehicle
    const vehicle = vehicles.find(v => v.id === t.vehicle_id);
    if (!vehicle) return selectedType === "All" && selectedStatus === "All" && selectedRegion === "All";
    
    const matchType = selectedType === "All" || vehicle.type === selectedType;
    const matchStatus = selectedStatus === "All" || vehicle.status === selectedStatus;
    const matchRegion = selectedRegion === "All" || t.region === selectedRegion;
    return matchType && matchStatus && matchRegion;
  });

  // Calculate Metrics
  const totalVehiclesCount = filteredVehicles.length;
  const activeCount = filteredVehicles.filter(v => v.status === "Active").length;
  const inShopCount = filteredVehicles.filter(v => v.status === "In Shop").length;
  const offDutyCount = filteredVehicles.filter(v => v.status === "Off Duty").length;
  const maintenanceCount = filteredVehicles.filter(v => v.status === "Maintenance").length;

  const activeTripsCount = filteredTrips.filter(t => t.status === "Active" || t.status === "Delayed").length;
  
  // Count active maintenance items for filtered vehicles
  const filteredVehicleIds = filteredVehicles.map(v => v.id);
  const activeMaintAlerts = maintenance.filter(m => 
    filteredVehicleIds.includes(m.vehicle_id) && m.status !== "Completed"
  ).length;

  // Mock static rates/counts to match mockup details
  const safetyIncidents = totalVehiclesCount > 0 ? Math.max(0, Math.round(totalVehiclesCount * 0.3)) : 0;
  const utilizationRate = totalVehiclesCount > 0 
    ? Math.round(((activeCount + maintenanceCount) / totalVehiclesCount) * 100) 
    : 0;

  // Status distributions in percentage for bar rendering
  const getPercentage = (count) => {
    if (totalVehiclesCount === 0) return 0;
    return Math.round((count / totalVehiclesCount) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-sm text-zinc-400">Real-time status of your fleet and active dispatches.</p>
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
            <option value="Active">Active</option>
            <option value="In Shop">In Shop</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Maintenance">Maintenance</option>
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
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Active Vehicles */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{activeCount}</div>
          <span className="text-[10px] text-zinc-500">Vehicles on road</span>
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

        {/* Off Duty */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Off Duty</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{offDutyCount}</div>
          <span className="text-[10px] text-zinc-500">Parked / Ready</span>
        </div>

        {/* Active Trips */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Trips</span>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{activeTripsCount}</div>
          <span className="text-[10px] text-zinc-500">Active dispatches</span>
        </div>

        {/* Maintenance Alerts */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-cyan-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Alerts</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{activeMaintAlerts}</div>
          <span className="text-[10px] text-rose-400/90 font-medium">Maint. pending</span>
        </div>

        {/* Safety Incidents */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-500/80" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{safetyIncidents}</div>
          <span className="text-[10px] text-zinc-500">Critical events</span>
        </div>

        {/* Fleet Utilization */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Utilization</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{utilizationRate}%</div>
          <span className="text-[10px] text-zinc-500">Capacity used</span>
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
            {/* Active Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Active
                </span>
                <span className="font-semibold">{activeCount} ({getPercentage(activeCount)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  style={{ width: `${getPercentage(activeCount)}%` }} 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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

            {/* Off Duty Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Off Duty
                </span>
                <span className="font-semibold">{offDutyCount} ({getPercentage(offDutyCount)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  style={{ width: `${getPercentage(offDutyCount)}%` }} 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Maintenance Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Maintenance
                </span>
                <span className="font-semibold">{maintenanceCount} ({getPercentage(maintenanceCount)}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  style={{ width: `${getPercentage(maintenanceCount)}%` }} 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex justify-between">
            <span>Last Updated: Just Now</span>
            <span className="text-amber-500 hover:underline cursor-pointer flex items-center gap-1">
              <Activity className="w-3 h-3" /> View detailed reports
            </span>
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
                    <th className="py-3 px-2">Vehicle ID</th>
                    <th className="py-3 px-2">Route</th>
                    <th className="py-3 px-2">Region</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
                  {filteredTrips.slice(0, 5).map((trip) => {
                    let badgeClass = "";
                    switch(trip.status) {
                      case "Active":
                        badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        break;
                      case "On Time":
                        badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                        break;
                      case "Delayed":
                        badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                        break;
                      default:
                        badgeClass = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                    }

                    return (
                      <tr key={trip.id} className="hover:bg-zinc-850/40 transition-colors">
                        <td className="py-3.5 px-2 font-mono font-medium text-white">{trip.id}</td>
                        <td className="py-3.5 px-2 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{trip.vehicle_id}</span>
                        </td>
                        <td className="py-3.5 px-2 max-w-[200px] truncate" title={trip.route_name}>
                          {trip.route_name}
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
            <span className="text-amber-500 hover:underline cursor-pointer">
              Manage Dispatcher →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
