# 🎓 College Notes Sharing Platform — Backend API

A clean, modular, production-ready RESTful backend API for a College Notes Sharing Platform built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **Cloudinary Storage**, and **JWT Authentication**.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database & Cloudinary Setup](#database--cloudinary-setup)
- [Installation & Running Locally](#installation--running-locally)
- [API Documentation & Endpoints](#api-documentation--endpoints)
  - [Standard Response Schema](#standard-response-schema)
  - [Authentication Routes](#authentication-routes)
  - [Notes Routes](#notes-routes)
  - [Subjects Routes](#subjects-routes)
  - [Users Routes](#users-routes)
- [Deep Dive: Architecture & Workflows](#deep-dive-architecture--workflows)
  - [1. User Registration & Password Hashing](#1-user-registration--password-hashing)
  - [2. User Login Flow](#2-user-login-flow)
  - [3. JWT Authentication & Protected Routes](#3-jwt-authentication--protected-routes)
  - [4. PDF Upload Workflow via Cloudinary](#4-pdf-upload-workflow-via-cloudinary)
  - [5. Secure PDF Download via Cloudinary Attachment URLs](#5-secure-pdf-download-via-cloudinary-attachment-urls)
  - [6. Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
- [License](#license)

---

## 📖 Overview

The **College Notes Sharing Platform Backend** allows college students and faculty to upload, discover, search, and download academic notes organized by semester and subject. The system is designed for high performance, reliability, and security by storing structured data in **MongoDB** and binary PDF documents in **Cloudinary**.

---

## ✨ Key Features

- 🔐 **Secure Authentication**: User registration and login using industry-standard `bcrypt` password hashing and JSON Web Tokens (JWT) based on 9-digit PRN.
- 🛡️ **Role-Based Authorization (RBAC)**: Fine-grained permissions differentiating between standard `student` users and `admin` moderators.
- 📁 **Cloudinary PDF Storage**: Direct streaming of PDF uploads into Cloudinary with organized folder hierarchies (`college_notes/semester-N/`).
- 🔗 **Direct & Friendly Downloads**: Generates attachment-ready URLs from Cloudinary forcing browser downloads with the proper file name.
- 📊 **Download Tracking**: Safely increments download metrics whenever a document download link is requested.
- 🔍 **Search & Filter Pagination**: Paginated listing of notes with full query support for keyword search, semester filtering, branch filtering, and subject filtering.
- 📚 **Academic Subjects Management**: Complete administrative CRUD for managing departments, subjects, and semesters, with automatic fallback and seeding.
- 🛑 **Centralized Error Handling**: Unified error middleware with clear JSON feedback across all failure modes (validation, duplicates, token expiry).

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | [Node.js](https://nodejs.org/) (v18+) | Non-blocking, event-driven JavaScript engine |
| **Framework** | [Express.js](https://expressjs.com/) (v5+) | Minimalist, flexible web framework |
| **Database** | [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/) | Document database with schema modeling |
| **File Storage** | [Cloudinary](https://cloudinary.com/) | Cloud storage and delivery for PDF documents |
| **Security** | [bcrypt](https://www.npmjs.com/package/bcrypt) | Blowfish-based adaptive one-way password hashing |
| **Auth Tokens** | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | Cryptographic signature verification for stateless auth |
| **File Uploads** | [Multer](https://www.npmjs.com/package/multer) | In-memory multipart/form-data handler |
| **CORS** | [cors](https://www.npmjs.com/package/cors) | Configurable Cross-Origin Resource Sharing |
| **Environment**| [dotenv](https://www.npmjs.com/package/dotenv) | Zero-dependency environment variable loader |

---

## 📁 Project Architecture & Directory Structure

```text
college-notes-backend/
│
├── src/
│   ├── config/
│   │   ├── db.js                   # Mongoose connection initialization
│   │   └── cloudinary.js           # Cloudinary SDK config & upload/download helpers
│   │
│   ├── models/
│   │   ├── User.js                 # User schema (PRN, name, password, role)
│   │   ├── Subject.js              # Subject schema (name, semester, department)
│   │   ├── Note.js                 # Note schema (title, file_url, public_id, uploader, etc.)
│   │   └── index.js                # Aggregated models export
│   │
│   ├── controllers/
│   │   ├── authController.js       # Register, login, get current user
│   │   ├── notesController.js      # Notes CRUD, Cloudinary PDF upload, download URL
│   │   ├── subjectsController.js   # Subject listing & administrative CRUD & auto-seed
│   │   └── usersController.js      # Admin user directory listing
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js       # Bearer token verification & admin role check
│   │   ├── errorMiddleware.js      # Centralized error and 404 handler
│   │   └── uploadMiddleware.js     # Multer config: memory storage & strict PDF filter
│   │
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoint router (/api/auth)
│   │   ├── notesRoutes.js          # Notes endpoint router (/api/notes)
│   │   ├── subjectsRoutes.js       # Subjects endpoint router (/api/subjects)
│   │   └── usersRoutes.js          # Users endpoint router (/api/users)
│   │
│   ├── utils/
│   │   └── generateToken.js        # Signed JWT utility helper
│   │
│   ├── constants/
│   │   ├── branches.js             # 9 Engineering branch configurations
│   │   └── defaultSubjects.js      # Default curriculum subjects for semesters 1-8
│   │
│   ├── app.js                      # Express application setup, middlewares & routes
│   └── server.js                   # Server bootstrap & graceful shutdown listeners
│
├── .env                            # Local environment configuration
├── .env.example                    # Sample environment template
├── package.json                    # Project metadata, dependencies & npm scripts
└── README.md                       # Complete project documentation
```

---

## ⚙️ Prerequisites

- **Node.js** v18.0.0 or higher
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)
- A **Cloudinary** account (Cloud Name, API Key, API Secret)

---

## 🔑 Environment Variables

Configure your `.env` file in the project root:

```env
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/edunotes?retryWrites=true&w=majority

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS Allowed URLs
CLIENT_URL=https://edunotesrcpit.vercel.app
BACKEND_URL=http://localhost:5000
```

---

## 🚀 Installation & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Start in Production Mode
```bash
npm start
```
