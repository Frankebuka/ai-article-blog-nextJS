import {
  getFirestore,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, User } from "firebase/auth";
import app from "../firebase";
import { v4 as uuidv4 } from "uuid";

interface CommentProps {
  id: string;
}

const Comment: React.FC<CommentProps> = ({ id }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const auth = getAuth(app);
  const [currentlyLoggedinUser] = useAuthState(auth);

  const db = getFirestore(app);
  const commentRef = doc(db, "Articles", id);

  useEffect(() => {
    const docRef = doc(db, "Articles", id);
    onSnapshot(docRef, (snapshot) => {
      setComments(snapshot.data()?.comments || []);
    });
  }, []);

  const handleChangeComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentlyLoggedinUser) {
      updateDoc(commentRef, {
        comments: arrayUnion({
          user: currentlyLoggedinUser.uid,
          userName: currentlyLoggedinUser.displayName,
          comment: comment,
          createdAt: new Date(),
          commentId: uuidv4(),
        }),
      }).then(() => {
        setComment("");
      });
    }
  };

  const handleDeleteComment = (commentObj: any) => {
    updateDoc(commentRef, {
      comments: arrayRemove(commentObj),
    })
      .then(() => {
        console.log("Comment deleted successfully");
      })
      .catch((error) => {
        console.log("Error deleting comment:", error);
      });
  };

  return (
    <div>
      Comment
      <div className="container">
        {comments.map(({ commentId, user, comment, userName, createdAt }) => (
          <div key={commentId}>
            <div className="border p-2 mt-2 row">
              <div className="col-11">
                <span
                  className={`badge ${
                    user === currentlyLoggedinUser?.uid
                      ? "bg-success"
                      : "bg-primary"
                  }`}
                  style={{ marginRight: "8px" }}
                >
                  {userName}
                </span>
                {comment}
              </div>
              <div className="col-1">
                {user === currentlyLoggedinUser?.uid && (
                  <i
                    className="fa fa-times"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      handleDeleteComment({
                        commentId,
                        user,
                        comment,
                        userName,
                        createdAt,
                      })
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        {currentlyLoggedinUser && (
          <input
            type="text"
            className="form-control mt-4 mb-5"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            placeholder="Add a comment"
            onKeyUp={(e) => {
              handleChangeComment(e);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Comment;
