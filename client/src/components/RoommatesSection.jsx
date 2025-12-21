import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../api";
import ConfirmDialog from "./ConfirmDialog";

function RoommatesSection() {
  const [roommates, setRoommates] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [confirmDelete, setConfirmDelete] = useState(null);

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
    setConfirmDelete(id);
  }

  async function confirmDeleteRoommate() {
    const id = confirmDelete;
    setConfirmDelete(null);

    try {
      setError("");
      await apiDelete(`/roommates/${id}`);
      setRoommates((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to remove roommate. Please try again.");
    }
  }

  return (
    <div className="section">
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Remove Roommate"
        message="Are you sure you want to remove this roommate? This action cannot be undone."
        onConfirm={confirmDeleteRoommate}
        onCancel={() => setConfirmDelete(null)}
      />
      <h2>Roommates</h2>
      <p style={{ color: "var(--text-light)", marginBottom: "1.5rem" }}>
        Roommates are automatically added when they sign in.
      </p>

      {error && <div className="message message-error">{error}</div>}

      {/* Search Bar */}
      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search roommates by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="form-input"
          style={{ flex: 1 }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="btn btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {roommates.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">No roommates yet. Add your first roommate!</p>
        </div>
      ) : (
        <>
          <ul className="list">
            {(() => {
              const filtered = roommates.filter((rm) => {
                const q = search.trim().toLowerCase();
                if (!q) return true;
                const name = (rm.displayName || "").toLowerCase();
                const email = (rm.email || "").toLowerCase();
                return name.includes(q) || email.includes(q);
              });
              const totalPages = Math.ceil(filtered.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedRoommates = filtered.slice(startIndex, endIndex);

              if (filtered.length === 0) {
                return (
                  <div className="empty-state" style={{ margin: "2rem 0" }}>
                    <p className="empty-state-text">No roommates found matching "{search}"</p>
                  </div>
                );
              }

              return paginatedRoommates.map((rm) => {
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
              });
            })()}
          </ul>
          {(() => {
            const filtered = roommates.filter((rm) => {
              const q = search.trim().toLowerCase();
              if (!q) return true;
              const name = (rm.displayName || "").toLowerCase();
              const email = (rm.email || "").toLowerCase();
              return name.includes(q) || email.includes(q);
            });
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            if (totalPages <= 1) return null;

            return (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn ${currentPage === page ? "btn-primary" : "btn-secondary"}`}
                    style={{ minWidth: "40px" }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                >
                  Next →
                </button>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default RoommatesSection;
