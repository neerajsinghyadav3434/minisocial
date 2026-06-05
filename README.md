# MiniSocial

A simple full-stack social media application where users can share posts (with optional images), like posts, and write/edit comments.

---

## Tech Stack

* **Frontend:** React, Vite, Material-UI (MUI)
* **Backend:** Node.js, Express, Mongoose (MongoDB)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs

---

## Getting Started

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add your configuration (for example, using MongoDB Atlas):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.
