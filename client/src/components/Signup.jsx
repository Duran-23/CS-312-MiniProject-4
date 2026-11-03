import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Signup({ navigate }) {
  const [user_id, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await api("/signup", {
        method: "POST",
        body: JSON.stringify({
          user_id,
          name,
          password
        })
      });

      setMessage(data.message);
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white">
            <h5 className="card-title mb-0">Sign Up</h5>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {message && (
              <div className="alert alert-success">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="user_id" className="form-label">
                  User ID
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="user_id"
                  value={user_id}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100">
                Sign Up
              </button>
            </form>

            <div className="mt-3 text-center">
              <p>
                Already have an account?{" "}
                <button
                  className="btn btn-link p-0"
                  onClick={() => navigate("signin")}
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}