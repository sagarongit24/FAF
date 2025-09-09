// Uploader that prefers Firebase Storage if available, else uses Cloudinary.
// Set REACT_APP_CLD_NAME and REACT_APP_CLD_PRESET if you want Cloudinary fallback.

import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";

async function uploadViaFirebase(file, docId) {
  const storage = getStorage();
  const path = `public/team/${docId}/${Date.now()}-${file.name}`;
  const r = sref(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  return { url, provider: "firebase", path };
}

async function uploadViaCloudinary(file, docId) {
  const cloud = process.env.REACT_APP_CLD_NAME;
  const preset = process.env.REACT_APP_CLD_PRESET;
  if (!cloud || !preset) throw new Error("Cloudinary env vars missing");

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", preset);
  data.append("folder", `broadneck/team/${docId}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body: data,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
  return { url: json.secure_url, provider: "cloudinary", publicId: json.public_id };
}

export async function uploadTeamImage(file, docId) {
  try {
    // Try Firebase first
    return await uploadViaFirebase(file, docId);
  } catch {
    // Fallback to Cloudinary
    return await uploadViaCloudinary(file, docId);
  }
}
