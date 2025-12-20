import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../api";

function ChoresSection() {
    const [chores, setChores] = useState([]);
    const [title, setTitle] = useState("");
    const [frequency, setFrequency] = useState("weekly");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingChoreId, setEditingChoreId] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterFrequency, setFilterFrequency] = useState("all");

    useEffect(() => {
        fetchChores();
    }, []);

    async function fetchChores() {
        try {
            setLoading(true);
            const res = await apiGet("/chores");
            setChores(Array.isArray(res.data) ? res.data : []);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load chores");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddChore(e) {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const payload = { title, frequency };
            let res;
            if (editingChoreId) {
                res = await apiPut(`/chores/${editingChoreId}`, payload);
                setChores((prev) => prev.map((c) => (c._id === editingChoreId ? res.data : c)));
            } else {
                res = await apiPost("/chores", payload);
                setChores((prev) => [res.data, ...prev]);
            }

            setTitle("");
            setFrequency("weekly");
            setEditingChoreId(null);
        } catch (err) {
            console.error(err);
            setError("Failed to add chore");
        }
    }

    async function handleDeleteChore(id) {
        try {
            await apiDelete(`/chores/${id}`);
            setChores((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to delete chore");
        }
    }

    async function toggleComplete(chore) {
        try {
            const res = await apiPut(`/chores/${chore._id}`, { ...chore, completed: !chore.completed });
            setChores((prev) => prev.map((c) => (c._id === chore._id ? res.data : c)));
        } catch (err) {
            console.error(err);
            setError("Failed to update chore");
        }
    }

    return (
        <div className="section">
            <h2>Chores</h2>

            <form onSubmit={handleAddChore} className="form-group">
                <input
                    type="text"
                    placeholder="Enter chore title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                />
                <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="form-select"
                >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <button type="submit" className="btn btn-primary">
                    {editingChoreId ? "💾 Save" : "➕ Add"}
                </button>
                {editingChoreId && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            setEditingChoreId(null);
                            setTitle("");
                            setFrequency("weekly");
                        }}
                    >
                        ✖️ Cancel
                    </button>
                )}
            </form>

            <div className="form-group" style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="Search chores by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, minWidth: "200px" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>Status:</span>
                    {["all", "open", "completed"].map((s) => (
                        <button
                            key={s}
                            type="button"
                            className={`btn ${filterStatus === s ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setFilterStatus(s)}
                        >
                            {s === "all" ? "All" : s === "open" ? "Open" : "Completed"}
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>Frequency:</span>
                    {["all", "once", "daily", "weekly", "monthly"].map((f) => (
                        <button
                            key={f}
                            type="button"
                            className={`btn ${filterFrequency === f ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setFilterFrequency(f)}
                        >
                            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        setSearch("");
                        setFilterStatus("all");
                        setFilterFrequency("all");
                    }}
                >
                    Reset
                </button>
            </div>

            {loading && (
                <div className="loading">
                    <span className="loading-spinner"></span> Loading chores...
                </div>
            )}
            {error && <div className="message message-error">{error}</div>}

            {chores.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p className="empty-state-text">No chores yet. Add one to get started!</p>
                </div>
            ) : (
                <ul className="list">
                    {chores
                        .filter((chore) => {
                            const q = search.trim().toLowerCase();
                            const matchesSearch = !q || chore.title?.toLowerCase().includes(q);
                            const matchesStatus =
                                filterStatus === "all"
                                    ? true
                                    : filterStatus === "completed"
                                        ? !!chore.completed
                                        : !chore.completed;
                            const matchesFrequency =
                                filterFrequency === "all"
                                    ? true
                                    : (chore.frequency || "").toLowerCase() === filterFrequency;

                            return matchesSearch && matchesStatus && matchesFrequency;
                        })
                        .map((chore) => (
                            <li key={chore._id} className={`list-item ${chore.completed ? "completed" : ""}`}>
                                <div className="list-item-content">
                                    <div className={`list-item-title ${chore.completed ? "list-item-completed" : ""}`}>
                                        {chore.title}
                                    </div>
                                    <div className="list-item-meta">
                                        <span className="list-item-badge">{chore.frequency}</span>
                                        {chore.assignedTo && (
                                            <span style={{ marginLeft: "0.5rem" }}>
                                                Assigned to: {chore.assignedTo.displayName || (chore.assignedTo.email ? chore.assignedTo.email.split("@")[0] : "Roommate")}
                                            </span>
                                        )}
                                        {chore.completed && <span style={{ color: "var(--success)" }}>Completed</span>}
                                    </div>
                                </div>
                                <div className="list-item-actions">
                                    <button onClick={() => toggleComplete(chore)} className={`btn ${chore.completed ? "btn-secondary" : "btn-success"}`}>
                                        {chore.completed ? "Undo" : "Done"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingChoreId(chore._id);
                                            setTitle(chore.title);
                                            setFrequency(chore.frequency || "weekly");
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteChore(chore._id)} className="btn btn-danger">
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}

export default ChoresSection;
