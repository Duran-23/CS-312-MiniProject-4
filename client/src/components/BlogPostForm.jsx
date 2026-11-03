import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function BlogPostForm({
  user,
  categories,
  onCreated,
  navigate
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const newPost = await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          category
        })
      });

      setTitle("");
      setContent("");
      setCategory("General");

      onCreated(newPost);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">Create New Post</h5>
      </div>

      <div className="card-body">
        {user ? (
          <>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  Creator Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={user.name}
                  disabled
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Blog Title
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>

                <select
                  className="form-select"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="content" className="form-label">
                  Blog Content
                </label>

                <textarea
                  className="form-control"
                  id="content"
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Publish Post
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">
              You must be signed in to create a new blog post.
            </p>

            <button
              className="btn btn-primary btn-sm me-2"
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
          </div>
        )}
      </div>
    </div>
  );
}