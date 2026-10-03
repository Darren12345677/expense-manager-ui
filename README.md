# Expense Manager UI

Next.js frontend for Expense Manager.

## Requirements

- Node.js 20.9 or newer
- The Expense Manager API running locally

## Local setup

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Sign-in requests are forwarded server-side to the API's `POST /token` endpoint. The default API URL is `http://127.0.0.1:8000`; set `EXPENSE_API_URL` if the API is running elsewhere.
