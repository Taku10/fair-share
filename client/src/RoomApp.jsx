import { useState } from "react";
import { useAuth } from "./AuthContext";
import ChatSection from "./components/ChatSection";
import ChoresSection from "./components/ChoresSection";
import ExpensesSection from "./components/ExpensesSection";
import RoommatesSection from "./components/RoommatesSection";

function RoomApp() {
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
export default RoomApp;