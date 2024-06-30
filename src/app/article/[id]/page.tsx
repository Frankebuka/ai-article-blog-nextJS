"use client";

import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  DocumentReference,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import app from "@/app/firebase";
import LikeArticle from "../../components/LikeArticle";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import Comment from "../../components/Comment";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import DeleteArticlePage from "@/app/components/DeleteArticlePage";

interface ArticleProps {
  params: {
    id: string;
  };
}

interface ArticleData {
  id: string;
  imageUrl: string;
  title: string;
  createdBy: string;
  userId: string;
  createdAt: {
    toDate: () => Date;
  };
  description: string;
  likes?: string[];
}

const Article: React.FC<ArticleProps> = ({ params }) => {
  const { id } = params;
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user] = useAuthState(auth);

  const cleanDescription =
    article?.description && (DOMPurify.sanitize(article.description) as any);

  useEffect(() => {
    const docRef = doc(db, "Articles", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const articleData = {
        ...snapshot.data(),
        id: snapshot.id,
      } as ArticleData;
      setArticle(articleData);
      setTitle(articleData.title);
      setDescription(articleData.description);
    });
    return () => unsubscribe();
  }, [id, db]);

  const toggleDropdown = (id: string) => {
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (article) {
      setTitle(article.title);
      setDescription(article.description);
    }
  };

  const handleSave = async () => {
    if (article) {
      const docRef: DocumentReference = doc(db, "Articles", article.id);
      setLoading(true);
      try {
        await updateDoc(docRef, {
          title,
          description,
        });
        toast("Article updated successfully", { type: "success" });
        setIsEditing(false);
      } catch (error) {
        toast("Failed to update article", { type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="container border bg-light"
      style={{ marginTop: 70, marginBottom: 20 }}
    >
      {article && (
        <div className="row">
          <div className="col-12 col-md-3 order-md-1">
            <Image
              src={article.imageUrl}
              alt={article.title}
              width={320}
              height={180}
              priority
              style={{ width: "100%", height: "auto", padding: 10 }}
            />
          </div>
          <div className="col-12 col-md-9 mt-3 order-md-2">
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control mb-3"
                  placeholder="Title"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control mb-3"
                  rows={15}
                  placeholder="Description"
                />
                <button
                  className="btn btn-primary me-2"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h2>{article.title}</h2>
                <h5>Author: {article.createdBy}</h5>
                <div>
                  Posted on: {article.createdAt?.toDate().toDateString()}
                </div>
                <hr />
                <h4 dangerouslySetInnerHTML={{ __html: cleanDescription }} />
              </>
            )}

            <div className="d-flex flex-row-reverse">
              {user && user.uid === article.userId && (
                <div className="dropdown ps-2">
                  <FontAwesomeIcon
                    icon={faEllipsisV}
                    onClick={() => toggleDropdown(article.id)}
                    style={{ cursor: "pointer" }}
                    title="Click to copy title or description"
                  />
                  {dropdownVisible === id && (
                    <div className="dropdown-menu show">
                      <button className="dropdown-item" onClick={handleEdit}>
                        Edit
                      </button>
                      <DeleteArticlePage
                        id={article.id}
                        imageUrl={article.imageUrl}
                      />
                    </div>
                  )}
                </div>
              )}
              {user && <LikeArticle id={id} likes={article.likes || []} />}
              <div className="pe-2">
                <p>{article.likes?.length}</p>
              </div>
            </div>
            {/* comment */}
            <Comment id={article.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Article;
