// src/pages/movies.js
import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useAdmin, useLongPress, showSnackbar } from "../lib/admin";
import LoginModal from "../components/LoginModal";
import "../styles/global.css";
import "../styles/movies.css";

const LOGO = "/brand/broadneck.png";

/* ==================== MOVIES PAGE ==================== */
function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [youtubeURL, setYoutubeURL] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isAdmin } = useAdmin();
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

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "movies"), orderBy("premiered", "desc"));
      const snap = await getDocs(q);
      setMovies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching movies:", err);
      // Fallback: fetch without ordering
      try {
        const snap = await getDocs(collection(db, "movies"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort(
          (a, b) =>
            (Date.parse(b.premiered || "") || 0) -
            (Date.parse(a.premiered || "") || 0)
        );
        setMovies(data);
      } catch (fallbackErr) {
        console.error("Fallback fetch failed:", fallbackErr);
        showSnackbar("Failed to load movies");
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
        name: sn.title,
        url: youtubeURL,
        premiered: sn.publishedAt.split("T")[0], // YYYY-MM-DD
        description: (sn.description || "").split("\n")[0]
      };
    } catch (err) {
      console.error("YouTube API error:", err);
      showSnackbar("Failed to fetch video details");
      return null;
    }
  };

  const handleAddMovie = async () => {
    if (!isAdmin) return;

    const videoId = extractVideoId(youtubeURL);
    if (!videoId) {
      showSnackbar("Invalid YouTube URL");
      return;
    }

    const movieData = await fetchYouTubeDetails(videoId);
    if (movieData) {
      try {
        await addDoc(collection(db, "movies"), movieData);
        setYoutubeURL("");
        fetchMovies();
        showSnackbar("Movie added successfully!");
      } catch (err) {
        console.error("Error adding movie:", err);
        showSnackbar("Failed to add movie");
      }
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this movie?")) return;

    try {
      await deleteDoc(doc(db, "movies", id));
      fetchMovies();
      showSnackbar("Movie deleted successfully!");
    } catch (err) {
      console.error("Error deleting movie:", err);
      showSnackbar("Failed to delete movie");
    }
  };

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      const ta = Date.parse(a.premiered || "") || 0;
      const tb = Date.parse(b.premiered || "") || 0;
      return tb - ta;
    });
  }, [movies]);

  return (
    <div className={`movies-page ${selectedMovie ? "modal-open" : ""}`}>
      <div className="sticky-shell">
        <header className="movies-header header--brand">
          <div className="brand-left">
            <img
              src={LOGO}
              alt="Broadneck Films"
              className="brand-logo"
              {...longPress}
            />
            <div className="brand-titles">
              <h1 className="title">Featured Movies</h1>
              <p className="subtitle">Broadneck Films • Filmography & Trailers</p>
            </div>
          </div>

          {isAdmin && (
            <div className="add-movie-form">
              <input
                type="text"
                placeholder="Enter YouTube URL"
                value={youtubeURL}
                onChange={(e) => setYoutubeURL(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddMovie()}
              />
              <button className="btn primary" onClick={handleAddMovie}>
                Post
              </button>
            </div>
          )}
        </header>
      </div>

      {/* Grid */}
      <div className={`movies-grid ${selectedMovie ? "blur-background" : ""}`}>
        {loading ? (
          <div className="state note">Loading movies...</div>
        ) : sortedMovies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <h3>No Movies Yet</h3>
            <p>Featured movies and trailers will appear here.</p>
          </div>
        ) : (
          sortedMovies.map((movie) => {
            const vid = extractVideoId(movie.url);
            return (
              <article
                key={movie.id}
                className="movie-card"
                onClick={() => setSelectedMovie(movie)}
                title="Play trailer"
              >
                <div className="poster-wrap">
                  <img
                    className="movie-poster"
                    src={`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`}
                    alt={movie.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                    }}
                  />

                  <div className="poster-gradient" />
                  <div className="poster-top">
                    <span className="badge">Premiered {movie.premiered}</span>
                    {isAdmin && (
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMovie(movie.id);
                        }}
                        aria-label="Delete movie"
                        title="Delete"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="poster-bottom">
                    <h3 className="movie-title">{movie.name}</h3>
                    {movie.description && (
                      <p className="movie-desc">
                        {movie.description.split(" ").slice(0, 18).join(" ")}
                        {movie.description.split(" ").length > 18 ? "…" : ""}
                      </p>
                    )}
                    <span className="cta">Tap to watch ▶</span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Video Modal */}
      {selectedMovie && (
        <div
          className="video-modal-overlay"
          onClick={() => setSelectedMovie(null)}
        >
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <iframe
              className="video-player"
              src={`https://www.youtube.com/embed/${extractVideoId(
                selectedMovie.url
              )}?autoplay=1`}
              title={selectedMovie.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
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

export default MoviesPage;