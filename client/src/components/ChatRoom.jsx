// client/src/components/ChatRoom.jsx
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { auth } from "../firebase";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

function ChatRoom({ roomId, currentUser, initialMessages = [], room }) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Initialize with preloaded messages from parent
  useEffect(() => {
    setMessages(initialMessages);
  }, [roomId, initialMessages]);

  // Calculate unique message senders from this room
  const messageSenders = messages.reduce((acc, msg) => {
    const senderId = msg.sender?._id;
    if (senderId && !acc.some(s => s._id === senderId)) {
      acc.push(msg.sender);
    }
    return acc;
  }, []);

  // connect socket when component mounts
  useEffect(() => {
    let active = true;

    const setupSocket = async () => {
      const token = await auth.currentUser?.getIdToken();
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      background: '#f8fafc',
      height: 480,
      overflow: 'hidden'
    }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{room?.name || 'Room Chat'}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
              {room?.members?.length || 0} member{room?.members?.length === 1 ? '' : 's'} • {messages.length} message{messages.length === 1 ? '' : 's'}
            </div>
          </div>
          {room?.members && room.members.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {room.members.map((member) => {
                const name = member?.displayName || member?.email?.split('@')[0] || 'User';
                const initials = name.substring(0, 2).toUpperCase();
                const messageCount = messages.filter(m => m.sender?._id === member._id).length;
                return (
                  <div
                    key={member._id}
                    title={`${name} (${messageCount} message${messageCount === 1 ? '' : 's'})`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: messageCount > 0 ? '#4f46e5' : '#e5e7eb',
                      color: messageCount > 0 ? '#fff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      border: '2px solid #fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {initials}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {error && <p style={{ color: "#dc2626", marginTop: 4 }}>{error}</p>}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem',
          background: '#eef2ff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        {messages.map((m) => {
          const mine = m.sender?.email === currentUser.email;
          return (
            <div
              key={m._id}
              style={{
                display: 'flex',
                justifyContent: mine ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  background: mine ? '#4f46e5' : '#fff',
                  color: mine ? '#fff' : '#0f172a',
                  padding: '0.65rem 0.75rem',
                  borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  border: mine ? '1px solid #4338ca' : '1px solid #e5e7eb',
                  fontSize: '0.95rem',
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, opacity: mine ? 0.9 : 0.7, marginBottom: 4 }}>
                  {m.sender?.displayName || m.sender?.email || 'Unknown'}
                  <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: 4 }}>
                    (ID: {m.sender?._id?.slice(-6) || 'N/A'})
                  </span>
                </div>
                <div>{m.text}</div>
                <div style={{ fontSize: '0.72rem', opacity: mine ? 0.75 : 0.6, marginTop: 4 }}>
                  Room: {m.roomId?.slice(-6) || roomId.slice(-6)}
                </div>
                {m.relatedType && (
                  <div style={{ fontSize: '0.78rem', opacity: mine ? 0.85 : 0.65, marginTop: 6 }}>
                    {m.relatedType === 'chore' && `Linked chore: ${m.relatedId}`}
                    {m.relatedType === 'expense' && `Linked expense: ${m.relatedId}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc' }}
        />
        <button type="submit" style={{ padding: '0.6rem 1.1rem', borderRadius: 10, background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 700 }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
