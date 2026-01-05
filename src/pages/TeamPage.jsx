// src/pages/TeamPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useAdmin, useLongPress } from "../lib/admin";
import LoginModal from "../components/LoginModal";
import { uploadTeamImage } from "../lib/uploader";

const LOGO = "/brand/broadneck.png";

export default function TeamPage() {
  const { isAdmin } = useAdmin();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  const longPress = useLongPress(() => setLoginOpen(true), 1200);

  const nameRef = useRef(null);
  const roleRef = useRef(null);
  const bioRef = useRef(null);
  const fileRef = useRef(null);

  // Keyboard shortcut to sign out (Ctrl+Shift+L)
  useEffect(() => {
    const auth = getAuth();
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        signOut(auth);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(query(collection(db, "team")));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMembers(list);
    } catch (err) {
      console.error("Error loading team:", err);
      setError("Failed to load team. Check Firestore rules/connection.");
    } finally {
      setLoading(false);
    }
  }

  async function addMember(e) {
    e.preventDefault();
    if (!isAdmin) return;

    setSaving(true);
    setError("");

    const name = nameRef.current.value.trim();
    const role = roleRef.current.value.trim();
    const bio = bioRef.current.value.trim();
    const file = fileRef.current?.files?.[0];

    if (!name || !file) {
      setError("Please provide a name and a photo.");
      setSaving(false);
      return;
    }

    try {
      const newRef = doc(collection(db, "team"));
      const uploadResult = await uploadTeamImage(file, newRef.id);

      await setDoc(newRef, {
        name,
        role,
        bio,
        photoUrl: uploadResult.url,
        provider: uploadResult.provider || "cloudinary",
        publicId: uploadResult.publicId || "",
        createdAt: Date.now()
      });

      e.target.reset();
      await loadMembers();
    } catch (err) {
      console.error("Error adding member:", err);
      setError(err.message || "Failed to save member.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(id) {
    if (!isAdmin) return;
    if (!window.confirm("Delete this team member?")) return;

    try {
      await deleteDoc(doc(db, "team", id));
      await loadMembers();
    } catch (err) {
      console.error("Error deleting member:", err);
      setError("Failed to delete member.");
    }
  }

  return (
    <div className="team-page">
      <div className="sticky-shell">
        <header className="section-header header--brand">
          <div className="brand-left">
            <img
              src={LOGO}
              alt="Broadneck Films"
              className="brand-logo"
              {...longPress}
            />
            <div className="brand-titles">
              <h1 className="title">Team</h1>
              <p className="subtitle">Members & Collaborators</p>
            </div>
          </div>
        </header>
      </div>

      <div className="section-hero">
        <img src={LOGO} className="section-watermark" alt="" />
      </div>

      {/* Admin-only form */}
      {isAdmin && (
        <form className="form" onSubmit={addMember} style={{ marginTop: 12 }}>
          <div className="grid-4">
            <input ref={nameRef} placeholder="Name *" required />
            <input ref={roleRef} placeholder="Role (optional)" />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              required
            />
            <button className="btn primary" disabled={saving}>
              {saving ? "Saving…" : "Add Member"}
            </button>
          </div>
          <textarea
            ref={bioRef}
            placeholder="Short intro / bio (optional)"
            style={{ marginTop: 8 }}
            rows={3}
          />
        </form>
      )}

      {error && <div className="state error">{error}</div>}

      {loading ? (
        <div className="state note">Loading team members...</div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Team Members Yet</h3>
          <p>Team members and collaborators will appear here.</p>
        </div>
      ) : (
        <div className="team-grid">
          {members.map((m) => (
            <article key={m.id} className="team-card card">
              <div className="avatar-wrap">
                <img
                  className="avatar-sq"
                  src={m.photoUrl}
                  alt={m.name}
                  loading="lazy"
                />
              </div>
              <div className="team-body">
                <h3 className="team-name">{m.name}</h3>
                {m.role && <p className="team-role">{m.role}</p>}
                {m.bio && <p className="team-bio">{m.bio}</p>}
                {isAdmin && (
                  <div className="card-actions">
                    <span className="spacer" />
                    <button
                      className="btn danger"
                      onClick={() => removeMember(m.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {isAdmin && (
        <button
          className="admin-chip"
          onClick={() => signOut(getAuth())}
          title="Sign out (Ctrl+Shift+L)"
        >
          Admin • Sign out
        </button>
      )}
    </div>
  );
}