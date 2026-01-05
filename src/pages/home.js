// src/pages/home.js - WITH BROADNECK FILMS PRE-LOADED
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAdmin, useLongPress } from "../lib/admin";
import LoginModal from "../components/LoginModal";

const LOGO_SRC = "/brand/broadneck.png";

/* ==================== LOCAL STORAGE ==================== */
const STORAGE_KEY = "portfolio.filmTimeline.v1";
const uid = () => Math.random().toString(36).slice(2, 10);

// BROADNECK FILMS - Pre-populated data
const INITIAL_FILMS = [
  {
    id: "yaaru-yenu",
    title: "YAARU YENU MADUVARU | Episode 1 - LIGHTS",
    role: "Director, Writer",
    releaseDate: "2025-08",
    description: "A night at the bar turns uneasy when an old debt resurfaces. Three friends follow a lead promising solution, only to find themselves pulled into a spiral of chaos.",
    tags: ["Action", "Thriller", "Series"],
    posterUrl: "",
    linkTrailer: "https://www.youtube.com/@broadneckfilms"
  },
  {
    id: "purloined",
    title: "PURLOINED POSSESSION",
    role: "Writer & Director: Davis",
    releaseDate: "2024-12",
    description: "In his pursuit of a master of disguise, Vinay finds himself drawn into a world where deception reigns and identities are fluid, forcing him to confront the shadows within himself.",
    tags: ["Mystery", "Thriller", "Psychological"],
    posterUrl: "",
    linkTrailer: "https://www.youtube.com/@broadneckfilms"
  },
  {
    id: "venus",
    title: "VENUS: TRY FLAP",
    role: "Writer & Director: Vamshi",
    releaseDate: "2024-10",
    description: "In the bustling, mist-laden Silicon City of 2028, Shukra stumbles upon a mysterious bag of oranges. What seems trivial quickly spirals into an unexpected journey.",
    tags: ["Sci-Fi", "Mystery", "Experimental"],
    posterUrl: "",
    linkTrailer: "https://www.youtube.com/@broadneckfilms"
  },
  {
    id: "surface",
    title: "SURFACE TENSION",
    role: "Writer & Director: Vamshi",
    releaseDate: "2024-07",
    description: "Rudra Residency seems to have a problem within its walls. Vivek and Sampath soon discover that their metal tools are of no use to fix the real issue hidden underneath.",
    tags: ["Mystery", "Short Film", "Suspense"],
    posterUrl: "",
    linkTrailer: "https://www.youtube.com/@broadneckfilms"
  },
  {
    id: "unfinished",
    title: "UNFINISHED HOPE",
    role: "Writer & Director: Srikanth Richi",
    releaseDate: "2024-04",
    description: "A woman's life takes a complex turn when she forgets to take her Hallucination pills while also discovering a personal connection to the case of a missing person.",
    tags: ["Thriller", "Psychological", "Kannada"],
    posterUrl: "",
    linkTrailer: "https://www.youtube.com/@broadneckfilms"
  },
  {
    id: "spaced",
    title: "SPACED OUT",
    role: "Writer & Director: Hari Haran R",
    releaseDate: "2023-01",
    description: "An exploration of isolation and psychological space.",
    tags: ["Experimental", "Psychological"],
    posterUrl: "",
    linkTrailer: "https://www.youtube.com/@broadneckfilms"
  },
  {
    id: "amygdala",
    title: "AMYGDALA",
    role: "Writer & Director: Sohan Shetty C",
    releaseDate: "2022-01",
    description: "A deep dive into fear, memory, and the human psyche.",
    tags: ["Psychological", "Drama", "Experimental"],
    posterUrl: "",
    linkTrailer: "https://www.youtube.com/@broadneckfilms"
  }
];

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_FILMS; // Return pre-loaded films if nothing in storage
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FILMS;
  } catch {
    return INITIAL_FILMS;
  }
}

function writeToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

/* ==================== REUSABLE MODAL ==================== */
function Modal({ children, onClose }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
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

/* ==================== FILM FORM ==================== */
function FilmForm({ onSubmit, initial }) {
  const [form, setForm] = useState(initial || {
    title: "",
    role: "",
    releaseDate: "",
    description: "",
    tags: "",
    posterUrl: "",
    linkTrailer: ""
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: (form.tags || "").split(",").map((t) => t.trim()).filter(Boolean)
    });
    
    if (!initial) {
      setForm({
        title: "",
        role: "",
        releaseDate: "",
        description: "",
        tags: "",
        posterUrl: "",
        linkTrailer: ""
      });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="grid">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Film title *"
          required
        />
        <input
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Your role (Director / Writer / Composer) *"
          required
        />
        <input
          name="releaseDate"
          value={form.releaseDate}
          onChange={handleChange}
          placeholder="Release (YYYY or YYYY-MM) *"
          required
        />
      </div>
      <input
        name="posterUrl"
        value={form.posterUrl}
        onChange={handleChange}
        placeholder="Poster URL (optional)"
      />
      <input
        name="linkTrailer"
        value={form.linkTrailer}
        onChange={handleChange}
        placeholder="Trailer/YouTube link (optional)"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Short synopsis"
        rows={3}
      />
      <input
        name="tags"
        value={form.tags}
        onChange={handleChange}
        placeholder="Tags (comma separated) e.g., Thriller, Mystery, Short Film"
      />
      <div className="actions">
        <button className="btn primary" type="submit">
          {initial ? "Save Changes" : "Add Film"}
        </button>
      </div>
    </form>
  );
}

/* ==================== FILM CARD ==================== */
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
          {item.posterUrl && (
            <img
              className="poster"
              src={item.posterUrl}
              alt={`${item.title} poster`}
              loading="lazy"
            />
          )}
          <div>
            <h3 className="card-title">{item.title}</h3>
            <p className="meta">
              <strong>{item.role}</strong>
            </p>
          </div>
        </div>

        {item.description && <p className="desc">{item.description}</p>}

        {item.tags?.length > 0 && (
          <ul className="tags">
            {item.tags.map((t, i) => (
              <li key={i} className="tag">
                {t}
              </li>
            ))}
          </ul>
        )}

        {item.linkTrailer && (
          <div className="links">
            <a
              href={item.linkTrailer}
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              Watch Film
            </a>
          </div>
        )}

        {admin && (
          <div className="card-actions">
            <button className="btn" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn danger" onClick={onDelete}>
              Delete
            </button>
            <div className="spacer" />
            <button className="btn ghost" onClick={onMoveUp} title="Move up">
              ↑
            </button>
            <button className="btn ghost" onClick={onMoveDown} title="Move down">
              ↓
            </button>
          </div>
        )}
      </div>

      {editing && admin && (
        <Modal onClose={() => setEditing(false)}>
          <h3>Edit Film</h3>
          <FilmForm
            initial={{
              title: item.title,
              role: item.role,
              releaseDate: item.releaseDate,
              description: item.description,
              tags: (item.tags || []).join(", "),
              posterUrl: item.posterUrl,
              linkTrailer: item.linkTrailer
            }}
            onSubmit={(payload) => {
              onEdit(payload);
              setEditing(false);
            }}
          />
        </Modal>
      )}
    </article>
  );
}

/* ==================== HOME PAGE ==================== */
function Home() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [loginOpen, setLoginOpen] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const longPress = useLongPress(() => setLoginOpen(true), 1200);

  // Keyboard shortcut to sign out (Ctrl+Shift+L)
  useEffect(() => {
    const auth = getAuth();
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        signOut(auth);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Local timeline data - pre-populated with your films
  const [items, setItems] = useState(() => readFromStorage());

  useEffect(() => {
    writeToStorage(items);
  }, [items]);

  const sortedItems = useMemo(() => {
    const normalize = (d) => (d || "0000-00").padEnd(7, "-00");
    return [...items].sort((a, b) =>
      normalize(b.releaseDate) > normalize(a.releaseDate) ? 1 : -1
    );
  }, [items]);

  function addItem(payload) {
    setItems((prev) => [{ id: uid(), ...payload }, ...prev]);
  }

  function updateItem(id, patch) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function deleteItem(id) {
    if (!window.confirm("Delete this film from your timeline?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function move(id, dir) {
    const order = sortedItems.map((it) => it.id);
    const i = order.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    
    const reordered = [...sortedItems];
    const [moved] = reordered.splice(i, 1);
    reordered.splice(j, 0, moved);
    setItems(reordered);
  }

  return (
    <div className="home-root">
      <div className="sticky-shell">
        <header className="header header--brand">
          <div
            className="brand-left"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && navigate("/")}
          >
            <img
              src={LOGO_SRC}
              alt="Broadneck Films logo"
              className="brand-logo"
              {...longPress}
            />
            <div className="brand-titles">
              <h1 className="title">Broadneck Films</h1>
              <p className="subtitle">Independent Cinema • Bengaluru</p>
            </div>
          </div>

          {isAdmin && (
            <div className="header-actions">
              <button
                className="btn primary"
                onClick={() => setAddingItem(true)}
              >
                Add Film
              </button>
            </div>
          )}
        </header>
      </div>

      {/* Watermark */}
      <div className="hero">
        <img
          src={LOGO_SRC}
          className="hero-watermark"
          alt=""
          aria-hidden="true"
        />
      </div>

      {/* Timeline */}
      <section className="timeline">
        {sortedItems.map((item) => (
          <FilmCard
            key={item.id}
            item={item}
            admin={isAdmin}
            onEdit={(patch) => updateItem(item.id, patch)}
            onDelete={() => deleteItem(item.id)}
            onMoveUp={() => move(item.id, -1)}
            onMoveDown={() => move(item.id, 1)}
          />
        ))}
      </section>

      {/* Modals */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {addingItem && isAdmin && (
        <Modal onClose={() => setAddingItem(false)}>
          <h3>Add New Film</h3>
          <FilmForm
            onSubmit={(data) => {
              addItem(data);
              setAddingItem(false);
            }}
          />
        </Modal>
      )}

      {/* Admin chip */}
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

export default Home;