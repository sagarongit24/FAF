import React, { useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import {
  collection, doc, setDoc, deleteDoc, getDocs, query
} from "firebase/firestore";
import { useAdmin } from "../lib/admin"; // your existing hidden-admin hook
import { uploadTeamImage } from "../lib/uploader";
import "../styles/team.css";

const LOGO = "/brand/broadneck.png";

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TeamPage() {
  const isAdmin = useAdmin();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nameRef = useRef(null);
  const roleRef = useRef(null);
  const bioRef  = useRef(null);
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(query(collection(db, "team")));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(shuffleInPlace(list)); // shuffle every mount
    } catch (e) {
      setError("Failed to load team. Check Firestore rules/connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addMember(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const name = nameRef.current.value.trim();
    const role = roleRef.current.value.trim();
    const bio  = bioRef.current.value.trim();
    const file = fileRef.current?.files?.[0];

    if (!name || !file) {
      setError("Please provide a name and a photo.");
      setSaving(false);
      return;
    }

    try {
      // create a docId first so our storage path can include it
      const newRef = doc(collection(db, "team"));
      const up = await uploadTeamImage(file, newRef.id);

      await setDoc(newRef, {
        name, role, bio,
        photoUrl: up.url,
        provider: up.provider || "firebase",
        publicId: up.publicId || "",  // if Cloudinary
        createdAt: Date.now()
      });

      // reset form & refresh
      e.target.reset();
      await load();
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to save member.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(id) {
    if (!window.confirm("Delete this member?")) return;
    try {
      await deleteDoc(doc(db, "team", id));
      await load();
    } catch (e) {
      setError("Failed to delete.");
    }
  }

  return (
    <div className="team-page">
      <div className="sticky-shell">
        <NavigationBar />
        <header className="section-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="" className="brand-logo" />
            <div className="brand-titles">
              <h1 className="title">Team</h1>
              <p className="subtitle">Members & collaborators</p>
            </div>
          </div>
        </header>
      </div>

      <div className="section-hero">
        <img src={LOGO} className="section-watermark" alt="" />
      </div>

      {isAdmin && (
        <form className="form" onSubmit={addMember} style={{ marginTop: 12 }}>
          <div className="grid-4">
            <input ref={nameRef} placeholder="Name *" />
            <input ref={roleRef} placeholder="Role (optional)" />
            <input ref={fileRef} type="file" accept="image/*" />
            <button className="btn primary" disabled={saving}>
              {saving ? "Saving…" : "Add member"}
            </button>
          </div>
          <textarea ref={bioRef} placeholder="Short intro / bio (optional)" style={{ marginTop: 8 }} />
        </form>
      )}

      {error && <div className="state error">{error}</div>}
      {loading ? (
        <div className="state note">Loading…</div>
      ) : members.length === 0 ? (
        <div className="state note">No team yet.</div>
      ) : (
        <div className="team-grid">
          {members.map(m => (
            <article key={m.id} className="team-card card">
              <div className="avatar-wrap">
                <img className="avatar-sq" src={m.photoUrl} alt={m.name} />
              </div>
              <div className="team-body">
                <h3 className="team-name">{m.name}</h3>
                {m.role ? <p className="team-role">{m.role}</p> : null}
                {m.bio ? <p className="team-bio">{m.bio}</p> : null}
                {isAdmin && (
                  <div className="card-actions">
                    <span className="spacer" />
                    <button className="btn danger" onClick={() => removeMember(m.id)}>Delete</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
