import React, { useState, useEffect } from "react";
import { Plus, Search, Users, ShieldAlert, Award, MoreVertical, Edit, Trash2, AlertTriangle } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function DriversView() {
  const supabase = useSupabase();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Add/Edit Driver Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newDriver, setNewDriver] = useState({
    id: "",
    name: "",
    license_number: "",
    safety_score: 95,
    status: "Active",
    phone: ""
  });

  // Meatballs Dropdown & Delete States
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  useEffect(() => {
    async function loadDrivers() {
      const data = await fleetService.getDrivers(supabase);
      setDrivers(data);
      setLoading(false);
    }
    loadDrivers();
  }, [supabase]);

  // Filtering Logic
  const filteredDrivers = drivers.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.phone && d.phone.includes(searchTerm));

    const matchStatus = selectedStatus === "All" || d.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setNewDriver({
      id: "",
      name: "",
      license_number: "",
      safety_score: 95,
      status: "Active",
      phone: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setIsEditMode(true);
    setNewDriver({
      id: driver.id,
      name: driver.name,
      license_number: driver.license_number,
      safety_score: driver.safety_score,
      status: driver.status,
      phone: driver.phone || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.id || !newDriver.name || !newDriver.license_number) return;

    if (isEditMode) {
      const result = await fleetService.updateDriver(supabase, newDriver.id, {
        name: newDriver.name,
        license_number: newDriver.license_number,
        safety_score: newDriver.safety_score,
        status: newDriver.status,
        phone: newDriver.phone
      });
      if (result) {
        const data = await fleetService.getDrivers(supabase);
        setDrivers(data);
        setIsModalOpen(false);
      }
    } else {
      const isDuplicate = drivers.some(
        (d) => d.id.toLowerCase() === newDriver.id.toLowerCase()
      );
      if (isDuplicate) {
        alert(`Driver ID "${newDriver.id}" already exists.`);
        return;
      }
      const result = await fleetService.createDriver(supabase, newDriver);
      if (result) {
        const data = await fleetService.getDrivers(supabase);
        setDrivers(data);
        setIsModalOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete) return;
    const result = await fleetService.deleteDriver(supabase, driverToDelete.id);
    if (result) {
      const data = await fleetService.getDrivers(supabase);
      setDrivers(data);
      setIsDeleteOpen(false);
      setDriverToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Drivers & Safety Profiles</h1>
          <p className="text-sm text-zinc-400">Track driver licenses, status, and automated safety scores.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Driver
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, license..."
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
            <option value="Off Duty">Off Duty</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                <th className="py-3.5 px-4">Driver ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">License No.</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Safety Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {filteredDrivers.map((driver) => {
                let scoreColor = "";
                let scoreBg = "";
                if (driver.safety_score >= 90) {
                  scoreColor = "text-emerald-400";
                  scoreBg = "bg-emerald-500/10 border-emerald-500/20";
                } else if (driver.safety_score >= 80) {
                  scoreColor = "text-amber-400";
                  scoreBg = "bg-amber-500/10 border-amber-500/20";
                } else {
                  scoreColor = "text-rose-400";
                  scoreBg = "bg-rose-500/10 border-rose-500/20";
                }

                let statusBadge = "";
                switch(driver.status) {
                  case "Active":
                    statusBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    break;
                  case "Off Duty":
                    statusBadge = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                    break;
                  case "On Leave":
                    statusBadge = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                    break;
                  default:
                    statusBadge = "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
                }

                return (
                  <tr key={driver.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-4 px-4 font-mono font-medium text-white">{driver.id}</td>
                    <td className="py-4 px-4 font-medium flex items-center gap-2 mt-1">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{driver.name}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-400">{driver.license_number}</td>
                    <td className="py-4 px-4">{driver.phone || "N/A"}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${scoreBg} ${scoreColor}`}>
                          <Award className="w-3 h-3" /> {driver.safety_score}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${statusBadge}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === driver.id ? null : driver.id)}
                        className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdown === driver.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)} 
                          />
                          <div className="absolute right-4 mt-2 w-28 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                            <button
                              onClick={() => {
                                handleOpenEditModal(driver);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setDriverToDelete(driver);
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
              {filteredDrivers.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-zinc-500">
                    No drivers found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{isEditMode ? "Edit Driver Details" : "Add New Driver"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white font-semibold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Driver ID (e.g. DRV-007)</label>
                <input
                  type="text"
                  required
                  disabled={isEditMode}
                  placeholder="DRV-007"
                  value={newDriver.id}
                  onChange={(e) => setNewDriver({ ...newDriver, id: e.target.value })}
                  className={`w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-655 ${isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Arthur Dent"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-655"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-TEX-103"
                    value={newDriver.license_number}
                    onChange={(e) => setNewDriver({ ...newDriver, license_number: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-655"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Safety Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newDriver.safety_score}
                    onChange={(e) => setNewDriver({ ...newDriver, safety_score: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Phone</label>
                  <input
                    type="text"
                    placeholder="+1-555-0100"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-655"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Status</label>
                  <select
                    value={newDriver.status}
                    onChange={(e) => setNewDriver({ ...newDriver, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Leave">On Leave</option>
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
                  {isEditMode ? "Save Changes" : "Add Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && driverToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Driver</h3>
              <p className="text-sm text-zinc-400">
                Are you sure you want to delete driver <strong>{driverToDelete.name}</strong> (<code>{driverToDelete.id}</code>)? This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                Keep Driver
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
