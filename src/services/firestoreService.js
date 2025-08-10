import { db, storage } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/** 🔹 Function to Upload Music File & Save Metadata */
export const uploadMusic = async (file, trackName, albumName, imageFile) => {
  try {
    // Upload music file to Firebase Storage
    const musicRef = ref(storage, `music/${file.name}`);
    await uploadBytes(musicRef, file);
    const fileUrl = await getDownloadURL(musicRef);

    // Upload cover image if provided
    let imageUrl = "";
    if (imageFile) {
      const imageRef = ref(storage, `music/covers/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    // Store track metadata in Firestore
    const docRef = await addDoc(collection(db, "music"), {
      name: trackName,
      album: albumName,
      url: fileUrl,
      coverImage: imageUrl || "",
      createdAt: new Date(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error uploading music:", error);
    return { success: false, error };
  }
};

/** 🔹 Function to Fetch All Music Data from Firestore */
export const fetchMusic = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "music"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching music:", error);
    return [];
  }
};

/** 🔹 Function to Upload Image & Save Metadata */
export const uploadGalleryImage = async (file, albumName) => {
  try {
    // Upload image to Firebase Storage
    const imageRef = ref(storage, `gallery/${albumName}/${file.name}`);
    await uploadBytes(imageRef, file);
    const fileUrl = await getDownloadURL(imageRef);

    // Store image metadata in Firestore
    await addDoc(collection(db, "gallery"), {
      album: albumName,
      imageUrl: fileUrl,
      createdAt: new Date(),
    });

    return { success: true, url: fileUrl };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { success: false, error };
  }
};

/** 🔹 Function to Fetch All Gallery Images */
export const fetchGallery = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
};
