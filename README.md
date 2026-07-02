# Developer Collaboration Board

A full-stack MERN collaboration platform for managing software team tasks. The app supports authentication, admin/member roles, real user task assignment, Kanban tracking, status updates, comments, and MongoDB persistence.

## Live Links

- Live App: https://developer-collaboration-board.vercel.app
- Backend API: https://developer-collaboration-board.onrender.com
- GitHub Repository: https://github.com/ignite72/Developer-Collaboration-Board

## Features

- User signup and login with JWT authentication
- Admin and member roles
- Admin-only task creation, editing, deletion, and assignment
- Real task assignment to registered users
- Members see only tasks assigned to them
- Kanban workflow with Todo, In Progress, Review, and Done statuses
- Focused status tabs for viewing specific task stages
- Task status updates
- Task comments with author and timestamp
- Protected backend routes with role and assignment checks
- MongoDB persistence for users, tasks, and comments

## Tech Stack

- Frontend: React, Vite, React Router, CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas, Mongoose
- Authentication: JWT, bcryptjs
- Deployment: Vercel frontend, Render backend

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

### Backend

```bash
cd developer-collaboration-board/backend
npm install
npm run dev
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_strong_secret
ADMIN_EMAILS=admin@example.com
CLIENT_URL=http://localhost:5173
```

### Frontend

```bash
cd developer-collaboration-board/frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
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

## Resume Summary

Built and deployed a full-stack collaboration board using React, Node.js, Express.js, MongoDB, and JWT. Implemented role-based access control, real user task assignment, protected APIs, Kanban status tracking, task comments, and deployment-ready environment configuration with Vercel and Render.
