// src/pages/ServicesPage.jsx
import React from "react";
import { useAdmin } from "../lib/admin";

const LOGO = "/brand/broadneck.png";

export default function ServicesPage() {
  const { isAdmin } = useAdmin();

  return (
    <div className="page">
      <div className="sticky-shell">
        <header className="section-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="Broadneck Films" className="brand-logo" />
            <div className="brand-titles">
              <h1 className="title">Services</h1>
              <p className="subtitle">What we offer</p>
            </div>
          </div>
        </header>
      </div>

      <div className="section-hero">
        <img src={LOGO} className="section-watermark" alt="" />
      </div>

      {/* Services grid */}
      <div className="empty-state">
        <div className="empty-icon">🎥</div>
        <h3>Services Coming Soon</h3>
        <p>
          Film production, music composition, sound design, and more.
        </p>
      </div>

      {isAdmin && (
        <section className="card" style={{ marginTop: 24 }}>
          <h3>Admin: Add Services</h3>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            Service management form coming soon.
          </p>
        </section>
      )}
    </div>
  );
}