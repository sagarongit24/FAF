// src/lib/uploader.js
// Handles Cloudinary uploads for team + stills

export async function uploadTeamImage(file, docId) {
  const cloud = process.env.REACT_APP_CLD_NAME;
  const preset = process.env.REACT_APP_CLD_PRESET || "Profiles";
  if (!cloud || !preset) throw new Error("Cloudinary env not set");

  const url = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  form.append("folder", `public/team/${docId}`);
  form.append("context", `alt=team:${docId}`);

  const r = await fetch(url, { method: "POST", body: form });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || "Upload failed");

  return {
    url: j.secure_url,
    publicId: j.public_id,
    width: j.width,
    height: j.height,
    provider: "cloudinary",
  };
}

// --- NEW: multi upload for stills ----
export async function uploadStills(files, slug) {
  const cloud = process.env.REACT_APP_CLD_NAME;
  const preset = process.env.REACT_APP_CLD_PRESET_STILLS || process.env.REACT_APP_CLD_PRESET;
  if (!cloud || !preset) throw new Error("Cloudinary env not set");

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const form = new FormData();
    form.append("file", files[i]);
    form.append("upload_preset", preset);
    form.append("folder", `public/stills/${slug}`);
    form.append("context", `alt=still:${slug}:${i}`);
    // optional transforms could be added via eager, but we keep originals

    const resp = await fetch(uploadUrl, { method: "POST", body: form });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error?.message || "Upload failed");

    results.push({
      url: json.secure_url,
      publicId: json.public_id,
      width: json.width,
      height: json.height,
      provider: "cloudinary",
    });
  }
  return results;
}
