# Lifelog

Personal time-tracking web app. Track what you work on, see your daily timeline, and analyze where your time goes.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Hono + sql.js + TypeScript
- **Auth**: JWT + bcrypt
- **Deployment**: Docker Compose

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

The API is available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` requests to the backend.

## Docker Deployment (VPS)

```bash
# Set a strong JWT secret
export JWT_SECRET=your-strong-secret-here

# Build and start
docker compose up -d --build

# The app is now available at http://your-vps-ip:80
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `change-me-in-production` | Secret key for JWT tokens |
| `TIMEZONE` | `Europe/Paris` | Timezone for date filtering |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT token expiry in minutes |
| `DATABASE_PATH` | `./lifelog.db` | Path to SQLite database file |
| `PORT` | `8000` | Backend server port |

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account (returns JWT)
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Current user info

### Entries (all require JWT)
- `POST /api/entries/start` — Start a task (auto-closes previous active task)
- `POST /api/entries/stop` — Stop the active task
- `GET /api/entries/active` — Get the currently running task
- `GET /api/entries?date=YYYY-MM-DD` — Get entries for a specific day
- `GET /api/entries?from=...&to=...` — Get entries for a date range
- `PATCH /api/entries/{id}` — Edit an entry (label, started_at, ended_at)
- `DELETE /api/entries/{id}` — Delete an entry

### Stats
- `GET /api/stats?from=...&to=...` — Aggregated stats (totals by label, distribution, daily series)

## Testing

```bash
cd backend
npx tsx ../test_api.ts