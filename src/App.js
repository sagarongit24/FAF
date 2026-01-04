// src/App.js  (OVERRIDE)
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavigationBar from "./components/navigation";

import Home from "./pages/home";
import Movies from "./pages/movies";
import Music from "./pages/music";
import Gallery from "./pages/gallery";
import StillsPage from "./pages/StillsPage";
import TeamPage from "./pages/TeamPage";
import ServicesPage from "./pages/ServicesPage";
import StudioPage from "./pages/StudioPage";
import TimelinePage from "./pages/TimelinePage";

export default function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <div className="nav-spacer" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/music" element={<Music />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/stills" element={<StillsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
