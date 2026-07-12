import React, { useState, useEffect } from "react";
import { Search, MapPin, Truck, Users, Calendar, AlertTriangle } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function TripsView() {
  const supabase = useSupabase();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    async function loadTrips() {
      const data = await fleetService.getTrips(supabase);
      setTrips(data);
      setLoading(false);
    }
    loadTrips();
  }, [supabase]);

  const filteredTrips = trips.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driver_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedStatus === "All" || t.status === selectedStatus;

    return matchSearch && matchStatus;
  });

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
                  </tr>
                );
              })}
              {filteredTrips.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-zinc-500">
                    No trips match the search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
