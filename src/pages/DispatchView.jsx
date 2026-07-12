import React, { useState, useEffect } from "react";
import { Send, MapPin, Truck, Users, CheckCircle, MoreVertical, Edit, Trash2, AlertTriangle, XCircle } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";
import { useUser } from "@clerk/clerk-react";

export default function DispatchView({ role }) {
  const supabase = useSupabase();
  const { user } = useUser();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);

  // Form State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("info");

  // Complete Trip Modal
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [tripToComplete, setTripToComplete] = useState(null);
  const [actualDistance, setActualDistance] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  // Meatballs & Delete Modal
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  const isWriteAllowed = role === "Fleet Manager" || role === "Driver";

  const showMsg = (msg, type = "info") => {
    setStatusMsg(msg);
    setStatusType(type);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  async function reload() {
    const [v, d, t] = await Promise.all([
      fleetService.getVehicles(supabase),
      fleetService.getDrivers(supabase),
      fleetService.getTrips(supabase)
    ]);
    setVehicles(v || []);
    setDrivers(d || []);
    setTrips(t || []);
  }

  useEffect(() => { reload(); }, [supabase]);

  // Only show available vehicles and drivers for dispatch form
  const availableVehicles = vehicles.filter(v => v.status === "Available");
  const availableDrivers = drivers.filter(d => {
    if (d.status !== "Available") return false;
    if (!d.license_expiry_date) return false;
    return new Date(d.license_expiry_date) >= new Date();
  });

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!source || !destination || !selectedVehicle || !selectedDriver || !cargoWeight || !plannedDistance) {
      showMsg("❌ Please fill in all required fields.", "error");
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (vehicle && parseFloat(cargoWeight) > parseFloat(vehicle.max_load_capacity)) {
      showMsg(`❌ Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.max_load_capacity} kg).`, "error");
      return;
    }

    try {
      await fleetService.createTrip(supabase, {
        source,
        destination,
        vehicle_id: selectedVehicle,
        driver_id: selectedDriver,
        cargo_weight: parseFloat(cargoWeight),
        planned_distance: parseFloat(plannedDistance),
        status: "Dispatched",
        created_by: user?.id
      });
      await reload();
      setSource(""); setDestination(""); setCargoWeight(""); setPlannedDistance("");
      if (availableVehicles.length > 0) setSelectedVehicle(availableVehicles[0].id);
      if (availableDrivers.length > 0) setSelectedDriver(availableDrivers[0].id);
      showMsg("✅ Trip dispatched! Vehicle and driver are now 'On Trip'.", "success");
    } catch (err) {
      showMsg(`❌ Dispatch failed: ${err.message}`, "error");
    }
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    if (!tripToComplete) return;
    try {
      await fleetService.updateTrip(supabase, tripToComplete.id, {
        status: "Completed",
        actual_distance: parseFloat(actualDistance) || null,
        fuel_consumed_liters: parseFloat(fuelConsumed) || null
      });
      await reload();
      setIsCompleteOpen(false);
      setTripToComplete(null);
      setActualDistance(""); setFuelConsumed("");
      showMsg("✅ Trip completed! Vehicle and driver returned to Available.", "success");
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`, "error");
    }
  };

  const handleCancelTrip = async (trip) => {
    try {
      await fleetService.updateTrip(supabase, trip.id, { status: "Cancelled" });
      await reload();
      showMsg("🚫 Trip cancelled. Resources freed.", "info");
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`, "error");
    }
    setActiveDropdown(null);
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    try {
      await fleetService.deleteTrip(supabase, tripToDelete.id);
      await reload();
      setIsDeleteOpen(false);
      setTripToDelete(null);
      showMsg("🗑️ Trip record deleted.", "info");
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`, "error");
    }
  };

  const activeTrips = trips.filter(t => t.status === "Dispatched");

  const msgColor = statusType === "error"
    ? "text-rose-400 border-rose-800/50 bg-rose-950/30"
    : statusType === "success"
    ? "text-emerald-400 border-emerald-800/50 bg-emerald-950/30"
    : "text-zinc-300 border-zinc-800 bg-zinc-900";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dispatch Control</h1>
        <p className="text-sm text-zinc-400">Assign routes to vehicles and drivers. DB triggers manage status transitions automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Form */}
        <div className="lg:col-span-1 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-500" /> New Dispatch
          </h3>
          <p className="text-xs text-zinc-400">Only available vehicles and drivers with valid licenses are shown.</p>

          {isWriteAllowed ? (
            <form onSubmit={handleDispatch} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Source (Origin) *</label>
                <input required value={source} onChange={e => setSource(e.target.value)}
                  placeholder="Mumbai Depot" className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Destination *</label>
                <input required value={destination} onChange={e => setDestination(e.target.value)}
                  placeholder="Pune Warehouse" className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Vehicle *</label>
                <select required value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
                  <option value="">-- Select Available Vehicle --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registration_number} — {v.name} (Max: {v.max_load_capacity} kg)</option>
                  ))}
                  {availableVehicles.length === 0 && <option disabled>No vehicles available</option>}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Driver *</label>
                <select required value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
                  <option value="">-- Select Available Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.license_number} (Score: {d.safety_score})</option>
                  ))}
                  {availableDrivers.length === 0 && <option disabled>No eligible drivers</option>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Cargo Weight (kg) *</label>
                  <input required type="number" min="0.01" step="0.01" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)}
                    placeholder="5000" className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Planned Distance (km) *</label>
                  <input required type="number" min="0.1" step="0.1" value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)}
                    placeholder="250" className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600" />
                </div>
              </div>

              {statusMsg && (
                <div className={`p-3 rounded-lg text-xs font-semibold border text-center ${msgColor}`}>
                  {statusMsg}
                </div>
              )}

              <button type="submit" disabled={availableVehicles.length === 0 || availableDrivers.length === 0}
                className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20">
                Dispatch Trip
              </button>
            </form>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-xs space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-zinc-600" />
              <p>Only Fleet Managers and Dispatchers can create trips.</p>
            </div>
          )}
        </div>

        {/* Active Dispatches */}
        <div className="lg:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Active Dispatches</h3>
              <p className="text-xs text-zinc-400">Ongoing routes currently being monitored.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeTrips.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {activeTrips.map(trip => {
              const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
              const driver = drivers.find(d => d.id === trip.driver_id);
              return (
                <div key={trip.id} className="p-4 border rounded-xl bg-zinc-950/60 border-zinc-850 hover:border-zinc-800 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        {trip.source} → {trip.destination}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Truck className="w-3 h-3" /> {vehicle?.registration_number || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Users className="w-3 h-3" /> {driver?.name || "Unknown"}
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold">
                          {trip.cargo_weight} kg • {trip.planned_distance} km
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Dispatched
                      </span>
                      {isWriteAllowed && (
                        <div className="relative">
                          <button onClick={() => setActiveDropdown(activeDropdown === trip.id ? null : trip.id)}
                            className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeDropdown === trip.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                              <div className="absolute right-0 mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                                <button onClick={() => { setTripToComplete(trip); setActualDistance(""); setFuelConsumed(""); setIsCompleteOpen(true); setActiveDropdown(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                  <CheckCircle className="w-3.5 h-3.5" /><span>Complete Trip</span>
                                </button>
                                <button onClick={() => handleCancelTrip(trip)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-amber-400 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                  <XCircle className="w-3.5 h-3.5" /><span>Cancel Trip</span>
                                </button>
                                <button onClick={() => { setTripToDelete(trip); setIsDeleteOpen(true); setActiveDropdown(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {activeTrips.length === 0 && (
              <div className="py-12 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-2">
                <CheckCircle className="w-8 h-8 text-zinc-650" />
                <p className="text-xs">No active dispatches at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {isCompleteOpen && tripToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Complete Trip</h3>
              <button onClick={() => setIsCompleteOpen(false)} className="text-zinc-400 hover:text-white text-xl cursor-pointer">&times;</button>
            </div>
            <p className="text-xs text-zinc-400">
              <span className="text-white font-semibold">{tripToComplete.source} → {tripToComplete.destination}</span><br />
              Enter actual distance and fuel consumed to update the vehicle odometer and log the fuel.
            </p>
            <form onSubmit={handleCompleteTrip} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Actual Distance (km)</label>
                <input type="number" min="0" step="0.1" value={actualDistance} onChange={e => setActualDistance(e.target.value)}
                  placeholder={`Planned: ${tripToComplete.planned_distance} km`}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Fuel Consumed (liters)</label>
                <input type="number" min="0" step="0.01" value={fuelConsumed} onChange={e => setFuelConsumed(e.target.value)}
                  placeholder="Optional — auto-logs fuel entry"
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCompleteOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition cursor-pointer shadow-md shadow-emerald-500/20">Mark Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Trip Record</h3>
            <p className="text-sm text-zinc-400">Permanently delete this trip log? This cannot be undone.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Keep</button>
              <button onClick={handleDeleteTrip}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
