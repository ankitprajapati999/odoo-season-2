import React, { useState, useEffect } from "react";
import { Search, MapPin, Truck, Users, Calendar, AlertTriangle, MoreVertical, Edit, Trash2 } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function TripsView() {
  const supabase = useSupabase();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Meatballs Dropdown & Modal States
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [vehicleList, setVehicleList] = useState([]);
  const [driverList, setDriverList] = useState([]);

  const [editForm, setEditForm] = useState({
    route_name: "",
    vehicle_id: "",
    driver_id: "",
    region: "North",
    status: "Active",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    async function loadTrips() {
      const data = await fleetService.getTrips(supabase);
      setTrips(data);
      setLoading(false);
    }
    async function loadResources() {
      const v = await fleetService.getVehicles(supabase);
      const d = await fleetService.getDrivers(supabase);
      setVehicleList(v);
      setDriverList(d);
    }
    loadTrips();
    loadResources();
  }, [supabase]);

  const handleOpenEdit = (trip) => {
    setSelectedTrip(trip);
    setEditForm({
      route_name: trip.route_name,
      vehicle_id: trip.vehicle_id,
      driver_id: trip.driver_id,
      region: trip.region,
      status: trip.status,
      start_time: trip.start_time ? trip.start_time.substring(0, 16) : "",
      end_time: trip.end_time ? trip.end_time.substring(0, 16) : ""
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
      status: editForm.status,
      start_time: editForm.start_time ? new Date(editForm.start_time).toISOString() : new Date().toISOString(),
      end_time: editForm.end_time ? new Date(editForm.end_time).toISOString() : null
    };

    if (updates.status === "Completed" && !updates.end_time) {
      updates.end_time = new Date().toISOString();
    }

    const result = await fleetService.updateTrip(supabase, selectedTrip.id, updates);
    if (result) {
      const data = await fleetService.getTrips(supabase);
      setTrips(data);
      setIsEditOpen(false);
      setSelectedTrip(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTrip) return;
    const result = await fleetService.deleteTrip(supabase, selectedTrip.id);
    if (result) {
      const data = await fleetService.getTrips(supabase);
      setTrips(data);
      setIsDeleteOpen(false);
      setSelectedTrip(null);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driver_id.toLowerCase().includes(searchTerm.toLowerCase());

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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Trips Registry & Logs</h1>
        <p className="text-sm text-zinc-400">Complete audit log of all dispatched, completed, and delayed trips.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, vehicle, route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Time">On Time</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-855 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                <th className="py-3.5 px-4">Trip ID</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Dispatch Time</th>
                <th className="py-3.5 px-4">Arrival Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {filteredTrips.map((trip) => {
                let badgeClass = "";
                switch (trip.status) {
                  case "Active":
                    badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    break;
                  case "On Time":
                    badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                    break;
                  case "Delayed":
                    badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                    break;
                  case "Completed":
                    badgeClass = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                    break;
                  default:
                    badgeClass = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                }

                return (
                  <tr key={trip.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-white">{trip.id}</td>
                    <td className="py-4 px-4 font-mono text-zinc-350">{trip.vehicle_id}</td>
                    <td className="py-4 px-4 font-medium">{trip.driver_id}</td>
                    <td className="py-4 px-4 font-medium flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{trip.route_name}</span>
                    </td>
                    <td className="py-4 px-4">{trip.region}</td>
                    <td className="py-4 px-4 font-mono text-zinc-400">{new Date(trip.start_time).toLocaleString()}</td>
                    <td className="py-4 px-4 font-mono text-zinc-400">
                      {trip.end_time ? new Date(trip.end_time).toLocaleString() : "Active"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${badgeClass}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === trip.id ? null : trip.id)}
                        className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdown === trip.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)} 
                          />
                          <div className="absolute right-4 mt-2 w-28 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
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
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredTrips.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-zinc-500">
                    No trips match the search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Trip Modal */}
      {isEditOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Trip Details</h3>
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
                  <label className="text-xs text-zinc-400 font-medium">Vehicle ID</label>
                  <select
                    value={editForm.vehicle_id}
                    onChange={(e) => setEditForm({ ...editForm, vehicle_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {vehicleList.map(v => (
                      <option key={v.id} value={v.id}>{v.id}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Driver ID</label>
                  <select
                    value={editForm.driver_id}
                    onChange={(e) => setEditForm({ ...editForm, driver_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {driverList.map(d => (
                      <option key={d.id} value={d.id}>{d.id}</option>
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
                    <option value="On Time">On Time</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Dispatch Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.start_time}
                    onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Arrival Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.end_time}
                    onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Trip</h3>
              <p className="text-sm text-zinc-400">
                Are you sure you want to delete trip logs for <strong>{selectedTrip.route_name}</strong> (<code>{selectedTrip.id}</code>)? This action is permanent.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                Keep Log
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
