// src/pages/music.js - YOUTUBE INTEGRATION
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  query 
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useAdmin, useLongPress, showSnackbar } from "../lib/admin";
import LoginModal from "../components/LoginModal";
import MusicPlayer from "../components/MusicPlayer";

const LOGO = "/brand/broadneck.png";

export default function MusicPage() {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [youtubeURL, setYoutubeURL] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  const { isAdmin } = useAdmin();
  const longPress = useLongPress(() => setLoginOpen(true), 1200);

  // Keyboard shortcut to sign out
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

  const extractVideoId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        return u.searchParams.get("v");
      }
      if (u.hostname.includes("youtu.be")) {
        return u.pathname.substring(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchYouTubeDetails = async (videoId) => {
    try {
      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      if (!apiKey) {
        showSnackbar("YouTube API key not configured");
        return null;
      }

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
      );
      const data = await res.json();

      if (!data.items?.length) {
        showSnackbar("No details found for this video");
        return null;
      }

      const sn = data.items[0].snippet;
      return {
        title: sn.title,
        artist: "Broadneck Films",
        url: youtubeURL,
        released: sn.publishedAt.split("T")[0],
        coverUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        tags: ["Soundtrack", "Original Score"]
      };
    } catch (err) {
      console.error("YouTube API error:", err);
      showSnackbar("Failed to fetch video details");
      return null;
    }
  };

  const handleAddTrack = async () => {
    if (!isAdmin) return;

    const videoId = extractVideoId(youtubeURL);
    if (!videoId) {
      showSnackbar("Invalid YouTube URL");
      return;
    }

    const trackData = await fetchYouTubeDetails(videoId);
    if (trackData) {
      try {
        await addDoc(collection(db, "music"), trackData);
        setYoutubeURL("");
        loadTracks();
        showSnackbar("Track added successfully!");
      } catch (err) {
        console.error("Error adding track:", err);
        showSnackbar("Failed to add track");
      }
    }
  };

  const handleDeleteTrack = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this track?")) return;

    try {
      await deleteDoc(doc(db, "music", id));
      loadTracks();
      showSnackbar("Track deleted successfully!");
    } catch (err) {
      console.error("Error deleting track:", err);
      showSnackbar("Failed to delete track");
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
            <img 
              src={LOGO} 
              alt="Broadneck Films" 
              className="brand-logo"
              {...longPress}
            />
            <div className="brand-titles">
              <h1 className="title">Music</h1>
              <p className="subtitle">Original Scores • Soundtracks • Sessions</p>
            </div>
          </div>

          {isAdmin ? (
            <div className="add-movie-form">
              <input
                type="text"
                placeholder="Enter YouTube URL"
                value={youtubeURL}
                onChange={(e) => setYoutubeURL(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTrack()}
              />
              <button className="btn primary" onClick={handleAddTrack}>
                Add Track
              </button>
            </div>
          ) : (
            <div className="music-actions">
              <input
                className="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracks…"
              />
            </div>
          )}
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
              : "Original film scores and soundtracks will appear here."}
          </p>
        </div>
      ) : (
        <div className="track-grid">
          {filteredTracks.map((t) => {
            const videoId = extractVideoId(t.url);
            const thumbnail = videoId
              ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : t.coverUrl;

            return (
              <article 
                key={t.id} 
                className="track-card card"
                onClick={() => setSelectedTrack(t)}
                style={{ cursor: 'pointer' }}
              >
                <div className="cover-wrap">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={t.title}
                      loading="lazy"
                      className="cover-img"
                      onError={(e) => {
                        e.currentTarget.src = videoId
                          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                          : "";
                      }}
                    />
                  ) : (
                    <div className="cover-placeholder">
                      <span>🎵</span>
                    </div>
                  )}
                  <div className="cover-play-overlay">
                    <div className="play-button">▶</div>
                  </div>
                </div>
                <div className="track-body">
                  <h3 className="track-title">{t.title}</h3>
                  <p className="track-meta">
                    {(t.artist || "Broadneck Films").trim()}
                    {t.released ? " • " + t.released : ""}
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
                  <div className="actions">
                    <button
                      className="btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrack(t);
                      }}
                    >
                      Play Track
                    </button>
                    {isAdmin && (
                      <button
                        className="btn danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrack(t.id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Music Player Modal */}
      {selectedTrack && (
        <MusicPlayer
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      )}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      <div id="snackbar" className="snackbar"></div>

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