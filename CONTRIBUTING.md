# Contributing

## Setup

1. Fork and clone the repo
2. Follow the [Quick Start](README.md#quick-start) instructions
3. Create a feature branch from `main`

## Development

```bash
# Backend
cd backend
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm run dev
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix a bug
docs(scope): update documentation
chore(scope): maintenance task
```

**Scopes:** `core`, `api`, `db`, `frontend`, `ui`, `config`, `deploy`

## Pull Requests

1. One feature/fix per PR
2. Keep changes minimal and focused
3. Ensure the app runs without errors
4. Update docs if behavior changes

## Project Structure

```
backend/
  api/views.py      - Serializers, CRUD views, automation engine
  api/models.py     - Stockyard and Order models
  api/urls.py       - API routes
  sailsih/          - Django project config

frontend/
  src/components/   - React components (dashboard, dialogs, ui)
  src/hooks/        - API query hooks
  src/pages/        - Page components
```

## Reporting Issues

Open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node version)
