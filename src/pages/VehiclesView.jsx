import React, { useState, useEffect } from "react";
import { Plus, Search, Truck, ShieldAlert } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function VehiclesView({ role }) {
  const supabase = useSupabase();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    id: "",
    name: "",
    type: "Truck",
    capacity: "",
    region: "North",
    fuel_efficiency: "",
    status: "Active",
    license_plate: ""
  });

  useEffect(() => {
    async function loadVehicles() {
      const data = await fleetService.getVehicles(supabase);
      setVehicles(data);
      setLoading(false);
    }
    loadVehicles();
  }, [supabase]);

  // Filtering Logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.license_plate && v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = selectedType === "All" || v.type === selectedType;
    const matchStatus = selectedStatus === "All" || v.status === selectedStatus;

    return matchSearch && matchType && matchStatus;
  });

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.id || !newVehicle.name) return;

    const result = await fleetService.createVehicle(supabase, newVehicle);
    if (result) {
      // Re-fetch to guarantee up-to-date state
      const data = await fleetService.getVehicles(supabase);
      setVehicles(data);
      setIsModalOpen(false);
      // Reset form
      setNewVehicle({
        id: "",
        name: "",
        type: "Truck",
        capacity: "",
        region: "North",
        fuel_efficiency: "",
        status: "Active",
        license_plate: ""
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vehicle Registry</h1>
          <p className="text-sm text-zinc-400">Manage and audit physical vehicles in your active fleet.</p>
        </div>
        {role === 'Fleet Manager' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Vehicle
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by ID, name, plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Truck">Trucks</option>
            <option value="Van">Vans</option>
            <option value="Mini">Minis</option>
            <option value="Bus">Buses</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Shop">In Shop</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                <th className="py-3.5 px-4">Vehicle ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Plate</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Efficiency</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {filteredVehicles.map((vehicle) => {
                let badgeClass = "";
                switch (vehicle.status) {
                  case "Active":
                    badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    break;
                  case "In Shop":
                    badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                    break;
                  case "Off Duty":
                    badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                    break;
                  case "Maintenance":
                    badgeClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                    break;
                  default:
                    badgeClass = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                }

                return (
                  <tr key={vehicle.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-white">{vehicle.id}</td>
                    <td className="py-4 px-4 font-medium">{vehicle.name}</td>
                    <td className="py-4 px-4 flex items-center gap-1.5 mt-1">
                      <Truck className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{vehicle.type}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">{vehicle.license_plate || "N/A"}</td>
                    <td className="py-4 px-4">{vehicle.capacity}</td>
                    <td className="py-4 px-4">{vehicle.region}</td>
                    <td className="py-4 px-4 font-mono">{vehicle.fuel_efficiency}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${badgeClass}`}>
                        {vehicle.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredVehicles.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-zinc-500">
                    No vehicles found in registry matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Vehicle</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white font-semibold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Vehicle ID (e.g. VEH-009)</label>
                <input
                  type="text"
                  required
                  placeholder="VEH-009"
                  value={newVehicle.id}
                  onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Vehicle Name</label>
                <input
                  type="text"
                  required
                  placeholder="Toyota Hiace Express"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Type</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Mini">Mini</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Status</label>
                  <select
                    value={newVehicle.status}
                    onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Capacity</label>
                  <input
                    type="text"
                    required
                    placeholder="3 Tons"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Fuel Efficiency</label>
                  <input
                    type="text"
                    required
                    placeholder="10.5 km/l"
                    value={newVehicle.fuel_efficiency}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuel_efficiency: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">License Plate</label>
                  <input
                    type="text"
                    placeholder="TX-392-SS"
                    value={newVehicle.license_plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Region</label>
                  <select
                    value={newVehicle.region}
                    onChange={(e) => setNewVehicle({ ...newVehicle, region: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
