// src/pages/GalleryPage.jsx
import React, { useState } from "react";
import NavigationBar from "../components/NavigationBar";
import "../styles/gallery.css";

const LOGO = "/brand/broadneck.png";

export default function GalleryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="gallery-page">
      {/* Sticky stack: nav + header */}
      <div className="sticky-shell">
        <NavigationBar />
        <header className="gallery-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="Broadneck Films" className="brand-logo" />
            <div className="brand-titles">
              <h1 className="title">Gallery</h1>
              <p className="subtitle">Sessions • BTS • Stills</p>
            </div>
          </div>
          <div className="gallery-actions">
            <input
              className="search"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search sessions…"
            />
          </div>
        </header>
      </div>

      {/* Watermark */}
      <div className="gallery-hero">
        <img src={LOGO} className="gallery-watermark" alt="" aria-hidden="true" />
      </div>

      {/* Album grid – empty for now; we’ll populate next */}
      <div className="album-grid">
        {/* coming next: map over albums */}
        <div className="album-empty">No sessions yet. (We’ll add uploads next.)</div>
      </div>
    </div>
  );
}
