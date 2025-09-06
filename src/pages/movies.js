import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import "../styles/movies.css";

const LOGO = "/brand/broadneck.png";

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [youtubeURL, setYoutubeURL] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const querySnapshot = await getDocs(collection(db, "movies"));
    setMovies(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const extractVideoId = (url) => {
    try {
      let videoId = "";
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtube.com")) {
        videoId = parsedUrl.searchParams.get("v");
      } else if (parsedUrl.hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.substring(1);
      }
      return videoId;
    } catch {
      return null;
    }
  };

  const fetchYouTubeDetails = async (videoId) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
      );
      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        showSnackbar("No details found for this video.");
        return null;
      }
      const sn = data.items[0].snippet;
      return {
        name: sn.title,
        url: youtubeURL,
        premiered: sn.publishedAt.split("T")[0],
        description: (sn.description || "").split("\n")[0],
      };
    } catch {
      showSnackbar("Failed to fetch video details.");
      return null;
    }
  };

  const handleAddMovie = async () => {
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
    await deleteDoc(doc(db, "movies", id));
    fetchMovies();
    showSnackbar("Movie Deleted Successfully!");
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    const el = document.getElementById("snackbar");
    el.className = "snackbar show";
    setTimeout(() => (el.className = el.className.replace("show", "")), 3000);
  };

  return (
    <div className={`movies-page ${selectedMovie ? "modal-open" : ""}`}>
      {/* Top nav (likely fixed). We add page padding via CSS to avoid overlap */}
      <NavigationBar />

      {/* Brand header + input bar */}
      <header className="movies-header header--brand">
        <div className="brand-left">
          <img src={LOGO} alt="Broadneck Films" className="brand-logo" />
          <div className="brand-titles">
            <h1 className="title">Featured Movies</h1>
            <p className="subtitle">Broadneck Films • Filmography & Trailers</p>
          </div>
        </div>

        <div className="add-movie-form">
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={youtubeURL}
            onChange={(e) => setYoutubeURL(e.target.value)}
          />
          <button className="btn primary" onClick={handleAddMovie}>Post</button>
        </div>
      </header>

      {/* Subtle page watermark */}
      <div className="movies-hero">
        <img src={LOGO} className="movies-watermark" alt="" aria-hidden="true" />
      </div>

      {/* Poster grid */}
      <div className={`movies-grid ${selectedMovie ? "blur-background" : ""}`}>
        {movies.map((movie) => {
          const vid = extractVideoId(movie.url);
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

      {/* Modal player */}
      {selectedMovie && (
        <div className="video-modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <iframe
              className="video-player"
              src={`https://www.youtube.com/embed/${extractVideoId(selectedMovie.url)}?autoplay=1`}
              title={selectedMovie.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div id="snackbar" className="snackbar">{snackbarMessage}</div>
    </div>
  );
}

export default MoviesPage;
