import React, { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, ShieldCheck, Flame, PieChart } from "lucide-react";

export default function AnalyticsView() {
  const [timeframe, setTimeframe] = useState("Month");

  // Mock data for analytics
  const fuelData = [
    { name: "VEH-001", efficiency: 6.2 },
    { name: "VEH-002", efficiency: 11.5 },
    { name: "VEH-003", efficiency: 8.0 },
    { name: "VEH-004", efficiency: 22.0 },
    { name: "VEH-005", efficiency: 7.1 },
    { name: "VEH-006", efficiency: 10.2 },
  ];

  const costBreakdown = [
    { category: "Fuel", amount: 1540.50, color: "bg-amber-500" },
    { category: "Maintenance", amount: 1350.00, color: "bg-blue-500" },
    { category: "Tolls", amount: 125.00, color: "bg-cyan-500" },
    { category: "Insurance", amount: 800.00, color: "bg-rose-500" },
    { category: "Other", amount: 95.00, color: "bg-zinc-500" },
  ];

  const utilizationTrend = [
    { day: "Mon", rate: 82 },
    { day: "Tue", rate: 85 },
    { day: "Wed", rate: 87 },
    { day: "Thu", rate: 84 },
    { day: "Fri", rate: 90 },
    { day: "Sat", rate: 76 },
    { day: "Sun", rate: 70 },
  ];

  const safetyLeaderboard = [
    { name: "Sarah Martinez", score: 98 },
    { name: "Alex Johnson", score: 96 },
    { name: "Elena Rostova", score: 95 },
    { name: "Jordan Brooks", score: 91 },
    { name: "David Kim", score: 89 },
  ];

  const totalCost = costBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Analytics</h1>
          <p className="text-sm text-zinc-400">Interactive trends, efficiency metrics, and safety score cards.</p>
        </div>
        <div className="flex bg-zinc-950 border border-zinc-850 rounded-lg p-0.5">
          {["Week", "Month", "Year"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                timeframe === t 
                  ? "bg-amber-500 text-zinc-950" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Fuel Efficiency (Bar Chart) */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> Fuel Efficiency (km/l)
            </h3>
            <span className="text-xs text-zinc-400">Filtered by Vehicle</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="relative pt-4 h-48 w-full flex items-end justify-between border-b border-zinc-800">
            {fuelData.map((d, index) => {
              const maxVal = 25; // max scale
              const heightPercent = (d.efficiency / maxVal) * 100;
              return (
                <div key={d.name} className="flex-1 flex flex-col items-center group cursor-pointer">
                  <div className="relative w-8 bg-zinc-800 rounded-t-md overflow-hidden flex items-end h-32 group-hover:bg-zinc-700/60 transition-colors">
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className="w-full bg-amber-500 rounded-t-md group-hover:bg-amber-400 transition-all duration-500"
                    />
                    {/* Tooltip */}
                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-1 bg-zinc-950 text-white text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 font-semibold pointer-events-none transition-all">
                      {d.efficiency}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-2 font-mono">{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Fleet Utilization Trend (Area Chart) */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Fleet Utilization (%)
            </h3>
            <span className="text-xs text-zinc-400">Weekly Active Trend</span>
          </div>

          {/* SVG Line / Area Chart */}
          <div className="h-48 w-full relative flex flex-col justify-end">
            <svg viewBox="0 0 500 150" className="w-full h-36 overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#27272a" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#27272a" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#27272a" strokeWidth="0.5" strokeDasharray="4" />

              {/* Area */}
              <path
                d="M 10 150 L 10 70 L 90 60 L 170 52 L 250 65 L 330 40 L 410 80 L 490 90 L 490 150 Z"
                fill="url(#areaGrad)"
              />
              {/* Path Line */}
              <path
                d="M 10 70 L 90 60 L 170 52 L 250 65 L 330 40 L 410 80 L 490 90"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Data points */}
              {[
                {x: 10, y: 70}, {x: 90, y: 60}, {x: 170, y: 52},
                {x: 250, y: 65}, {x: 330, y: 40}, {x: 410, y: 80}, {x: 490, y: 90}
              ].map((pt, i) => (
                <circle 
                  key={i} 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="4" 
                  fill="#10b981" 
                  stroke="#18181b" 
                  strokeWidth="1.5"
                  className="cursor-pointer hover:r-6 transition-all"
                />
              ))}
            </svg>
            <div className="flex justify-between text-[10px] text-zinc-500 px-2 mt-2">
              {utilizationTrend.map(d => <span key={d.day}>{d.day}</span>)}
            </div>
          </div>
        </div>

        {/* Chart 3: Operational Cost breakdown (Donut / Visual Bar list) */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-500" /> Operational Cost Breakdown
            </h3>
            <span className="text-xs font-semibold text-zinc-300">Total: ${totalCost.toFixed(2)}</span>
          </div>

          <div className="space-y-3.5">
            {costBreakdown.map((item) => {
              const percentage = Math.round((item.amount / totalCost) * 100);
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      {item.category}
                    </span>
                    <span className="font-semibold">${item.amount.toFixed(2)} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      style={{ width: `${percentage}%` }} 
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Safety score Leaderboard */}
        <div className="p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Safety score Leaderboard
            </h3>
            <span className="text-xs text-zinc-400">Top Drivers</span>
          </div>

          <div className="space-y-3">
            {safetyLeaderboard.map((d, index) => {
              const maxScore = 100;
              const barPercent = (d.score / maxScore) * 100;
              return (
                <div key={d.name} className="flex items-center gap-3">
                  {/* Rank */}
                  <span className="text-xs font-bold text-zinc-500 w-4">#{index + 1}</span>
                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>{d.name}</span>
                      <span className="font-semibold text-emerald-400">{d.score} pts</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        style={{ width: `${barPercent}%` }} 
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
