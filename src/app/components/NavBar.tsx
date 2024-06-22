"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, signOut } from "firebase/auth";
import app from "../firebase";
import Link from "next/link";

const NavBar = () => {
  const auth = getAuth(app);
  const [user] = useAuthState(auth);

  return (
    <div className="fixed-top border" style={{ backgroundColor: "whitesmoke" }}>
      <nav className="navbar">
        <div className="ms-5">AI Blog</div>
        <Link className="nav-link" href={"/"}>
          Home
        </Link>
        <div>
          {user && (
            <>
              <span className="pe-4">
                Signed in as {user.displayName || user.email}
              </span>
              <button
                className="btn btn-primary btn-sm me-3"
                onClick={() => {
                  signOut(auth);
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
