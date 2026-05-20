# FairShare Client

Frontend application for FairShare, built with React + Vite and authenticated with Firebase.

## Responsibilities

- Handles user sign-up/sign-in via Firebase Auth
- Renders the main household UI (chores, expenses, roommates, chat, calendar)
- Calls backend APIs with Firebase ID token bearer auth
- Connects to Socket.IO for room chat updates

## Prerequisites

- Node.js 20+
- npm 10+
- A configured Firebase project (web app)
- Running FairShare server API (local or deployed)

## Setup

```bash
cd client
npm ci
```

Create `client/.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_API_BASE=http://localhost:5000/api
VITE_AUTH_IN_MEMORY=false
```

### Environment variables

- `VITE_API_BASE` — API base URL used by `src/api.js`
- `VITE_AUTH_IN_MEMORY`:
  - `false` (default recommended): browser session persistence (per-tab session storage)
  - `true`: in-memory auth persistence

## Run

```bash
npm run dev
```

Dev server defaults to `http://localhost:5173`.

## Build & quality checks

```bash
npm run lint
npm run build
```

## Key files

- `src/App.jsx` — app shell + auth gating
- `src/AuthContext.jsx` — auth state provider
- `src/firebase.js` — Firebase app/auth initialization + persistence mode
- `src/api.js` — authenticated API client wrappers
- `src/RoomApp.jsx` — main application tabs and profile/calendar modal controls
