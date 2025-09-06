import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

// Place your logo at: public/brand/broadneck.png
const LOGO_SRC = "/brand/broadneck.png";

// --- Types (Film-centric)
/**
 * @typedef {Object} FilmItem
 * @property {string} id
 * @property {string} title        // Film / Project title
 * @property {string} role         // e.g., Actor, Composer, Director, Editor
 * @property {string} releaseDate  // e.g., 2024-08 or just 2024
 * @property {string} description  // Short note (scene, soundtrack style, etc.)
 * @property {string[]} tags       // e.g., ["Short", "Feature", "Indie"]
 * @property {string} posterUrl    // Optional poster/thumbnail URL
 * @property {string} linkTrailer  // Optional trailer / IMDB / YT link
 */

const STORAGE_KEY = "portfolio.filmTimeline.v1";

const uid = () => Math.random().toString(36).slice(2, 10);

const readFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeToStorage = (items) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
};

export default function Home() {
  const navigate = useNavigate();
  const [adminMode, setAdminMode] = useState(false);
  const [items, setItems] = useState(() =>
    readFromStorage() ?? [
      {
        id: uid(),
        title: "Finding Rhythm",
        role: "Composer",
        releaseDate: "2025-05",
        description:
          "Composed and produced the complete original soundtrack (ambient + percussive themes).",
        tags: ["Short", "OST"],
        posterUrl: "",
        linkTrailer: "",
      },
      {
        id: uid(),
        title: "Streetlight Stories",
        role: "Actor",
        releaseDate: "2024-11",
        description:
          "Played a supporting role; key scene in Act II at the riverside sequence.",
        tags: ["Indie"],
        posterUrl: "",
        linkTrailer: "",
      },
    ]
  );

  useEffect(() => { writeToStorage(items); }, [items]);

  const sortedItems = useMemo(() => {
    const parse = (d) => (d || "0000-00").padEnd(7, "-00");
    return [...items].sort((a, b) => (parse(b.releaseDate) > parse(a.releaseDate) ? 1 : -1));
  }, [items]);

  // CRUD
  const addItem = (payload) => setItems((prev) => [{ id: uid(), ...payload }, ...prev]);
  const updateItem = (id, patch) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const deleteItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
  const move = (id, dir) => {
    const order = sortedItems.map((it) => it.id);
    const i = order.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    const reordered = [...sortedItems];
    const [moved] = reordered.splice(i, 1);
    reordered.splice(j, 0, moved);
    setItems(reordered);
  };

  // Import/Export
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "film-timeline.json"; a.click(); URL.revokeObjectURL(url);
  };
  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) setItems(data.map((d) => ({ id: uid(), ...d })));
      } catch { alert("Invalid JSON file"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="home-root">
      {/* Header with brand logo */}
      <header className="header header--brand">
        <div className="brand-left" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <img src={LOGO_SRC} alt="Broadneck Films logo" className="brand-logo" />
          <div className="brand-titles">
            <h1 className="title">Broadneck Films</h1>
            <p className="subtitle">Filmography & credits</p>
          </div>
        </div>
        <div className="header-actions">
          <label className="admin-toggle">
            <input type="checkbox" checked={adminMode} onChange={(e) => setAdminMode(e.target.checked)} />
            <span>Admin mode</span>
          </label>
          <button className="btn primary" onClick={() => navigate("/movies")}>Show Work</button>
        </div>
      </header>

      {/* Subtle logo watermark */}
      <div className="hero">
        <img src={LOGO_SRC} className="hero-watermark" alt="" aria-hidden="true" />
      </div>

      {/* Admin toolbar */}
      {adminMode && (
        <div className="toolbar">
          <FilmForm onSubmit={addItem} />
          <div className="io-group">
            <button className="btn" onClick={exportJSON}>Export JSON</button>
            <label className="btn file">Import JSON
              <input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
            </label>
            <button className="btn danger" onClick={() => setItems([])}>Clear</button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <section className="timeline">
        {sortedItems.length === 0 ? (
          <p className="empty">No films yet. {adminMode ? "Add your first credit above." : ""}</p>
        ) : (
          sortedItems.map((item) => (
            <FilmCard
              key={item.id}
              item={item}
              admin={adminMode}
              onEdit={(patch) => updateItem(item.id, patch)}
              onDelete={() => deleteItem(item.id)}
              onMoveUp={() => move(item.id, -1)}
              onMoveDown={() => move(item.id, 1)}
            />
          ))
        )}
      </section>

      <footer className="footer">
        <button className="btn ghost" onClick={() => navigate("/music")}>Music</button>
        <button className="btn ghost" onClick={() => navigate("/gallery")}>Gallery</button>
      </footer>
    </div>
  );
}

function FilmForm({ onSubmit, initial }) {
  const [form, setForm] = useState(
    initial || {
      title: "",
      role: "",
      releaseDate: "",
      description: "",
      tags: "",
      posterUrl: "",
      linkTrailer: "",
    }
  );

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: (form.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
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
            {item.tags.map((t, i) => (
              <li key={i} className="tag">{t}</li>
            ))}
          </ul>
        ) : null}

        <div className="links">
          {item.linkTrailer && (
            <a href={item.linkTrailer} target="_blank" rel="noreferrer" className="link">Watch Trailer</a>
          )}
        </div>

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

      {editing && (
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
