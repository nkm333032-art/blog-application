const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const Blog = require("./models/Blog");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

// ========================================
// MONGODB CONNECTION
// ========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error.message);
    });

// ========================================
// HOME / TEST API
// ========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Inkly Blog Application Backend is running!"
    });
});

// ========================================
// REGISTER API
// ========================================

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password
        });

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// LOGIN API + JWT
// ========================================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            password: password
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// GET CURRENT USER
// ========================================

app.get("/api/profile", authMiddleware, async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// CREATE BLOG API
// ========================================

app.post("/api/blogs", authMiddleware, async (req, res) => {

    try {

        const {
            title,
            category,
            content
        } = req.body;

        if (!title || !category || !content) {
            return res.status(400).json({
                success: false,
                message: "Title, category and content are required."
            });
        }

        const newBlog = await Blog.create({
            title,
            category,
            content,

            // Get author information from JWT
            author: req.user.name,
            email: req.user.email
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully.",
            blog: newBlog
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// GET ALL BLOGS
// ========================================

app.get("/api/blogs", async (req, res) => {

    try {

        const blogs = await Blog.find()
            .sort({
                createdAt: -1
            });

        res.json({
            success: true,
            blogs
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// GET LOGGED-IN USER'S BLOGS
// ========================================

app.get("/api/blogs/my", authMiddleware, async (req, res) => {

    try {

        const blogs = await Blog.find({
            email: req.user.email
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            blogs
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// GET BLOGS BY EMAIL
// ========================================

app.get("/api/blogs/user/:email", async (req, res) => {

    try {

        const email = req.params.email.toLowerCase();

        const blogs = await Blog.find({
            email
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            blogs
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// GET SINGLE BLOG
// ========================================

app.get("/api/blogs/:id", async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        res.json({
            success: true,
            blog
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            success: false,
            message: "Invalid blog ID."
        });
    }
});

// ========================================
// UPDATE BLOG
// ========================================

app.put("/api/blogs/:id", authMiddleware, async (req, res) => {

    try {

        const {
            title,
            category,
            content
        } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        // Only the owner can update the blog
        if (
            blog.email.toLowerCase() !==
            req.user.email.toLowerCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot update this blog."
            });
        }

        blog.title = title || blog.title;
        blog.category = category || blog.category;
        blog.content = content || blog.content;

        await blog.save();

        res.json({
            success: true,
            message: "Blog updated successfully.",
            blog
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// ========================================
// DELETE BLOG
// ========================================

app.delete("/api/blogs/:id", authMiddleware, async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        // Only the owner can delete the blog
        if (
            blog.email.toLowerCase() !==
            req.user.email.toLowerCase()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete this blog."
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Blog deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});