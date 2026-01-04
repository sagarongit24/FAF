// src/lib/admin.js
import { useState, useEffect, useRef, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Get admin UIDs from environment variable
// In your .env file, add: REACT_APP_ADMIN_UIDS=uid1,uid2,uid3
const ADMIN_UIDS = process.env.REACT_APP_ADMIN_UIDS?.split(',') || [
  "ltNMGWFdGBOHe0EVAjYrCXhvXdS2" // Fallback to your UID
];

/**
 * Hook to check if current user is an admin
 * @returns {{ user: User | null, isAdmin: boolean }}
 */
export function useAdmin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      const allowed = !!u && ADMIN_UIDS.includes(u.uid);
      setIsAdmin(allowed);
      if (u) {
        console.log("Signed in:", u.email, "UID:", u.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin };
}

/**
 * Hook for hidden long-press trigger (to open admin login)
 * @param {Function} callback - Function to call after long press
 * @param {number} ms - Duration in milliseconds (default 1200ms)
 * @returns {Object} Event handlers for long press
 */
export function useLongPress(callback, ms = 1200) {
  const timerRef = useRef(null);

  const start = useCallback(() => {
    timerRef.current = setTimeout(callback, ms);
  }, [callback, ms]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear
  };
}

/**
 * Show a temporary snackbar message
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms (default 3000)
 */
export function showSnackbar(message, duration = 3000) {
  const el = document.getElementById("snackbar");
  if (!el) return;

  el.textContent = message;
  el.className = "snackbar show";

  setTimeout(() => {
    el.className = el.className.replace("show", "");
  }, duration);
}