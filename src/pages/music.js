// src/pages/music.js
import React, { useEffect, useState } from "react";
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
    loadTracks();
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    setError("");

    try {
      const q = query(collection(db, "music"), orderBy("released", "desc"));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTracks(rows);
    } catch (e) {
      console.error("Error loading music:", e);
      
      // Friendly message if rules aren't set yet
      if (e?.message?.includes("Missing or insufficient permissions")) {
        setError(
          "Can't read /music yet. Update Firestore rules to allow public read."
        );
      } else {
        setError(e?.message || "Failed to load tracks.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter tracks based on search
  const filteredTracks = tracks.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    
    const searchText = `${t.title || ""} ${t.artist || ""} ${
      (t.tags || []).join(" ")
    }`.toLowerCase();
    
    return searchText.includes(q);
  });

  return (
    <div className="music-page">
      {/* Sticky header */}
      <div className="sticky-shell">
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracks…"
            />
          </div>
        </header>
      </div>

      {/* Watermark */}
      <div className="music-hero">
        <img
          src={LOGO}
          className="music-watermark"
          alt=""
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="state note">Loading tracks...</div>
      ) : error ? (
        <div className="state error">{error}</div>
      ) : filteredTracks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <h3>
            {search.trim() ? "No tracks found" : "No tracks yet"}
          </h3>
          <p>
            {search.trim()
              ? "Try a different search term."
              : "Music tracks, scores, and sessions will appear here."}
          </p>
        </div>
      ) : (
        <div className="track-grid">
          {filteredTracks.map((t) => (
            <article key={t.id} className="track-card">
              <div className="cover-wrap">
                {t.coverUrl ? (
                  <img
                    src={t.coverUrl}
                    alt={t.title}
                    loading="lazy"
                    className="cover-img"
                  />
                ) : (
                  <div className="cover-placeholder">
                    <span>🎵</span>
                  </div>
                )}
              </div>
              <div className="track-body">
                <h3 className="track-title">{t.title}</h3>
                <p className="track-meta">
                  {(t.artist || "").trim()}
                  {t.released
                    ? (t.artist ? " • " : "") + t.released
                    : ""}
                </p>
                {t.tags?.length > 0 && (
                  <ul className="tags">
                    {t.tags.map((x, i) => (
                      <li key={i} className="tag">
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
                {t.url && (
                  <div className="actions">
                    <a
                      className="btn"
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Listen
                    </a>
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