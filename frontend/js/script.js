// =====================================================
// INKLY BLOG APPLICATION
// FRONTEND JAVASCRIPT
// =====================================================

const API_URL = "http://localhost:3000/api";


// =====================================================
// MOBILE MENU
// =====================================================

function toggleMenu() {
    const navLinks = document.getElementById("navLinks");

    if (navLinks) {
        navLinks.classList.toggle("show");
    }
}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(message, type = "success") {

    const messageBox = document.getElementById("message");

    if (!messageBox) {
        alert(message);
        return;
    }

    messageBox.textContent = message;
    messageBox.className = "alert " + type;
    messageBox.style.display = "block";

    setTimeout(() => {
        messageBox.style.display = "none";
    }, 4000);
}


// =====================================================
// REGISTER
// =====================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!name || !email || !password) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        try {

            const response = await fetch(`${API_URL}/register`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {

                showMessage(
                    "Account created successfully!",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1200);

            } else {

                showMessage(
                    data.message || "Registration failed.",
                    "error"
                );
            }

        } catch (error) {

            console.error("Register error:", error);

            showMessage(
                "Cannot connect to backend. Make sure server.js is running.",
                "error"
            );
        }

    });
}


// =====================================================
// LOGIN
// =====================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {

            showMessage(
                "Please enter email and password.",
                "error"
            );

            return;
        }

        try {

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {

                // Save user information
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(data.user)
                );

                showMessage(
                    "Login successful!",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);

            } else {

                showMessage(
                    data.message || "Invalid email or password.",
                    "error"
                );
            }

        } catch (error) {

            console.error("Login error:", error);

            showMessage(
                "Cannot connect to backend. Make sure server.js is running.",
                "error"
            );
        }

    });
}


// =====================================================
// CREATE BLOG
// =====================================================

const blogForm = document.getElementById("blogForm");

if (blogForm) {

    const loggedInUser =
        JSON.parse(localStorage.getItem("loggedInUser"));

    // If user is not logged in
    if (!loggedInUser) {

        window.location.href = "login.html";

    } else {

        // Automatically fill author
        const authorInput =
            document.getElementById("author");

        if (authorInput) {
            authorInput.value = loggedInUser.name;
        }
    }


    blogForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const title =
            document.getElementById("title").value.trim();

        const category =
            document.getElementById("category").value;

        const author =
            document.getElementById("author").value.trim();

        const content =
            document.getElementById("content").value.trim();


        // Get logged in user again
        const user =
            JSON.parse(localStorage.getItem("loggedInUser"));


        if (!user) {

            showMessage(
                "Please login before creating a blog.",
                "error"
            );

            return;
        }


        if (!title || !category || !author || !content) {

            showMessage(
                "Please fill in all fields.",
                "error"
            );

            return;
        }


        try {

            const response = await fetch(`${API_URL}/blogs`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: title,

                    category: category,

                    content: content,

                    author: author,

                    // IMPORTANT:
                    // Backend requires email
                    email: user.email

                })
            });


            const data = await response.json();


            if (data.success) {

                showMessage(
                    "Your story has been published!",
                    "success"
                );

                blogForm.reset();


                // Restore author after reset
                const authorInput =
                    document.getElementById("author");

                if (authorInput) {
                    authorInput.value = user.name;
                }


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1200);

            } else {

                showMessage(
                    data.message || "Failed to publish story.",
                    "error"
                );
            }

        } catch (error) {

            console.error("Create blog error:", error);

            showMessage(
                "Cannot connect to backend. Make sure server.js is running.",
                "error"
            );
        }

    });
}


// =====================================================
// LOAD ALL BLOGS
// HOME PAGE
// =====================================================

async function loadBlogs() {

    const blogContainer =
        document.getElementById("blogContainer");

    if (!blogContainer) {
        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/blogs`);


        const data =
            await response.json();


        if (!data.success) {

            blogContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load stories
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;

            return;
        }


        const blogs =
            data.blogs || [];


        if (blogs.length === 0) {

            blogContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No stories yet
                    </h3>

                    <p>
                        Be the first person to publish a story.
                    </p>

                    <br>

                    <a
                        href="register.html"
                        class="btn btn-primary">

                        Start Writing

                    </a>

                </div>
            `;

            return;
        }


        blogContainer.innerHTML =
            blogs.map(blog => createBlogCard(blog)).join("");


    } catch (error) {

        console.error("Load blogs error:", error);

        blogContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Cannot connect to server
                </h3>

                <p>
                    Please make sure the backend server is running.
                </p>

            </div>
        `;
    }
}


// =====================================================
// CREATE BLOG CARD
// =====================================================

function createBlogCard(blog) {

    const title =
        escapeHTML(blog.title || "Untitled Story");

    const category =
        escapeHTML(blog.category || "General");

    const author =
        escapeHTML(blog.author || "Anonymous");

    const content =
        escapeHTML(blog.content || "");

    const date =
        escapeHTML(
            blog.date ||
            new Date().toLocaleDateString()
        );


    const preview =
        content.length > 150
            ? content.substring(0, 150) + "..."
            : content;


    return `
        <article class="blog-card">

            <div class="blog-card-image">

                <div class="blog-image-icon">
                    ✍️
                </div>

            </div>


            <div class="blog-card-content">

                <span class="blog-category">
                    ${category}
                </span>


                <h3>
                    ${title}
                </h3>


                <p>
                    ${preview}
                </p>


                <div class="blog-meta">

                    <span>
                        By ${author}
                    </span>

                    <span>
                        ${date}
                    </span>

                </div>

            </div>

        </article>
    `;
}


// =====================================================
// DASHBOARD
// =====================================================

async function loadUserBlogs() {

    const userBlogs =
        document.getElementById("userBlogs");

    if (!userBlogs) {
        return;
    }


    const loggedInUser =
        JSON.parse(localStorage.getItem("loggedInUser"));


    if (!loggedInUser) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        // Use email-based API from your server.js
        const response = await fetch(
            `${API_URL}/blogs/user/${encodeURIComponent(loggedInUser.email)}`
        );


        const data =
            await response.json();


        if (!data.success) {

            userBlogs.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to load your stories
                    </h3>

                </div>
            `;

            return;
        }


        const blogs =
            data.blogs || [];


        // Update story count
        const blogCount =
            document.getElementById("blogCount");


        if (blogCount) {

            blogCount.textContent =
                blogs.length;
        }


        // No blogs
        if (blogs.length === 0) {

            userBlogs.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No stories yet
                    </h3>

                    <p>
                        Start writing your first story.
                    </p>

                    <br>

                    <a
                        href="create-blog.html"
                        class="btn btn-primary">

                        Write Your First Story

                    </a>

                </div>
            `;

            return;
        }


        // Display blogs
        userBlogs.innerHTML =
            blogs.map(blog => {

                return `
                    <article class="blog-card">

                        <div class="blog-card-image">

                            <div class="blog-image-icon">
                                ✍️
                            </div>

                        </div>


                        <div class="blog-card-content">

                            <span class="blog-category">
                                ${escapeHTML(blog.category)}
                            </span>


                            <h3>
                                ${escapeHTML(blog.title)}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    blog.content.length > 150
                                        ? blog.content.substring(0, 150) + "..."
                                        : blog.content
                                )}
                            </p>


                            <div class="blog-meta">

                                <span>
                                    ${escapeHTML(blog.date)}
                                </span>

                                <button
                                    class="delete-btn"
                                    onclick="deleteBlog(${blog.id})">

                                    Delete

                                </button>

                            </div>

                        </div>

                    </article>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        userBlogs.innerHTML = `
            <div class="empty-state">

                <h3>
                    Cannot connect to server
                </h3>

                <p>
                    Please make sure server.js is running.
                </p>

            </div>
        `;
    }
}


// =====================================================
// DASHBOARD USER NAME
// =====================================================

function loadUserInformation() {

    const user =
        JSON.parse(localStorage.getItem("loggedInUser"));


    if (!user) {
        return;
    }


    const welcomeMessage =
        document.getElementById("welcomeMessage");


    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Welcome back, ${user.name}.`;
    }
}


// =====================================================
// DELETE BLOG
// =====================================================

async function deleteBlog(blogId) {

    const user =
        JSON.parse(localStorage.getItem("loggedInUser"));


    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    const confirmed =
        confirm("Are you sure you want to delete this story?");


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/blogs/${blogId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: user.email
                    })
                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert("Story deleted successfully.");

            loadUserBlogs();

        } else {

            alert(
                data.message ||
                "Could not delete story."
            );
        }


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Cannot connect to backend."
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem(
        "loggedInUser"
    );

    window.location.href =
        "index.html";
}


// =====================================================
// PROTECT DASHBOARD
// =====================================================

function protectDashboard() {

    const dashboard =
        document.getElementById("userBlogs");


    if (!dashboard) {
        return;
    }


    const user =
        localStorage.getItem("loggedInUser");


    if (!user) {

        window.location.href =
            "login.html";
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Inkly frontend loaded successfully."
        );

        // Home
        loadBlogs();

        // Dashboard
        protectDashboard();

        loadUserInformation();

        loadUserBlogs();

    }
);