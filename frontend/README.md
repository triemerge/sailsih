# Frontend - React Dashboard

Interactive dashboard for managing stockyards, orders, and running the rake formation optimizer.

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # Production build → dist/
```

## Stack

- React 18 + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- TanStack Query for API state management
- Sonner for toast notifications

## Structure

```
src/
├── components/
│   ├── dashboard/    - AutomationDashboard, MatrixTable, PlanTable
│   ├── dialogs/      - OrderDialog, StockyardDialog
│   └── ui/           - shadcn/ui components (button, card, table, etc.)
├── hooks/            - useAutomationData (API query/mutation hooks)
├── lib/              - Utilities (indian-formatter, cn helper)
└── pages/            - Index page
```

## API Connection

The frontend expects the backend at `http://localhost:8000/api/`. Configure the base URL in `src/hooks/useAutomationData.js`.
