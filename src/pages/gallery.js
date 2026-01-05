// src/pages/gallery.js
import React, { useState } from "react";

const LOGO = "/brand/broadneck.png";

export default function GalleryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="gallery-page">
      {/* Sticky header */}
      <div className="sticky-shell">
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions…"
            />
          </div>
        </header>
      </div>

      {/* Watermark */}
      <div className="gallery-hero">
        <img
          src={LOGO}
          className="gallery-watermark"
          alt=""
          aria-hidden="true"
        />
      </div>

      {/* Album grid */}
      <div className="album-grid">
        <div className="empty-state">
          <div className="empty-icon">📸</div>
          <h3>No Sessions Yet</h3>
          <p>
            Gallery sessions, behind-the-scenes photos, and stills will appear
            here.
          </p>
        </div>
      </div>
    </div>
  );
}