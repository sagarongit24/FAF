import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export function useAdmin({ allow = [] } = {}) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setIsAdmin(!!u && allow.includes(u.uid));
      if (u) console.log("Signed in as:", u.email, "UID:", u.uid); // find your UID
    });
  }, [allow]);

  return { user, isAdmin };
}
