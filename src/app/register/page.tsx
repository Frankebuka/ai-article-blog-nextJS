"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import app from "@/app/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();
  const auth = getAuth(app);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message, { type: "error" });
      } else {
        toast("An unknown error occurred", { type: "error" });
      }
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <form
      onSubmit={handleSignup}
      className="border p-3 bg-light mx-auto"
      style={{ maxWidth: 400, marginTop: 70 }}
    >
      <h1>Register</h1>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter your name"
          onChange={handleNameChange}
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter your email"
          onChange={handleEmailChange}
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          onChange={handlePasswordChange}
        />
      </div>
      <br />
      <button className="btn btn-primary" type="submit">
        Register
      </button>
    </form>
  );
};

export default Register;
