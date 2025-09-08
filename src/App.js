import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import MoviesPage from "./pages/movies";
import MusicPage from "./pages/music";
import GalleryPage from "./pages/galllery";
import TeamPage from "./pages/TeamPage";
import StudioPage from "./pages/StudioPage";
import ServicesPage from "./pages/ServicesPage";
import StillsPage from "./pages/StillsPage";
import TimelinePage from "./pages/TimelinePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/stills" element={<StillsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
