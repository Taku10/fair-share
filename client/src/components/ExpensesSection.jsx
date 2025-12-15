import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../api";

function ExpensesSection() {
  const [expenses, setExpenses] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [balances, setBalances] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [error, setError] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  async function fetchRoommates() {
    const res = await apiGet("/roommates");
    setRoommates(Array.isArray(res.data) ? res.data : []);
  }

  async function fetchExpenses() {
    const res = await apiGet("/expenses");
    setExpenses(Array.isArray(res.data) ? res.data : []);
  }

  async function fetchBalances() {
    const res = await apiGet("/expenses/balances/summary");
    setBalances(Array.isArray(res.data) ? res.data : []);
  }

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchRoommates(), fetchExpenses(), fetchBalances()]);
      } catch (err) {
        console.error(err);
        setError("Failed to load expenses data");
      }
    };
    load();
  }, []);

  function toggleSplitBetween(id) {
    setSplitBetween((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!description.trim() || !amount || !paidBy || splitBetween.length === 0) {
      setError("Fill all fields and pick roommates to split between");
      return;
    }

    try {
      const payload = {
        description,
        amount: parseFloat(amount),
        paidBy,
        splitBetween,
      };

      let res;
      if (editingExpenseId) {
        res = await apiPut(`/expenses/${editingExpenseId}`, payload);
        setExpenses((prev) => prev.map((e) => (e._id === editingExpenseId ? res.data : e)));
      } else {
        res = await apiPost("/expenses", payload);
        setExpenses((prev) => [res.data, ...prev]);
      }

      setDescription("");
      setAmount("");
      setPaidBy("");
      setSplitBetween([]);
      setEditingExpenseId(null);
      setError("");
      fetchBalances();
    } catch (err) {
      console.error(err);
      setError("Failed to add expense");
    }
  }

  async function handleDeleteExpense(id) {
    try {
      await apiDelete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      fetchBalances();
    } catch (err) {
      console.error(err);
      setError("Failed to delete expense");
    }
  }

  return (
    <div className="section">
      <h2>Expenses</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "1.5rem" }}>
        Add roommates in the Roommates tab first, then log expenses here and see who owes who.
      </p>

      <form onSubmit={handleAddExpense} className="form-group" style={{ flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Description (e.g. Rent, Wi-Fi)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: "200px" }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            style={{ flex: 0, minWidth: "100px" }}
          />
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="form-select"
            style={{ flex: 0, minWidth: "150px" }}
          >
            <option value="">Paid by...</option>
            {roommates.map((rm) => (
              <option key={rm._id} value={rm._id}>
                {rm.displayName || (rm.email ? rm.email.split("@")[0] : "Roommate")}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            {editingExpenseId ? "💾 Save" : "➕ Add"}
          </button>
          {editingExpenseId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditingExpenseId(null);
                setDescription("");
                setAmount("");
                setPaidBy("");
                setSplitBetween([]);
              }}
            >
              ✖️ Cancel
            </button>
          )}
        </div>

        <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--bg-light)", borderRadius: "8px" }}>
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>Split between:</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {roommates.map((rm) => {
              const selected = splitBetween.includes(rm._id);
              return (
                <button
                  type="button"
                  key={rm._id}
                  onClick={() => toggleSplitBetween(rm._id)}
                  style={{
                    border: selected ? "1px solid var(--primary)" : "1px solid #e5e7eb",
                    background: selected ? "rgba(99, 102, 241, 0.12)" : "#fff",
                    color: selected ? "var(--primary)" : "var(--text-dark)",
                    padding: "0.55rem 0.85rem",
                    borderRadius: "999px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: selected ? "var(--primary)" : "#cbd5e1",
                    }}
                  ></span>
                  {rm.displayName || (rm.email ? rm.email.split("@")[0] : "Roommate")}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {error && <div className="message message-error">{error}</div>}

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "var(--text-dark)" }}>Balances</h3>
        {balances.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No expenses recorded yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {balances.map((b) => {
              const positive = b.balance > 0;
              const negative = b.balance < 0;
              return (
                <div
                  key={b.roommateId}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-dark)" }}>{b.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      {negative ? "owes" : positive ? "is owed" : "settled"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: negative ? "#dc2626" : positive ? "#16a34a" : "var(--text-dark)",
                      background: negative ? "#fef2f2" : positive ? "#f0fdf4" : "#f8fafc",
                      padding: "0.5rem 0.9rem",
                      borderRadius: "8px",
                      minWidth: "90px",
                      textAlign: "right",
                    }}
                  >
                    {negative ? "−" : positive ? "+" : ""}${Math.abs(b.balance).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "var(--text-dark)" }}>All Expenses</h3>
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p className="empty-state-text">No expenses yet. Add one to get started!</p>
          </div>
        ) : (
          <ul className="list">
            {expenses.map((exp) => (
              <li key={exp._id} className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">
                    {exp.description} <span style={{ color: "var(--primary)", fontWeight: "700" }}>
                      ${Number(exp.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="list-item-meta">
                    <span>👤 Paid by: {exp.paidBy?.displayName || (exp.paidBy?.email ? exp.paidBy.email.split("@")[0] : "Unknown")}</span>
                    <span>🔀 Split: {exp.splitBetween?.map((rm) => rm.displayName || (rm.email ? rm.email.split("@")[0] : "Roommate")).join(", ")}</span>
                  </div>
                </div>
                <div className="list-item-actions">
                  <button
                    onClick={() => {
                      setEditingExpenseId(exp._id);
                      setDescription(exp.description || "");
                      setAmount(String(exp.amount || ""));
                      setPaidBy(exp.paidBy?._id || exp.paidBy || "");
                      setSplitBetween(exp.splitBetween?.map((rm) => rm._id || rm) || []);
                    }}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteExpense(exp._id)} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ExpensesSection;
