// ===============================
// Get users from localStorage
// ===============================

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}


// ===============================
// Register
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("registerMessage");

        if (password !== confirmPassword) {

            message.textContent = "Passwords do not match.";
            message.style.color = "red";

            return;
        }

        let users = getUsers();

        const existingUser =
            users.find(user => user.email === email);

        if (existingUser) {

            message.textContent =
                "Email already registered.";

            message.style.color = "red";

            return;
        }

        const newUser = {
            name: name,
            email: email,
            password: password
        };

        users.push(newUser);

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );

        message.textContent =
            "Registration successful! Redirecting...";

        message.style.color = "green";

        setTimeout(function() {
            window.location.href = "login.html";
        }, 1000);

    });
}


// ===============================
// Login
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        const users = getUsers();

        const user = users.find(function(user) {

            return user.email === email &&
                   user.password === password;

        });

        if (!user) {

            message.textContent =
                "Invalid email or password.";

            message.style.color = "red";

            return;
        }

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(user)
        );

        message.textContent =
            "Login successful!";

        message.style.color = "green";

        setTimeout(function() {
            window.location.href = "dashboard.html";
        }, 800);

    });
}


// ===============================
// Logout
// ===============================

function logout() {

    localStorage.removeItem("loggedInUser");

    window.location.href = "login.html";
}


// ===============================
// Get Blogs
// ===============================

function getBlogs() {

    return JSON.parse(
        localStorage.getItem("blogs")
    ) || [];

}


// ===============================
// Save Blogs
// ===============================

function saveBlogs(blogs) {

    localStorage.setItem(
        "blogs",
        JSON.stringify(blogs)
    );

}


// ===============================
// Create Blog
// ===============================

const blogForm = document.getElementById("blogForm");

if (blogForm) {

    blogForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const loggedInUser =
            JSON.parse(
                localStorage.getItem("loggedInUser")
            );

        if (!loggedInUser) {

            alert("Please login first.");

            window.location.href = "login.html";

            return;
        }

        const title =
            document.getElementById("blogTitle").value.trim();

        const category =
            document.getElementById("blogCategory").value;

        const content =
            document.getElementById("blogContent").value.trim();

        const blogs = getBlogs();

        const newBlog = {

            id: Date.now(),

            title: title,

            category: category,

            content: content,

            author: loggedInUser.name,

            email: loggedInUser.email,

            date: new Date().toLocaleDateString()

        };

        blogs.push(newBlog);

        saveBlogs(blogs);

        document.getElementById("blogMessage").textContent =
            "Blog published successfully!";

        document.getElementById("blogMessage").style.color =
            "green";

        blogForm.reset();

        setTimeout(function() {

            window.location.href = "dashboard.html";

        }, 1000);

    });

}


// ===============================
// Display Blogs on Home
// ===============================

function displayHomeBlogs() {

    const blogList =
        document.getElementById("blogList");

    if (!blogList) return;

    const blogs = getBlogs();

    if (blogs.length === 0) {

        blogList.innerHTML = `
            <div class="blog-card">
                <h3>No Blogs Yet</h3>
                <p>
                    Be the first person to create a blog!
                </p>
            </div>
        `;

        return;
    }

    blogList.innerHTML = "";

    blogs.slice().reverse().forEach(function(blog) {

        const card = document.createElement("div");

        card.className = "blog-card";

        card.innerHTML = `
            <span class="category">
                ${escapeHTML(blog.category)}
            </span>

            <h3>
                ${escapeHTML(blog.title)}
            </h3>

            <p>
                ${escapeHTML(blog.content)}
            </p>

            <span class="blog-date">
                By ${escapeHTML(blog.author)}
                • ${escapeHTML(blog.date)}
            </span>
        `;

        blogList.appendChild(card);

    });

}


// ===============================
// Dashboard
// ===============================

function loadDashboard() {

    const dashboardBlogs =
        document.getElementById("dashboardBlogs");

    if (!dashboardBlogs) return;

    const loggedInUser =
        JSON.parse(
            localStorage.getItem("loggedInUser")
        );

    if (!loggedInUser) {

        window.location.href = "login.html";

        return;
    }

    const welcomeUser =
        document.getElementById("welcomeUser");

    if (welcomeUser) {

        welcomeUser.textContent =
            "Welcome, " + loggedInUser.name + "!";

    }

    const blogs = getBlogs();

    const userBlogs = blogs.filter(function(blog) {

        return blog.email === loggedInUser.email;

    });

    const totalBlogs =
        document.getElementById("totalBlogs");

    if (totalBlogs) {

        totalBlogs.textContent =
            userBlogs.length;

    }

    if (userBlogs.length === 0) {

        dashboardBlogs.innerHTML = `
            <div class="blog-card">
                <h3>No blogs created</h3>

                <p>
                    Start sharing your ideas by creating
                    your first blog.
                </p>

                <br>

                <a
                    href="create-blog.html"
                    class="btn"
                >
                    Create Blog
                </a>
            </div>
        `;

        return;
    }

    dashboardBlogs.innerHTML = "";

    userBlogs.slice().reverse().forEach(function(blog) {

        const card =
            document.createElement("div");

        card.className = "blog-card";

        card.innerHTML = `

            <span class="category">
                ${escapeHTML(blog.category)}
            </span>

            <h3>
                ${escapeHTML(blog.title)}
            </h3>

            <p>
                ${escapeHTML(blog.content)}
            </p>

            <span class="blog-date">
                ${escapeHTML(blog.date)}
            </span>

            <button
                class="delete-btn"
                onclick="deleteBlog(${blog.id})"
            >
                Delete
            </button>

        `;

        dashboardBlogs.appendChild(card);

    });

}


// ===============================
// Delete Blog
// ===============================

function deleteBlog(id) {

    const loggedInUser =
        JSON.parse(
            localStorage.getItem("loggedInUser")
        );

    if (!loggedInUser) return;

    let blogs = getBlogs();

    blogs = blogs.filter(function(blog) {

        return !(
            blog.id === id &&
            blog.email === loggedInUser.email
        );

    });

    saveBlogs(blogs);

    loadDashboard();

}


// ===============================
// HTML Escape
// ===============================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ===============================
// Run Functions
// ===============================

displayHomeBlogs();

loadDashboard();
