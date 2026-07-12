import React, { useState, useEffect } from "react";
import { Wrench, Plus, AlertTriangle, CheckCircle, Clock, MoreVertical, Edit, Trash2 } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function MaintenanceView() {
  const supabase = useSupabase();
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [cost, setCost] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Meatballs Dropdown & Modal States
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [editForm, setEditForm] = useState({
    vehicle_id: "",
    issue: "",
    priority: "Medium",
    cost: "",
    status: "Pending"
  });

  useEffect(() => {
    async function loadData() {
      const m = await fleetService.getMaintenance(supabase);
      const v = await fleetService.getVehicles(supabase);
      setMaintenance(m);
      setVehicles(v);

      if (v.length > 0) setSelectedVehicle(v[0].id);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleOpenEdit = (ticket) => {
    setSelectedTicket(ticket);
    setEditForm({
      vehicle_id: ticket.vehicle_id,
      issue: ticket.issue,
      priority: ticket.priority,
      cost: ticket.cost,
      status: ticket.status
    });
    setIsEditOpen(true);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const updates = {
      vehicle_id: editForm.vehicle_id,
      issue: editForm.issue,
      priority: editForm.priority,
      cost: parseFloat(editForm.cost) || 0.0,
      status: editForm.status
    };

    const result = await fleetService.updateMaintenance(supabase, selectedTicket.id, updates);
    if (result) {
      const data = await fleetService.getMaintenance(supabase);
      setMaintenance(data);
      setIsEditOpen(false);
      setSelectedTicket(null);
      setStatusMsg("🛠️ Ticket updated successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTicket) return;
    const result = await fleetService.deleteMaintenance(supabase, selectedTicket.id);
    if (result) {
      const data = await fleetService.getMaintenance(supabase);
      setMaintenance(data);
      setIsDeleteOpen(false);
      setSelectedTicket(null);
      setStatusMsg("🗑️ Ticket deleted successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue || !selectedVehicle || !cost) {
      setStatusMsg("❌ Please fill in all fields.");
      return;
    }

    const newMaint = {
      id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
      vehicle_id: selectedVehicle,
      issue,
      priority,
      status: "Pending",
      cost: parseFloat(cost) || 0.0,
      date: new Date().toISOString().split('T')[0]
    };

    const result = await fleetService.createMaintenance(supabase, newMaint);
    if (result) {
      const updatedMaint = await fleetService.getMaintenance(supabase);
      setMaintenance(updatedMaint);
      setIssue("");
      setCost("");
      setStatusMsg("🛠️ Maintenance ticket logged successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Maintenance Manager</h1>
        <p className="text-sm text-zinc-400">Log repairs, track service histories, and audit operational maintenance costs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Log Form (Left 1 Column) */}
        <div className="lg:col-span-1 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" /> Log Maintenance Task
          </h3>
          <p className="text-xs text-zinc-400">Record a mechanical issue or scheduled servicing for a vehicle.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Select Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} - {v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Description of Issue</label>
              <textarea
                required
                rows="3"
                placeholder="Brake pad wear or oil leak detection..."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Estimated Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650"
                />
              </div>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-lg text-xs font-semibold bg-zinc-950 border border-zinc-850 text-center">
                {statusMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 active:scale-98 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Log Ticket
            </button>
          </form>
        </div>

        {/* Maintenance Logs Table (Right 2 Columns) */}
        <div className="lg:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Maintenance History</h3>
            <p className="text-xs text-zinc-400 mb-4">Chronological log of vehicle repair statuses and actions.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Issue</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
                  {maintenance.map((m) => {
                    let priorityColor = "";
                    switch (m.priority) {
                      case "Critical":
                        priorityColor = "text-rose-500 font-bold";
                        break;
                      case "High":
                        priorityColor = "text-rose-400";
                        break;
                      case "Medium":
                        priorityColor = "text-amber-400";
                        break;
                      default:
                        priorityColor = "text-zinc-400";
                    }

                    let statusBadge = "";
                    switch (m.status) {
                      case "Completed":
                        statusBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        break;
                      case "In Progress":
                        statusBadge = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                        break;
                      default:
                        statusBadge = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                    }

                    return (
                      <tr key={m.id} className="hover:bg-zinc-850/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-white">{m.id}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-350">{m.vehicle_id}</td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate" title={m.issue}>{m.issue}</td>
                        <td className={`py-3.5 px-4 ${priorityColor}`}>{m.priority}</td>
                        <td className="py-3.5 px-4 font-mono font-medium">${Number(m.cost).toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${statusBadge}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === m.id ? null : m.id)}
                            className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdown === m.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveDropdown(null)} 
                              />
                              <div className="absolute right-4 mt-2 w-28 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                                <button
                                  onClick={() => {
                                    handleOpenEdit(m);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTicket(m);
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
                  {maintenance.length === 0 && !loading && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-zinc-500">
                        No maintenance tickets logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Ticket Modal */}
      {isEditOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Maintenance Ticket</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-white font-semibold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Select Vehicle</label>
                <select
                  value={editForm.vehicle_id}
                  onChange={(e) => setEditForm({ ...editForm, vehicle_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.id} - {v.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Description of Issue</label>
                <textarea
                  required
                  rows="3"
                  value={editForm.issue}
                  onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.cost}
                    onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Ticket</h3>
              <p className="text-sm text-zinc-400">
                Are you sure you want to delete maintenance ticket <strong>{selectedTicket.id}</strong>? This action is permanent.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                Keep Ticket
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
