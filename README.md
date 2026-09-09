# Task Manager MVC (starter)

This repository contains a starter full‑stack Task Manager project (Full SaaS scope) using JavaScript.

What's included in this initial commit:
- backend/: Express + PostgreSQL backend with JWT auth and tasks CRUD endpoints
- docker-compose.yml to run Postgres + backend quickly
- frontend/: Next.js placeholder

Quick start (Docker Compose)
1. Install Docker and Docker Compose
2. From repo root run:
   docker-compose up --build
3. Backend will be available at http://localhost:4000

API endpoints (examples):
- POST /api/auth/register { username, password }
- POST /api/auth/login { username, password }
- GET /api/tasks (Authorization: Bearer <token>)
- POST /api/tasks { title, description }
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

Next steps (I'll implement these next if you want):
- Frontend (Next.js) with signup/login and tasks UI
- Tests and GitHub Actions CI
- Docker setup for frontend + deployment guides

.env example: backend/.env.example

