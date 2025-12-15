import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import ChatRoom from "./ChatRoom";

function ChatSection({ currentUser }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomMessages, setRoomMessages] = useState({});

  useEffect(() => {
    fetchRoomsAndSelect(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadSelectedRoomMessages = async () => {
      if (!selectedRoomId) return;
      try {
        const res = await apiGet(`/chat/${selectedRoomId}/chat`);
        setRoomMessages((prev) => ({ ...prev, [selectedRoomId]: Array.isArray(res.data) ? res.data : [] }));
      } catch (err) {
        console.error("Failed to load messages for selected room", selectedRoomId, err);
      }
    };
    loadSelectedRoomMessages();
  }, [selectedRoomId]);

  async function fetchRoomsAndSelect(firstLoad = false) {
    try {
      setLoading(true);
      const res = await apiGet("/rooms");
      const nextRooms = Array.isArray(res.data) ? res.data : [];
      setRooms(nextRooms);
      if ((firstLoad || !selectedRoomId) && nextRooms.length > 0) {
        setSelectedRoomId(nextRooms[0]._id);
      }
      await fetchAllRoomMessages(nextRooms);
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
            messagesMap[room._id] = Array.isArray(res.data) ? res.data : [];
          } catch (err) {
            console.error("Failed to load messages for room", room._id, err);
            messagesMap[room._id] = [];
          }
        })
      );
      setRoomMessages(messagesMap);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      setLoading(true);
      setError("");
      const res = await apiPost("/rooms", { name: newRoomName.trim() });
      const updatedRooms = [res.data, ...rooms];
      setRooms(updatedRooms);
      setSelectedRoomId(res.data._id);
      setNewRoomName("");
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
      try {
        const msgRes = await apiGet(`/chat/${res.data._id}/chat`);
        setRoomMessages((prev) => ({ ...prev, [res.data._id]: Array.isArray(msgRes.data) ? msgRes.data : [] }));
      } catch (msgErr) {
        console.error("Failed to load messages for joined room:", msgErr);
      }
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

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600 }}>Room:</label>
        <select
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          className="form-select"
          style={{ minWidth: "200px" }}
        >
          {rooms.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name || "Room"}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-secondary" onClick={() => fetchRoomsAndSelect(true)}>
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
        <form
          onSubmit={handleCreateRoom}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--bg-light)", padding: "0.75rem", borderRadius: 8 }}
        >
          <input
            type="text"
            placeholder="New room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </form>
        <form
          onSubmit={handleJoinRoom}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--bg-light)", padding: "0.75rem", borderRadius: 8 }}
        >
          <input
            type="text"
            placeholder="Enter room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary">
            Join
          </button>
        </form>
      </div>

      {loading && (
        <div className="loading">
          <span className="loading-spinner"></span> Loading rooms...
        </div>
      )}

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
          room={rooms.find((r) => r._id === selectedRoomId)}
        />
      )}
    </div>
  );
}

export default ChatSection;
