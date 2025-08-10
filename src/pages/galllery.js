import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import { db, storage } from "../firebaseConfig";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function GalleryPage() {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [albumName, setAlbumName] = useState("");

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    setImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleUpload = async () => {
    const imageRef = ref(storage, `gallery/${newImage.name}`);
    await uploadBytes(imageRef, newImage);
    const url = await getDownloadURL(imageRef);

    await addDoc(collection(db, "gallery"), { album: albumName, imageUrl: url });
    fetchImages();
  };

  return (
    <div>
      <NavigationBar />
      <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Image</button>
      {images.map((img) => (
        <img key={img.id} src={img.imageUrl} alt="Gallery" />
      ))}
    </div>
  );
}

export default GalleryPage;
