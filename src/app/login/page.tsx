"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "@/app/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const auth = getAuth(app);
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast(error.message, { type: "error" });
      } else {
        toast("An unknown error occurred", { type: "error" });
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div
      className="border p-3 bg-light mx-auto"
      style={{ maxWidth: 400, marginTop: 70 }}
    >
      <h1>Login</h1>
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
      <button className="btn btn-primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
