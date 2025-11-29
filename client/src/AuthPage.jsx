// client/src/AuthPage.jsx
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { auth } from "./firebase";

function AuthPage() {
  const { currentUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  if (currentUser) {
    return <p>You are logged in as {currentUser.email}</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", width: "100%" }}>
          {isRegister ? "Create account" : "Login"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setIsRegister((b) => !b)}
        style={{ marginTop: "0.5rem" }}
      >
        {isRegister ? "Already have an account? Login" : "Need an account? Register"}
      </button>
    </div>
  );
}

export default AuthPage;
