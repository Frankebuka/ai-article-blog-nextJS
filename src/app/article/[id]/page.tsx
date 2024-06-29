"use client";

import { getFirestore, doc, onSnapshot } from "firebase/firestore";
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
import { title } from "process";

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
  createdAt: {
    toDate: () => Date;
  };
  description: string;
  likes?: string[];
}

const Article: React.FC<ArticleProps> = ({ params }) => {
  const { id } = params;
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const docRef = doc(db, "Articles", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      setArticle({ ...snapshot.data(), id: snapshot.id } as ArticleData);
    });
    return () => unsubscribe();
  }, [id, db]);

  const toggleDropdown = (id: string) => {
    setDropdownVisible(dropdownVisible === id ? null : id);
  };

  const copyToClipboard = (text: string) => {
    setDropdownVisible(null);
    navigator.clipboard.writeText(text).then(
      () => {
        toast(`Copied ${text == article?.title ? "title" : "description"}`, {
          type: "success",
        });
      },
      (err) => {
        toast("Failed to copy text", { type: "error" });
      }
    );
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
            <h2>{article.title}</h2>
            <h5>Author: {article.createdBy}</h5>
            <div>Posted on: {article.createdAt.toDate().toDateString()}</div>
            <hr />
            <h4>{article.description}</h4>

            <div className="d-flex flex-row-reverse">
              <div className="dropdown ps-2">
                <FontAwesomeIcon
                  icon={faEllipsisV}
                  onClick={() => toggleDropdown(article.id)}
                  style={{ cursor: "pointer" }}
                  title="Click to copy title or description"
                />
                {dropdownVisible === id && (
                  <div className="dropdown-menu show">
                    <button
                      className="dropdown-item"
                      onClick={() => copyToClipboard(article.title)}
                    >
                      Title
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => copyToClipboard(article.description)}
                    >
                      Description
                    </button>
                  </div>
                )}
              </div>
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
