import React, { useState } from "react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";

// Pages
import DashboardView from "./pages/DashboardView";
import VehiclesView from "./pages/VehiclesView";
import TripsView from "./pages/TripsView";
import DriversView from "./pages/DriversView";
import DispatchView from "./pages/DispatchView";
import MaintenanceView from "./pages/MaintenanceView";
import ExpensesView from "./pages/ExpensesView";
import AnalyticsView from "./pages/AnalyticsView";
import SettingsView from "./pages/SettingsView";

// Icons
import {
  LayoutDashboard,
  Truck,
  Compass,
  Users,
  Send,
  Wrench,
  DollarSign,
  BarChart3,
  Settings,
  Search,
  CheckCircle2,
  Shield,
  Activity
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarLinks = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Vehicles", icon: Truck },
    { name: "Trips", icon: Compass },
    { name: "Drivers", icon: Users },
    { name: "Dispatch", icon: Send },
    { name: "Maintenance", icon: Wrench },
    { name: "Fuel & Expenses", icon: DollarSign },
    { name: "Analytics", icon: BarChart3 },
    { name: "Settings", icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardView />;
      case "Vehicles":
        return <VehiclesView />;
      case "Trips":
        return <TripsView />;
      case "Drivers":
        return <DriversView />;
      case "Dispatch":
        return <DispatchView />;
      case "Maintenance":
        return <MaintenanceView />;
      case "Fuel & Expenses":
        return <ExpensesView />;
      case "Analytics":
        return <AnalyticsView />;
      case "Settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="dark min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      {/* 1. Signed Out View (Splash / Login Page) */}
      <Show when="signed-out">
        <div className="flex min-h-screen flex-col lg:flex-row bg-zinc-950 font-sans">
          
          {/* Left Hero Column */}
          <div className="flex-1 flex flex-col justify-between p-8 lg:p-16 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border-r border-zinc-900">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 p-2 rounded-xl text-zinc-950">
                <Truck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">TransitOps</h1>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold">Fleet OS v2.0</p>
              </div>
            </div>

            {/* Title / Description */}
            <div className="max-w-md my-12 lg:my-0 space-y-6">
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Fleet Tracking & Operations <span className="text-amber-500">Simplified.</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                A unified logistics control center for dispatches, maintenance, driver metrics, and cost management.
              </p>

              {/* Bullet Features */}
              <div className="space-y-3 pt-6">
                {[
                  { text: "Live dispatch & route monitoring", desc: "Track delays, delivery status, and scheduling" },
                  { text: "Driver safety profiles", desc: "Monitor safety scores, phone contacts, and logs" },
                  { text: "Maintenance logs & expenses", desc: "Calculate fuel efficiency, tolls, and repair costs" },
                  { text: "Reports & analytics charts", desc: "Visualize fleet utilization and operational costs" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{item.text}</p>
                      <p className="text-[10px] text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-[10px] text-zinc-650">
              © {new Date().getFullYear()} TransitOps Platform. All rights reserved.
            </div>
          </div>

          {/* Right Login Card Column */}
          <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950">
            <div className="w-full max-w-sm p-8 border rounded-2xl bg-zinc-900/60 border-zinc-850 backdrop-blur-md space-y-6 shadow-2xl shadow-black/60">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-white">Welcome back</h3>
                <p className="text-xs text-zinc-400">Please sign in to access your dashboard.</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <SignInButton mode="modal">
                  <button className="w-full py-3 text-xs font-bold text-zinc-950 bg-amber-500 rounded-xl hover:bg-amber-450 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-amber-500/10">
                    Sign In
                  </button>
                </SignInButton>

                <div className="flex items-center gap-2.5 my-3.5">
                  <hr className="flex-1 border-zinc-800" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-600">or</span>
                  <hr className="flex-1 border-zinc-800" />
                </div>

                <SignUpButton mode="modal">
                  <button className="w-full py-3 text-xs font-bold text-zinc-300 border border-zinc-800 rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer">
                    Create Admin Account
                  </button>
                </SignUpButton>
              </div>

              {/* RLS notice */}
              <div className="p-3 border rounded-lg bg-zinc-950/40 border-zinc-850 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Your session is encrypted via Clerk JWT and protected by PostgreSQL Row Level Security (RLS) policies.
                </p>
              </div>
            </div>
          </div>

        </div>
      </Show>

      {/* 2. Signed In Dashboard Layout */}
      <Show when="signed-in">
        <div className="flex min-h-screen bg-zinc-950 font-sans">
          
          {/* Sidebar */}
          <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between p-5 select-none shrink-0">
            <div className="space-y-6">
              {/* Logo / Header */}
              <div className="flex items-center gap-2 px-1">
                <div className="bg-amber-500 p-2 rounded-xl text-zinc-950">
                  <Truck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-md font-bold tracking-tight text-white">TransitOps</h2>
                  <p className="text-[9px] text-zinc-500 tracking-wider font-semibold uppercase">Platform Control</p>
                </div>
              </div>

              {/* Links */}
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  const LinkIcon = link.icon;
                  const isActive = activeTab === link.name;
                  return (
                    <button
                      key={link.name}
                      onClick={() => setActiveTab(link.name)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? "bg-zinc-900 text-amber-500 border-l-[3px] border-amber-500 rounded-l-none"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                      }`}
                    >
                      <LinkIcon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-zinc-500"}`} />
                      {link.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Bottom (User Account Details) */}
            <div className="pt-4 border-t border-zinc-900 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-tight">Operator Profile</p>
                    <p className="text-[10px] text-zinc-500 leading-none">Console operator</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-zinc-900/30 text-[9px] font-semibold text-emerald-500">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950 shrink-0">
              
              {/* Search Box */}
              <div className="relative w-64">
                <Search className="absolute w-4 h-4 left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Global registry search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs text-white border rounded-lg bg-zinc-900/40 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650"
                />
              </div>

              {/* Welcome Operator */}
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-full">
                  HQ Node: Active
                </span>
              </div>
            </header>

            {/* Scrollable Page Wrapper */}
            <main className="flex-1 overflow-y-auto p-8">
              <div className="max-w-[1600px] mx-auto">
                {renderActiveView()}
              </div>
            </main>
          </div>

        </div>
      </Show>
    </div>
  );
}