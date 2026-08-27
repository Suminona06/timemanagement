# ChronoCraft ⏱️

> **Personal Time Management Suite** — Track, analyze, and optimize your time with a powerful MERN-stack application.

---

## ✨ Features

- **Stopwatch & Pomodoro Timer** — Drift-proof epoch-based timer engine with background tab resilience
- **Time-Blocking Calendar** — Visual daily/weekly grid comparing planned tasks vs. actual logged time
- **Analytics Dashboard** — Recharts-powered insights: category donut charts, focus trend bars, estimation accuracy, and streak tracker
- **Task Hub** — List and Kanban board views with filtering, sorting, and drag-and-drop
- **Categories & Color Coding** — Color-coded task categories for visual organization
- **Dark / Light Theme** — User-configurable theme with persistent preferences

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Zustand, Recharts  |
| Backend    | Node.js, Express.js                              |
| Database   | MongoDB, Mongoose                                |
| Auth       | JWT (JSON Web Tokens), bcryptjs                  |
| DnD        | @hello-pangea/dnd                                |
| Icons      | Lucide React                                     |

---

## 📁 Project Structure

```
chronocraft/
├── client/             # React + Vite frontend
│   └── src/
│       ├── features/   # Feature-based module folders
│       ├── stores/     # Zustand state stores
│       ├── hooks/      # Custom React hooks
│       ├── services/   # Axios API service layer
│       ├── components/ # Shared UI components
│       └── utils/      # Utility functions
├── server/             # Express + Mongoose backend
│   └── src/
│       ├── models/     # Mongoose schemas
│       ├── controllers/# Route handlers
│       ├── routes/     # Express route definitions
│       ├── middleware/ # Auth & error middleware
│       ├── config/     # DB and environment config
│       └── scripts/    # CLI utility scripts (seed, etc.)
├── package.json        # Root monorepo scripts
├── .env.example        # Environment variable template
└── tasks.md            # Agentic implementation task breakdown
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- npm >= 9.x

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd chronocraft

# Install all dependencies (root + server + client)
npm run install:all

# Copy environment variables
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret
```

### Development

```bash
# Start both server and client concurrently
npm run dev

# Start individually
npm run dev:server   # Express API on http://localhost:5000
npm run dev:client   # Vite React on http://localhost:5173
```

### Seed Database

```bash
# Populate DB with demo user, categories, tasks, and 50+ time logs
npm run seed
```

### Build for Production

```bash
npm run build        # Builds client to client/dist/
```

---

## 🌐 API Endpoints

| Method | Endpoint                       | Description                      |
|--------|--------------------------------|----------------------------------|
| POST   | `/api/auth/register`           | Register new user                |
| POST   | `/api/auth/login`              | Login and receive JWT            |
| GET    | `/api/auth/me`                 | Get current user profile         |
| PUT    | `/api/auth/preferences`        | Update user preferences          |
| GET    | `/api/categories`              | List all categories              |
| POST   | `/api/categories`              | Create a category                |
| GET    | `/api/tasks`                   | List tasks (with filters)        |
| POST   | `/api/tasks`                   | Create a task                    |
| PUT    | `/api/tasks/:id`               | Update a task                    |
| DELETE | `/api/tasks/:id`               | Delete a task                    |
| GET    | `/api/timelogs`                | Get time logs (by date range)    |
| POST   | `/api/timelogs`                | Create a time log                |
| GET    | `/api/analytics/summary`       | Get analytics summary            |
| GET    | `/api/health`                  | Server health check              |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
