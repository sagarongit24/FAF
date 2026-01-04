import React from "react";
import { useAdmin } from "../lib/admin";

export default function ServicesPage() {
  const { isAdmin } = useAdmin();

  return (
    <div className="page">
      <header className="section-header header--brand">
        <div className="brand-left">
          <img src="/brand/broadneck.png" alt="" className="brand-logo" />
          <div className="brand-titles">
            <h1 className="title">Services</h1>
            <p className="subtitle">What we offer</p>
          </div>
        </div>
      </header>

      {isAdmin && (
        <section className="card" style={{ marginTop: 24 }}>
          {/* your existing services add form here */}
        </section>
      )}
      {/* public list of services below */}
    </div>
  );
}
