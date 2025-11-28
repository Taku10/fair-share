// client/src/App.jsx
import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3000/api";

function App() {
  const [chores, setChores] = useState([]);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchChores = async () => {
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

  const handleAddChore = async (e) => {
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

  const handleDeleteChore = async (id) => {
    try {
      await axios.delete(`${API_BASE}/chores/${id}`);
      setChores((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete chore");
    }
  }

  const toggleComplete = async (chore) => {
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
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem" }}>
      <h1>FairShare</h1>

      <form onSubmit={handleAddChore} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Chore title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "0.5rem", width: "60%", marginRight: "0.5rem" }}
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
    </div>
  );
}

export default App;
