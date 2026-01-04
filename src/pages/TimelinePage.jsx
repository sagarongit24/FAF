import React from "react";
import { useAdmin } from "../lib/admin";

export default function TimelinePage() {
  const { isAdmin } = useAdmin();

  return (
    <div className="page">
      <header className="section-header header--brand">
        <div className="brand-left">
          <img src="/brand/broadneck.png" alt="" className="brand-logo" />
          <div className="brand-titles">
            <h1 className="title">Timeline</h1>
            <p className="subtitle">Project timeline</p>
          </div>
        </div>
      </header>

      {isAdmin && (
        <section className="card" style={{ marginTop: 24 }}>
          {/* your existing timeline add form here */}
        </section>
      )}
      {/* public timeline list below */}
    </div>
  );
}
