import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, ShieldCheck, Flame, Download, Truck } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function AnalyticsView({ role }) {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    async function loadAll() {
      const [v, d, t, e, f, m] = await Promise.all([
        fleetService.getVehicles(supabase),
        fleetService.getDrivers(supabase),
        fleetService.getTrips(supabase),
        fleetService.getExpenses(supabase),
        fleetService.getFuelLogs(supabase),
        fleetService.getMaintenance(supabase)
      ]);
      setVehicles(v || []); setDrivers(d || []); setTrips(t || []);
      setExpenses(e || []); setFuelLogs(f || []); setMaintenance(m || []);
      setLoading(false);
    }
    loadAll();
  }, [supabase]);

  // ── Derived Analytics ──────────────────────────────────────────────────────
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalMaintCost = maintenance.reduce((sum, m) => sum + Number(m.cost), 0);
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);
  const grandTotal = totalFuelCost + totalMaintCost + totalExpenses;

  const costCategories = [
    { label: "Fuel (Logs)", amount: totalFuelCost, color: "bg-amber-500", text: "text-amber-400" },
    { label: "Maintenance", amount: totalMaintCost, color: "bg-rose-500", text: "text-rose-400" },
    { label: "Expenses", amount: totalExpenses, color: "bg-blue-500", text: "text-blue-400" }
  ];

  const activeVehicles = vehicles.filter(v => v.status !== "Retired");
  const onTripCount = vehicles.filter(v => v.status === "On Trip").length;
  const utilization = activeVehicles.length > 0 ? Math.round((onTripCount / activeVehicles.length) * 100) : 0;

  const completedTrips = trips.filter(t => t.status === "Completed");

  const tripStatusCounts = {
    Draft: trips.filter(t => t.status === "Draft").length,
    Dispatched: trips.filter(t => t.status === "Dispatched").length,
    Completed: trips.filter(t => t.status === "Completed").length,
    Cancelled: trips.filter(t => t.status === "Cancelled").length
  };
  const maxTripCount = Math.max(...Object.values(tripStatusCounts), 1);

  const safetyLeaderboard = [...drivers].sort((a, b) => Number(b.safety_score) - Number(a.safety_score)).slice(0, 8);

  const vehicleROI = vehicles.map(v => {
    const vTrips = completedTrips.filter(t => t.vehicle_id === v.id);
    const totalDistance = vTrips.reduce((sum, t) => sum + Number(t.actual_distance || t.planned_distance || 0), 0);
    const vMaint = maintenance.filter(m => m.vehicle_id === v.id).reduce((sum, m) => sum + Number(m.cost), 0);
    const vFuel = fuelLogs.filter(f => f.vehicle_id === v.id).reduce((sum, f) => sum + Number(f.cost), 0);
    const vExp = expenses.filter(e => e.vehicle_id === v.id).reduce((sum, e) => sum + Number(e.amount), 0);
    const totalCost = vMaint + vFuel + vExp;
    const roi = Number(v.acquisition_cost) > 0 ? (((totalDistance * 2) - totalCost) / Number(v.acquisition_cost) * 100) : 0;
    return { ...v, tripsCount: vTrips.length, totalDistance: Math.round(totalDistance), totalCost: Math.round(totalCost), roi: roi.toFixed(1) };
  }).sort((a, b) => b.tripsCount - a.tripsCount);

  const handleExportCSV = () => {
    const headers = ["Reg Number", "Name", "Type", "Status", "Trips", "Distance (km)", "Cost ($)", "ROI (%)"];
    const rows = vehicleROI.map(v => [v.registration_number, v.name, v.type, v.status, v.tripsCount, v.totalDistance, v.totalCost, v.roi]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fleet_analytics_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-zinc-400 text-sm">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Analytics</h1>
          <p className="text-sm text-zinc-400">Live fleet performance metrics, cost breakdowns, and safety scores.</p>
        </div>
        <button onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-all cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Fleet Utilization</div>
          <div className="mt-2 text-3xl font-bold text-amber-400">{utilization}%</div>
          <div className="text-[10px] text-zinc-500 mt-1">{onTripCount} of {activeVehicles.length} active on trip</div>
        </div>
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Completed Trips</div>
          <div className="mt-2 text-3xl font-bold text-emerald-400">{completedTrips.length}</div>
          <div className="text-[10px] text-zinc-500 mt-1">{trips.length} total logged</div>
        </div>
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Fleet Cost</div>
          <div className="mt-2 text-3xl font-bold text-rose-400">${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="text-[10px] text-zinc-500 mt-1">Fuel + Maintenance + Expenses</div>
        </div>
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Avg Safety Score</div>
          <div className="mt-2 text-3xl font-bold text-blue-400">
            {drivers.length > 0 ? (drivers.reduce((sum, d) => sum + Number(d.safety_score), 0) / drivers.length).toFixed(0) : "—"}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Across {drivers.length} drivers</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Status Bar Chart */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" /> Trip Status Breakdown
          </h3>
          <div className="relative pt-2 h-48 w-full flex items-end justify-around gap-2 border-b border-zinc-800 pb-2">
            {Object.entries(tripStatusCounts).map(([status, count]) => {
              const heightPct = (count / maxTripCount) * 100;
              const colors = { Draft: "bg-zinc-500", Dispatched: "bg-emerald-500", Completed: "bg-blue-500", Cancelled: "bg-rose-500" };
              return (
                <div key={status} className="flex-1 flex flex-col items-center group cursor-pointer">
                  <div className="relative w-10 bg-zinc-800 rounded-t-md overflow-hidden flex items-end h-32">
                    <div style={{ height: `${Math.max(heightPct, count > 0 ? 5 : 0)}%` }}
                      className={`w-full ${colors[status]} rounded-t-md transition-all duration-500`} />
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-1 bg-zinc-950 text-white text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 font-semibold pointer-events-none whitespace-nowrap">
                      {count} trips
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-2">{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" /> Cost Breakdown
          </h3>
          <div className="space-y-3">
            {costCategories.map(cat => {
              const pct = grandTotal > 0 ? ((cat.amount / grandTotal) * 100).toFixed(1) : 0;
              return (
                <div key={cat.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${cat.text}`}>{cat.label}</span>
                    <span className="text-zinc-300 font-mono">${cat.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs font-bold">
              <span className="text-zinc-300">Grand Total</span>
              <span className="text-white font-mono">${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* Safety Leaderboard */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Driver Safety Leaderboard
          </h3>
          <div className="space-y-2.5">
            {safetyLeaderboard.length === 0 && <p className="text-xs text-zinc-500 text-center py-4">No driver data yet.</p>}
            {safetyLeaderboard.map((driver, i) => {
              const scoreColor = driver.safety_score >= 90 ? "text-emerald-400" : driver.safety_score >= 80 ? "text-amber-400" : "text-rose-400";
              const scoreBg = driver.safety_score >= 90 ? "bg-emerald-500/10 border-emerald-500/20" : driver.safety_score >= 80 ? "bg-amber-500/10 border-amber-500/20" : "bg-rose-500/10 border-rose-500/20";
              return (
                <div key={driver.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-xs font-bold ${i < 3 ? "text-amber-400" : "text-zinc-500"}`}>#{i + 1}</span>
                    <div>
                      <p className="text-xs font-medium text-white">{driver.name}</p>
                      <p className="text-[10px] text-zinc-500">Class {driver.license_category} • {driver.status}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${scoreColor} ${scoreBg}`}>{driver.safety_score} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Status Distribution */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" /> Fleet Status Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: "Available", color: "bg-emerald-500", textColor: "text-emerald-400" },
              { label: "On Trip", color: "bg-blue-500", textColor: "text-blue-400" },
              { label: "In Shop", color: "bg-rose-500", textColor: "text-rose-400" },
              { label: "Retired", color: "bg-zinc-500", textColor: "text-zinc-400" }
            ].map(({ label, color, textColor }) => {
              const count = vehicles.filter(v => v.status === label).length;
              const pct = vehicles.length > 0 ? ((count / vehicles.length) * 100).toFixed(1) : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${textColor}`}>{label}</span>
                    <span className="text-zinc-300 font-mono">{count} vehicles ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vehicle ROI Table */}
      <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-500" /> Vehicle Performance & ROI
          </h3>
          <span className="text-[10px] text-zinc-500">ROI = (Distance × 2 − Cost) / Acquisition Cost</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Trips</th>
                <th className="py-3 px-3">Distance (km)</th>
                <th className="py-3 px-3">Total Cost ($)</th>
                <th className="py-3 px-3">Acq. Cost ($)</th>
                <th className="py-3 px-3">Est. ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {vehicleROI.map(v => {
                const roiColor = Number(v.roi) > 5 ? "text-emerald-400" : Number(v.roi) < 0 ? "text-rose-400" : "text-amber-400";
                return (
                  <tr key={v.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-medium text-white">{v.name}</div>
                      <div className="font-mono text-[10px] text-zinc-500">{v.registration_number}</div>
                    </td>
                    <td className="py-3 px-3">{v.type}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        v.status === "Available" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        v.status === "On Trip"   ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        v.status === "In Shop"   ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}>{v.status}</span>
                    </td>
                    <td className="py-3 px-3 font-mono">{v.tripsCount}</td>
                    <td className="py-3 px-3 font-mono">{v.totalDistance.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono">${v.totalCost.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono">${Number(v.acquisition_cost).toLocaleString()}</td>
                    <td className={`py-3 px-3 font-mono font-bold ${roiColor}`}>{v.roi}%</td>
                  </tr>
                );
              })}
              {vehicleROI.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-zinc-500">No vehicle data to analyze.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
