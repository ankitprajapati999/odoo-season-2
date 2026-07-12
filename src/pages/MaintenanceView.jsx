import React, { useState, useEffect } from "react";
import { Wrench, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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
                      </tr>
                    );
                  })}
                  {maintenance.length === 0 && !loading && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-zinc-500">
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
    </div>
  );
}
