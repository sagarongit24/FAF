import React, { useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { useAdmin } from "../lib/admin";
import "../styles/sections.css";

const LOGO = "/brand/broadneck.png";

export default function StudioPage() {
  const isAdmin = useAdmin();
  const [gear, setGear] = useState([]);
  const [loading, setLoading] = useState(true);

  const catRef = useRef(null);
  const nameRef = useRef(null);
  const notesRef = useRef(null);
  const orderRef = useRef(null);

  async function load() {
    setLoading(true);
    const qy = query(collection(db, "studio_gear"), orderBy("order", "asc"));
    const snap = await getDocs(qy);
    setGear(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function addItem(e){
    e.preventDefault();
    await addDoc(collection(db,"studio_gear"), {
      category: catRef.current.value.trim(),
      name: nameRef.current.value.trim(),
      notes: notesRef.current.value.trim(),
      order: Number(orderRef.current.value||0),
      createdAt: Date.now()
    });
    e.target.reset(); load();
  }
  async function remove(id){ await deleteDoc(doc(db,"studio_gear",id)); load(); }

  return (
    <div className="studio-page">
      <div className="sticky-shell">
        <NavigationBar />
        <header className="section-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="" className="brand-logo" />
            <div className="brand-titles"><h1 className="title">Studio</h1><p className="subtitle">Space, gear & equipment</p></div>
          </div>
        </header>
      </div>

      <div className="section-hero"><img src={LOGO} className="section-watermark" alt="" /></div>

      {isAdmin && (
        <form className="form" onSubmit={addItem} style={{marginTop:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr 1fr",gap:8}}>
            <input ref={catRef} placeholder="Category (Camera, Audio…)" />
            <input ref={nameRef} placeholder="Name / Model" />
            <input ref={orderRef} type="number" defaultValue={0} placeholder="Order" />
            <button className="btn primary">Add</button>
          </div>
          <textarea ref={notesRef} placeholder="Notes (optional)" style={{marginTop:8}} />
        </form>
      )}

      {loading ? <div className="state note">Loading…</div> : (
        <div className="card-grid">
          {gear.map(g=>(
            <article key={g.id} className="card">
              <h3>{g.name}</h3>
              <p style={{margin:"2px 0 8px"}}>{g.category}</p>
              {g.notes ? <p>{g.notes}</p> : null}
              {isAdmin && <div className="card-actions" style={{textAlign:"right"}}><button className="btn danger" onClick={()=>remove(g.id)}>Delete</button></div>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
