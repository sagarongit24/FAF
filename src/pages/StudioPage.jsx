import React from "react";
import { useAdmin } from "../lib/admin";

export default function StudioPage() {
  const { isAdmin } = useAdmin();

  return (
    <div className="page">
      <header className="section-header header--brand">
        <div className="brand-left">
          <img src="/brand/broadneck.png" alt="" className="brand-logo" />
          <div className="brand-titles">
            <h1 className="title">Studio</h1>
            <p className="subtitle">Space, gear & equipment</p>
          </div>
        </div>
      </header>

      {/* Admin-only form */}
      {isAdmin && (
        <section className="card" style={{ marginTop: 24 }}>
          {/* your existing studio add form here */}
          {/* e.g. inputs & Add button */}
        </section>
      )}
      {/* public listing remains visible below */}
    </div>
  );
}
