import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, User } from "firebase/auth";
import app from "../firebase";
import {
  getFirestore,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";

interface LikeArticleProps {
  id: string;
  likes: string[];
}

const LikeArticle: React.FC<LikeArticleProps> = ({ id, likes }) => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user] = useAuthState(auth) as [User | null, boolean, any];

  const likesRef = doc(db, "Articles", id);

  const handleLike = () => {
    if (!user) return;

    if (likes.includes(user.uid)) {
      updateDoc(likesRef, {
        likes: arrayRemove(user.uid),
      })
        .then(() => {
          console.log("unliked");
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      updateDoc(likesRef, {
        likes: arrayUnion(user.uid),
      })
        .then(() => {
          console.log("liked");
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <div>
      <i
        className={`fa fa-heart${
          !likes.includes(user?.uid ?? "") ? "-o" : ""
        } fa-lg`}
        style={{
          cursor: "pointer",
          color: likes.includes(user?.uid ?? "") ? "red" : undefined,
        }}
        onClick={handleLike}
      />
    </div>
  );
};

export default LikeArticle;
