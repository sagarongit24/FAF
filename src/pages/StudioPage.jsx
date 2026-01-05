// src/pages/StudioPage.jsx
import React from "react";
import { useAdmin } from "../lib/admin";

const LOGO = "/brand/broadneck.png";

export default function StudioPage() {
  const { isAdmin } = useAdmin();

  return (
    <div className="page">
      <div className="sticky-shell">
        <header className="section-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="Broadneck Films" className="brand-logo" />
            <div className="brand-titles">
              <h1 className="title">Studio</h1>
              <p className="subtitle">Space, gear & equipment</p>
            </div>
          </div>
        </header>
      </div>

      <div className="section-hero">
        <img src={LOGO} className="section-watermark" alt="" />
      </div>

      {/* Studio info */}
      <div className="empty-state">
        <div className="empty-icon">🎬</div>
        <h3>Studio Information</h3>
        <p>
          Details about our recording studio, equipment, and booking will appear here.
        </p>
      </div>

      {isAdmin && (
        <section className="card" style={{ marginTop: 24 }}>
          <h3>Admin: Studio Management</h3>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            Add studio details, equipment list, and booking information.
          </p>
        </section>
      )}
    </div>
  );
}