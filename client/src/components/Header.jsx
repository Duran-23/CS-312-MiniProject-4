import React, { useEffect, useState } from "react";

export default function Header({ user, navigate, logout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <button
          className="navbar-brand fw-bold btn btn-link text-decoration-none"
          onClick={() => navigate("home")}
        >
          CS-312 Blog
        </button>

        <div className="navbar-nav ms-auto d-flex flex-row align-items-center gap-2">
          {user ? (
            <>
              <span className="navbar-text text-light me-2">
                Welcome, {user.name}
              </span>

              <button
                className="btn btn-outline-light btn-sm"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => navigate("signin")}
              >
                Sign In
              </button>

              <button
                className="btn btn-success btn-sm"
                onClick={() => navigate("signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}