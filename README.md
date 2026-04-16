# 🛠️ Task Manager Backend API

A scalable and well-structured **REST API** built using **Node.js**, **Express.js**, and **MongoDB** for managing tasks. This backend also integrates **Gemini AI** to generate intelligent task descriptions.

---

## 🚀 Features

- ✅ CRUD operations for tasks
- 📦 RESTful API design
- 🗂️ MongoDB database with Mongoose
- ⚡ Fast and lightweight Express server
- 🔐 Environment-based configuration
- 🤖 AI-powered task description generation (Gemini)
- 🧱 Clean and scalable folder structure

---

## 🏗️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Gemini API (Generative AI)

---

## 📁 Project Structure
backend/
│
├── controllers/ # Business logic (task operations)
├── models/ # Mongoose schemas
├── routes/ # API route definitions
├── config/ # Database connection & configs
├── middleware/ # Custom middleware (error handling, auth, etc.)
├── utils/ # Utility/helper functions
├── server.js # Application entry point
├── .env # Environment variables
└── package.json # Dependencies & scripts



---

## ⚙️ Getting Started

### 📌 Prerequisites

Make sure you have:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

---

### 🔧 Installation

#### 1. Clone the repository


git clone https://github.com/your-username/task-manager-backend.git
cd task-manager-backend

2. Install dependencies
npm install
3. Setup Environment Variables

Create a .env file in the root directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
4. Run the Application

Development mode:

npm run dev

Production mode:

npm start

Server will start on:

http://localhost:5000
