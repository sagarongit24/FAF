import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut
} from "firebase/auth";
import NavigationBar from "../components/NavigationBar";
import "../styles/home.css";

const LOGO_SRC = "/brand/broadneck.png";
/** >>>>>>>>>> PUT YOUR ADMIN UID(S) HERE <<<<<<<<<< */
const ADMIN_UIDS = ["ADMIN_UIDS"];

/* ---------- Hidden long-press trigger ---------- */
function useLongPress(callback, ms = 1200) {
  const timerRef = useRef(null);
  const start = useCallback(() => { timerRef.current = setTimeout(callback, ms); }, [callback, ms]);
  const clear = useCallback(() => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  return {
    onMouseDown: start, onTouchStart: start,
    onMouseUp: clear, onMouseLeave: clear, onTouchEnd: clear
  };
}

/* ---------- Admin state (checks UID allow-list) ---------- */
function useAdmin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      const allowed = !!u && ADMIN_UIDS.includes(u.uid);
      setIsAdmin(allowed);
      if (u) console.log("Signed in:", u.email, "UID:", u.uid);
    });
  }, []);
  return { user, isAdmin };
}

/* ---------- Minimal Login Modal (Google + optional magic link) ---------- */
function LoginModal({ onClose }) {
  const auth = getAuth();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const stored = window.localStorage.getItem("admin-email") || window.prompt("Confirm your email");
      if (stored) {
        signInWithEmailLink(auth, stored, window.location.href)
          .then(() => onClose())
          .catch((e) => console.error(e));
      }
    }
  }, [auth, onClose]);

  async function signInGoogle() {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); onClose(); }
    catch (e) { console.error(e); alert("Google sign-in failed"); }
  }
  async function sendMagicLink() {
    const actionCodeSettings = { url: window.location.origin, handleCodeInApp: true };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("admin-email", email);
      alert("Magic link sent. Check your email.");
    } catch (e) { console.error(e); alert("Failed to send link."); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Admin Sign-In</h3>
        <p style={{opacity:.8, marginTop:4}}>Hidden login for site owner.</p>

        <div style={{display:"flex", gap:8, margin:"12px 0"}}>
          <button className="btn primary" onClick={signInGoogle}>Sign in with Google</button>
          <button className="btn" onClick={() => signOut(auth)}>Sign out</button>
        </div>

        <div style={{marginTop:10, borderTop:"1px solid rgba(255,255,255,.12)", paddingTop:10}}>
          <p style={{margin:"6px 0 8px"}}>Or get a magic link:</p>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{padding:10, width:"100%"}}
          />
          <div className="actions" style={{marginTop:8}}>
            <button className="btn" onClick={sendMagicLink}>Send magic link</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Film Timeline local model ---------- */
/**
 * @typedef {Object} FilmItem
 * @property {string} id
 * @property {string} title
 * @property {string} role
 * @property {string} releaseDate // YYYY or YYYY-MM
 * @property {string} description
 * @property {string[]} tags
 * @property {string} posterUrl
 * @property {string} linkTrailer
 */
const STORAGE_KEY = "portfolio.filmTimeline.v1";
const uid = () => Math.random().toString(36).slice(2, 10);

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function writeToStorage(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

/* ---------- Reusable Modal for timeline edit ---------- */
function Modal({ children, onClose }) {
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

/* ============================== PAGE ============================== */
function Home() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [loginOpen, setLoginOpen] = useState(false);
  const longPress = useLongPress(() => setLoginOpen(true), 1200);

  // Optional: keyboard shortcut to sign out (Ctrl+Shift+L)
  useEffect(() => {
    const auth = getAuth();
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") signOut(auth);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Local timeline data (admin-only editable; persisted to localStorage)
  const [items, setItems] = useState(() => readFromStorage());
  useEffect(() => { writeToStorage(items); }, [items]);

  const sortedItems = useMemo(() => {
    const normalize = (d) => (d || "0000-00").padEnd(7, "-00");
    return [...items].sort((a, b) => (normalize(b.releaseDate) > normalize(a.releaseDate) ? 1 : -1));
  }, [items]);

  function addItem(payload) { setItems((prev) => [{ id: uid(), ...payload }, ...prev]); }
  function updateItem(id, patch) { setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it))); }
  function deleteItem(id) { setItems((prev) => prev.filter((it) => it.id !== id)); }
  function move(id, dir) {
    const order = sortedItems.map((it) => it.id);
    const i = order.indexOf(id), j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    const reordered = [...sortedItems];
    const [moved] = reordered.splice(i, 1);
    reordered.splice(j, 0, moved);
    setItems(reordered);
  }

return (
    <div className="home-root">
      {/* Sticky: Navigation + header (exactly like other pages) */}
      <div className="sticky-shell">
        <NavigationBar />
        <header className="header header--brand">
          <div
            className="brand-left"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
          >
            <img
              src={LOGO_SRC}
              alt="Broadneck Films logo"
              className="brand-logo"
              {...longPress}
            />
            <div className="brand-titles">
              <h1 className="title">Broadneck Films</h1>
              <p className="subtitle">Filmography & credits</p>
            </div>
          </div>

          {/* ⛔ removed the Show Work button */}
          {/* <div className="header-actions">
            <button className="btn primary" onClick={() => navigate("/movies")}>Show Work</button>
          </div> */}
        </header>
      </div>

      {/* Watermark */}
      <div className="hero">
        <img src={LOGO_SRC} className="hero-watermark" alt="" aria-hidden="true" />
      </div>

      {/* Timeline ... (unchanged) */}
      <section className="timeline">
        {/* ...your cards... */}
      </section>

      {/* ⛔ removed bottom footer buttons */}
      {/* <footer className="footer">
        <button className="btn ghost" onClick={() => navigate("/music")}>Music</button>
        <button className="btn ghost" onClick={() => navigate("/gallery")}>Gallery</button>
      </footer> */}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {isAdmin && (
        <button
          className="admin-chip"
          onClick={() => signOut(getAuth())}
          title="Sign out (Ctrl+Shift+L)"
        >
          Admin • Sign out
        </button>
      )}
    </div>
  );
}

/* ---------- Timeline components ---------- */
function FilmForm({ onSubmit, initial }) {
  const [form, setForm] = useState(initial || {
    title: "", role: "", releaseDate: "", description: "", tags: "", posterUrl: "", linkTrailer: ""
  });
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: (form.tags || "").split(",").map((t) => t.trim()).filter(Boolean)
    });
    if (!initial) setForm({ title: "", role: "", releaseDate: "", description: "", tags: "", posterUrl: "", linkTrailer: "" });
  };
  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="grid">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Film title *" required />
        <input name="role" value={form.role} onChange={handleChange} placeholder="Your role (Actor / Composer / Director) *" required />
        <input name="releaseDate" value={form.releaseDate} onChange={handleChange} placeholder="Release (YYYY or YYYY-MM) *" required />
        <input name="posterUrl" value={form.posterUrl} onChange={handleChange} placeholder="Poster URL (optional)" />
        <input name="linkTrailer" value={form.linkTrailer} onChange={handleChange} placeholder="Trailer/IMDB/YouTube link (optional)" />
      </div>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short note about your contribution" rows={3} />
      <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated) e.g., Short, Feature, Indie" />
      <div className="actions"><button className="btn primary" type="submit">{initial ? "Save" : "Add"}</button></div>
    </form>
  );
}

function FilmCard({ item, admin, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false);

  return (
    <article className="card">
      <div className="card-left">
        <div className="dot" />
        <div className="dates">
          <span className="start">{item.releaseDate}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-header">
          {item.posterUrl ? (
            <img className="poster" src={item.posterUrl} alt={`${item.title} poster`} loading="lazy" />
          ) : null}
          <div>
            <h3 className="card-title">{item.title}</h3>
            <p className="meta"><strong>{item.role}</strong></p>
          </div>
        </div>

        {item.description && <p className="desc">{item.description}</p>}
        {item.tags?.length ? (
          <ul className="tags">
            {item.tags.map((t, i) => (<li key={i} className="tag">{t}</li>))}
          </ul>
        ) : null}

        {item.linkTrailer && (
          <div className="links">
            <a href={item.linkTrailer} target="_blank" rel="noreferrer" className="link">Watch Trailer</a>
          </div>
        )}

        {admin && (
          <div className="card-actions">
            <button className="btn" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn danger" onClick={onDelete}>Delete</button>
            <div className="spacer" />
            <button className="btn ghost" onClick={onMoveUp}>↑</button>
            <button className="btn ghost" onClick={onMoveDown}>↓</button>
          </div>
        )}
      </div>

      {editing && admin && (
        <Modal onClose={() => setEditing(false)}>
          <h3>Edit film</h3>
          <FilmForm
            initial={{
              title: item.title,
              role: item.role,
              releaseDate: item.releaseDate,
              description: item.description,
              tags: (item.tags || []).join(", "),
              posterUrl: item.posterUrl,
              linkTrailer: item.linkTrailer,
            }}
            onSubmit={(payload) => { onEdit(payload); setEditing(false); }}
          />
        </Modal>
      )}
    </article>
  );
}

export default Home;
