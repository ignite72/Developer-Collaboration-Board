# Developer Collaboration Board

A full-stack collaboration board for managing software team tasks with authentication, role-based access, real user assignment, comments, and a Kanban workflow.

## Features

- Public landing page with login and signup entry points
- JWT authentication with MongoDB-backed users
- Admin and member roles
- Admin-only task creation, editing, deletion, and assignment
- Real user assignment using registered accounts
- Members see only tasks assigned to them
- Task status workflow: Todo, In Progress, Review, Done
- Kanban board with focused status tabs
- Task comments with author and timestamp
- Protected backend routes with role and assignment checks
- MongoDB persistence for users, tasks, and comments

## Tech Stack

- Frontend: React, Vite, React Router, CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas, Mongoose
- Authentication: JWT, bcryptjs
- Deployment-ready config: Vite environment variables and Express CORS

## Project Structure

```text
developer-collaboration-board/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      server.js
  frontend/
    src/
      pages/
      services/
      App.jsx
      main.jsx
      styles.css
```

## Local Setup

Clone the repository and install dependencies separately for backend and frontend.

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_strong_secret
ADMIN_EMAILS=admin@example.com
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

## API Overview

Authentication:

- `POST /api/auth/signup`
- `POST /api/auth/login`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `POST /api/tasks/:id/comments`

Users:

- `GET /api/users`

## Deployment Notes

Frontend deployment, for example Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-backend-url`

Backend deployment, for example Render or Railway:

- Root directory: `backend`
- Start command: `npm start`
- Environment variables:
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `ADMIN_EMAILS`
  - `CLIENT_URL=https://your-frontend-url`

## Resume Bullets

- Built a full-stack developer collaboration board using React, Node.js, Express.js, MongoDB, and JWT authentication.
- Implemented role-based access control with admin/member permissions, protected routes, and assignment-based task visibility.
- Developed MongoDB-backed task management with Kanban workflow, comments, status updates, and admin edit/delete operations.
- Configured deployment-ready environment variables, CORS handling, and GitHub-safe project documentation.
