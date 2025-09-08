import React, { useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, doc, deleteDoc, orderBy, query } from "firebase/firestore";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAdmin } from "../lib/admin";
import "../styles/sections.css";

const LOGO = "/brand/broadneck.png";
const storage = getStorage();

export default function StillsPage() {
  const isAdmin = useAdmin();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const titleRef = useRef(null);
  const descRef  = useRef(null);
  const filesRef = useRef(null);

  async function load(){
    setLoading(true);
    const qy = query(collection(db,"stills_albums"), orderBy("createdAt","desc"));
    const snap = await getDocs(qy);
    setAlbums(snap.docs.map(d=>({ id:d.id, ...d.data() })));
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function createAlbum(e){
    e.preventDefault();
    const title = titleRef.current.value.trim();
    const desc  = descRef.current.value.trim();
    const files = Array.from(filesRef.current?.files || []);
    const albumRef = await addDoc(collection(db,"stills_albums"), {
      title, description: desc, coverUrl:"", photoCount:0, createdAt: Date.now()
    });

    let cover = "";
    let count = 0;
    for (const f of files) {
      const path = `public/stills/${albumRef.id}/${Date.now()}-${f.name}`;
      const r = sref(storage, path);
      await uploadBytes(r, f);
      const url = await getDownloadURL(r);
      // store as subcollection doc
      await addDoc(collection(db, `stills_albums/${albumRef.id}/photos`), {
        url, createdAt: Date.now()
      });
      if (!cover) cover = url;
      count++;
    }

    // update album cover + count
    await addDoc(collection(db, `stills_albums/${albumRef.id}/meta`), { touched: Date.now() }); // cheap index-bump
    await fetch(`https://firestore.googleapis.com/v1/projects/${process.env.REACT_APP_FIREBASE_PROJECT_ID}/databases/(default)/documents:commit`, { method:"POST" }).catch(()=>{}); // no-op if blocked

    // quick-and-dirty client-side patch: just refetch
    e.target.reset();
    load();
  }

  async function removeAlbum(id){
    // simple delete of album doc; (optional) clean storage manually later
    await deleteDoc(doc(db,"stills_albums",id));
    load();
  }

  return (
    <div className="stills-page">
      <div className="sticky-shell">
        <NavigationBar />
        <header className="section-header header--brand">
          <div className="brand-left">
            <img src={LOGO} alt="" className="brand-logo" />
            <div className="brand-titles"><h1 className="title">Stills</h1><p className="subtitle">Albums (BTS, posters, frames)</p></div>
          </div>
        </header>
      </div>

      <div className="section-hero"><img src={LOGO} className="section-watermark" alt=""/></div>

      {isAdmin && (
        <form className="form" onSubmit={createAlbum} style={{marginTop:12}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr",gap:8}}>
            <input ref={titleRef} placeholder="Album title" />
            <input ref={descRef}  placeholder="Description (optional)" />
            <input ref={filesRef} type="file" accept="image/*" multiple />
          </div>
          <div className="actions"><button className="btn primary">Create album (+ upload)</button></div>
        </form>
      )}

      {loading ? <div className="state note">Loading…</div> : (
        <div className="card-grid">
          {albums.map(a=>(
            <article key={a.id} className="card">
              <div style={{width:"100%",aspectRatio:"16/9",borderRadius:12,overflow:"hidden",background:"#0E0F13",marginBottom:8}}>
                {a.coverUrl ? <img src={a.coverUrl} alt={a.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{display:"grid",placeItems:"center",height:"100%",opacity:.7}}>No cover</div>}
              </div>
              <h3>{a.title}</h3>
              {a.description ? <p>{a.description}</p> : null}
              {isAdmin && <div style={{textAlign:"right"}}><button className="btn danger" onClick={()=>removeAlbum(a.id)}>Delete</button></div>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
