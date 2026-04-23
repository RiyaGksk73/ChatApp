import React, { useState, useEffect, useContext } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

import { toast } from 'react-toastify'
import upload from '../../lib/upload'
import { AppContext } from '../../context/AppContext'

const ProfileUpdate = () => {

  const navigate = useNavigate();
  const { setUserData } = useContext(AppContext);

  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [loading, setLoading] = useState(false);

  const profileUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!prevImage && !image) {
        toast.error("Upload profile picture");
        return;
      }

      setLoading(true);

      const docRef = doc(db, 'users', uid);

      let imgUrl = prevImage;

      if (image) {
        imgUrl = await upload(image);
      }

      await updateDoc(docRef, {
        avatar: imgUrl,
        bio,
        name
      });

      setPrevImage(imgUrl);

      // ✅ SAFE UPDATE
      setUserData(prev => ({
        ...prev,
        name,
        bio,
        avatar: imgUrl
      }));

      toast.success("Profile updated successfully ✅");

    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);

        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setPrevImage(data.avatar || "");
        }
      } else {
        navigate('/');
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className='Profile'>
      <div className='Profile-container'>
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>

          <label htmlFor='avatar'>
            <input
              type='file'
              id='avatar'
              hidden
              accept='.png,.jpg,.jpeg'
              onChange={(e) => setImage(e.target.files[0])}
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
              alt=""
            />
            Upload profile image
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Your name'
            required
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder='Write bio'
            required
          />

          <button disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        <img
          className='Profile-pic'
          src={image ? URL.createObjectURL(image) : prevImage || assets.logo_icon}
          alt=""
        />
      </div>
    </div>
  )
}

export default ProfileUpdate;