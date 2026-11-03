import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function EditPost({
  post,
  categories,
  onSaved,
  onCancel
}) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.body);
  const [category, setCategory] = useState(post.category);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const updatedPost = await api(`/posts/${post.blog_id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          content,
          category
        })
      });

      onSaved(updatedPost);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow-sm">
          <div className="card-header bg-warning text-dark">
            <h5 className="card-title mb-0">
              Edit Blog Post
            </h5>
          </div>

          <div className="card-body">
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
                  value={post.creator_name}
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
                  rows="6"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}