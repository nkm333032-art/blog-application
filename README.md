# 📝 Inkly - Full Stack Blog Application

Inkly is a responsive full-stack blog application developed during my Web Development Internship at Codomax Digital Solutions.

The application allows users to register, log in securely, create blog posts, view blogs, update their own posts, and delete them. The project uses a modern frontend connected to a Node.js and Express.js backend with MongoDB Atlas for database storage.

## 🚀 Features

- User Registration
- User Login
- JWT Authentication
- Protected Dashboard
- Create Blog Posts
- View All Blogs
- View Individual Blog Details
- Update Blog Posts
- Delete Blog Posts
- User-specific Blog Dashboard
- Responsive Design
- MongoDB Atlas Database
- REST API Integration

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### Tools
- Visual Studio Code
- Git
- GitHub

## 📁 Project Structure

```text
blog-application/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Blog.js
│   │
│   ├── .env
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── css/
│   ├── js/
│   │   └── script.js
│   │
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── blog-details.html
│   └── edit-blog.html
│
├── .gitignore
└── README.md