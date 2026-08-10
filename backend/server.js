const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data files
const dataFolder = path.join(__dirname, "data");
const usersFile = path.join(dataFolder, "users.json");
const blogsFile = path.join(dataFolder, "blogs.json");

// Make sure data folder exists
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}

// Make sure JSON files exist
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]");
}

if (!fs.existsSync(blogsFile)) {
    fs.writeFileSync(blogsFile, "[]");
}

// Read users
function getUsers() {
    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

// Save users
function saveUsers(users) {
    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2)
    );
}

// Read blogs
function getBlogs() {
    return JSON.parse(fs.readFileSync(blogsFile, "utf8"));
}

// Save blogs
function saveBlogs(blogs) {
    fs.writeFileSync(
        blogsFile,
        JSON.stringify(blogs, null, 2)
    );
}


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

app.post("/api/register", (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const users = getUsers();

    const existingUser = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already registered."
        });
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email.toLowerCase(),
        password: password
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
        success: true,
        message: "Registration successful.",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });
});


// ========================================
// LOGIN API
// ========================================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    const users = getUsers();

    const user = users.find(
        user =>
            user.email.toLowerCase() === email.toLowerCase() &&
            user.password === password
    );

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
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});


// ========================================
// CREATE BLOG API
// ========================================

app.post("/api/blogs", (req, res) => {

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

    const blogs = getBlogs();

    const newBlog = {
        id: Date.now(),
        title: title,
        category: category,
        content: content,
        author: author,
        email: email.toLowerCase(),
        date: new Date().toLocaleDateString()
    };

    blogs.push(newBlog);
    saveBlogs(blogs);

    res.status(201).json({
        success: true,
        message: "Blog created successfully.",
        blog: newBlog
    });
});


// ========================================
// GET ALL BLOGS API
// ========================================

app.get("/api/blogs", (req, res) => {

    const blogs = getBlogs();

    res.json({
        success: true,
        blogs: blogs
    });
});


// ========================================
// GET USER BLOGS API
// ========================================

app.get("/api/blogs/user/:email", (req, res) => {

    const email = req.params.email.toLowerCase();

    const blogs = getBlogs();

    const userBlogs = blogs.filter(
        blog => blog.email.toLowerCase() === email
    );

    res.json({
        success: true,
        blogs: userBlogs
    });
});


// ========================================
// DELETE BLOG API
// ========================================

app.delete("/api/blogs/:id", (req, res) => {

    const blogId = Number(req.params.id);
    const { email } = req.body;

    let blogs = getBlogs();

    const blog = blogs.find(
        blog => blog.id === blogId
    );

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

    blogs = blogs.filter(
        blog => blog.id !== blogId
    );

    saveBlogs(blogs);

    res.json({
        success: true,
        message: "Blog deleted successfully."
    });
});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});