import React, { useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAdmin } from "../lib/admin";
import "../styles/sections.css";

const LOGO = "/brand/broadneck.png";
const storage = getStorage();

export default function TeamPage() {
  const isAdmin = useAdmin();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const nameRef = useRef(null);
  const roleRef = useRef(null);
  const bioRef  = useRef(null);
  const orderRef= useRef(null);
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    const qy = query(collection(db, "team"), orderBy("order", "asc"));
    const snap = await getDocs(qy);
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function addMember(e) {
    e.preventDefault();
    const name = nameRef.current.value.trim();
    const role = roleRef.current.value.trim();
    const bio  = bioRef.current.value.trim();
    const order = Number(orderRef.current.value || 0);
    if (!name || !role) return;

    let photoUrl = "";
    const f = fileRef.current?.files?.[0];
    if (f) {
      const path = `public/team/${Date.now()}-${f.name}`;
      const r = sref(storage, path);
      await uploadBytes(r, f);
      photoUrl = await getDownloadURL(r);
    }

    await addDoc(collection(db, "team"), {
      name, role, bio, order, photoUrl, createdAt: Date.now()
    });
    e.target.reset();
    load();
  }

  async function remove(id) {
    await deleteDoc(doc(db, "team", id));
    load();
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
        <form className="form" onSubmit={addMember} style={{marginTop:12}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr",gap:8}}>
            <input ref={nameRef} placeholder="Name" />
            <input ref={roleRef} placeholder="Role" />
            <input ref={orderRef} type="number" defaultValue={0} placeholder="Order" />
            <input ref={fileRef} type="file" accept="image/*" />
          </div>
          <textarea ref={bioRef} placeholder="Short bio (optional)" style={{marginTop:8}} />
          <div className="actions"><button className="btn primary">Add member</button></div>
        </form>
      )}

      {loading ? <div className="state note">Loading…</div> : (
        <div className="card-grid">
          {members.map(m => (
            <article key={m.id} className="card">
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:60,height:60,borderRadius:12,overflow:"hidden",background:"#0E0F13"}}>
                  {m.photoUrl ? <img src={m.photoUrl} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : null}
                </div>
                <div>
                  <h3 style={{margin:0}}>{m.name}</h3>
                  <p style={{margin:"2px 0 0",opacity:.8}}>{m.role}</p>
                </div>
              </div>
              {m.bio ? <p style={{marginTop:8}}>{m.bio}</p> : null}
              {isAdmin && (
                <div className="card-actions" style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}>
                  <button className="btn danger" onClick={()=>remove(m.id)}>Delete</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
