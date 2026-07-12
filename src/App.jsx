import React, { useState, useEffect } from "react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useAuth
} from "@clerk/react";

import { useSupabase } from "./auth/supabase";
import database from "./services/database";

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

// Sidebar Links Gating based on role
const getSidebarLinks = (role) => {
  const common = [
    { name: "Dashboard", icon: LayoutDashboard },
  ];
  const end = [
    { name: "Settings", icon: Settings }
  ];

  switch (role) {
    case 'Fleet Manager':
      return [
        ...common,
        { name: "Vehicles", icon: Truck },
        { name: "Drivers", icon: Users },
        { name: "Analytics", icon: BarChart3 },
        ...end
      ];
    case 'Driver': // Dispatcher
      return [
        ...common,
        { name: "Vehicles", icon: Truck },
        { name: "Trips", icon: Compass },
        { name: "Dispatch", icon: Send },
        ...end
      ];
    case 'Safety Officer':
      return [
        ...common,
        { name: "Drivers", icon: Users },
        { name: "Trips", icon: Compass },
        { name: "Maintenance", icon: Wrench },
        ...end
      ];
    case 'Financial Analyst':
      return [
        ...common,
        { name: "Vehicles", icon: Truck },
        { name: "Fuel & Expenses", icon: DollarSign },
        { name: "Analytics", icon: BarChart3 },
        ...end
      ];
    default:
      return [...common, ...end];
  }
};

function DashboardShell() {
  const supabase = useSupabase();
  const { user } = useUser();
  
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!supabase || !user) return;
    async function checkProfile() {
      try {
        const data = await database.getById(supabase, "profiles", user.id);
        if (data) {
          setProfile(data);
          const links = getSidebarLinks(data.role);
          if (links.length > 0) setActiveTab(links[0].name);
        } else {
          // Profile does not exist (New Sign Up)
          // Read selected role from localStorage
          const selectedRole = localStorage.getItem("selected_role") || "Fleet Manager";
          const dbRole = selectedRole === "Dispatcher" ? "Driver" : selectedRole;
          const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "";
          
          const newProfile = {
            id: user.id,
            email: userEmail,
            full_name: user.fullName || "Operator",
            role: dbRole
          };
          const result = await database.create(supabase, "profiles", newProfile);
          setProfile(result);
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(result));
          const links = getSidebarLinks(result.role);
          if (links.length > 0) setActiveTab(links[0].name);
        }
      } catch (error) {
        console.warn("Profiles table check failed. Falling back to local storage profile.", error.message);
        const cached = localStorage.getItem(`profile_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setProfile(parsed);
          const links = getSidebarLinks(parsed.role);
          if (links.length > 0) setActiveTab(links[0].name);
        } else {
          // Create a mock local profile for hackathon offline demo
          const selectedRole = localStorage.getItem("selected_role") || "Fleet Manager";
          const dbRole = selectedRole === "Dispatcher" ? "Driver" : selectedRole;
          const fallbackProfile = {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "user@transitops.com",
            full_name: user.fullName || "Operator",
            role: dbRole
          };
          setProfile(fallbackProfile);
          localStorage.setItem(`profile_${user.id}`, JSON.stringify(fallbackProfile));
          const links = getSidebarLinks(dbRole);
          if (links.length > 0) setActiveTab(links[0].name);
        }
      } finally {
        setLoadingProfile(false);
      }
    }
    checkProfile();
  }, [user, supabase]);

  const renderActiveView = () => {
    const role = profile?.role;
    switch (activeTab) {
      case "Dashboard":
        return <DashboardView role={role} />;
      case "Vehicles":
        return <VehiclesView role={role} />;
      case "Trips":
        return <TripsView role={role} />;
      case "Drivers":
        return <DriversView role={role} />;
      case "Dispatch":
        return <DispatchView role={role} />;
      case "Maintenance":
        return <MaintenanceView role={role} />;
      case "Fuel & Expenses":
        return <ExpensesView role={role} />;
      case "Analytics":
        return <AnalyticsView role={role} />;
      case "Settings":
        return <SettingsView role={role} />;
      default:
        return <DashboardView role={role} />;
    }
  };

  if (!supabase || loadingProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
        <Activity className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider">Syncing Fleet profile...</span>
      </div>
    );
  }

  const sidebarLinks = getSidebarLinks(profile?.role);
  const displayRoleLabel = profile?.role === "Driver" ? "Dispatcher" : profile?.role;

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between p-5 select-none shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <div className="bg-amber-500 p-2 rounded-xl text-zinc-950">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-md font-bold tracking-tight text-white">TransitOps</h2>
              <p className="text-[9px] text-zinc-500 tracking-wider font-semibold uppercase">Platform Control</p>
            </div>
          </div>

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

        <div className="pt-4 border-t border-zinc-900 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <UserButton afterSignOutUrl="/" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">{profile?.full_name}</p>
                <p className="text-[9px] text-amber-500 font-bold uppercase">{displayRoleLabel}</p>
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
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950 shrink-0">
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

          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-full">
              HQ Node: Active
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const [signupRole, setSignupRole] = useState("Fleet Manager");
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    // Ensure a default role is always cached
    if (!localStorage.getItem("selected_role")) {
      localStorage.setItem("selected_role", "Fleet Manager");
    } else {
      setSignupRole(localStorage.getItem("selected_role"));
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-4">
        <Activity className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider">Syncing secure node...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="dark min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
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
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Fleet Tracking & Operations <span className="text-amber-500">Simplified.</span>
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  A unified logistics control center for dispatches, maintenance, driver metrics, and cost management.
                </p>
              </div>

              {/* Bullet Features */}
              <div className="space-y-3 pt-6 border-t border-zinc-900">
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
              
              {!isSigningUp ? (
                /* SIGN IN VIEW (No dropdown) */
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight text-white">Welcome back</h3>
                    <p className="text-xs text-zinc-400">Please sign in to access your dashboard.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <SignInButton mode="modal">
                      <button className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-amber-500/20">
                        Sign In
                      </button>
                    </SignInButton>

                    <p className="text-xs text-zinc-500 text-center">
                      Don't have an account?{" "}
                      <button
                        onClick={() => setIsSigningUp(true)}
                        className="text-amber-500 hover:underline font-semibold cursor-pointer"
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* SIGN UP VIEW (Contains dropdown role selector) */
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight text-white">Create Account</h3>
                    <p className="text-xs text-zinc-400">Select your active role to register.</p>
                  </div>

                  {/* Dropdown Role Selector */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-zinc-400">Select Role</label>
                    <select
                      value={signupRole}
                      onChange={(e) => {
                        setSignupRole(e.target.value);
                        localStorage.setItem("selected_role", e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Safety Officer">Safety Officer</option>
                      <option value="Financial Analyst">Financial Analyst</option>
                    </select>
                  </div>

                  <div className="space-y-4 pt-2">
                    <SignUpButton mode="modal">
                      <button className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-amber-500/20">
                        Sign Up
                      </button>
                    </SignUpButton>

                    <p className="text-xs text-zinc-500 text-center">
                      Already have an account?{" "}
                      <button
                        onClick={() => setIsSigningUp(false)}
                        className="text-amber-500 hover:underline font-semibold cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* RLS notice */}
              <div className="p-3 border rounded-lg bg-zinc-950/40 border-zinc-850 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-550 leading-relaxed">
                  Your session is protected by Clerk and PostgreSQL Row Level Security (RLS) policies.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      <DashboardShell />
    </div>
  );
}