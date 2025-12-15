import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "./api";
import { useAuth } from "./AuthContext";
import ChatRoom from "./components/ChatRoom";
import "./RoomApp.css";
const API_BASE = "http://localhost:5000/api";

function RoomApp () {
  const [activeTab, setActiveTab] = useState("chores");
const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="app-title">Fair Share</h1>
              <p className="app-subtitle">
                Keep roommate chores and shared bills fair and transparent.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', opacity: 0.9 }}>
                👤 {currentUser?.email}
              </p>
              <button
                onClick={handleLogout}
                className="btn btn-logout"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab("chores")}
          className={`tab-button ${activeTab === "chores" ? "active" : ""}`}
        >
          Chores
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`tab-button ${activeTab === "expenses" ? "active" : ""}`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab("roommates")}
          className={`tab-button ${activeTab === "roommates" ? "active" : ""}`}
        >
          Roommates
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
        >
          Chat
        </button>
      </div>

      <main className="content">
        {activeTab === "chores" && <ChoresSection />}
        {activeTab === "expenses" && <ExpensesSection />}
        {activeTab === "roommates" && <RoommatesSection />}
        {activeTab === "chat" && <ChatSection currentUser={currentUser} />}
      </main>
    </div>
  );
}

/* ----------------- CHAT SECTION ----------------- */

function ChatSection({ currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomMessages, setRoomMessages] = useState({});

  async function fetchRoomsAndSelect(firstLoad = false) {
    try {
      setLoading(true);
      const res = await apiGet('/rooms');
      setRooms(res.data);
      if ((firstLoad || !selectedRoomId) && res.data.length > 0) {
        setSelectedRoomId(res.data[0]._id);
      }
      // Fetch messages for all rooms
      await fetchAllRoomMessages(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load rooms for chat");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllRoomMessages(roomList) {
    if (!roomList || roomList.length === 0) return;
    try {
      const messagesMap = {};
      
      await Promise.all(
        roomList.map(async (room) => {
          try {
            const res = await apiGet(`/chat/${room._id}/chat`);
            messagesMap[room._id] = res.data || [];
          } catch (err) {
            console.error('Failed to load messages for room', room._id, err);
            messagesMap[room._id] = [];
          }
        })
      );
      
      setRoomMessages(messagesMap);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchRoomsAndSelect(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure messages load when switching selected room
  useEffect(() => {
    const loadSelectedRoomMessages = async () => {
      if (!selectedRoomId) return;
      try {
        const res = await apiGet(`/chat/${selectedRoomId}/chat`);
        setRoomMessages((prev) => ({ ...prev, [selectedRoomId]: res.data || [] }));
      } catch (err) {
        console.error('Failed to load messages for selected room', selectedRoomId, err);
      }
    };
    loadSelectedRoomMessages();
  }, [selectedRoomId]);

  async function handleCreateRoom(e) {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      setLoading(true);
      setError("");
      const res = await apiPost('/rooms', { name: newRoomName.trim() });
      const updatedRooms = [res.data, ...rooms];
      setRooms(updatedRooms);
      setSelectedRoomId(res.data._id);
      setNewRoomName("");
      // Refresh from server to ensure all rooms appear
      fetchRoomsAndSelect();
    } catch (err) {
      console.error(err);
      setError("Could not create room");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      setLoading(true);
      setError("");
      const res = await apiPost(`/rooms/join/${joinCode.trim()}`);
      const existing = rooms.find((r) => r._id === res.data._id);
      const updatedRooms = existing ? rooms : [res.data, ...rooms];
      setRooms(updatedRooms);
      setSelectedRoomId(res.data._id);
      setJoinCode("");
      // Immediately fetch messages for the joined room
      try {
        const msgRes = await apiGet(`/chat/${res.data._id}/chat`);
        setRoomMessages(prev => ({ ...prev, [res.data._id]: msgRes.data || [] }));
      } catch (msgErr) {
        console.error('Failed to load messages for joined room:', msgErr);
      }
      // Refresh from server to ensure all rooms appear
      await fetchRoomsAndSelect();
    } catch (err) {
      console.error(err);
      setError("Invalid room code or join failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <h2>Chat</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "1rem" }}>
        Chat with roommates in a room. Select a room to join.
      </p>

      {error && <div className="message message-error">{error}</div>}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Room:</label>
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className="form-select"
          style={{ minWidth: '200px' }}
        >
          {rooms.map((r) => (
            <option key={r._id} value={r._id}>{r.name || 'Room'}</option>
          ))}
        </select>
        <button type="button" className="btn btn-secondary" onClick={() => fetchRoomsAndSelect(true)}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <form onSubmit={handleCreateRoom} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-light)', padding: '0.75rem', borderRadius: 8 }}>
          <input
            type="text"
            placeholder="New room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
        <form onSubmit={handleJoinRoom} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-light)', padding: '0.75rem', borderRadius: 8 }}>
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary">Join</button>
        </form>
      </div>

      {loading && <div className="loading"><span className="loading-spinner"></span> Loading rooms...</div>}

      {!loading && rooms.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-text">No rooms yet. Create an expense or room first to chat.</p>
        </div>
      )}

      {selectedRoomId && currentUser && (
        <ChatRoom 
          key={selectedRoomId} 
          roomId={selectedRoomId} 
          currentUser={currentUser}
          initialMessages={Array.isArray(roomMessages[selectedRoomId]) ? roomMessages[selectedRoomId] : []}
          room={rooms.find(r => r._id === selectedRoomId)}
        />
      )}
    </div>
  );
}

/* ----------------- CHORES SECTION ----------------- */

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

  async function fetchChores() {
    try {
      setLoading(true);
      const res = await apiGet('/chores');
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
      const payload = {
        title,
        frequency,
      };

      let res;
      if (editingChoreId) {
        res = await apiPut(`/chores/${editingChoreId}`, payload);
        setChores((prev) => prev.map((c) => (c._id === editingChoreId ? res.data : c)));
      } else {
        res = await apiPost('/chores', payload);
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
      const res = await apiPut(`/chores/${chore._id}`, {
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
          {editingChoreId ? '💾 Save' : '➕ Add'}
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

      <div className="form-group" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search chores by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Status:</span>
          {['all','open','completed'].map((s) => (
            <button
              key={s}
              type="button"
              className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'All' : s === 'open' ? 'Open' : 'Completed'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Frequency:</span>
          {['all','once','daily','weekly','monthly'].map((f) => (
            <button
              key={f}
              type="button"
              className={`btn ${filterFrequency === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterFrequency(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
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

      {loading && <div className="loading"><span className="loading-spinner"></span> Loading chores...</div>}
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
              const matchesSearch = (() => {
                if (!q) return true;
                const titleMatch = chore.title?.toLowerCase().includes(q);
                return titleMatch;
              })();

              const matchesStatus = (() => {
                if (filterStatus === 'all') return true;
                if (filterStatus === 'completed') return !!chore.completed;
                if (filterStatus === 'open') return !chore.completed;
                return true;
              })();

              const matchesFrequency = (() => {
                if (filterFrequency === 'all') return true;
                return (chore.frequency || '').toLowerCase() === filterFrequency;
              })();

              return matchesSearch && matchesStatus && matchesFrequency;
            })
            .map((chore) => (
            <li
              key={chore._id}
              className={`list-item ${chore.completed ? 'completed' : ''}`}
            >
              <div className="list-item-content">
                <div className={`list-item-title ${chore.completed ? 'list-item-completed' : ''}`}>
                  {chore.title}
                </div>
                <div className="list-item-meta">
                  <span className="list-item-badge">{chore.frequency}</span>
                  {chore.assignedTo && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      Assigned to: {chore.assignedTo.displayName || (chore.assignedTo.email ? chore.assignedTo.email.split('@')[0] : 'Roommate')}
                    </span>
                  )}
                  {chore.completed && <span style={{ color: 'var(--success)' }}>Completed</span>}
                </div>
              </div>
              <div className="list-item-actions">
                <button
                  onClick={() => toggleComplete(chore)}
                  className={`btn ${chore.completed ? 'btn-secondary' : 'btn-success'}`}
                >
                  {chore.completed ? 'Undo' : 'Done'}
                </button>
                <button
                  onClick={() => {
                    setEditingChoreId(chore._id);
                    setTitle(chore.title);
                    setFrequency(chore.frequency || 'weekly');
                  }}
                  className="btn btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteChore(chore._id)}
                  className="btn btn-danger"
                >
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

/* ----------------- ROOMMATES SECTION ----------------- */

function RoommatesSection() {
  const [roommates, setRoommates] = useState([]);
  const [error, setError] = useState("");

  async function fetchRoommates() {
    try {
      const res = await apiGet('/roommates');
      setRoommates(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load roommates");
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        await fetchRoommates();
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  async function handleDeleteRoommate(id) {
    try {
      await apiDelete(`/roommates/${id}`);
      setRoommates((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete roommate");
    }
  }

  return (
    <div className="section">
      <h2>Roommates</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "1.5rem" }}>
        Roommates are automatically added when they sign in.
      </p>

      {error && <div className="message message-error">{error}</div>}

      {roommates.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">No roommates yet. Add your first roommate!</p>
        </div>
      ) : (
        <ul className="list">
          {roommates.map((rm) => {
            const name = rm.displayName || 'Roommate';
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();
            return (
              <li key={rm._id} className="list-item">
                <div className="list-item-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    aria-label="profile-avatar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--bg-light)',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: 'var(--text-dark)'
                    }}
                  >
                    {initials}
                  </div>
                  <div className="list-item-title" style={{ fontWeight: 600 }}>{name}</div>
                </div>
                <div className="list-item-actions">
                  <button
                    onClick={() => handleDeleteRoommate(rm._id)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
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
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  async function fetchRoommates() {
    const res = await apiGet('/roommates');
    setRoommates(res.data);
  }

  async function fetchExpenses() {
    const res = await apiGet('/expenses');
    setExpenses(res.data);
  }

  async function fetchBalances() {
    const res = await apiGet('/expenses/balances/summary');
    setBalances(res.data);
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
        res = await apiPost('/expenses', payload);
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
        Add roommates in the Roommates tab first, then log expenses here and see
        who owes who.
      </p>

      <form onSubmit={handleAddExpense} className="form-group" style={{ flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Description (e.g. Rent, Wi-Fi)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            style={{ flex: 0, minWidth: '100px' }}
          />
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="form-select"
            style={{ flex: 0, minWidth: '150px' }}
          >
            <option value="">Paid by...</option>
            {roommates.map((rm) => (
              <option key={rm._id} value={rm._id}>
                {rm.displayName || (rm.email ? rm.email.split('@')[0] : 'Roommate')}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            {editingExpenseId ? '💾 Save' : '➕ Add'}
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

        <div style={{ marginTop: "1rem", padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px' }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Split between:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {roommates.map((rm) => {
              const selected = splitBetween.includes(rm._id);
              return (
                <button
                  type="button"
                  key={rm._id}
                  onClick={() => toggleSplitBetween(rm._id)}
                  style={{
                    border: selected ? '1px solid var(--primary)' : '1px solid #e5e7eb',
                    background: selected ? 'rgba(99, 102, 241, 0.12)' : '#fff',
                    color: selected ? 'var(--primary)' : 'var(--text-dark)',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: selected ? 'var(--primary)' : '#cbd5e1'
                  }}></span>
                  {rm.displayName || (rm.email ? rm.email.split('@')[0] : 'Roommate')}
                </button>
              );
            })}
          </div>
        </div>
      </form>

      {error && <div className="message message-error">{error}</div>}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Balances</h3>
        {balances.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">No expenses recorded yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {balances.map((b) => {
              const positive = b.balance > 0;
              const negative = b.balance < 0;
              return (
                <div
                  key={b.roommateId}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{b.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {negative ? 'owes' : positive ? 'is owed' : 'settled'}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: negative ? '#dc2626' : positive ? '#16a34a' : 'var(--text-dark)' ,
                    background: negative ? '#fef2f2' : positive ? '#f0fdf4' : '#f8fafc',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    minWidth: '90px',
                    textAlign: 'right'
                  }}>
                    {negative ? '−' : positive ? '+' : ''}${Math.abs(b.balance).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>All Expenses</h3>
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
                    {exp.description} <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                      ${Number(exp.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="list-item-meta">
                    <span>👤 Paid by: {exp.paidBy?.displayName || (exp.paidBy?.email ? exp.paidBy.email.split('@')[0] : "Unknown")}</span>
                    <span>🔀 Split: {exp.splitBetween?.map((rm) => rm.displayName || (rm.email ? rm.email.split('@')[0] : 'Roommate')).join(", ")}</span>
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
                  <button
                    onClick={() => handleDeleteExpense(exp._id)}
                    className="btn btn-danger"
                  >
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

export default RoomApp;