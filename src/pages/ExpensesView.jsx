import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Flame, AlertCircle, TrendingDown, MoreVertical, Edit, Trash2, AlertTriangle } from "lucide-react";
import fleetService from "../services/fleetService";
import { useSupabase } from "../auth/supabase";

export default function ExpensesView() {
  const supabase = useSupabase();
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [expenseType, setExpenseType] = useState("Fuel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Meatballs Dropdown & Modal States
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [editForm, setEditForm] = useState({
    vehicle_id: "",
    type: "Fuel",
    amount: "",
    description: ""
  });

  useEffect(() => {
    async function loadData() {
      const e = await fleetService.getExpenses(supabase);
      const v = await fleetService.getVehicles(supabase);
      setExpenses(e);
      setVehicles(v);

      if (v.length > 0) setSelectedVehicle(v[0].id);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const handleOpenEdit = (expense) => {
    setSelectedExpense(expense);
    setEditForm({
      vehicle_id: expense.vehicle_id,
      type: expense.type,
      amount: expense.amount,
      description: expense.description
    });
    setIsEditOpen(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!selectedExpense) return;

    const updates = {
      vehicle_id: editForm.vehicle_id,
      type: editForm.type,
      amount: parseFloat(editForm.amount) || 0.0,
      description: editForm.description
    };

    const result = await fleetService.updateExpense(supabase, selectedExpense.id, updates);
    if (result) {
      const data = await fleetService.getExpenses(supabase);
      setExpenses(data);
      setIsEditOpen(false);
      setSelectedExpense(null);
      setStatusMsg("💵 Expense record updated!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedExpense) return;
    const result = await fleetService.deleteExpense(supabase, selectedExpense.id);
    if (result) {
      const data = await fleetService.getExpenses(supabase);
      setExpenses(data);
      setIsDeleteOpen(false);
      setSelectedExpense(null);
      setStatusMsg("🗑️ Expense record deleted!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !amount) {
      setStatusMsg("❌ Please fill in all fields.");
      return;
    }

    const newExpense = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      vehicle_id: selectedVehicle,
      type: expenseType,
      amount: parseFloat(amount) || 0.0,
      description: description || `${expenseType} cost`,
      date: new Date().toISOString().split('T')[0]
    };

    const result = await fleetService.createExpense(supabase, newExpense);
    if (result) {
      const updatedExpenses = await fleetService.getExpenses(supabase);
      setExpenses(updatedExpenses);
      setAmount("");
      setDescription("");
      setStatusMsg("💵 Expense logged successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  // Grouped Totals
  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const fuelTotal = expenses.filter(item => item.type === "Fuel").reduce((sum, item) => sum + Number(item.amount), 0);
  const tollsTotal = expenses.filter(item => item.type === "Tolls").reduce((sum, item) => sum + Number(item.amount), 0);
  const maintTotal = expenses.filter(item => item.type === "Maintenance").reduce((sum, item) => sum + Number(item.amount), 0);
  const otherTotal = expenses.filter(item => ["Insurance", "Other"].includes(item.type)).reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-4">
        <img src="/favicon.png" className="w-12 h-12 animate-spin drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" alt="Loading" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading expenses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Fuel & Expense Management</h1>
        <p className="text-sm text-zinc-400">Track diesel refills, toll expenses, and maintenance payouts.</p>
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Outflow */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Outflow</div>
          <div className="mt-2 text-2xl font-bold text-white">${totalAmount.toFixed(2)}</div>
        </div>

        {/* Fuel Costs */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Fuel Total
          </div>
          <div className="mt-2 text-2xl font-bold text-white">${fuelTotal.toFixed(2)}</div>
        </div>

        {/* Tolls */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tolls & Fees</div>
          <div className="mt-2 text-2xl font-bold text-white">${tollsTotal.toFixed(2)}</div>
        </div>

        {/* Maintenance */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Maintenance Bills</div>
          <div className="mt-2 text-2xl font-bold text-white">${maintTotal.toFixed(2)}</div>
        </div>

        {/* Miscellaneous */}
        <div className="p-4 border rounded-xl bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Miscellaneous</div>
          <div className="mt-2 text-2xl font-bold text-white">${otherTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Expense Form (Left 1 Column) */}
        <div className="lg:col-span-1 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" /> Record Expense
          </h3>
          <p className="text-xs text-zinc-400">Submit a fuel purchase receipt or highway toll payment log.</p>

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Expense Category</label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Fuel">Fuel</option>
                  <option value="Tolls">Tolls</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Total Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="85.50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Expense Description</label>
              <input
                type="text"
                placeholder="Full unleaded tank refuel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-zinc-650"
              />
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
              Log Expense
            </button>
          </form>
        </div>

        {/* Expenses List (Right 2 Columns) */}
        <div className="lg:col-span-2 p-6 border rounded-xl bg-zinc-900/40 border-zinc-800/80 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white">Expense Records</h3>
          <p className="text-xs text-zinc-400">Audit listing of financial transactions for the active fleet.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-xs text-zinc-400 font-semibold bg-zinc-950/20">
                  <th className="py-3 px-4">Expense ID</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">{exp.id}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-350">{exp.vehicle_id}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        exp.type === "Fuel" 
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                          : exp.type === "Maintenance" 
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-zinc-700/20 text-zinc-300 border border-zinc-700/30"
                      }`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[150px] truncate" title={exp.description}>{exp.description}</td>
                    <td className="py-3.5 px-4">{exp.date}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">${Number(exp.amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-center relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === exp.id ? null : exp.id)}
                        className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdown === exp.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)} 
                          />
                          <div className="absolute right-4 mt-2 w-28 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1 text-left">
                            <button
                              onClick={() => {
                                handleOpenEdit(exp);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedExpense(exp);
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
                ))}
                {expenses.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-zinc-500">
                      No expenses logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Expense Modal */}
      {isEditOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Expense Record</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-white font-semibold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Expense Category</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Fuel">Fuel</option>
                    <option value="Tolls">Tolls</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-medium">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Expense Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-white border rounded-lg bg-zinc-950 border-zinc-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
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
      {isDeleteOpen && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 border rounded-2xl bg-zinc-900 border-zinc-800 shadow-xl text-center space-y-4">
            <div className="h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Expense Record</h3>
              <p className="text-sm text-zinc-400">
                Are you sure you want to delete expense record <strong>{selectedExpense.id}</strong>? This action is permanent.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                Keep Record
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
