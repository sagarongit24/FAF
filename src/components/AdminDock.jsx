import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/admin";
import "../styles/global.css"; // has variables; add chip css below if needed

function LoginModal({ open, onClose }) {
  const { login } = useAuth();
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Admin Sign-in</h3>
        <p>Use your Google account (must be in the allowed UID list).</p>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn primary" onClick={async () => { await login(); onClose(); }}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDock() {
  const { isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  // Long-press on any element that has data-admin-trigger (attach to your logos)
  useEffect(() => {
    const start = (e) => {
      const t = e.target.closest("[data-admin-trigger]");
      if (!t) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen(true), 650);
    };
    const end = () => clearTimeout(timer.current);

    document.addEventListener("mousedown", start, true);
    document.addEventListener("touchstart", start, { passive: true, capture: true });
    document.addEventListener("mouseup", end, true);
    document.addEventListener("mouseleave", end, true);
    document.addEventListener("touchend", end, true);
    document.addEventListener("touchcancel", end, true);

    // Keyboard fallback Ctrl+Shift+L
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "L" || e.key === "l")) setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", start, true);
      document.removeEventListener("touchstart", start, true);
      document.removeEventListener("mouseup", end, true);
      document.removeEventListener("mouseleave", end, true);
      document.removeEventListener("touchend", end, true);
      document.removeEventListener("touchcancel", end, true);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {isAdmin && (
        <button
          className="admin-chip"
          title="Sign out"
          onClick={logout}
        >
          Admin • Sign out
        </button>
      )}
      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
