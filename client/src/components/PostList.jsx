import React, { useEffect, useState } from "react";

export default function PostList({
  posts,
  user,
  categories,
  category,
  setCategory,
  onEdit,
  onDelete
}) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
        <h4 className="mb-0">Blog Posts</h4>

        <div className="d-flex align-items-center gap-2">
          <label htmlFor="categoryFilter" className="fw-semibold">
            Filter:
          </label>

          <select
            id="categoryFilter"
            className="form-select form-select-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="alert alert-info text-center">
          No posts found in this category.
        </div>
      ) : (
        posts.map((post) => (
          <div
            className="card mb-3 shadow-sm"
            key={post.blog_id}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="card-title text-primary">
                  {post.title}
                </h5>

                <span className="badge bg-secondary">
                  {post.category}
                </span>
              </div>

              <h6 className="card-subtitle mb-2 text-muted">
                By {post.creator_name} |{" "}
                <small>
                  {new Date(post.date_created).toLocaleString()}
                </small>
              </h6>

              <p className="card-text">
                {post.body}
              </p>

              {user &&
                String(post.creator_user_id) ===
                  String(user.user_id) && (
                  <div className="d-flex justify-content-end gap-2 border-top pt-2">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => onEdit(post)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDelete(post)}
                    >
                      Delete
                    </button>
                  </div>
                )}
            </div>
          </div>
        ))
      )}
    </>
  );
}