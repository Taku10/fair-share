// client/src/App.jsx
import { useAuth } from "./AuthContext.jsx";
import AuthPage from "./AuthPage.jsx"; // login/register screen
import RoomApp from "./RoomApp.jsx";

function App() {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading authentication...
      </div>
    );
  }

  if (!currentUser) {
    // Not logged in -> show Firebase login/register page
    return <AuthPage />;
  }

  // Logged in -> show the real app
  return <RoomApp currentUser={currentUser} />;
}

export default App;
