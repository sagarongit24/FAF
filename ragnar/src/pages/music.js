import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import { db, storage } from "../firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function MusicPage() {
  const [tracks, setTracks] = useState([]);
  const [newTrack, setNewTrack] = useState({ name: "", album: "", file: null, coverImage: null });

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    const querySnapshot = await getDocs(collection(db, "music"));
    setTracks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleUpload = async () => {
    if (!newTrack.file) {
      alert("Please select a file.");
      return;
    }

    const storageRef = ref(storage, `music/${newTrack.file.name}`);
    await uploadBytes(storageRef, newTrack.file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "music"), { ...newTrack, url });
    fetchTracks();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "music", id));
    fetchTracks();
  };

  return (
    <div className="page-container">
      <NavigationBar />
      <h1 className="text-2xl font-bold">Music</h1>

      {/* Upload Music */}
      <input type="text" placeholder="Track Name" onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })} />
      <input type="file" accept="audio/wav" onChange={(e) => setNewTrack({ ...newTrack, file: e.target.files[0] })} />
      <button onClick={handleUpload}>Upload Music</button>

      {/* List Tracks */}
      {tracks.map((track) => (
        <div key={track.id}>
          <h2>{track.name}</h2>
          <audio controls>
            <source src={track.url} type="audio/wav" />
          </audio>
          <button onClick={() => handleDelete(track.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default MusicPage;
