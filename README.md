# Task Manager

A full-stack task management application built with React, Node.js/Express, and Supabase (PostgreSQL). Features JWT authentication, full CRUD task management, search and filtering, dark mode, and Docker deployment.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

Task Manager is a portfolio project demonstrating full-stack web development skills. Users can create an account, log in securely, and manage their personal tasks — including setting due dates, filtering by status, and searching by title. The app is containerized with Docker for easy deployment.

---

## Features

- **User Accounts** — Register and log in with secure JWT-based authentication
- **Task CRUD** — Create, view, edit, and delete tasks
- **Due Dates** — Assign deadlines to tasks and track them visually
- **Search & Filter** — Search tasks by title; filter by status (pending, in progress, completed)
- **Dark Mode** — Toggle between light and dark themes, persisted in localStorage
- **Docker Deployment** — Fully containerized with Docker Compose for backend and frontend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Recharts |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| Deployment | Docker, Docker Compose |

---

## Project Structure

```
task-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js       # Supabase client setup
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── auth.js           # Register / Login routes
│   │   │   └── tasks.js          # Task CRUD routes
│   │   └── index.js              # Express entry point
│   ├── .env                      # Environment variables (not committed)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route-level pages
│   │   ├── context/              # Auth context / dark mode context
│   │   ├── api/                  # API call helpers
│   │   └── main.jsx              # App entry point
│   ├── index.html
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) account and project
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Environment Variables

Create a `.env` file inside the `backend/` folder with the following:

```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_random_secret_string
```

> ⚠️ Never commit your `.env` file. It is already included in `.gitignore`.

### Running Locally

**Backend**

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:5000`

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Running with Docker

```bash
docker-compose up --build
```

Both services will start automatically. Frontend at `http://localhost:5173`, backend at `http://localhost:5000`.

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Tasks *(protected — requires JWT)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks for the logged-in user |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | text | Unique |
| password | text | Hashed with bcryptjs |
| created_at | timestamp | Auto-generated |

### `tasks`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Foreign key → users.id |
| title | text | Required |
| description | text | Optional |
| status | text | `pending`, `in_progress`, `completed` |
| due_date | date | Optional |
| created_at | timestamp | Auto-generated |

---

## Roadmap

- [x] Project setup & Express server
- [x] Database schema (Supabase)
- [x] JWT Authentication
- [ ] Task CRUD API
- [ ] React frontend
- [ ] Task UI with dark mode
- [ ] Search & filter
- [ ] Docker deployment

---

## Author

**Cristian Acevedo**
Holberton School — Full-Stack Software Engineering
[GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-profile)
