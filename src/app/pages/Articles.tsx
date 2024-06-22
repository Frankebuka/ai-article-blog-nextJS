"use client";

import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import app from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, User } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import DeleteArticle from "../components/DeleteArticle";
import LikeArticle from "../components/LikeArticle";

interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: any; // Type this appropriately if you use a specific date library
  createdBy: string;
  userId: string;
  likes: string[];
  comments: string[];
}

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user] = useAuthState(auth) as [User | null, boolean, any];

  useEffect(() => {
    const articleRef = collection(db, "Articles");
    const q = query(articleRef, orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Article)
      );
      setArticles(articles);
    });
  }, [db]);

  return (
    <div>
      {articles.length === 0 ? (
        <p>No articles found!</p>
      ) : (
        articles.map(
          ({
            id,
            title,
            description,
            imageUrl,
            createdAt,
            createdBy,
            userId,
            likes,
            comments,
          }) => (
            <div className="border mt-3 p-3 bg-light" key={id}>
              <div className="row">
                <div className="col-md-3 mb-3 mb-md-0">
                  <Link href={`/article/${id}`}>
                    <Image
                      src={imageUrl}
                      alt="title"
                      className="img-fluid"
                      width={320}
                      height={180}
                      style={{ maxHeight: "180px", width: "100%" }}
                    />
                  </Link>
                </div>
                <div className="col-md-9 ps-md-3">
                  <div className="row">
                    <div className="col-6">
                      {createdBy && (
                        <span className="badge bg-primary">{createdBy}</span>
                      )}
                    </div>
                    <div className="col-6 d-flex justify-content-end">
                      {user && user.uid === userId && (
                        <DeleteArticle id={id} imageUrl={imageUrl} />
                      )}
                    </div>
                  </div>
                  <h3 className="mt-3">{title}</h3>
                  <p>{createdAt.toDate().toDateString()}</p>
                  <h5 className="description">{description}</h5>

                  <div className="d-flex justify-content-end">
                    {user && <LikeArticle id={id} likes={likes} />}
                    <div className="pe-2 mr-3" style={{ marginLeft: "8px" }}>
                      <p>
                        {likes?.length} {likes.length > 1 ? "likes" : "like"}
                      </p>
                    </div>
                    {comments && comments.length > 0 && (
                      <div className="pe-2">
                        <p>
                          {comments?.length}{" "}
                          {comments.length > 1 ? "comments" : "comment"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
};

export default Articles;
