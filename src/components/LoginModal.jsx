// src/components/LoginModal.jsx
import React, { useState, useEffect } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut
} from "firebase/auth";

export default function LoginModal({ onClose }) {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is completing email link sign-in
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const stored = window.localStorage.getItem("admin-email") || 
                     window.prompt("Please confirm your email");
      if (stored) {
        signInWithEmailLink(auth, stored, window.location.href)
          .then(() => {
            window.localStorage.removeItem("admin-email");
            onClose();
          })
          .catch((e) => {
            console.error(e);
            setError("Failed to sign in with email link");
          });
      }
    }
  }, [auth, onClose]);

  async function signInGoogle() {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      onClose();
    } catch (e) {
      console.error(e);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("admin-email", email);
      alert("Magic link sent! Check your email inbox.");
      setEmail("");
    } catch (e) {
      console.error(e);
      setError("Failed to send magic link. Please check your email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to sign out");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h3>Admin Sign-In</h3>
        <p style={{ opacity: 0.8, marginTop: 4 }}>
          Hidden login for site owner.
        </p>

        {error && (
          <div style={{ 
            padding: 12, 
            marginTop: 12, 
            background: "rgba(255, 77, 77, 0.1)", 
            border: "1px solid rgba(255, 77, 77, 0.3)",
            borderRadius: 8,
            color: "#ffb3bf"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
          <button 
            className="btn primary" 
            onClick={signInGoogle}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>
          <button className="btn" onClick={handleSignOut}>
            Sign out
          </button>
        </div>

        <div style={{ 
          marginTop: 16, 
          borderTop: "1px solid rgba(255,255,255,.12)", 
          paddingTop: 16 
        }}>
          <p style={{ margin: "0 0 12px" }}>Or get a magic link:</p>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMagicLink()}
            style={{ padding: 10, width: "100%" }}
            disabled={loading}
          />
          <div className="actions" style={{ marginTop: 12 }}>
            <button 
              className="btn" 
              onClick={sendMagicLink}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}