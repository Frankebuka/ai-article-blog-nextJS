import { deleteDoc, doc, getFirestore } from "firebase/firestore";
import { getStorage, deleteObject, ref } from "firebase/storage";
import React from "react";
import { toast } from "react-toastify";
import app from "../firebase";
import { useRouter } from "next/navigation";

interface DeleteArticleProps {
  id: string;
  imageUrl: string;
}

const DeleteArticlePage: React.FC<DeleteArticleProps> = ({ id, imageUrl }) => {
  const db = getFirestore(app);
  const storage = getStorage(app);
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      router.push("/");
      await deleteDoc(doc(db, "Articles", id));
      toast("Article deleted successfully", { type: "success" });
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    }
  };

  return (
    <button
      className="dropdown-item"
      onClick={handleDelete}
      style={{ cursor: "pointer" }}
    >
      Delete
    </button>
  );
};

export default DeleteArticlePage;
