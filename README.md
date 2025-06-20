
## 🚀 Demo Video 👉 [Watch Here](https://drive.google.com/file/d/1QjsxaVuYR7GWbGd6Ip2FRyo1G9dnwOSe/view?usp=sharing)
#   Student Progress & Analytics System

[![GitHub Workflow Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)](https://github.com/Kunal1522/Smart-Cp--TLE/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Technology Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](https://www.mongodb.com/mern-stack)
[![Codeforces API](https://img.shields.io/badge/External%20API-Codeforces-orange?style=for-the-badge)](https://codeforces.com/api/)

---
## Table of Contents

1.  [Overview](#1-overview)
2.  [Core Features](#2-core-features)
3.  [Architecture](#3-architecture)
4.  [Technology Stack](#4-technology-stack)
5.  [Setup and Local Development](#5-setup-and-local-development)
    * [Prerequisites](#prerequisites)
    * [Backend Setup](#backend-setup)
    * [Frontend Setup](#frontend-setup)
    * [Running the Application](#running-the-application)
    * [Troubleshooting](#troubleshooting)
6.  [API Documentation (Backend Endpoints)](#6-api-documentation-backend-endpoints)
    * [Authentication & Authorization](#authentication--authorization)
    * [Error Handling Standards](#error-handling-standards)
    * [Endpoints Reference](#endpoints-reference)
7.  [Data Synchronization & Cron Job (`node-cron`)](#7-data-synchronization--cron-job-node-cron)
    * [Process Flow](#process-flow)
    * [Idempotency & Resilience](#idempotency--resilience)
8.  [Database Schema](#8-database-schema)
9.  [Frontend User Interface & Experience](#9-frontend-user-interface--experience)
10. [Future Enhancements](#10-future-enhancements)
11. [Contributing Guidelines](#11-contributing-guidelines)
12. [License](#12-license)
13. [Acknowledgements](#13-acknowledgements)

---

## 1. Overview

This project is a full-stack MERN web application developed as part of an internship assignment. It focuses on automating the tracking, analysis, and visualization of Codeforces activity for competitive programmers.

It is designed to:

Automate fetching Codeforces data such as user profiles, ratings, contests, and submissions.

Provide visual analytics on competitive programming progress, including rating changes and problem-solving trends.

Identify inactive Codeforces users and send automated reminder emails to help encourage consistent participation.

Export competitive programming data to CSV files for further analysis.

Ensure secure access with authentication & authorization systems.

Use a cron job for daily data synchronization and background task automation.

This project demonstrates API integration, background task handling, and data-driven visualization for a real-world use case in competitive programming ecosystems.

---

## 2. Core Features

* **Automated Data Synchronization:** Daily cron job fetches and updates student rating history, contest participation, and problem submissions from Codeforces.
* **Student Profile Management:** Comprehensive profiles including name, email, contact, and Codeforces handle.
* **Performance Analytics:** Visualizations of rating changes over time, average problems solved per day, and detailed submission history.
* **Inactivity Monitoring:** Identifies students who have been inactive for a configurable period.
* **Automated Inactivity Reminders:** Sends personalized email notifications to inactive students to encourage consistent practice.
* **CSV Data Export:** Allows administrators to download student data for offline analysis.
* **User Authentication & Authorization:** Secure login system with administrative roles.
* **Feedback System:** A channel for users to submit comments and report issues.



### Component Responsibilities

* **Frontend (React.js):** Manages the user interface, client-side routing, state, and interacts with the backend API to display and visualize data.
* **Backend Server (Node.js/Express.js):** Acts as a RESTful API gateway, handles business logic, communicates with MongoDB, orchestrates external API calls (Codeforces), manages user authentication, and runs scheduled tasks.
* **MongoDB (Database):** A NoSQL document database used for persistent storage of all application data, including student profiles, Codeforces submissions, and contest details.
* **Cron Job (`node-cron`):** A scheduled task within the backend responsible for periodic data synchronization with the Codeforces API and triggering automated email reminders.

### Inter-Component Communication

* **Frontend ↔ Backend:** Communicates via RESTful HTTP requests, with JSON as the data format. JWTs are used for secure, stateless authentication.
* **Backend ↔ MongoDB:** Interacts via Mongoose ODM, providing schema validation and robust data modeling.
* **Backend ↔ Codeforces API:** Uses Axios to make HTTP requests, with built-in rate limiting to manage API call frequency.

### Scalability and Resilience

The architecture is designed for maintainability and resilience. The backend is stateless to facilitate horizontal scaling. Robust error handling, asynchronous operations, and idempotent data updates ensure system stability and data integrity, even during failures or repeated operations.

---

## 4. Technology Stack

### Frontend Stack

* **React.js:** For building dynamic user interfaces.
* **Tailwind CSS:** Utility-first CSS framework for responsive design.
* **Recharts:** For data visualization (e.g., rating graphs).
* **Lucide React:** For SVG icons.
* **Axios:** HTTP client for API requests.

### Backend Stack

* **Node.js & Express.js:** Runtime environment and web framework for the RESTful API.
* **Mongoose:** MongoDB ODM for data modeling.
* **Axios:** For external API calls.
* **`node-cron`:** For scheduling automated tasks.
* **`nodemailer`:** For sending emails.
* **`dotenv`:** For environment variable management.
* **`jsonwebtoken` & `bcryptjs`:** For secure authentication.
* **`cors`:** Middleware for Cross-Origin Resource Sharing.

### Database

* **MongoDB:** NoSQL document database for flexible and scalable data storage.

### External Integrations

* **Codeforces API:** The primary source for competitive programming data (user info, submissions, contest details).

---

## 5. Setup and Local Development

Follow these detailed instructions to set up and run the TLE Eliminators project on your local development environment.

### Prerequisites

* **Node.js** (LTS version recommended) & **npm**
* **MongoDB** instance (local or cloud-hosted via MongoDB Atlas)
* **Git**

### Backend Setup

1.  **Clone the repository:** `git clone https://github.com/Kunal1522/Smart-Cp--TLE.git`
2.  **Navigate:** `cd Smart-Cp--TLE/backend`
3.  **Install dependencies:** `npm install`
4.  **Create `.env`:** Create a `.env` file in `backend/` with:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string_here
    JWT_SECRET=a_very_strong_random_secret_key_for_jwt_signing
    JWT_EXPIRES_IN=1d
    EMAIL_USER=your_gmail_email@gmail.com
    EMAIL_PASS=your_gmail_app_password # Use App Password for Gmail with 2FA
    CLIENT_ORIGIN=http://localhost:3000
    FRONTEND_URL=http://localhost:3000
    CODEFORCES_API_BASE_URL=[https://codeforces.com/api/](https://codeforces.com/api/)
    ```

### Frontend Setup

1.  **Navigate:** `cd Smart-Cp--TLE/frontend`
2.  **Install dependencies:** `npm install`
3.  **Create `.env`:** Create a `.env` file in `frontend/` with:
    ```env
    REACT_APP_API_BASE_URL=http://localhost:5000/api
    ```

### Running the Application

1.  **Start Backend:** In `backend/` directory, run `npm start`.
2.  **Start Frontend:** In `frontend/` directory, run `npm start`.
    The frontend will typically open in your browser at `http://localhost:3000`.

### Troubleshooting

* **`EADDRINUSE`:** A port is already in use. Change `PORT` in `.env` or terminate the conflicting process.
* **MongoDB Connection:** Verify `MONGODB_URI` and ensure your MongoDB instance is running and accessible.
* **CORS Errors:** Ensure `CLIENT_ORIGIN` in `backend/.env` exactly matches your frontend's URL.
* **Network Error / `SyntaxError` (Frontend):** Confirm backend server is running and `REACT_APP_API_BASE_URL` in `frontend/.env` is correct.

---

## 6. API Documentation (Backend Endpoints)

The TLE Eliminators backend provides a RESTful API for managing student data and system functionalities.

### Authentication & Authorization

All sensitive endpoints require a valid JWT in the `Authorization: Bearer <token>` header. Role-based authorization (`admin` access) restricts certain routes.

### Error Handling Standards

API responses use standard HTTP status codes. Errors are consistently returned as JSON objects with a `message` field.

### Endpoints Reference

#### 6.1. Authentication & User Management

* **`POST /api/auth/register`**: Register a new user.
    * Request: `{ username, email, password, role }`
    * Response: `{ token, user }` (201 Created)
* **`POST /api/auth/login`**: Authenticate a user and get a JWT.
    * Request: `{ email, password }`
    * Response: `{ token, user }` (200 OK)

#### 6.2. Student Profile Management (Admin only)

* **`GET /api/students`**: Retrieve a list of all students with summarized data.
* **`GET /api/students/:id`**: Retrieve basic details for a specific student by MongoDB ID.
* **`GET /api/students/:id/profile`**: Retrieve comprehensive profile data (student, contests, submissions).
* **`POST /api/students`**: Register a new student. Triggers async Codeforces data sync.
    * Request: `{ name, email, phoneNumber, codeforcesHandle, autoEmailEnabled }`
* **`PUT /api/students/:id`**: Update student details. Triggers async re-sync if handle changes.
* **`DELETE /api/students/:id`**: Delete a student and all associated data.
* **`GET /api/students/download-csv`**: Download all student data as a CSV file.

#### 6.3. Feedback System (Public)

* **`POST /api/feedback`**: Submit user feedback.
    * Request: `{ name, email, message }`
    * Response: `{ message: "Feedback submitted successfully." }` (201 Created)

---

## 7. Data Synchronization & Cron Job (`node-cron`)

The `node-cron` job runs daily within the backend server to keep student data current.

### Process Flow

1.  **Fetch All Students:** Retrieves student records from the database.
2.  **Iterate & Sync:** For each student, it makes sequential API calls to Codeforces (`user.info`, `user.status`, `user.rating`) to fetch the latest data.
    * Student profiles, contest history, and submissions are updated/inserted into MongoDB.
    * Rate limits are respected with delays between calls.
3.  **Post-Sync Analytics:** Calculates derived metrics like "average problems per day" using MongoDB aggregation pipelines.
4.  **Inactivity Detection:** Identifies students inactive for a set period.
5.  **Automated Reminders:** Sends email reminders to inactive students via Nodemailer.

### Idempotency & Resilience

The sync process is idempotent, utilizing MongoDB's `upsert: true` and unique indexes to prevent data duplication on repeated runs. Comprehensive `try-catch` blocks and logging ensure individual student sync failures do not halt the entire job, and API rate limits are handled gracefully.

---

## 8. Database Schema

The MongoDB database includes the following key collections, managed by Mongoose:

* **`students`**: Core student information, Codeforces handle, ratings, and meta-data.
* **`codeforcescontests`**: Records of student participation in Codeforces contests.
* **`codeforcessubmissions`**: Detailed records of individual Codeforces problem submissions.
* **`feedbacks`**: Stores user-submitted feedback messages.

All collections use appropriate indexing for query performance and data integrity.

---

## 9. Frontend User Interface & Experience

The React frontend delivers an intuitive and responsive user experience:

* **Welcome Page:** Engaging introduction with animations and navigation.
* **Authentication Pages:** Secure login and signup forms.
* **Dashboard:** Central admin hub listing students, summary stats, and actions like adding students or downloading CSVs.
* **Student Profile Page:** Detailed view for individual students with rating graphs, contest history, and submission lists.
* **Add/Edit Student Forms:** Intuitive interfaces for managing student information.

Styling is handled by **Tailwind CSS** for a consistent and responsive design across all devices. The UI incorporates modern aesthetics and subtle animations to enhance user engagement.

---

## 10. Future Enhancements

* More granular user roles and permissions.
* In-app notifications for system events.
* Dedicated student-facing dashboard.
* Advanced problem tag and difficulty analysis.
* Integration with other competitive programming platforms.
* Dockerization for streamlined deployment.
* Automated testing and CI/CD pipeline.

---

## 11. Contributing Guidelines

Contributions are welcome!
1.  Fork the repository.
2.  Create a new feature or bugfix branch.
3.  Implement your changes following existing code style.
4.  Write clear, conventional commit messages.
5.  Open a Pull Request with a descriptive summary.

---

## 12. License

This project is open-source and licensed under the [MIT License](LICENSE).

---

## 13. Acknowledgements

* **Codeforces:** For providing the platform and API.
* **MERN Stack Technologies:** MongoDB, Express.js, React, Node.js.
* All other open-source libraries and frameworks that make this project possible.

---













