import React, { useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { useAdmin } from "../lib/admin";
import "../styles/sections.css";

const LOGO = "/brand/broadneck.png";

/** doc shape: { date:"2025-05-10", project:"Finding Rhythm", role:"Composer", notes, tags:[] } */

export default function TimelinePage() {
  const isAdmin = useAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateRef = useRef(null);
  const projectRef = useRef(null);
  const roleRef = useRef(null);
  const notesRef = useRef(null);

  async function load(){
    setLoading(true);
    const qy = query(collection(db,"timeline"), orderBy("date","desc"));
    const snap = await getDocs(qy);
    setItems(snap.docs.map(d=>({id:d.id,...d.data()})));
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function addItem(e){
    e.preventDefault();
    await addDoc(collection(db,"timeline"), {
      date: dateRef.current.value,
      project: projectRef.current.value.trim(),
      role: roleRef.current.value.trim(),
      notes: notesRef.current.value.trim(),
      createdAt: Date.now()
    });
    e.target.reset(); load();
  }
  async function remove(id){ await deleteDoc(doc(db,"timeline",id)); load(); }

  return (
    <div className="timeline-page">
      <div className="sticky-shell">
        <NavigationBar />
        <header className="section-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="" className="brand-logo"/>
            <div className="brand-titles"><h1 className="title">Timeline</h1><p className="subtitle">Project timeline</p></div>
          </div>
        </header>
      </div>

      <div className="section-hero"><img src={LOGO} className="section-watermark" alt=""/></div>

      {isAdmin && (
        <form className="form" onSubmit={addItem} style={{marginTop:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1.5fr",gap:8}}>
            <input ref={dateRef} type="date" required />
            <input ref={projectRef} placeholder="Project" required />
            <input ref={roleRef} placeholder="Role" required />
          </div>
          <textarea ref={notesRef} placeholder="Notes (optional)" style={{marginTop:8}} />
          <div className="actions"><button className="btn primary">Add to timeline</button></div>
        </form>
      )}

      {loading ? <div className="state note">Loading…</div> : (
        <div className="card-grid">
          {items.map(x=>(
            <article key={x.id} className="card">
              <h3>{x.project}</h3>
              <p style={{margin:"2px 0 6px",opacity:.85}}>{x.date} • {x.role}</p>
              {x.notes ? <p>{x.notes}</p> : null}
              {isAdmin && <div style={{textAlign:"right"}}><button className="btn danger" onClick={()=>remove(x.id)}>Delete</button></div>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
    