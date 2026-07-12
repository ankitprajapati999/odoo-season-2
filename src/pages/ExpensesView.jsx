import React, { useState, useEffect } from "react";
import { DollarSign, Flame, MoreVertical, Edit, Trash2, AlertTriangle } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

const EXPENSE_TYPES = ["Fuel", "Tolls", "Maintenance", "Permit", "Other"];

export default function ExpensesView({ role }) {
  const supabase = useSupabase();
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [expenseType, setExpenseType] = useState("Fuel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusMsg, setStatusMsg] = useState("");

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editForm, setEditForm] = useState({ vehicle_id: "", type: "Fuel", amount: "", description: "", date: "" });

  const isWriteAllowed = role === "Fleet Manager" || role === "Financial Analyst";

  async function reload() {
    const [e, v] = await Promise.all([
      fleetService.getExpenses(supabase),
      fleetService.getVehicles(supabase)
    ]);
    setExpenses(e || []); setVehicles(v || []);
    if (v && v.length > 0 && !selectedVehicle) setSelectedVehicle(v[0].id);
  }

  useEffect(() => {
    if (!supabase) return;
    async function init() { await reload(); setLoading(false); }
    init();
  }, [supabase]);

  const showMsg = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(""), 3500); };

  const handleOpenEdit = (expense) => {
    setSelectedExpense(expense);
    setEditForm({ vehicle_id: expense.vehicle_id, type: expense.type, amount: expense.amount, description: expense.description, date: expense.date || "" });
    setIsEditOpen(true); setActiveDropdown(null);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!selectedExpense) return;
    try {
      await fleetService.updateExpense(supabase, selectedExpense.id, {
        vehicle_id: editForm.vehicle_id, type: editForm.type,
        amount: parseFloat(editForm.amount) || 0.0,
        description: editForm.description,
        date: editForm.date || new Date().toISOString().split("T")[0]
      });
      await reload(); setIsEditOpen(false); setSelectedExpense(null);
      showMsg("💵 Expense record updated!");
    } catch (err) { showMsg(`❌ Error: ${err.message}`); }
  };

  const handleConfirmDelete = async () => {
    if (!selectedExpense) return;
    try {
      await fleetService.deleteExpense(supabase, selectedExpense.id);
      await reload(); setIsDeleteOpen(false); setSelectedExpense(null);
      showMsg("🗑️ Expense record deleted!");
    } catch (err) { showMsg(`❌ Error: ${err.message}`); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !amount) { showMsg("❌ Please fill in all fields."); return; }
    try {
      await fleetService.createExpense(supabase, {
        vehicle_id: selectedVehicle, type: expenseType,
        amount: parseFloat(amount) || 0.0,
        description: description || `${expenseType} expense`,
        date: expenseDate
      });
      await reload(); setAmount(""); setDescription("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      showMsg("💵 Expense logged successfully!");
    } catch (err) { showMsg(`❌ Error: ${err.message}`); }
  };

  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const fuelTotal = expenses.filter(i => i.type === "Fuel").reduce((sum, i) => sum + Number(i.amount), 0);
  const tollsTotal = expenses.filter(i => i.type === "Tolls").reduce((sum, i) => sum + Number(i.amount), 0);
  const maintTotal = expenses.filter(i => i.type === "Maintenance").reduce((sum, i) => sum + Number(i.amount), 0);
  const otherTotal = expenses.filter(i => ["Permit", "Other"].includes(i.type)).reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Fuel & Expense Management</h1>
        <p className="text-sm text-zinc-400">Track diesel refills, toll expenses, permit fees, and maintenance payouts.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Spend</div>
          <div className="mt-2 text-2xl font-bold text-white">${totalAmount.toFixed(2)}</div>
        </div>
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Fuel Total
          </div>
          <div className="mt-2 text-2xl font-bold text-white">${fuelTotal.toFixed(2)}</div>
        </div>
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tolls & Fees</div>
          <div className="mt-2 text-2xl font-bold text-white">${tollsTotal.toFixed(2)}</div>
        </div>
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Miscellaneous</div>
          <div className="mt-2 text-2xl font-bold text-white">${(maintTotal + otherTotal).toFixed(2)}</div>
        </div>
      </div>

      {statusMsg && (
        <div className="px-4 py-2 text-xs font-semibold text-center rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-200">{statusMsg}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Form */}
        <div className="lg:col-span-1 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" /> Record Expense
          </h3>
          <p className="text-xs text-zinc-400">Submit a fuel receipt or highway toll payment log.</p>

          {isWriteAllowed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Select Vehicle</label>
                <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
                  {vehicles.length === 0 && <option value="">No vehicles found</option>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Expense Category</label>
                  <select value={expenseType} onChange={e => setExpenseType(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer">
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Total Amount ($)</label>
                  <input type="number" step="0.01" required placeholder="85.50" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Description (optional)</label>
                <input type="text" placeholder="Highway I-45 toll pass" value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Date</label>
                <input type="date" required max={new Date().toISOString().split("T")[0]} min={new Date(Date.now() - 90*24*60*60*1000).toISOString().split("T")[0]} value={expenseDate} onChange={e => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer" />
              </div>
              <button type="submit" disabled={vehicles.length === 0}
                className="w-full py-2.5 text-xs font-bold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20">
                Log Expense
              </button>
            </form>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-xs space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-zinc-600" />
              <p>Only Fleet Managers and Financial Analysts can log expenses.</p>
            </div>
          )}
        </div>

        {/* Expense Logs */}
        <div className="lg:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white">Expense Logs</h3>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {expenses.map(expense => {
              const vehicle = vehicles.find(v => v.id === expense.vehicle_id);
              return (
                <div key={expense.id} className="p-3 border rounded-xl bg-zinc-950/60 border-zinc-850 hover:border-zinc-800 transition-all flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">{expense.type}</span>
                      <span className="text-xs font-medium text-white">{expense.description}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-zinc-500 font-mono">
                      <span>{vehicle?.registration_number || "Unknown"}</span>
                      <span>{expense.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">${Number(expense.amount).toFixed(2)}</span>
                    {isWriteAllowed && (
                      <div className="relative">
                        <button onClick={() => setActiveDropdown(activeDropdown === expense.id ? null : expense.id)}
                          className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeDropdown === expense.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-0 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                              <button onClick={() => handleOpenEdit(expense)}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer">
                                <Edit className="w-3.5 h-3.5 text-zinc-500" /><span>Edit</span>
                              </button>
                              <button onClick={() => { setSelectedExpense(expense); setIsDeleteOpen(true); setActiveDropdown(null); }}
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
              );
            })}
            {expenses.length === 0 && !loading && (
              <div className="py-10 text-center text-zinc-500 text-xs">No expenses logged yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Expense</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-zinc-400 hover:text-white text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Vehicle</label>
                <select value={editForm.vehicle_id} onChange={e => setEditForm({...editForm, vehicle_id: e.target.value})}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Type</label>
                  <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500">
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Amount ($)</label>
                  <input type="number" step="0.01" min="0" required value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Description</label>
                <input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Date</label>
                <input type="date" required max={new Date().toISOString().split("T")[0]} min={new Date(Date.now() - 90*24*60*60*1000).toISOString().split("T")[0]} value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-450 transition cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Expense</h3>
            <p className="text-sm text-zinc-400">Permanently remove this expense record?</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer">Keep</button>
              <button onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
