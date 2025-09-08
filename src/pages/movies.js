import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import {
  collection, getDocs, addDoc, deleteDoc, doc, query, orderBy
} from "firebase/firestore";
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
import "../styles/global.css";
import "../styles/movies.css";

/** >>>>>>>>>> PUT YOUR ADMIN UID(S) HERE <<<<<<<<<< */
const ADMIN_UIDS = ["ltNMGWFdGBOHe0EVAjYrCXhvXdS2"];

const LOGO = "/brand/broadneck.png";

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

/* ---------- Admin state (by UID allow-list) ---------- */
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

/* ============================== PAGE ============================== */
function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [youtubeURL, setYoutubeURL] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const { isAdmin } = useAdmin();
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

  useEffect(() => { fetchMovies(); }, []);

  const fetchMovies = async () => {
    try {
      // Prefer server-side ordering by YYYY-MM-DD string
      const q = query(collection(db, "movies"), orderBy("premiered", "desc"));
      const snap = await getDocs(q);
      setMovies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      // Fallback: fetch and sort locally
      const snap = await getDocs(collection(db, "movies"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (Date.parse(b.premiered || "") || 0) - (Date.parse(a.premiered || "") || 0));
      setMovies(data);
    }
  };

  const extractVideoId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.substring(1);
      return null;
    } catch { return null; }
  };

  const fetchYouTubeDetails = async (videoId) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      if (!data.items?.length) { showSnackbar("No details found for this video."); return null; }
      const sn = data.items[0].snippet;
      return {
        name: sn.title,
        url: youtubeURL,
        premiered: sn.publishedAt.split("T")[0], // YYYY-MM-DD
        description: (sn.description || "").split("\n")[0],
      };
    } catch {
      showSnackbar("Failed to fetch video details."); return null;
    }
  };

  const handleAddMovie = async () => {
    if (!isAdmin) return; // UI guard (rules also protect)
    const videoId = extractVideoId(youtubeURL);
    if (!videoId) return showSnackbar("Invalid YouTube URL.");
    const movieData = await fetchYouTubeDetails(videoId);
    if (movieData) {
      await addDoc(collection(db, "movies"), movieData);
      setYoutubeURL("");
      fetchMovies();
      showSnackbar("Movie Added Successfully!");
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, "movies", id));
    fetchMovies();
    showSnackbar("Movie Deleted Successfully!");
  };

  const showSnackbar = (msg) => {
    setSnackbarMessage(msg);
    const el = document.getElementById("snackbar");
    if (!el) return;
    el.className = "snackbar show";
    setTimeout(() => (el.className = el.className.replace("show", "")), 3000);
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
      {/* Sticky stack: Navigation + sub-header */}
      <div className="sticky-shell">
        <NavigationBar />
        <header className="movies-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="Broadneck Films" className="brand-logo" {...longPress} />
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
              />
              <button className="btn primary" onClick={handleAddMovie}>Post</button>
            </div>
          )}
        </header>
      </div>

      {/* Grid */}
      <div className={`movies-grid ${selectedMovie ? "blur-background" : ""}`}>
        {sortedMovies.map((movie) => {
          const vid = extractVideoId(movie.url);
          // 16:9 thumbnail (YouTube). If maxres is missing for some videos, swap to hqdefault.jpg
          const thumb = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
          return (
            <article
              key={movie.id}
              className="movie-card"
              onClick={() => setSelectedMovie(movie)}
              title="Play trailer"
            >
              <div className="poster-wrap">
                <img className="poster" src={thumb} alt={movie.name} loading="lazy" />
                <div className="poster-gradient" />
                <div className="poster-top">
                  <span className="badge">Premiered {movie.premiered}</span>
                  {isAdmin && (
                    <button
                      className="delete-button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteMovie(movie.id); }}
                      aria-label="Delete movie"
                      title="Delete"
                    >×</button>
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
        })}
      </div>

      {/* Modal */}
      {selectedMovie && (
        <div className="video-modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <iframe
              className="video-player"
              src={`https://www.youtube.com/embed/${(function getId(u){try{const x=new URL(u);if(x.hostname.includes("youtube.com"))return x.searchParams.get("v");if(x.hostname.includes("youtu.be"))return x.pathname.substring(1);}catch{} return "";})(selectedMovie.url)}?autoplay=1`}
              title={selectedMovie.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
      <div id="snackbar" className="snackbar">{snackbarMessage}</div>

      {/* Discreet sign-out chip (only visible when admin) */}
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
