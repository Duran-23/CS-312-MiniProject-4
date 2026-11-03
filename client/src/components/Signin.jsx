import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Signin({ onSuccess, navigate }) {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await api("/signin", {
        method: "POST",
        body: JSON.stringify({
          user_id,
          password
        })
      });

      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">Sign In</h5>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-danger">
                {error}
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

              <button type="submit" className="btn btn-primary w-100">
                Sign In
              </button>
            </form>

            <div className="mt-3 text-center">
              <p>
                Don't have an account?{" "}
                <button
                  className="btn btn-link p-0"
                  onClick={() => navigate("signup")}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}