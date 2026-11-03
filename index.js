import express from "express";
import session from "express-session";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL database connection
const db = new pg.Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432)
});

db.query("SELECT 1")
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Database error:", err));

// Middleware
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

// Categories
const categories = [
  "General",
  "Tech",
  "Lifestyle",
  "Education",
  "Sport"
];

// Authentication middleware
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Please sign in first."
    });
  }

  next();
}

// Get current user
app.get("/api/me", (req, res) => {
  res.json({
    user: req.session.user || null
  });
});

// Get categories
app.get("/api/categories", (req, res) => {
  res.json(categories);
});

// Signup
app.post("/api/signup", async (req, res) => {
  const { user_id, password, name } = req.body;

  if (!user_id?.trim() || !password || !name?.trim()) {
    return res.status(400).json({
      error: "All fields are required."
    });
  }

  try {
    const existing = await db.query(
      "SELECT user_id FROM users WHERE user_id = $1",
      [user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "User ID is already taken."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO users (user_id, password, name)
       VALUES ($1, $2, $3)`,
      [user_id, hashedPassword, name]
    );

    res.status(201).json({
      message: "Account created successfully."
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "An error occurred during signup."
    });
  }
});

// Signin
app.post("/api/signin", async (req, res) => {
  const { user_id, password } = req.body;

  if (typeof user_id !== "string" ||
      typeof password !== "string") {
    return res.status(400).json({
      error: "User ID and password are required."
    });
  }

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid User ID or Password."
      });
    }

    const account = result.rows[0];

    const isHashed = /^\$2[aby]\$\d{2}\$/.test(account.password);

    const validPassword = isHashed
      ? await bcrypt.compare(password, account.password)
      : password === account.password;

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid User ID or Password."
      });
    }

    // Upgrade older plaintext passwords
    if (!isHashed) {
      const hash = await bcrypt.hash(password, 12);

      await db.query(
        "UPDATE users SET password = $1 WHERE user_id = $2",
        [hash, account.user_id]
      );
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({
          error: "Session error."
        });
      }

      req.session.user = {
        user_id: account.user_id,
        name: account.name
      };

      res.json({
        message: "Signed in successfully.",
        user: req.session.user
      });
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "An error occurred during signin."
    });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "Could not log out."
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      message: "Logged out."
    });
  });
});

// Get all blog posts
app.get("/api/posts", async (req, res) => {
  const selectedCategory = req.query.category;

  try {
    let query = "SELECT * FROM blogs";
    const params = [];

    if (selectedCategory && selectedCategory !== "All") {
      query += " WHERE category = $1";
      params.push(selectedCategory);
    }

    query += " ORDER BY date_created DESC";

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Could not load posts."
    });
  }
});

// Get one post
app.get("/api/posts/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM blogs WHERE blog_id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Post not found."
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Could not load post."
    });
  }
});

// Create a blog post
app.post("/api/posts", requireLogin, async (req, res) => {
  const { title, content, category } = req.body;

  if (typeof title !== "string" ||
      typeof content !== "string" ||
      !title.trim() || !content.trim()) {
    return res.status(400).json({
      error: "Title and content are required."
    });
  }

  if (category && !categories.includes(category)) {
    return res.status(400).json({
      error: "Invalid category."
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO blogs
       (creator_name, creator_user_id, title, body,
        category, date_created)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [
        req.session.user.name,
        req.session.user.user_id,
        title,
        content,
        category || "General"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Could not create post."
    });
  }
});

// Update a blog post
app.put("/api/posts/:id", requireLogin, async (req, res) => {
  const { title, content, category } = req.body;

  if (typeof title !== "string" ||
      typeof content !== "string" ||
      !title.trim() ||
      !content.trim() ||
      !categories.includes(category)) {
    return res.status(400).json({
      error: "Valid title, content, and category are required."
    });
  }

  try {
    const result = await db.query(
      `UPDATE blogs
       SET title = $1, body = $2, category = $3
       WHERE blog_id = $4 AND creator_user_id = $5
       RETURNING *`,
      [
        title,
        content,
        category,
        req.params.id,
        req.session.user.user_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Post not found or you are not its creator."
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Could not update post."
    });
  }
});

// Delete a blog post
app.delete("/api/posts/:id", requireLogin, async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM blogs
       WHERE blog_id = $1 AND creator_user_id = $2
       RETURNING blog_id`,
      [
        req.params.id,
        req.session.user.user_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Post not found or you are not its creator."
      });
    }

    res.json({
      message: "Post deleted successfully."
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Could not delete post."
    });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Blog API: http://localhost:${PORT}`);
});