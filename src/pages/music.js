import React, { useEffect, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "../styles/music.css";

const LOGO = "/brand/broadneck.png";

/**
 * Expected Firestore doc shape in /music:
 * {
 *   title: string,          // track or session title
 *   artist?: string,        // optional: you / collaborators
 *   released?: string,      // YYYY-MM-DD
 *   coverUrl?: string,      // optional image url (or storage download URL)
 *   url?: string,           // optional streaming link (YT/Spotify/etc.)
 *   tags?: string[]
 * }
 */

export default function MusicPage() {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // If you don’t have released dates, you can drop orderBy
        const q = query(collection(db, "music"), orderBy("released", "desc"));
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTracks(rows);
      } catch (e) {
        // Friendly message if rules aren’t set yet
        setError(
          e?.message?.includes("Missing or insufficient permissions")
            ? "Can’t read /music yet. Update Firestore rules to allow public read."
            : (e?.message || "Failed to load tracks.")
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shown = tracks.filter(t => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const hay = `${t.title || ""} ${t.artist || ""} ${(t.tags || []).join(" ")}`.toLowerCase();
    return hay.includes(q);
  });

  return (
    <div className="music-page">
      {/* Sticky: nav + header */}
      <div className="sticky-shell">
        <NavigationBar />
        <header className="music-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="Broadneck Films" className="brand-logo" />
            <div className="brand-titles">
              <h1 className="title">Music</h1>
              <p className="subtitle">Scores • Sessions • Soundtracks</p>
            </div>
          </div>
          <div className="music-actions">
            <input
              className="search"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search tracks…"
            />
          </div>
        </header>
      </div>

      {/* Watermark */}
      <div className="music-hero">
        <img src={LOGO} className="music-watermark" alt="" aria-hidden="true" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="state note">Loading…</div>
      ) : error ? (
        <div className="state error">{error}</div>
      ) : shown.length === 0 ? (
        <div className="state note">No tracks yet.</div>
      ) : (
        <div className="track-grid">
          {shown.map(t => (
            <article key={t.id} className="track-card">
              <div className="cover-wrap">
                {t.coverUrl ? (
                  <img src={t.coverUrl} alt={t.title} loading="lazy" />
                ) : (
                  <div className="cover-ph">No cover</div>
                )}
              </div>
              <div className="track-body">
                <h3 className="track-title">{t.title}</h3>
                <p className="track-meta">
                  {(t.artist || "").trim()}
                  {t.released ? (t.artist ? " • " : "") + t.released : ""}
                </p>
                {t.tags?.length ? (
                  <ul className="tags">
                    {t.tags.map((x,i)=><li key={i} className="tag">{x}</li>)}
                  </ul>
                ) : null}
                {t.url && (
                  <div className="actions">
                    <a className="btn" href={t.url} target="_blank" rel="noreferrer">Listen</a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
