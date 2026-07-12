import React, { useState, useEffect } from "react";
import { Send, MapPin, Truck, Users, Clock, AlertTriangle } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function DispatchView() {
  const supabase = useSupabase();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [route, setRoute] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("North");

  // Status message
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      const v = await fleetService.getVehicles(supabase);
      const d = await fleetService.getDrivers(supabase);
      const t = await fleetService.getTrips(supabase);
      
      setVehicles(v.filter(item => item.status === "Active")); // Only active vehicles can be dispatched
      setDrivers(d.filter(item => item.status === "Active"));   // Only active drivers
      setTrips(t);

      // Set defaults
      if (v.length > 0) setSelectedVehicle(v[0].id);
      if (d.length > 0) setSelectedDriver(d[0].id);

      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!route || !selectedVehicle || !selectedDriver) {
      setStatusMsg("❌ Please fill in all fields.");
      return;
    }

    const newTrip = {
      id: `TRIP-${Math.floor(100 + Math.random() * 900)}`,
      vehicle_id: selectedVehicle,
      driver_id: selectedDriver,
      status: "Active",
      start_time: new Date().toISOString(),
      end_time: null,
      region: selectedRegion,
      route_name: route
    };

    const result = await fleetService.createTrip(supabase, newTrip);
    if (result) {
      const updatedTrips = await fleetService.getTrips(supabase);
      setTrips(updatedTrips);
      setRoute("");
      setStatusMsg("🚀 Trip dispatched successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const activeTrips = trips.filter(t => t.status === "Active" || t.status === "Delayed");

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Trip Dispatcher</h1>
        <p className="text-sm text-zinc-400">Initiate new dispatches, map routes, and assign vehicles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dispatch Form (Left 1 Column) */}
        <div className="lg:col-span-1 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-500" /> New Dispatch Form
          </h3>
          <p className="text-xs text-zinc-400">Select active resources and assign a destination route.</p>

          <form onSubmit={handleDispatch} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Route Name</label>
              <input
                type="text"
                required
                placeholder="Dallas Main Depot -> Houston Hub"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Select Vehicle (Active)</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.name} ({v.type})</option>
                ))}
                {vehicles.length === 0 && <option value="">No Active Vehicles Available</option>}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Assign Driver (Active)</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.id} - {d.name}</option>
                ))}
                {drivers.length === 0 && <option value="">No Active Drivers Available</option>}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Target Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="North">North Region</option>
                <option value="East">East Region</option>
                <option value="South">South Region</option>
                <option value="West">West Region</option>
              </select>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-lg text-xs font-semibold bg-zinc-950 border border-zinc-850 text-center">
                {statusMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={vehicles.length === 0 || drivers.length === 0}
              className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
            >
              Dispatch Trip
            </button>
          </form>
        </div>

        {/* Active Dispatches (Right 2 Columns) */}
        <div className="lg:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Active Dispatches</h3>
              <p className="text-xs text-zinc-400">Ongoing routes currently being monitored.</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 animate-spin" /> {activeTrips.length} Active
            </span>
          </div>

          <div className="space-y-3.5">
            {activeTrips.map(trip => {
              const startFormatted = new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={trip.id} className="p-4 border rounded-xl bg-zinc-950/60 border-zinc-850 hover:border-zinc-800 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Route */}
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        {trip.route_name}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Truck className="w-3.5 h-3.5 text-zinc-500" /> {trip.vehicle_id}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Users className="w-3.5 h-3.5 text-zinc-500" /> {trip.driver_id}
                        </span>
                        <span className="text-[10px] text-zinc-500">Region: {trip.region}</span>
                      </div>
                    </div>

                    {/* Status & Time */}
                    <div className="text-right space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
                        trip.status === "Delayed" 
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {trip.status}
                      </span>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> Dispatched at {startFormatted}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activeTrips.length === 0 && (
              <div className="py-12 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-2">
                <AlertTriangle className="w-8 h-8 text-zinc-650" />
                <p className="text-xs">No active dispatches on the road.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
