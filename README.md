# SAILSIH - Rake Formation Automation System

Decision support system for optimizing steel dispatch via Indian Railways. Automates rake formation from stockyard inventory and customer orders using a greedy optimization algorithm.

## Architecture

```
backend/   → Django REST API (Python)
frontend/  → React + Vite dashboard (JavaScript)
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for local dev)

### Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit with your DB credentials
python manage.py migrate
python manage.py runserver   # http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stockyards/` | List stockyards |
| POST | `/api/stockyards/` | Create stockyard |
| GET | `/api/orders/` | List orders |
| POST | `/api/orders/` | Create order |
| POST | `/api/automate/` | Run optimization engine |
| GET | `/api/automate/preview/` | Preview results |
| GET | `/api/health/` | Health check |

## Tech Stack

- **Backend:** Django 5, Django REST Framework, PostgreSQL (Neon), Gunicorn
- **Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Deployment:** Render (backend), Vercel-compatible (frontend)

## License

MIT - see [LICENSE](LICENSE).
