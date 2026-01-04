// src/services/stills.js
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

// Load all still groups (films), newest first by createdAt
export async function loadStills() {
  const q = query(collection(db, "stills"));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
  // Sort by createdAt desc if present
  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function upsertStillsDoc({ film, slug, newImages }) {
  const ref = doc(db, "stills", slug);
  const existing = await getDoc(ref);

  if (!existing.exists()) {
    await setDoc(ref, {
      film,
      slug,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: newImages.map((img, i) => ({ ...img, index: i })),
    });
  } else {
    const data = existing.data();
    const merged = [...(data.images || []), ...newImages.map((img) => ({ ...img }))];
    // normalize indexes
    const normalized = merged.map((img, i) => ({ ...img, index: i }));
    await updateDoc(ref, { images: normalized, updatedAt: Date.now() });
  }
}

export async function replaceStillsDoc({ film, slug, images }) {
  const ref = doc(db, "stills", slug);
  await setDoc(ref, {
    film,
    slug,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    images: images.map((img, i) => ({ ...img, index: i })),
  });
}

export async function writeOrder(slug, images) {
  const ref = doc(db, "stills", slug);
  const normalized = images.map((img, i) => ({ ...img, index: i }));
  await updateDoc(ref, { images: normalized, updatedAt: Date.now() });
}

export async function removeStill(slug, index) {
  const ref = doc(db, "stills", slug);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const next = (data.images || []).filter((_, i) => i !== index);
  await updateDoc(ref, {
    images: next.map((img, i) => ({ ...img, index: i })),
    updatedAt: Date.now(),
  });
}
