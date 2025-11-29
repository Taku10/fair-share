// client/src/components/ChatRoom.jsx
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:3000/api";
const SOCKET_URL = "http://localhost:3000";

function ChatRoom({ roomId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // load chat history once via REST
  async function loadHistory() {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(`${API_BASE}/rooms/${roomId}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load chat history");
    }
  }

  useEffect(() => {
    loadHistory();
  }, [roomId]);

  // connect socket when component mounts
  useEffect(() => {
    let active = true;

    const setupSocket = async () => {
      const token = await currentUser.getIdToken();
      const socket = io(SOCKET_URL, {
        auth: { token },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to socket");
        socket.emit("joinRoom", roomId);
      });

      socket.on("chatMessage", (msg) => {
        if (!active) return;
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("errorMessage", (msg) => {
        console.error("Socket error:", msg);
      });
    };

    setupSocket();

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, currentUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      roomId,
      text,
      // optional:
      // relatedType: "chore",
      // relatedId: someChoreId,
    });

    setText("");
  }

  return (
    <div style={{ borderTop: "1px solid #ddd", marginTop: "1rem", paddingTop: "1rem" }}>
      <h3>Room Chat</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {messages.map((m) => (
          <div
            key={m._id}
            style={{
              marginBottom: "0.5rem",
              padding: "0.25rem 0.5rem",
              background:
                m.sender?.email === currentUser.email ? "#e6f7ff" : "#f6f6f6",
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
              {m.sender?.displayName || m.sender?.email || "Unknown"}
            </div>
            <div>{m.text}</div>

            {m.relatedType && (
              <div style={{ fontSize: "0.75rem", color: "#555", marginTop: 2 }}>
                {m.relatedType === "chore" && `🔗 Linked chore: ${m.relatedId}`}
                {m.relatedType === "expense" && `💸 Linked expense: ${m.relatedId}`}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
