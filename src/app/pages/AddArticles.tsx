"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";
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
import { getAuth } from "firebase/auth";
import app from "../firebase";

// prompt = f"Based on the following transcript from a YouTube video, write a comprehensive blog article, write it based on the transcript, but don't make it look like a youtube video, make it look like a proper blog article:\n\n{transcription}\n\nArticle:"

interface FormData {
  title: string;
  description: string;
  askAI: string;
  image: File | string;
  createdAt: Date;
}

const AddArticles: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [openAskAI, setOpenAskAI] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    image: "",
    askAI: "",
    createdAt: Timestamp.now().toDate(),
  });

  const { title, description, image, askAI, createdAt } = formData;

  const [progress, setProgress] = useState(0);

  const storage = getStorage(app);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user] = useAuthState(auth);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handlePublish = (e: FormEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (!title || !description || !image) {
      alert("please fill all the fields");
      return;
    }

    setLoading(true);

    const storageRef = ref(
      storage,
      `/images/${Date.now()}${(image as File).name}`
    );

    const uploadImage = uploadBytesResumable(storageRef, image as File);

    if (!askAI) {
      uploadImage.on(
        "state_changed",
        (snapshot) => {
          const progressPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progressPercent);
        },
        (err) => {
          console.log(err);
        },
        () => {
          getDownloadURL(uploadImage.snapshot.ref).then((url) => {
            const articleRef = collection(db, "Articles");
            addDoc(articleRef, {
              title,
              description,
              imageUrl: url,
              createdAt: Timestamp.now().toDate(),
              createdBy: user?.displayName || "Anonymous",
              userId: user?.uid || "Anonymous",
              likes: [],
              comments: [],
            })
              .then(() => {
                toast("Article added successfully", { type: "success" });
                setProgress(0);
              })
              .catch((err) => {
                toast("Error adding article", { type: "error" });
              });
          });
        }
      );
    } else {
      uploadImage.on(
        "state_changed",
        (snapshot) => {
          const progressPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progressPercent);
        },
        (err) => {
          console.log(err);
        },
        async () => {
          const res = await fetch("api/generatedArticle", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ description }),
          });

          // if (!res.ok) {
          //   throw new Error("Failed to article");
          // }

          const data = await res.json();

          getDownloadURL(uploadImage.snapshot.ref).then((url) => {
            const articleRef = collection(db, "Articles");
            addDoc(articleRef, {
              title,
              description: res.ok ? data : "Failed to generate article",
              imageUrl: url,
              createdAt: Timestamp.now().toDate(),
              createdBy: user?.displayName || "Anonymous",
              userId: user?.uid || "Anonymous",
              likes: [],
              comments: [],
            })
              .then(() => {
                toast("Article added successfully", { type: "success" });
                setProgress(0);
              })
              .catch((err) => {
                toast("Error adding article", { type: "error" });
              });
          });
        }
      );
    }

    setFormData({
      title: "",
      description: "",
      askAI: "",
      image: "",
      createdAt: Timestamp.now().toDate(),
    });
    setLoading(false);
  };

  return (
    <>
      {user && (
        <div className="border p-3 bg-light my-3">
          <h2>Create article</h2>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            className="form-control"
            value={description}
            onChange={handleChange}
            required
          />

          {openAskAI ? (
            <input
              type="text"
              name="askAI"
              className="form-control mt-2"
              placeholder="e.g., summarize the description"
              value={askAI}
              onChange={handleChange}
            />
          ) : (
            <button
              className="form-control btn-primary mt-2"
              onClick={() => setOpenAskAI(true)}
            >
              Ask AI
            </button>
          )}

          <label htmlFor="image">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="form-control"
            onChange={handleImageChange}
            required
          />

          {progress === 0 ? null : (
            <div className="progress">
              <div
                className="progress-bar progress-bar-striped mt-2"
                style={{ width: `${progress}%` }}
              >
                {`uploading image ${progress}%`}
              </div>
            </div>
          )}

          <button
            className="form-control btn-primary mt-2"
            onClick={handlePublish}
            disabled={loading}
          >
            {loading ? "Processing... please wait" : "Publish"}
          </button>
        </div>
      )}
    </>
  );
};

export default AddArticles;
