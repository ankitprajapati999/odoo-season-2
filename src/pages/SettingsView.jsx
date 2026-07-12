import React, { useState } from "react";
import { Settings, Shield, Bell, Key, Save, CheckCircle } from "lucide-react";

export default function SettingsView() {
  const [speedLimit, setSpeedLimit] = useState("80");
  const [idleAlertTime, setIdleAlertTime] = useState("15");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Admin</h1>
        <p className="text-sm text-zinc-400">Configure global fleet parameters, threshold alerts, and integration credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Category Links */}
        <div className="md:col-span-1 p-4 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-2 h-fit">
          <button className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-amber-500 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Fleet Rules
          </button>
          <button className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition flex items-center gap-2 cursor-pointer">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition flex items-center gap-2 cursor-pointer">
            <Key className="w-4 h-4" /> Integration API Keys
          </button>
        </div>

        {/* Right Side: Settings Content Panels */}
        <div className="md:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" /> Fleet Safety & Control Rules
          </h3>
          <p className="text-xs text-zinc-400">Manage thresholds that trigger alerts and safety warnings in your fleet logs.</p>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Speed Limits */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">Fleet Speed Threshold (km/h)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="50" 
                  max="120"
                  value={speedLimit} 
                  onChange={(e) => setSpeedLimit(e.target.value)}
                  className="flex-1 accent-amber-500 cursor-pointer h-1 bg-zinc-800 rounded-lg"
                />
                <span className="text-xs font-mono font-bold text-white bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded w-16 text-center">
                  {speedLimit} km/h
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">Triggers an alert when a truck or van exceeds this speed on a trip.</p>
            </div>

            {/* Idle alerts */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Max Allowable Idle Time (mins)</label>
              <input
                type="number"
                value={idleAlertTime}
                onChange={(e) => setIdleAlertTime(e.target.value)}
                className="w-full max-w-[150px] px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Generates an efficiency alert when a vehicle is idle with ignition on.</p>
            </div>

            {/* Toggle alerts */}
            <div className="space-y-3 pt-3 border-t border-zinc-850">
              <label className="text-xs font-semibold text-zinc-300 block">Global Alert Methods</label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-zinc-300 font-medium block">Email Notifications</span>
                  <span className="text-[10px] text-zinc-500">Send summary reports and incidents to fleet managers.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer focus:outline-none ${
                    emailAlerts ? "bg-amber-500" : "bg-zinc-850"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-250 ${
                    emailAlerts ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-zinc-300 font-medium block">SMS Critical Alerts</span>
                  <span className="text-[10px] text-zinc-500">Ping dispatch operators instantly on safety collisions.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-250 cursor-pointer focus:outline-none ${
                    smsAlerts ? "bg-amber-500" : "bg-zinc-850"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-250 ${
                    smsAlerts ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-850 justify-between">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Settings updated successfully!
                </span>
              )}
              <div className="flex-1" />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
