// client/src/App.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
const API_BASE = "http://localhost:3000/api";

function App() {
  const [activeTab, setActiveTab] = useState("chores");
const { currentUser, authLoading } = useAuth();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem" }}>
      <h1>RoomSync</h1>
      <p style={{ color: "#555", marginBottom: "1rem" }}>
        Keep roommate chores and shared bills fair and transparent.
      </p>

      <div style={{ margin: "1rem 0" }}>
        <button
          onClick={() => setActiveTab("chores")}
          style={tabStyle(activeTab === "chores")}
        >
          Chores
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          style={tabStyle(activeTab === "expenses")}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab("roommates")}
          style={tabStyle(activeTab === "roommates")}
        >
          Roommates
        </button>
      </div>

      {activeTab === "chores" && <ChoresSection />}
      {activeTab === "expenses" && <ExpensesSection />}
      {activeTab === "roommates" && <RoommatesSection />}
    </div>
  );
}

function tabStyle(active) {
  return {
    padding: "0.5rem 1rem",
    marginRight: "0.5rem",
    borderRadius: 6,
    border: active ? "2px solid #333" : "1px solid #ccc",
    background: active ? "#eee" : "white",
    cursor: "pointer",
  };
}

/* ----------------- CHORES SECTION ----------------- */

function ChoresSection() {
  const [chores, setChores] = useState([]);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchChores() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/chores`);
      setChores(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load chores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchChores();
  }, []);

  async function handleAddChore(e) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/chores`, {
        title,
        frequency,
      });
      setChores((prev) => [res.data, ...prev]);
      setTitle("");
      setFrequency("weekly");
    } catch (err) {
      console.error(err);
      setError("Failed to add chore");
    }
  }

  async function handleDeleteChore(id) {
    try {
      await axios.delete(`${API_BASE}/chores/${id}`);
      setChores((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete chore");
    }
  }

  async function toggleComplete(chore) {
    try {
      const res = await axios.put(`${API_BASE}/chores/${chore._id}`, {
        ...chore,
        completed: !chore.completed,
      });
      setChores((prev) =>
        prev.map((c) => (c._id === chore._id ? res.data : c))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update chore");
    }
  }

  return (
    <div>
      <h2>Chores</h2>

      <form onSubmit={handleAddChore} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Chore title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "0.5rem", width: "50%", marginRight: "0.5rem" }}
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        >
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add
        </button>
      </form>

      {loading && <p>Loading chores...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {chores.map((chore) => (
          <li
            key={chore._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: "0.5rem",
            }}
          >
            <div>
              <strong
                style={{
                  textDecoration: chore.completed ? "line-through" : "none",
                }}
              >
                {chore.title}
              </strong>
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                {chore.frequency}
              </div>
            </div>
            <div>
              <button
                onClick={() => toggleComplete(chore)}
                style={{ marginRight: "0.5rem" }}
              >
                {chore.completed ? "Undo" : "Done"}
              </button>
              <button onClick={() => handleDeleteChore(chore._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      // Example inside a chore card
      <button
        onClick={() =>
          socketRef.current?.emit("sendMessage", {
            roomId,
            text: `Reminder about chore: ${chore.title}`,
            relatedType: "chore",
            relatedId: chore._id,
          })
        }
      >
        Share to chat
      </button>

    </div>
  );
}

/* ----------------- ROOMMATES SECTION ----------------- */

function RoommatesSection() {
  const [roommates, setRoommates] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function fetchRoommates() {
    try {
      const res = await axios.get(`${API_BASE}/roommates`);
      setRoommates(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load roommates");
    }
  }

  useEffect(() => {
    fetchRoommates();
  }, []);

  async function handleAddRoommate(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/roommates`, {
        name,
        email,
      });
      setRoommates((prev) => [res.data, ...prev]);
      setName("");
      setEmail("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to add roommate");
    }
  }

  async function handleDeleteRoommate(id) {
    try {
      await axios.delete(`${API_BASE}/roommates/${id}`);
      setRoommates((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete roommate");
    }
  }

  return (
    <div>
      <h2>Roommates</h2>
      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        Add the people you live with. These names are used in expenses.
      </p>

      <form onSubmit={handleAddRoommate} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Name (e.g. Alex)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem", width: "30%", marginRight: "0.5rem" }}
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "0.5rem", width: "30%", marginRight: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {roommates.map((rm) => (
          <li
            key={rm._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "0.5rem",
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>{rm.name}</strong>
              {rm.email && (
                <div style={{ fontSize: "0.8rem", color: "#555" }}>
                  {rm.email}
                </div>
              )}
            </div>
            <button onClick={() => handleDeleteRoommate(rm._id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------- EXPENSES SECTION ----------------- */

function ExpensesSection() {
  const [expenses, setExpenses] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [balances, setBalances] = useState([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [error, setError] = useState("");

  async function fetchRoommates() {
    const res = await axios.get(`${API_BASE}/roommates`);
    setRoommates(res.data);
  }

  async function fetchExpenses() {
    const res = await axios.get(`${API_BASE}/expenses`);
    setExpenses(res.data);
  }

  async function fetchBalances() {
    const res = await axios.get(`${API_BASE}/expenses/balances/summary`);
    setBalances(res.data);
  }

  useEffect(() => {
    Promise.all([fetchRoommates(), fetchExpenses(), fetchBalances()]).catch(
      (err) => {
        console.error(err);
        setError("Failed to load expenses data");
      }
    );
  }, []);

  function toggleSplitBetween(id) {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!description.trim() || !amount || !paidBy || splitBetween.length === 0) {
      setError("Fill all fields and pick roommates to split between");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/expenses`, {
        description,
        amount: parseFloat(amount),
        paidBy,
        splitBetween,
      });
      setExpenses((prev) => [res.data, ...prev]);
      setDescription("");
      setAmount("");
      setPaidBy("");
      setSplitBetween([]);
      setError("");
      fetchBalances();
    } catch (err) {
      console.error(err);
      setError("Failed to add expense");
    }
  }

  async function handleDeleteExpense(id) {
    try {
      await axios.delete(`${API_BASE}/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      fetchBalances();
    } catch (err) {
      console.error(err);
      setError("Failed to delete expense");
    }
  }

  return (
    <div>
      <h2>Expenses</h2>
      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        Add roommates in the Roommates tab first, then log expenses here and see
        who owes who.
      </p>

      <form onSubmit={handleAddExpense} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Description (e.g. Rent, Wi-Fi)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: "0.5rem", width: "35%", marginRight: "0.5rem" }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: "0.5rem", width: "15%", marginRight: "0.5rem" }}
        />
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          style={{ padding: "0.5rem", width: "20%", marginRight: "0.5rem" }}
        >
          <option value="">Paid by...</option>
          {roommates.map((rm) => (
            <option key={rm._id} value={rm._id}>
              {rm.name}
            </option>
          ))}
        </select>
        <button type="submit" style={{ padding: "0.5rem 1rem", marginTop: "0.5rem" }}>
          Add
        </button>

        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
          <strong>Split between:</strong>{" "}
          {roommates.map((rm) => (
            <label
              key={rm._id}
              style={{ marginRight: "0.75rem", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={splitBetween.includes(rm._id)}
                onChange={() => toggleSplitBetween(rm._id)}
                style={{ marginRight: "0.25rem" }}
              />
              {rm.name}
            </label>
          ))}
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Balances</h3>
      <ul style={{ listStyle: "none", padding: 0, marginBottom: "1rem" }}>
        {balances.map((b) => (
          <li key={b.roommateId}>
            {b.name}:{" "}
            <strong
              style={{
                color: b.balance < 0 ? "red" : b.balance > 0 ? "green" : "#333",
              }}
            >
              {b.balance.toFixed(2)}
            </strong>
          </li>
        ))}
      </ul>

      <h3>Expenses List</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {expenses.map((exp) => (
          <li
            key={exp._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "0.5rem",
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong>{exp.description}</strong>{" "}
              <span>(${Number(exp.amount).toFixed(2)})</span>
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                Paid by: {exp.paidBy?.name || "Unknown"} | Split between:{" "}
                {exp.splitBetween?.map((rm) => rm.name).join(", ")}
              </div>
            </div>
            <button onClick={() => handleDeleteExpense(exp._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
