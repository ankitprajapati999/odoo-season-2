import React, { useState, useEffect } from "react";
import { Search, MapPin, Truck, Users, MoreVertical, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function TripsView({ role }) {
  const supabase = useSupabase();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const [editForm, setEditForm] = useState({
    source: "", destination: "", vehicle_id: "", driver_id: "",
    cargo_weight: "", planned_distance: "", actual_distance: "",
    fuel_consumed_liters: "", status: "Draft"
  });

  // RLS: Fleet Manager + Driver can UPDATE trips. Only Fleet Manager can DELETE.
  const isWriteAllowed = role === "Fleet Manager" || role === "Driver";
  const isDeleteAllowed = role === "Fleet Manager";

  async function reload() {
    const [t, v, d] = await Promise.all([
      fleetService.getTrips(supabase),
      fleetService.getVehicles(supabase),
      fleetService.getDrivers(supabase)
    ]);
    setTrips(t || []); setVehicles(v || []); setDrivers(d || []);
  }

  useEffect(() => {
    if (!supabase) return;
    async function init() { await reload(); setLoading(false); }
    init();
  }, [supabase]);

  const showMsg = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(""), 3500); };

  const handleOpenEdit = (trip) => {
    setSelectedTrip(trip);
    setEditForm({
      source: trip.source, destination: trip.destination,
      vehicle_id: trip.vehicle_id, driver_id: trip.driver_id,
      cargo_weight: trip.cargo_weight, planned_distance: trip.planned_distance,
      actual_distance: trip.actual_distance || "", fuel_consumed_liters: trip.fuel_consumed_liters || "",
      status: trip.status
    });
    setIsEditOpen(true); setActiveDropdown(null);
  };

  const handleSaveTrip = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      await fleetService.updateTrip(supabase, selectedTrip.id, {
        source: editForm.source, destination: editForm.destination,
        vehicle_id: editForm.vehicle_id, driver_id: editForm.driver_id,
        cargo_weight: parseFloat(editForm.cargo_weight) || 0,
        planned_distance: parseFloat(editForm.planned_distance) || 0,
        actual_distance: editForm.actual_distance ? parseFloat(editForm.actual_distance) : null,
        fuel_consumed_liters: editForm.fuel_consumed_liters ? parseFloat(editForm.fuel_consumed_liters) : null,
        status: editForm.status
      });
      await reload();
      setIsEditOpen(false); setSelectedTrip(null);
      showMsg("✅ Trip record updated.");
    } catch (err) { showMsg(`❌ Error: ${err.message}`); }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTrip) return;
    try {
      await fleetService.deleteTrip(supabase, selectedTrip.id);
      await reload(); setIsDeleteOpen(false); setSelectedTrip(null);
      showMsg("🗑️ Trip deleted.");
    } catch (err) { showMsg(`❌ Error: ${err.message}`); }
  };

  const filteredTrips = trips.filter(t => {
    const matchSearch =
      (t.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.destination || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "All" || t.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
        <img src="/favicon.png" className="w-12 h-12 animate-spin drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" alt="Loading" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading trips...</span>
      </div>
    );
  }

  const badgeClass = (status) => {
    switch (status) {
      case "Dispatched": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Draft":      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Completed":  return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
      case "Cancelled":  return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:           return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Trips Registry & Logs</h1>
        <p className="text-sm text-zinc-400">Complete audit log of all dispatched, completed, and cancelled trips.</p>
      </div>

      {statusMsg && (
        <div className="px-4 py-2 text-xs font-semibold text-center rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-200">{statusMsg}</div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Search by source or destination..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-500" />
        </div>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Trips Table */}
      <div className="border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-855 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Cargo (kg)</th>
                <th className="py-3.5 px-4">Distance (km)</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4">Status</th>
                {isWriteAllowed && <th className="py-3.5 px-4 w-12 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {filteredTrips.map(trip => {
                const vehicle = vehicles.find(v => v.id === trip.vehicle_id);
                const driver = drivers.find(d => d.id === trip.driver_id);
                return (
                  <tr key={trip.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="font-medium">{trip.source} → {trip.destination}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">{vehicle?.registration_number || "—"}</td>
                    <td className="py-4 px-4 font-medium">{driver?.name || "—"}</td>
                    <td className="py-4 px-4 font-mono">{trip.cargo_weight}</td>
                    <td className="py-4 px-4 font-mono">
                      {trip.actual_distance ? `${trip.actual_distance} / ${trip.planned_distance}` : trip.planned_distance}
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-500 text-[10px]">
                      {new Date(trip.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${badgeClass(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                     {isWriteAllowed && (
                      <td className={`py-4 px-4 text-center relative ${activeDropdown === trip.id ? "z-30" : ""}`}>
                        <button onClick={() => setActiveDropdown(activeDropdown === trip.id ? null : trip.id)}
                          className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeDropdown === trip.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-4 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 py-1 text-left">
                              <button onClick={() => handleOpenEdit(trip)}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                <Edit className="w-3.5 h-3.5 text-zinc-500" /><span>Edit</span>
                              </button>
                              {isDeleteAllowed && (
                              <button onClick={() => { setSelectedTrip(trip); setIsDeleteOpen(true); setActiveDropdown(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5 text-rose-500/80" /><span>Delete</span>
                              </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredTrips.length === 0 && !loading && (
                <tr><td colSpan="8" className="py-8 text-center text-zinc-500">No trips found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Trip Modal */}
      {isEditOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Trip Record</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-zinc-400 hover:text-white text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSaveTrip} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Source</label>
                  <input required value={editForm.source} onChange={e => setEditForm({...editForm, source: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Destination</label>
                  <input required value={editForm.destination} onChange={e => setEditForm({...editForm, destination: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Actual Distance (km)</label>
                  <input type="number" min="0" step="0.1" value={editForm.actual_distance} onChange={e => setEditForm({...editForm, actual_distance: e.target.value})}
                    placeholder="Optional" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Fuel Consumed (L)</label>
                  <input type="number" min="0" step="0.01" value={editForm.fuel_consumed_liters} onChange={e => setEditForm({...editForm, fuel_consumed_liters: e.target.value})}
                    placeholder="Optional" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  <option value="Draft">Draft</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Trip</h3>
            <p className="text-sm text-zinc-400">Permanently delete this trip record?</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Keep</button>
              <button onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
