import React, { useState, useEffect } from "react";
import { Plus, Search, Truck, MoreVertical, Edit, Trash2, AlertTriangle } from "lucide-react";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: "",
    name: "",
    type: "Truck",
    max_load_capacity: "",
    odometer: "0",
    acquisition_cost: "",
    region: "Global",
    status: "Available"
  });
  const [editingId, setEditingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  // Meatballs Dropdown & Delete Modal States
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const isWriteAllowed = role === "Fleet Manager";

  async function reload() {
    const data = await fleetService.getVehicles(supabase);
    setVehicles(data || []);
  }

  useEffect(() => {
    async function init() {
      await reload();
      setLoading(false);
    }
    init();
  }, [supabase]);

  const showMsg = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  // Filtering Logic — search by registration_number or name
  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      (v.registration_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === "All" || v.type === selectedType;
    const matchStatus = selectedStatus === "All" || v.status === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      registration_number: "",
      name: "",
      type: "Truck",
      max_load_capacity: "",
      odometer: "0",
      acquisition_cost: "",
      region: "Global",
      status: "Available"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setIsEditMode(true);
    setEditingId(vehicle.id);
    setFormData({
      registration_number: vehicle.registration_number,
      name: vehicle.name,
      type: vehicle.type,
      max_load_capacity: vehicle.max_load_capacity,
      odometer: vehicle.odometer,
      acquisition_cost: vehicle.acquisition_cost,
      region: vehicle.region,
      status: vehicle.status
    });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!formData.registration_number || !formData.name || !formData.max_load_capacity || !formData.acquisition_cost) {
      showMsg("❌ Please fill in all required fields.");
      return;
    }

    const payload = {
      registration_number: formData.registration_number.toUpperCase(),
      name: formData.name,
      type: formData.type,
      max_load_capacity: parseFloat(formData.max_load_capacity) || 0,
      odometer: parseFloat(formData.odometer) || 0,
      acquisition_cost: parseFloat(formData.acquisition_cost) || 0,
      region: formData.region,
      status: formData.status
    };

    try {
      if (isEditMode) {
        await fleetService.updateVehicle(supabase, editingId, payload);
        showMsg("✅ Vehicle updated successfully!");
      } else {
        await fleetService.createVehicle(supabase, payload);
        showMsg("✅ Vehicle added to registry!");
      }
      await reload();
      setIsModalOpen(false);
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await fleetService.deleteVehicle(supabase, vehicleToDelete.id);
      await reload();
      setIsDeleteOpen(false);
      setVehicleToDelete(null);
      showMsg("🗑️ Vehicle removed from registry.");
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "Available": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "On Trip":   return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "In Shop":   return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "Retired":   return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
      default:          return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
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
        {isWriteAllowed && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Vehicle
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="px-4 py-2 text-xs font-semibold text-center rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-200">
          {statusMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by reg. number or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-500"
          />
        </div>
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
            <option value="SUV">SUVs</option>
            <option value="Sedan">Sedans</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                <th className="py-3.5 px-4">Reg. Number</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Max Load (kg)</th>
                <th className="py-3.5 px-4">Odometer (km)</th>
                <th className="py-3.5 px-4">Acq. Cost ($)</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Status</th>
                {isWriteAllowed && <th className="py-3.5 px-4 w-12 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-zinc-850/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-medium text-white">{vehicle.registration_number}</td>
                  <td className="py-4 px-4 font-medium">{vehicle.name}</td>
                  <td className="py-4 px-4 flex items-center gap-1.5 mt-1">
                    <Truck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{vehicle.type}</span>
                  </td>
                  <td className="py-4 px-4 font-mono">{Number(vehicle.max_load_capacity).toLocaleString()}</td>
                  <td className="py-4 px-4 font-mono">{Number(vehicle.odometer).toLocaleString()}</td>
                  <td className="py-4 px-4 font-mono">${Number(vehicle.acquisition_cost).toLocaleString()}</td>
                  <td className="py-4 px-4">{vehicle.region}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${statusBadge(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  {isWriteAllowed && (
                    <td className="py-4 px-4 text-center relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === vehicle.id ? null : vehicle.id)}
                        className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeDropdown === vehicle.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute right-4 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                            <button
                              onClick={() => handleOpenEditModal(vehicle)}
                              className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-zinc-500" /><span>Edit</span>
                            </button>
                            <button
                              onClick={() => { setVehicleToDelete(vehicle); setIsDeleteOpen(true); setActiveDropdown(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-zinc-800 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500/80" /><span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredVehicles.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-zinc-500">
                    No vehicles found. {isWriteAllowed ? "Add one to get started." : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{isEditMode ? "Edit Vehicle" : "Add New Vehicle"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSaveVehicle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Registration Number *</label>
                  <input required value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})}
                    placeholder="MH-01-AB-1234" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Vehicle Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Heavy Duty Semi" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Mini">Mini</option>
                    <option value="Bus">Bus</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Max Load Capacity (kg) *</label>
                  <input required type="number" min="1" step="0.01" value={formData.max_load_capacity} onChange={e => setFormData({...formData, max_load_capacity: e.target.value})}
                    placeholder="15000" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Odometer (km)</label>
                  <input type="number" min="0" step="0.1" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})}
                    placeholder="0" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Acquisition Cost ($) *</label>
                  <input required type="number" min="0" step="0.01" value={formData.acquisition_cost} onChange={e => setFormData({...formData, acquisition_cost: e.target.value})}
                    placeholder="150000" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Region</label>
                  <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option value="Global">Global</option>
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option value="Available">Available</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition cursor-pointer shadow-md shadow-amber-500/20">
                  {isEditMode ? "Save Changes" : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Vehicle</h3>
              <p className="text-sm text-zinc-400">Permanently remove <span className="text-white font-semibold">{vehicleToDelete.registration_number}</span> from the registry?</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">
                Keep
              </button>
              <button onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer shadow-md shadow-rose-600/20">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
