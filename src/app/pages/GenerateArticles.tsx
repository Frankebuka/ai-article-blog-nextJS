"use client";

import React, { useState } from "react";
import app from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, User } from "firebase/auth";
import { toast } from "react-toastify";
import {
  collection,
  Timestamp,
  getFirestore,
  addDoc,
} from "firebase/firestore";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import Link from "next/link";

const GenerateArticles: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const auth = getAuth(app);
  const [user] = useAuthState(auth) as [User | null, boolean, any];
  const db = getFirestore(app);
  const storage = getStorage(app);

  const handleGenerate = async () => {
    if (!url) {
      alert("Please enter a YouTube URL");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `api/generatedArticle?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch video data");
      }
      const data = await response.json();

      // Fetch the image from your server
      const imageResponse = await fetch(
        `api/fetchImage?url=${encodeURIComponent(data.thumbnailUrl)}`
      );
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch thumbnail image");
      }
      const imageBlob = await imageResponse.blob();

      // Create a reference to Firebase Storage and upload the image Blob
      const storageRef = ref(storage, `/images/${Date.now()}${data.title}.jpg`);
      const uploadTask = await uploadBytesResumable(storageRef, imageBlob);

      // Get the download URL after the upload completes
      const imageUrl = await getDownloadURL(uploadTask.ref);

      // Add the article to Firestore
      const articleRef = collection(db, "Articles");
      await addDoc(articleRef, {
        title: data.title,
        description: data.transcription,
        imageUrl,
        createdAt: Timestamp.now().toDate(),
        createdBy: user?.displayName,
        userId: user?.uid,
        likes: [],
        comments: [],
      });

      toast("Article added successfully", { type: "success" });
      setUrl("");
    } catch (error: any) {
      console.error("Error generating article:", error.message);
      toast("Failed to generate article", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-3 mt-3 bg-light">
      {!user ? (
        <>
          <h2>
            <Link href="/login">Login to create article</Link>
          </h2>
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </>
      ) : (
        <>
          <h2>Generate article</h2>
          <label htmlFor="" className="mb-1">
            Enter youtube video link
          </label>
          <input
            type="url"
            name="link"
            placeholder="Place Youtube Link..."
            className="form-control mb-4"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          {/* button */}
          <button
            className="form-control btn-primary mt-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Processing... please wait" : "Generate"}
          </button>
        </>
      )}
    </div>
  );
};

export default GenerateArticles;
