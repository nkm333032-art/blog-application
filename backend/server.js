const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Blog = require("./models/Blog");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
        message: "Blog Application Backend is running!"
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
// LOGIN API
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

        res.json({
            success: true,
            message: "Login successful.",
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
// CREATE BLOG API
// ========================================

app.post("/api/blogs", async (req, res) => {

    try {

        const {
            title,
            category,
            content,
            author,
            email
        } = req.body;

        if (!title || !category || !content || !author || !email) {
            return res.status(400).json({
                success: false,
                message: "All blog fields are required."
            });
        }

        const newBlog = await Blog.create({
            title,
            category,
            content,
            author,
            email: email.toLowerCase()
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

        const blogs = await Blog.find().sort({
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
// GET USER BLOGS
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

        res.status(500).json({
            success: false,
            message: "Invalid blog ID."
        });
    }
});


// ========================================
// DELETE BLOG
// ========================================

app.delete("/api/blogs/:id", async (req, res) => {

    try {

        const { email } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        if (
            !email ||
            blog.email.toLowerCase() !== email.toLowerCase()
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