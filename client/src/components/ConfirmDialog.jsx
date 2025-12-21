function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div 
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(5px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onCancel}
        >
            <div 
                style={{
                    background: "rgba(30, 41, 59, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(102, 126, 234, 0.25)",
                    borderRadius: "12px",
                    padding: "2rem",
                    maxWidth: "400px",
                    width: "90%",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ 
                    margin: "0 0 1rem 0", 
                    color: "var(--text-dark)",
                    fontSize: "1.25rem"
                }}>
                    {title}
                </h3>
                <p style={{ 
                    margin: "0 0 1.5rem 0", 
                    color: "var(--text-light)",
                    lineHeight: "1.6"
                }}>
                    {message}
                </p>
                <div style={{ 
                    display: "flex", 
                    gap: "0.75rem", 
                    justifyContent: "flex-end" 
                }}>
                    <button 
                        onClick={onCancel}
                        className="btn btn-secondary"
                        style={{ minWidth: "80px" }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="btn btn-danger"
                        style={{ minWidth: "80px" }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
