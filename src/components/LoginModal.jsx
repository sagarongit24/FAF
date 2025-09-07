import { useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut
} from "firebase/auth";

export default function LoginModal({ onClose }) {
  const auth = getAuth();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const stored = window.localStorage.getItem("admin-email") || window.prompt("Confirm your email");
      if (stored) {
        signInWithEmailLink(auth, stored, window.location.href)
          .then(() => onClose())
          .catch((e) => console.error(e));
      }
    }
  }, [auth, onClose]);

  async function signInGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      onClose();
    } catch (e) { console.error(e); }
  }

  async function sendMagicLink() {
    const actionCodeSettings = {
      url: window.location.origin, // comes back to the same site
      handleCodeInApp: true
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("admin-email", email);
      alert("Magic link sent. Check your email.");
    } catch (e) { console.error(e); alert("Failed to send link."); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Admin Sign-In</h3>
        <p style={{opacity:.8, marginTop:4}}>Hidden login for site owner.</p>

        <div style={{display:"flex", gap:8, margin:"12px 0"}}>
          <button className="btn primary" onClick={signInGoogle}>Sign in with Google</button>
          <button className="btn" onClick={() => signOut(auth)}>Sign out</button>
        </div>

        <div style={{marginTop:10, borderTop:"1px solid rgba(255,255,255,.12)", paddingTop:10}}>
          <p style={{margin:"6px 0 8px"}}>Or get a magic link:</p>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{padding:10, width:"100%"}}
          />
          <div className="actions" style={{marginTop:8}}>
            <button className="btn" onClick={sendMagicLink}>Send magic link</button>
          </div>
        </div>
      </div>
    </div>
  );
}
