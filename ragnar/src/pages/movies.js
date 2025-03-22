import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import "../styles/movies.css";

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
    setMovies(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
    } catch (error) {
      console.error("Error extracting Video ID:", error);
      return null;
    }
  };

  const fetchYouTubeDetails = async (videoId) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        showSnackbar("No details found for this video.");
        return null;
      }

      const videoDetails = data.items[0].snippet;
      const title = videoDetails.title;
      const description = videoDetails.description.split("\n")[0]; // First paragraph as summary
      const premiered = videoDetails.publishedAt.split("T")[0]; // YYYY-MM-DD format

      return {
        name: title,
        url: youtubeURL,
        premiered,
        description,
      };
    } catch (error) {
      console.error("Error fetching YouTube details:", error);
      showSnackbar("Failed to fetch video details.");
      return null;
    }
  };

  const handleAddMovie = async () => {
    const videoId = extractVideoId(youtubeURL);
    if (!videoId) {
      showSnackbar("Invalid YouTube URL.");
      return;
    }

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
    const snackbar = document.getElementById("snackbar");
    snackbar.className = "snackbar show";
    setTimeout(() => {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
  };

  return (
    <div className="movies-page">
      <NavigationBar />
      <h1 className="movies-title">🎬 Featured Movies</h1>

      <div className="add-movie-form">
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={youtubeURL}
          onChange={(e) => setYoutubeURL(e.target.value)}
        />
        <button onClick={handleAddMovie}>Post</button>
      </div>

      <div className={`movies-grid ${selectedMovie ? "blur-background" : ""}`}>
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
            <img
              src={`https://img.youtube.com/vi/${extractVideoId(movie.url)}/maxresdefault.jpg`}
              alt={movie.name}
            />
            <div className="movie-card-content">
              <h3 className="movie-title">{movie.name}</h3>
              <p className="movie-date">
                <span>Premiered:</span> {movie.premiered}
              </p>
              <p className="movie-description">{movie.description}</p>

              <button className="delete-button" onClick={(e) => {
                e.stopPropagation();
                handleDeleteMovie(movie.id);
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <div className="video-modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <iframe
              className="video-player"
              src={`https://www.youtube.com/embed/${extractVideoId(selectedMovie.url)}?autoplay=1`}
              title={selectedMovie.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <div id="snackbar" className="snackbar">{snackbarMessage}</div>
    </div>
  );
}

export default MoviesPage;
