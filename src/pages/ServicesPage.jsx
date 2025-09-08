import React, { useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { useAdmin } from "../lib/admin";
import "../styles/sections.css";

const LOGO = "/brand/broadneck.png";

export default function ServicesPage() {
  const isAdmin = useAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const titleRef = useRef(null);
  const descRef  = useRef(null);
  const priceRef = useRef(null);
  const unitRef  = useRef(null);
  const orderRef = useRef(null);

  async function load(){
    setLoading(true);
    const qy = query(collection(db,"services"), orderBy("order","asc"));
    const snap = await getDocs(qy);
    setItems(snap.docs.map(d=>({id:d.id, ...d.data()})));
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function addItem(e){
    e.preventDefault();
    await addDoc(collection(db,"services"), {
      title: titleRef.current.value.trim(),
      description: descRef.current.value.trim(),
      priceFrom: priceRef.current.value.trim(),
      unit: unitRef.current.value.trim(),
      order: Number(orderRef.current.value||0),
      createdAt: Date.now()
    });
    e.target.reset(); load();
  }
  async function remove(id){ await deleteDoc(doc(db,"services",id)); load(); }

  return (
    <div className="services-page">
      <div className="sticky-shell">
        <NavigationBar />
        <header className="section-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="" className="brand-logo"/>
            <div className="brand-titles"><h1 className="title">Services</h1><p className="subtitle">What we offer</p></div>
          </div>
        </header>
      </div>

      <div className="section-hero"><img src={LOGO} className="section-watermark" alt=""/></div>

      {isAdmin && (
        <form className="form" onSubmit={addItem} style={{marginTop:12}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8}}>
            <input ref={titleRef} placeholder="Title" />
            <input ref={priceRef} placeholder="Price from (optional)" />
            <input ref={unitRef} placeholder="Unit (day/hour…)" />
            <input ref={orderRef} type="number" defaultValue={0} placeholder="Order" />
          </div>
          <textarea ref={descRef} placeholder="Description" style={{marginTop:8}} />
          <div className="actions"><button className="btn primary">Add</button></div>
        </form>
      )}

      {loading ? <div className="state note">Loading…</div> : (
        <div className="card-grid">
          {items.map(s=>(
            <article key={s.id} className="card">
              <h3>{s.title}</h3>
              <p style={{margin:"2px 0 8px",opacity:.85}}>
                {s.priceFrom ? `From ${s.priceFrom} ` : ""}{s.unit ? `(${s.unit})` : ""}
              </p>
              {s.description ? <p>{s.description}</p> : null}
              {isAdmin && <div style={{textAlign:"right",marginTop:8}}><button className="btn danger" onClick={()=>remove(s.id)}>Delete</button></div>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
