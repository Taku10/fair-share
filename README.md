# FairShare

FairShare is a full-stack roommate coordination app for managing chores, shared expenses, events, rooms, and chat in one place.

## Repository layout

- `client/` — React + Vite frontend with Firebase Authentication
- `server/` — Express + MongoDB API with Firebase Admin auth verification and Socket.IO chat
- `docs/` — Additional project documentation

## Core features

- Email/password auth with Firebase
- Room creation and joining via room code
- Chore tracking and assignment
- Expense tracking with balance summary
- Roommate profiles
- Event/calendar support (including unpaid bill events)
- Real-time room chat via Socket.IO

## Tech stack

- Frontend: React 19, Vite, Axios, Firebase Web SDK
- Backend: Node.js, Express 5, Mongoose, Firebase Admin SDK, Socket.IO
- CI/CD: GitHub Actions (client lint/build, server install sanity, Firebase deploy on main/master)

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB instance
- Firebase project:
  - Web app config for frontend auth
  - Service account/admin credentials for backend token verification

## Quick start

### 1) Clone and install

```bash
# from repository root
cd client && npm ci
cd ../server && npm ci
```

### 2) Configure environment

Create:
- `client/.env`
- `server/.env`

See:
- `docs/DEVELOPMENT.md` for full setup details
- `docs/API.md` for API reference

### 3) Run locally

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`

## Scripts

### Client (`client/package.json`)

- `npm run dev` — start Vite dev server
- `npm run lint` — run ESLint
- `npm run build` — production build
- `npm run preview` — preview production build locally

### Server (`server/package.json`)

- `npm run start` — start Express server
- `npm run dev` — start server with nodemon
- `npm run seed` — run seed script

## Validation

Current CI validates:
- Client lint (`npm run lint`)
- Client build (`npm run build`)
- Server dependency install sanity (`npm ci`)

For local parity, run the same commands in each package directory.

## Deployment

Deployment is handled by `.github/workflows/ci.yml`:
- Runs on all pushes/PRs for validation jobs
- Deploys to Firebase Hosting only on `main` or `master`

