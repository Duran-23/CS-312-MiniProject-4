import React, { useEffect, useState } from "react";
import { api } from "./api.js";

import Header from "./components/Header.jsx";
import Signin from "./components/Signin.jsx";
import Signup from "./components/Signup.jsx";
import BlogPostForm from "./components/BlogPostForm.jsx";
import PostList from "./components/PostList.jsx";
import EditPost from "./components/EditPost.jsx";

const defaultCategories = [
  "General",
  "Tech",
  "Lifestyle",
  "Education",
  "Sport"
];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(defaultCategories);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load the current user
  useEffect(() => {
    api("/me")
      .then((data) => {
        setUser(data.user);
      })
      .catch((err) => {
        setError(err.message);
      });

    api("/categories")
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Load posts when the selected category changes
  useEffect(() => {
    let active = true;

    setLoading(true);

    api(`/posts?category=${encodeURIComponent(category)}`)
      .then((data) => {
        if (active) {
          setPosts(data);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [category]);

  // Change the visible page
  function navigate(nextPage) {
    setEditing(null);
    setPage(nextPage);
    setError("");
  }

  // Sign in successfully
  function handleSignin(nextUser) {
    setUser(nextUser);
    navigate("home");
  }

  // Log out
  async function handleLogout() {
    try {
      await api("/logout", {
        method: "POST"
      });

      setUser(null);
      navigate("home");
    } catch (err) {
      setError(err.message);
    }
  }

  // Add newly created post to the list
  function handleCreated(newPost) {
    setCategory("All");

    setPosts((previousPosts) => [
      newPost,
      ...previousPosts.filter(
        (post) => post.blog_id !== newPost.blog_id
      )
    ]);
  }

  // Open the edit form
  function handleEdit(post) {
    setEditing(post);
    setError("");
  }

  // Update post in the list
  function handleSaved(updatedPost) {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.blog_id === updatedPost.blog_id
          ? updatedPost
          : post
      )
    );

    setEditing(null);
    setPage("home");
  }

  // Delete a post
  async function handleDelete(post) {
    if (!window.confirm("Delete this post?")) {
      return;
    }

    try {
      await api(`/posts/${post.blog_id}`, {
        method: "DELETE"
      });

      setPosts((previousPosts) =>
        previousPosts.filter(
          (item) => item.blog_id !== post.blog_id
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        navigate={navigate}
        logout={handleLogout}
      />

      <main className="container mb-5 flex-grow-1">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {page === "signin" ? (
          <Signin
            onSuccess={handleSignin}
            navigate={navigate}
          />
        ) : page === "signup" ? (
          <Signup
            navigate={navigate}
          />
        ) : editing ? (
          <EditPost
            key={editing.blog_id}
            post={editing}
            categories={categories}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div className="row">
            <div className="col-md-5 mb-4">
              <BlogPostForm
                user={user}
                categories={categories}
                onCreated={handleCreated}
                navigate={navigate}
              />
            </div>

            <div className="col-md-7">
              {loading ? (
                <p className="text-white">
                  Loading posts...
                </p>
              ) : (
                <PostList
                  posts={posts}
                  user={user}
                  categories={categories}
                  category={category}
                  setCategory={setCategory}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">
          © {new Date().getFullYear()} CS-312 Mini Project 4.
          All rights reserved.
        </p>
      </footer>
    </div>
  );
}