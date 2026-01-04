import React, { useEffect, useState, useRef } from "react";
import { useAdmin } from "../lib/admin";
// if you already have uploader helpers, keep them; otherwise leave upload UI gated and minimal

export default function StillsPage() {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stills, setStills] = useState([]);

  // load list (safe even if public)
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        // TODO: your Firestore fetch for stills collection
        setStills([]); // keep placeholder empty data
      } catch (e) {
        setError("Failed to load stills");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="page">
      <header className="section-header header--brand">
        <div className="brand-left">
          <img src="/brand/broadneck.png" alt="" className="brand-logo" />
          <div className="brand-titles">
            <h1 className="title">Stills</h1>
            <p className="subtitle">Film stills & behind-the-scenes</p>
          </div>
        </div>
      </header>

      {/* Admin-only upload UI */}
      {isAdmin && (
        <section className="card" style={{ marginTop: 16 }}>
          {/* your existing stills uploader inputs here */}
        </section>
      )}

      {error && <div className="state error">{error}</div>}
      {loading ? (
        <div className="state note">Loading…</div>
      ) : stills.length === 0 ? (
        <div className="state note">No stills yet.</div>
      ) : (
        <div>{/* your slider/grid */}</div>
      )}
    </div>
  );
}
