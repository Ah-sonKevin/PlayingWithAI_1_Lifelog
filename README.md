# Lifelog

Personal time-tracking web app. Track what you work on, see your daily timeline, and analyze where your time goes.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Auth**: JWT + bcrypt
- **Deployment**: Docker Compose

## Local Development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

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

## API Endpoints

### Auth
- `POST /auth/register` — Create account (returns JWT)
- `POST /auth/login` — Login (returns JWT)
- `GET /auth/me` — Current user info

### Entries (all require JWT)
- `POST /entries/start` — Start a task (auto-closes previous active task)
- `POST /entries/stop` — Stop the active task
- `GET /entries/active` — Get the currently running task
- `GET /entries?date=YYYY-MM-DD` — Get entries for a specific day
- `GET /entries?from=...&to=...` — Get entries for a date range
- `PATCH /entries/{id}` — Edit an entry (label, started_at, ended_at)
- `DELETE /entries/{id}` — Delete an entry

### Stats
- `GET /stats?from=...&to=...` — Aggregated stats (totals by label, distribution, daily series)