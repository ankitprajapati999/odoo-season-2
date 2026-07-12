import React, { useState, useEffect } from "react";
import { Send, MapPin, Truck, Users, Clock, AlertTriangle, MoreVertical, Edit, CheckCircle, Trash2 } from "lucide-react";
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

  // Meatballs Dropdown & Modal States
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [allVehicles, setAllVehicles] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);

  const [editForm, setEditForm] = useState({
    route_name: "",
    vehicle_id: "",
    driver_id: "",
    region: "North",
    status: "Active"
  });

  useEffect(() => {
    async function loadData() {
      const v = await fleetService.getVehicles(supabase);
      const d = await fleetService.getDrivers(supabase);
      const t = await fleetService.getTrips(supabase);
      
      setAllVehicles(v);
      setAllDrivers(d);
      setVehicles(v.filter(item => item.status === "Active")); // Only active vehicles can be dispatched
      setDrivers(d.filter(item => item.status === "Active"));   // Only active drivers
      setTrips(t);

      const activeV = v.filter(item => item.status === "Active");
      const activeD = d.filter(item => item.status === "Active");
      if (activeV.length > 0) setSelectedVehicle(activeV[0].id);
      if (activeD.length > 0) setSelectedDriver(activeD[0].id);

      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleMarkCompleted = async (trip) => {
    const result = await fleetService.updateTrip(supabase, trip.id, {
      status: "Completed",
      end_time: new Date().toISOString()
    });
    if (result) {
      const updatedTrips = await fleetService.getTrips(supabase);
      setTrips(updatedTrips);
      setStatusMsg("✅ Trip completed successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleOpenEdit = (trip) => {
    setSelectedTrip(trip);
    setEditForm({
      route_name: trip.route_name,
      vehicle_id: trip.vehicle_id,
      driver_id: trip.driver_id,
      region: trip.region,
      status: trip.status
    });
    setIsEditOpen(true);
  };

  const handleSaveTrip = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;

    const updates = {
      route_name: editForm.route_name,
      vehicle_id: editForm.vehicle_id,
      driver_id: editForm.driver_id,
      region: editForm.region,
      status: editForm.status
    };

    if (updates.status === "Completed") {
      updates.end_time = new Date().toISOString();
    }

    const result = await fleetService.updateTrip(supabase, selectedTrip.id, updates);
    if (result) {
      const updatedTrips = await fleetService.getTrips(supabase);
      setTrips(updatedTrips);
      setIsEditOpen(false);
      setSelectedTrip(null);
      setStatusMsg("✍️ Trip details updated!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTrip) return;
    const result = await fleetService.deleteTrip(supabase, selectedTrip.id);
    if (result) {
      const updatedTrips = await fleetService.getTrips(supabase);
      setTrips(updatedTrips);
      setIsDeleteOpen(false);
      setSelectedTrip(null);
      setStatusMsg("🗑️ Dispatch canceled!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

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
                    <div className="flex items-start gap-2 relative">
                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
                          trip.status === "Delayed" 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {trip.status}
                        </span>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end font-mono">
                          <Clock className="w-3 h-3" /> {startFormatted}
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveDropdown(activeDropdown === trip.id ? null : trip.id)}
                        className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer self-start"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdown === trip.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)} 
                          />
                          <div className="absolute right-0 mt-8 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                            <button
                              onClick={() => {
                                handleMarkCompleted(trip);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-zinc-800 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                            <button
                              onClick={() => {
                                handleOpenEdit(trip);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setIsDeleteOpen(true);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-zinc-800 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500/80" />
                              <span>Cancel Trip</span>
                            </button>
                          </div>
                        </>
                      )}
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

      {/* Edit Dispatch Modal */}
      {isEditOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Active Dispatch</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-white font-semibold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTrip} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Route Name</label>
                <input
                  type="text"
                  required
                  value={editForm.route_name}
                  onChange={(e) => setEditForm({ ...editForm, route_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Vehicle</label>
                  <select
                    value={editForm.vehicle_id}
                    onChange={(e) => setEditForm({ ...editForm, vehicle_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {allVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.id} - {v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Driver</label>
                  <select
                    value={editForm.driver_id}
                    onChange={(e) => setEditForm({ ...editForm, driver_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {allDrivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Region</label>
                  <select
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Dispatch Confirmation Modal */}
      {isDeleteOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Cancel Trip Dispatch</h3>
              <p className="text-sm text-zinc-400">
                Are you sure you want to cancel the dispatch for route <strong>{selectedTrip.route_name}</strong>? This will permanently delete the active trip log.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer shadow-md shadow-rose-600/20"
              >
                Cancel Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
