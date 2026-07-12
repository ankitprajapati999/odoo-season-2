import React, { useState, useEffect } from "react";
import { Wrench, AlertTriangle, CheckCircle, MoreVertical, Edit, Trash2, CalendarDays } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function MaintenanceView({ role }) {
  const supabase = useSupabase();
  const [maintenance, setMaintenance] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("info");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editForm, setEditForm] = useState({ vehicle_id: "", description: "", cost: "", start_date: "", end_date: "", status: "Active" });
  const [filterStatus, setFilterStatus] = useState("All");

  const isWriteAllowed = role === "Fleet Manager" || role === "Safety Officer";

  async function reload() {
    const [m, v] = await Promise.all([
      fleetService.getMaintenance(supabase),
      fleetService.getVehicles(supabase)
    ]);
    setMaintenance(m || []);
    setVehicles(v || []);
    if (v && v.length > 0 && !selectedVehicle) setSelectedVehicle(v[0].id);
  }

  useEffect(() => {
    async function init() { await reload(); setLoading(false); }
    init();
  }, [supabase]);

  const showMsg = (msg, type = "info") => {
    setStatusMsg(msg); setStatusType(type);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !selectedVehicle || !cost) { showMsg("❌ Please fill in all fields.", "error"); return; }
    try {
      await fleetService.createMaintenance(supabase, {
        vehicle_id: selectedVehicle,
        description,
        cost: parseFloat(cost) || 0.0,
        start_date: startDate,
        status: "Active"
      });
      await reload();
      setDescription(""); setCost("");
      setStartDate(new Date().toISOString().split("T")[0]);
      showMsg("🛠️ Maintenance logged. Vehicle moved to In Shop.", "success");
    } catch (err) { showMsg(`❌ Error: ${err.message}`, "error"); }
  };

  const handleOpenEdit = (ticket) => {
    setSelectedTicket(ticket);
    setEditForm({ vehicle_id: ticket.vehicle_id, description: ticket.description, cost: ticket.cost, start_date: ticket.start_date || "", end_date: ticket.end_date || "", status: ticket.status });
    setIsEditOpen(true); setActiveDropdown(null);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await fleetService.updateMaintenance(supabase, selectedTicket.id, {
        vehicle_id: editForm.vehicle_id,
        description: editForm.description,
        cost: parseFloat(editForm.cost) || 0.0,
        start_date: editForm.start_date,
        end_date: editForm.end_date || null,
        status: editForm.status
      });
      await reload();
      setIsEditOpen(false); setSelectedTicket(null);
      showMsg("🛠️ Maintenance log updated!", "success");
    } catch (err) { showMsg(`❌ Error: ${err.message}`, "error"); }
  };

  const handleCloseTicket = async (ticket) => {
    try {
      await fleetService.updateMaintenance(supabase, ticket.id, { status: "Closed", end_date: new Date().toISOString().split("T")[0] });
      await reload();
      showMsg("✅ Ticket closed. Vehicle returned to Available.", "success");
    } catch (err) { showMsg(`❌ Error: ${err.message}`, "error"); }
    setActiveDropdown(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTicket) return;
    try {
      await fleetService.deleteMaintenance(supabase, selectedTicket.id);
      await reload();
      setIsDeleteOpen(false); setSelectedTicket(null);
      showMsg("🗑️ Maintenance log deleted.", "info");
    } catch (err) { showMsg(`❌ Error: ${err.message}`, "error"); }
  };

  const filteredMaintenance = filterStatus === "All" ? maintenance : maintenance.filter(m => m.status === filterStatus);

  const msgColor = statusType === "error" ? "text-rose-400 border-rose-800/50 bg-rose-950/30"
    : statusType === "success" ? "text-emerald-400 border-emerald-800/50 bg-emerald-950/30"
    : "text-zinc-300 border-zinc-800 bg-zinc-950";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Maintenance Manager</h1>
        <p className="text-sm text-zinc-400">Log repairs, track service histories, and audit operational maintenance costs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        <div className="lg:col-span-1 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" /> Log Maintenance Task
          </h3>
          <p className="text-xs text-zinc-400">Vehicle is automatically moved to "In Shop" when a log is created.</p>

          {isWriteAllowed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Select Vehicle</label>
                <select required value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name} ({v.status})</option>)}
                  {vehicles.length === 0 && <option value="">No vehicles found</option>}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Description of Issue</label>
                <textarea required rows="3" placeholder="Brake pad wear or oil leak detection..." value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Estimated Cost ($)</label>
                  <input type="number" step="0.01" min="0" required placeholder="250.00" value={cost} onChange={e => setCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Start Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer" />
                </div>
              </div>
              {statusMsg && (
                <div className={`p-3 rounded-lg text-xs font-semibold border text-center ${msgColor}`}>{statusMsg}</div>
              )}
              <button type="submit" disabled={vehicles.length === 0}
                className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20">
                Log Maintenance
              </button>
            </form>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-xs space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-zinc-600" />
              <p>Only Fleet Managers and Safety Officers can log maintenance.</p>
            </div>
          )}
        </div>

        {/* Maintenance Logs */}
        <div className="lg:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Maintenance Logs</h3>
              <p className="text-xs text-zinc-400">All logged maintenance entries.</p>
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredMaintenance.map(ticket => {
              const vehicle = vehicles.find(v => v.id === ticket.vehicle_id);
              const statusBadge = ticket.status === "Active"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
              return (
                <div key={ticket.id} className="p-4 border rounded-xl bg-zinc-950/60 border-zinc-850 hover:border-zinc-800 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-start gap-2">
                        <Wrench className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-white leading-snug">{ticket.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-zinc-400 ml-6">
                        <span className="font-mono text-[10px]">{vehicle?.registration_number || ticket.vehicle_id} — {vehicle?.name}</span>
                        <span className="flex items-center gap-1 text-[10px] font-mono">
                          <CalendarDays className="w-3 h-3 text-zinc-500" />
                          {ticket.start_date}{ticket.end_date && ` → ${ticket.end_date}`}
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold">${Number(ticket.cost).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${statusBadge}`}>{ticket.status}</span>
                      {isWriteAllowed && (
                        <div className="relative">
                          <button onClick={() => setActiveDropdown(activeDropdown === ticket.id ? null : ticket.id)}
                            className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeDropdown === ticket.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                              <div className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                                {ticket.status === "Active" && (
                                  <button onClick={() => handleCloseTicket(ticket)}
                                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                    <CheckCircle className="w-3.5 h-3.5" /><span>Close Ticket</span>
                                  </button>
                                )}
                                <button onClick={() => handleOpenEdit(ticket)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                  <Edit className="w-3.5 h-3.5 text-zinc-500" /><span>Edit</span>
                                </button>
                                <button onClick={() => { setSelectedTicket(ticket); setIsDeleteOpen(true); setActiveDropdown(null); }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500/80" /><span>Delete</span>
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
            {filteredMaintenance.length === 0 && !loading && (
              <div className="py-12 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 gap-2">
                <CheckCircle className="w-8 h-8 text-zinc-650" />
                <p className="text-xs">No maintenance logs found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Maintenance Log</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-zinc-400 hover:text-white text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSaveTicket} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Vehicle</label>
                <select value={editForm.vehicle_id} onChange={e => setEditForm({...editForm, vehicle_id: e.target.value})}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Description</label>
                <textarea required rows="3" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Cost ($)</label>
                  <input type="number" step="0.01" min="0" required value={editForm.cost} onChange={e => setEditForm({...editForm, cost: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Start Date</label>
                  <input type="date" required value={editForm.start_date} onChange={e => setEditForm({...editForm, start_date: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">End Date (optional)</label>
                  <input type="date" value={editForm.end_date} onChange={e => setEditForm({...editForm, end_date: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
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
      {isDeleteOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Maintenance Log</h3>
            <p className="text-sm text-zinc-400">Permanently delete this log? This action cannot be undone.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Keep Log</button>
              <button onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
