# RuralLearn - Gamified Learning Platform for Rural Students

RuralLearn is a full-stack MERN application that enables a gamified, adaptive, and offline-capable e-learning experience.

## Features
- **Gamified Engine**: Points, Streaks, Leaderboards.
- **Adaptive Engine**: Automatically scales quiz difficulty based on student Competency Index (CI).
- **Offline Support**: Uses Service Workers to cache assets and offline sync logic for uninterrupted learning.
- **Roles**: Student, Teacher, Parent, Admin views.
- **UI**: Modern Tailwind CSS interface featuring glassmorphism elements, vibrant gradients, and fully responsive layouts.

## Tech Stack
**Frontend**: React (Vite), React Router, TailwindCSS, Axios, Chart.js  
**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT  

## Installation & Setup

1. **Clone the repository** (if applicable).
2. **Start MongoDB locally** (`mongodb://localhost:27017/rurallearn` or update `.env`).

### Backend
\`\`\`bash
cd backend
npm install
node server.js
\`\`\`
*(Make sure to specify `.env` variables like `JWT_SECRET` prior to running!)*

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Architecture
- `backend/services/gamificationService.js`: Defines points rules, awards points, manages streaks, generates leaderboard.
- `backend/services/adaptiveEngine.js`: Weights Time + Accuracy + Consistency to assign Dynamic difficulty.
- `frontend/src/services/offlineSyncService.js`: Captures failed HTTP POST requests in localStorage and syncs when reconnected to Network.
- `frontend/public/sw.js`: Caches required UI files for immediate load.
