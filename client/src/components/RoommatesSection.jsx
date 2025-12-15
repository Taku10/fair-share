import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../api";

function RoommatesSection() {
  const [roommates, setRoommates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet("/roommates");
        setRoommates(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load roommates");
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
            const name = rm.displayName || "Roommate";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();
            return (
              <li key={rm._id} className="list-item">
                <div className="list-item-content" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    aria-label="profile-avatar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--bg-light)",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="list-item-title" style={{ fontWeight: 600 }}>{name}</div>
                </div>
                <div className="list-item-actions">
                  <button onClick={() => handleDeleteRoommate(rm._id)} className="btn btn-danger">
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

export default RoommatesSection;
