import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import MoviesPage from "./pages/movies";
import MusicPage from "./pages/music";
import GalleryPage from "./pages/galllery";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
