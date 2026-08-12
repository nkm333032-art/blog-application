const API_URL = "http://localhost:3000/api";

// ========================================
// MOBILE MENU
// ========================================

function toggleMenu() {
    const navLinks = document.getElementById("navLinks");

    if (navLinks) {
        navLinks.classList.toggle("show");
    }
}

// ========================================
// MESSAGE
// ========================================

function showMessage(message, type = "success") {
    const messageBox = document.getElementById("message");

    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `alert ${type}`;
    messageBox.style.display = "block";
}

// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch(`${API_URL}/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {

                showMessage(
                    data.message,
                    "error"
                );

                return;
            }

            showMessage(
                "Account created successfully! Redirecting...",
                "success"
            );

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1200);

        } catch (error) {

            console.error(error);

            showMessage(
                "Cannot connect to the backend.",
                "error"
            );
        }
    });
}

// ========================================
// LOGIN + JWT
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch(`${API_URL}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {

                showMessage(
                    data.message,
                    "error"
                );

                return;
            }

            // Save logged-in user
            localStorage.setItem(
                "currentUser",
                JSON.stringify(data.user)
            );

            // Save JWT token
            localStorage.setItem(
                "token",
                data.token
            );

            showMessage(
                "Login successful! Redirecting...",
                "success"
            );

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1000);

        } catch (error) {

            console.error(error);

            showMessage(
                "Cannot connect to the backend.",
                "error"
            );
        }
    });
}

// ========================================
// CREATE BLOG
// ========================================

const blogForm = document.getElementById("blogForm");

if (blogForm) {

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {

        const authorInput =
            document.getElementById("author");

        if (authorInput) {

            authorInput.value =
                currentUser.name;
        }
    }

    blogForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const currentUser =
            JSON.parse(localStorage.getItem("currentUser"));

        const token =
            localStorage.getItem("token");

        if (!currentUser || !token) {

            showMessage(
                "Please login before publishing.",
                "error"
            );

            return;
        }

        const title =
            document.getElementById("title").value.trim();

        const category =
            document.getElementById("category").value;

        const content =
            document.getElementById("content").value.trim();

        try {

            const response =
                await fetch(`${API_URL}/blogs`, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title,
                        category,
                        content
                    })
                });

            const data =
                await response.json();

            if (!response.ok) {

                showMessage(
                    data.message,
                    "error"
                );

                return;
            }

            showMessage(
                "Story published successfully!",
                "success"
            );

            blogForm.reset();

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1200);

        } catch (error) {

            console.error(error);

            showMessage(
                "Cannot connect to the backend.",
                "error"
            );
        }
    });
}

// ========================================
// LOAD ALL BLOGS
// ========================================

async function loadBlogs() {

    const container =
        document.getElementById("blogContainer");

    if (!container) return;

    try {

        const response =
            await fetch(`${API_URL}/blogs`);

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(data.message);
        }

        if (data.blogs.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No stories yet</h3>
                    <p>
                        Be the first person to publish a story.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML =
            data.blogs.map(blog => `

                <article class="blog-card">

                    <div class="blog-card-content">

                        <span class="blog-category">
                            ${escapeHTML(blog.category)}
                        </span>

                        <h3>
                            ${escapeHTML(blog.title)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                blog.content.substring(0, 150)
                            )}...
                        </p>

                        <div class="blog-meta">

                            <span>
                                By ${escapeHTML(blog.author)}
                            </span>

                            <a
                                href="blog-details.html?id=${blog._id}"
                                class="btn btn-outline">
                                Read Story →
                            </a>

                        </div>

                    </div>

                </article>

            `).join("");

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load stories
                </h3>

                <p>
                    Please make sure the backend is running.
                </p>

            </div>
        `;
    }
}

// ========================================
// LOAD USER BLOGS / DASHBOARD
// ========================================

async function loadUserBlogs() {

    const container =
        document.getElementById("userBlogs");

    if (!container) return;

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    const token =
        localStorage.getItem("token");

    if (!currentUser || !token) {

        window.location.href =
            "login.html";

        return;
    }

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    if (welcomeMessage) {

        welcomeMessage.textContent =
            `Welcome back, ${currentUser.name}.`;
    }

    try {

        // Use protected API
        const response =
            await fetch(`${API_URL}/blogs/my`, {

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(data.message);
        }

        const blogCount =
            document.getElementById("blogCount");

        if (blogCount) {

            blogCount.textContent =
                data.blogs.length;
        }

        if (data.blogs.length === 0) {

            container.innerHTML = `
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

        container.innerHTML =
            data.blogs.map(blog => `

                <article class="blog-card">

                    <div class="blog-card-content">

                        <span class="blog-category">
                            ${escapeHTML(blog.category)}
                        </span>

                        <h3>
                            ${escapeHTML(blog.title)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                blog.content.substring(0, 150)
                            )}...
                        </p>

                        <div class="blog-meta">

                            <a
                                href="blog-details.html?id=${blog._id}"
                                class="btn btn-outline">
                                Read
                            </a>

                            <a
                                href="edit-blog.html?id=${blog._id}"
                                class="btn btn-primary">
                                Edit
                            </a>

                            <button
                                class="btn btn-primary"
                                onclick="deleteBlog('${blog._id}')">
                                Delete
                            </button>

                        </div>

                    </div>

                </article>

            `).join("");

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load your stories
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;
    }
}

// ========================================
// BLOG DETAILS
// ========================================

async function loadBlogDetails() {

    const container =
        document.getElementById("blogDetails");

    if (!container) return;

    const params =
        new URLSearchParams(window.location.search);

    const blogId =
        params.get("id");

    if (!blogId) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>Blog not found</h3>
            </div>
        `;

        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/blogs/${blogId}`);

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(data.message);
        }

        const blog =
            data.blog;

        container.innerHTML = `

            <article class="blog-details">

                <span class="blog-category">
                    ${escapeHTML(blog.category)}
                </span>

                <h1>
                    ${escapeHTML(blog.title)}
                </h1>

                <div class="blog-author">

                    <strong>
                        ${escapeHTML(blog.author)}
                    </strong>

                    <span>
                        ${new Date(
                            blog.createdAt
                        ).toLocaleDateString()}
                    </span>

                </div>

                <div class="blog-content">

                    ${escapeHTML(blog.content)
                        .replace(/\n/g, "<br><br>")}

                </div>

                <br>

                <a
                    href="index.html"
                    class="btn btn-outline">
                    ← Back to Stories
                </a>

            </article>

        `;

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Unable to load this story
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;
    }
}

// ========================================
// LOAD EDIT BLOG
// ========================================

async function loadEditBlog() {

    const editForm =
        document.getElementById("editBlogForm");

    if (!editForm) return;

    const token =
        localStorage.getItem("token");

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    if (!token || !currentUser) {

        window.location.href =
            "login.html";

        return;
    }

    const params =
        new URLSearchParams(window.location.search);

    const blogId =
        params.get("id");

    if (!blogId) {

        showMessage(
            "Blog ID is missing.",
            "error"
        );

        return;
    }

    // ------------------------------------
    // GET BLOG
    // ------------------------------------

    try {

        const response =
            await fetch(`${API_URL}/blogs/${blogId}`);

        const data =
            await response.json();

        if (!response.ok) {

            showMessage(
                data.message,
                "error"
            );

            return;
        }

        const blog =
            data.blog;

        // Fill form with existing data

        document.getElementById("title").value =
            blog.title;

        document.getElementById("category").value =
            blog.category;

        document.getElementById("content").value =
            blog.content;

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to load blog.",
            "error"
        );

        return;
    }

    // ------------------------------------
    // UPDATE BLOG
    // ------------------------------------

    editForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const title =
            document.getElementById("title").value.trim();

        const category =
            document.getElementById("category").value;

        const content =
            document.getElementById("content").value.trim();

        if (!title || !category || !content) {

            showMessage(
                "Please fill all fields.",
                "error"
            );

            return;
        }

        try {

            const response =
                await fetch(`${API_URL}/blogs/${blogId}`, {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title,
                        category,
                        content
                    })
                });

            const data =
                await response.json();

            if (!response.ok) {

                showMessage(
                    data.message,
                    "error"
                );

                return;
            }

            showMessage(
                "Story updated successfully!",
                "success"
            );

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1000);

        } catch (error) {

            console.error(error);

            showMessage(
                "Cannot connect to the backend.",
                "error"
            );
        }
    });
}

// ========================================
// DELETE BLOG
// ========================================

async function deleteBlog(blogId) {

    const currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    const token =
        localStorage.getItem("token");

    if (!currentUser || !token) {

        window.location.href =
            "login.html";

        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to delete this story?"
        );

    if (!confirmed) return;

    try {

        const response =
            await fetch(`${API_URL}/blogs/${blogId}`, {

                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

        const data =
            await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        alert(
            "Story deleted successfully."
        );

        loadUserBlogs();

    } catch (error) {

        console.error(error);

        alert(
            "Cannot connect to the backend."
        );
    }
}

// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem("currentUser");

    localStorage.removeItem("token");

    window.location.href =
        "login.html";
}

// ========================================
// SECURITY HELPER
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;
}

// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadBlogs();

        loadUserBlogs();

        loadBlogDetails();

        loadEditBlog();

    }
);