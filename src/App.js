// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/home";
import MoviesPage from "./pages/movies";
import MusicPage from "./pages/music";
import GalleryPage from "./pages/gallery";
import TeamPage from "./pages/TeamPage";
import StudioPage from "./pages/StudioPage";
import ServicesPage from "./pages/ServicesPage";

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/services" element={<ServicesPage />} />
            
            {/* Redirects for deleted pages */}
            <Route path="/stills" element={<Navigate to="/gallery" replace />} />
            <Route path="/timeline" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Global snackbar for notifications */}
        <div id="snackbar" className="snackbar"></div>
      </div>
    </Router>
  );
}

export default App;