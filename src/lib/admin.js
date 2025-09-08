import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// set your UID(s) here
export const ADMIN_UIDS = ["YOUR_ADMIN_UID"];

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
      setIsAdmin(!!u && ADMIN_UIDS.includes(u.uid));
    });
  }, []);
  return isAdmin;
}
