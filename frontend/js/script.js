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
// JWT HELPERS
// ========================================

function getToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    const user = localStorage.getItem("currentUser");

    if (!user) return null;

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

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
                showMessage(data.message, "error");
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

            // Save JWT
            localStorage.setItem(
                "token",
                data.token
            );

            // Save user information
            localStorage.setItem(
                "currentUser",
                JSON.stringify(data.user)
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
// DASHBOARD AUTHENTICATION
// ========================================

async function checkDashboardAuth() {

    const userBlogs =
        document.getElementById("userBlogs");

    if (!userBlogs) return;

    const token = getToken();

    if (!token) {

        window.location.href =
            "login.html";

        return;
    }

    try {

        const response =
            await fetch(`${API_URL}/profile`, {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            });

        if (!response.ok) {

            logout();

            return;
        }

        const data =
            await response.json();

        if (data.success) {

            localStorage.setItem(
                "currentUser",
                JSON.stringify(data.user)
            );

            const welcomeMessage =
                document.getElementById("welcomeMessage");

            if (welcomeMessage) {

                welcomeMessage.textContent =
                    `Welcome back, ${data.user.name}.`;
            }
        }

    } catch (error) {

        console.error(error);

        showDashboardError(
            "Cannot connect to the backend."
        );
    }
}

// ========================================
// CREATE BLOG
// ========================================

const blogForm =
    document.getElementById("blogForm");

if (blogForm) {

    const currentUser =
        getCurrentUser();

    if (!getToken()) {

        window.location.href =
            "login.html";
    }

    if (currentUser) {

        const authorInput =
            document.getElementById("author");

        if (authorInput) {

            authorInput.value =
                currentUser.name;
        }
    }

    blogForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const token =
                getToken();

            if (!token) {

                showMessage(
                    "Please login before publishing.",
                    "error"
                );

                return;
            }

            const title =
                document.getElementById(
                    "title"
                ).value.trim();

            const category =
                document.getElementById(
                    "category"
                ).value;

            const content =
                document.getElementById(
                    "content"
                ).value.trim();

            try {

                const response =
                    await fetch(
                        `${API_URL}/blogs`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                title,
                                category,
                                content
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {

                    if (response.status === 401) {
                        logout();
                        return;
                    }

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
        }
    );
}

// ========================================
// LOAD ALL BLOGS
// ========================================

async function loadBlogs() {

    const container =
        document.getElementById(
            "blogContainer"
        );

    if (!container) return;

    try {

        const response =
            await fetch(
                `${API_URL}/blogs`
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.message
            );
        }

        if (data.blogs.length === 0) {

            container.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No stories yet
                    </h3>

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
                                blog.content.substring(
                                    0,
                                    150
                                )
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
// LOAD USER BLOGS
// ========================================

async function loadUserBlogs() {

    const container =
        document.getElementById(
            "userBlogs"
        );

    if (!container) return;

    const token =
        getToken();

    if (!token) {

        window.location.href =
            "login.html";

        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/blogs/my`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (response.status === 401) {

            logout();

            return;
        }

        if (!response.ok) {

            throw new Error(
                data.message
            );
        }

        const blogCount =
            document.getElementById(
                "blogCount"
            );

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
                                blog.content.substring(
                                    0,
                                    150
                                )
                            )}...
                        </p>

                        <div class="blog-meta">

                            <a
                                href="blog-details.html?id=${blog._id}"
                                class="btn btn-outline">
                                Read
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
        document.getElementById(
            "blogDetails"
        );

    if (!container) return;

    const params =
        new URLSearchParams(
            window.location.search
        );

    const blogId =
        params.get("id");

    if (!blogId) {

        container.innerHTML = `
            <div class="empty-state">

                <h3>
                    Blog not found
                </h3>

            </div>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/blogs/${blogId}`
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message
            );
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
                        ${blog.createdAt
                            ? new Date(
                                blog.createdAt
                              ).toLocaleDateString()
                            : ""
                        }
                    </span>

                </div>

                <div class="blog-content">

                    ${escapeHTML(blog.content)
                        .replace(
                            /\n/g,
                            "<br><br>"
                        )}

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
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
        `;
    }
}

// ========================================
// DELETE BLOG
// ========================================

async function deleteBlog(blogId) {

    const token =
        getToken();

    if (!token) {

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
            await fetch(
                `${API_URL}/blogs/${blogId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (response.status === 401) {

            logout();

            return;
        }

        if (!response.ok) {

            alert(
                data.message
            );

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

    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");

    window.location.href =
        "login.html";
}

// ========================================
// DASHBOARD ERROR
// ========================================

function showDashboardError(message) {

    const container =
        document.getElementById(
            "userBlogs"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}

// ========================================
// SECURITY HELPER
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

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

        checkDashboardAuth();

        loadBlogs();

        loadUserBlogs();

        loadBlogDetails();

    }
);