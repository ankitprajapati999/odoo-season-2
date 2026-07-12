import React, { useState, useEffect } from "react";
import { Plus, Search, Users, Award, MoreVertical, Edit, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function DriversView({ role }) {
  const supabase = useSupabase();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    license_category: "B",
    license_expiry_date: "",
    contact_number: "",
    safety_score: 100,
    status: "Available"
  });
  const [statusMsg, setStatusMsg] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  // RLS: Fleet Manager → full CRUD. Safety Officer → UPDATE only (no INSERT/DELETE).
  const isFullWriteAllowed = role === "Fleet Manager";
  const isEditAllowed = role === "Fleet Manager" || role === "Safety Officer";

  async function reload() {
    const data = await fleetService.getDrivers(supabase);
    setDrivers(data || []);
  }

  useEffect(() => {
    if (!supabase) return;
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

  const filteredDrivers = drivers.filter((d) => {
    const matchSearch =
      (d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.license_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.contact_number || "").includes(searchTerm);
    const matchStatus = selectedStatus === "All" || d.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const blankForm = () => ({
    name: "",
    license_number: "",
    license_category: "B",
    license_expiry_date: "",
    contact_number: "",
    safety_score: 100,
    status: "Available"
  });

  const handleOpenAddModal = () => {
    // Only Fleet Manager can create new drivers
    if (!isFullWriteAllowed) return;
    setIsEditMode(false);
    setEditingId(null);
    setFormData(blankForm());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setIsEditMode(true);
    setEditingId(driver.id);
    setFormData({
      name: driver.name,
      license_number: driver.license_number,
      license_category: driver.license_category || "B",
      license_expiry_date: driver.license_expiry_date || "",
      contact_number: driver.contact_number || "",
      safety_score: driver.safety_score,
      status: driver.status
    });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSaveDriver = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.license_number || !formData.license_expiry_date || !formData.contact_number) {
      showMsg("❌ Please fill in all required fields.");
      return;
    }

    const payload = {
      name: formData.name,
      license_number: formData.license_number,
      license_category: formData.license_category,
      license_expiry_date: formData.license_expiry_date,
      contact_number: formData.contact_number,
      safety_score: parseFloat(formData.safety_score) || 100,
      status: formData.status
    };

    try {
      if (isEditMode) {
        await fleetService.updateDriver(supabase, editingId, payload);
        showMsg("✅ Driver profile updated!");
      } else {
        await fleetService.createDriver(supabase, payload);
        showMsg("✅ Driver added to registry!");
      }
      await reload();
      setIsModalOpen(false);
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;
    try {
      await fleetService.deleteDriver(supabase, driverToDelete.id);
      await reload();
      setIsDeleteOpen(false);
      setDriverToDelete(null);
      showMsg("🗑️ Driver removed from registry.");
    } catch (err) {
      showMsg(`❌ Error: ${err.message}`);
    }
  };

<<<<<<< HEAD
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
        <img src="/favicon.png" className="w-12 h-12 animate-spin drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" alt="Loading" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading drivers...</span>
      </div>
    );
  }

=======
>>>>>>> c3fa527cb94f1d1c845500e83261473d3dd37aaf
  const statusBadge = (status) => {
    switch (status) {
      case "Available":  return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "On Trip":    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Off Duty":   return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Suspended":  return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:           return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

<<<<<<< HEAD
=======
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
        <img src="/favicon.png" className="w-12 h-12 animate-spin drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" alt="Loading" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading drivers...</span>
      </div>
    );
  }
>>>>>>> c3fa527cb94f1d1c845500e83261473d3dd37aaf

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Driver Registry</h1>
          <p className="text-sm text-zinc-400">Manage driver profiles, licenses, safety scores, and duty statuses.</p>
        </div>
        {isFullWriteAllowed && (
          <button onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-500/20">
            <Plus className="w-4 h-4 stroke-[3]" /> Add Driver
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
          <input type="text" placeholder="Search by name or license..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-500" />
        </div>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Drivers Table */}
      <div className="border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">License No.</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Safety Score</th>
                <th className="py-3.5 px-4">Status</th>
                {isEditAllowed && <th className="py-3.5 px-4 w-12 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-zinc-850/40 transition-colors">
                  <td className="py-4 px-4 font-medium text-white flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    {driver.name}
                  </td>
                  <td className="py-4 px-4 font-mono text-zinc-400">{driver.license_number}</td>
                  <td className="py-4 px-4">Class {driver.license_category}</td>
                  <td className={`py-4 px-4 font-mono ${isExpired(driver.license_expiry_date) ? "text-rose-400 font-semibold" : "text-zinc-400"}`}>
                    {driver.license_expiry_date}
                    {isExpired(driver.license_expiry_date) && <span className="ml-1 text-[10px] text-rose-400">EXPIRED</span>}
                  </td>
                  <td className="py-4 px-4 font-mono">{driver.contact_number}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Award className={`w-3.5 h-3.5 ${driver.safety_score >= 90 ? "text-amber-400" : driver.safety_score >= 75 ? "text-zinc-400" : "text-rose-400"}`} />
                      <span className={driver.safety_score >= 90 ? "text-amber-400 font-semibold" : driver.safety_score >= 75 ? "" : "text-rose-400"}>
                        {driver.safety_score}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${statusBadge(driver.status)}`}>
                      {driver.status}
                    </span>
                  </td>
                   {isEditAllowed && (
                    <td className={`py-4 px-4 text-center relative ${activeDropdown === driver.id ? "z-30" : ""}`}>
                      <button onClick={() => setActiveDropdown(activeDropdown === driver.id ? null : driver.id)}
                        className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeDropdown === driver.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute right-4 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 py-1 text-left">
                            <button onClick={() => handleOpenEditModal(driver)}
                              className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-1.5 cursor-pointer">
                              <Edit className="w-3.5 h-3.5 text-zinc-500" /><span>Edit</span>
                            </button>
                            {isFullWriteAllowed && (
                            <button onClick={() => { setDriverToDelete(driver); setIsDeleteOpen(true); setActiveDropdown(null); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-zinc-800 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500/80" /><span>Delete</span>
                            </button>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredDrivers.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-zinc-500">
                    No drivers found. {isFullWriteAllowed ? "Add one to get started." : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{isEditMode ? "Edit Driver" : "Add New Driver"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSaveDriver} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Full Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">License Number *</label>
                  <input required value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})}
                    placeholder="DL-MH-12345" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">License Category *</label>
                  <select value={formData.license_category} onChange={e => setFormData({...formData, license_category: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option value="A">A – Motorcycle</option>
                    <option value="B">B – Light Vehicle</option>
                    <option value="C">C – Medium Vehicle</option>
                    <option value="D">D – Bus / Passenger</option>
                    <option value="E">E – Heavy Truck</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">License Expiry Date *</label>
                  <input required type="date" min={new Date().toISOString().split("T")[0]} value={formData.license_expiry_date} onChange={e => setFormData({...formData, license_expiry_date: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Contact Number *</label>
                  <input required value={formData.contact_number} onChange={e => setFormData({...formData, contact_number: e.target.value})}
                    placeholder="+91-9876543210" className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Safety Score (0–100)</label>
                  <input type="number" min="0" max="100" value={formData.safety_score} onChange={e => setFormData({...formData, safety_score: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  <option value="Available">Available</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition cursor-pointer shadow-md shadow-amber-500/20">
                  {isEditMode ? "Save Changes" : "Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && driverToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Driver</h3>
              <p className="text-sm text-zinc-400">Remove <span className="text-white font-semibold">{driverToDelete.name}</span> permanently?</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Keep</button>
              <button onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer shadow-md shadow-rose-600/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
