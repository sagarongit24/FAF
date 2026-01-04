// src/components/AdminChip.js
import React from "react";
import { useAdmin } from "../lib/admin";

/**
 * Small floating chip shown only for admins (bottom-right).
 * Click to sign out.
 */
export default function AdminChip() {
  const { isAdmin, logout } = useAdmin();
  if (!isAdmin) return null;

  return (
    <button className="admin-chip" onClick={logout} aria-label="Sign out">
      Admin • Sign out
    </button>
  );
}
