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
  const [downloadAudio, setDownloadAudio] = useState<boolean>(false);
  const [downloadVideo, setDownloadVideo] = useState<boolean>(false);
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
        `https://ai-article-blog-nextjs.onrender.com/api/generatedArticle?url=${encodeURIComponent(
          url
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch video data");
      }
      const data = await response.json();

      // Fetch the image from your server
      const imageResponse = await fetch(
        `https://ai-article-blog-nextjs.onrender.com/api/fetchImage?url=${encodeURIComponent(
          data.thumbnailUrl
        )}`
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

      // Automatically download the audio file if downloadAudio is true
      if (downloadAudio) {
        const response = await fetch(
          `https://ai-article-blog-nextjs.onrender.com/api/downloadAudio?url=${encodeURIComponent(
            url
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch audio file");
        }
        const blob = await response.blob();
        const timestamp = new Date().getTime();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `audio_${timestamp}.mp3`;
        link.click();
        setDownloadAudio(false);
      }

      if (downloadVideo) {
        const response = await fetch(
          `https://ai-article-blog-nextjs.onrender.com/api/downloadVideo?url=${encodeURIComponent(
            url
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch video file");
        }
        const blob = await response.blob();
        const timestamp = new Date().getTime();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `video_${timestamp}.mp4`;
        link.click();
        setDownloadVideo(false);
      }

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
            className="form-control mb-2"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />

          {/* checkbox and message */}
          <div className="d-flex">
            <div className="d-flex align-items-center me-4">
              <input
                type="checkbox"
                id="downloadAudio"
                className="me-2"
                checked={downloadAudio}
                onChange={(e) => setDownloadAudio(e.target.checked)}
              />
              <label htmlFor="downloadAudio" className="mb-0 small-text">
                Download audio
              </label>
            </div>
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                id="downloadVideo"
                className="me-2"
                checked={downloadVideo}
                onChange={(e) => setDownloadVideo(e.target.checked)}
              />
              <label htmlFor="downloadVideo" className="mb-0 small-text">
                Download video
              </label>
            </div>
          </div>

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
