# Backend - Django REST API

Handles stockyard/order CRUD and the greedy rake formation optimization engine.

## Setup

```bash
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## Key Files

| File | Purpose |
|------|---------|
| `api/models.py` | `Stockyard` and `Order` database models |
| `api/views.py` | Serializers, CRUD views, `run_engine()` algorithm |
| `api/urls.py` | API route definitions |
| `sailsih/settings.py` | Django config (DB, CORS, DRF, security) |

## Algorithm

`run_engine()` in `api/views.py` implements a greedy rake formation algorithm:

1. Groups rail orders by destination
2. Sorts by priority and deadline
3. Greedily fills wagons from matching stockyard inventory
4. Returns rake plans with utilization metrics

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Database

PostgreSQL via Neon (serverless). Falls back to SQLite locally if `DATABASE_URL` is unset.

Tables: `stockyards`, `orders` (configured via `db_table` in models).
