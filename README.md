# Itsinda Ryacu (Ibimina)

Web app for managing community savings groups: members, meetings, savings, loans, cycles and share-outs.

- **Database:** SQLite, created by `scripts/create_database.py`
- **Backend:** Node.js, Express, better-sqlite3 (`backend/`)
- **Frontend:** React, TypeScript, Vite (`frontend/`)

**Requirements:** Node.js 20+, Python 3.8+

## 1. Database

The `.db` file is not in Git, so create it once from the repo root:

```bash
python scripts/create_database.py
```

This creates `database/Ibimina_database.db`, which is where the backend looks for it. Use `py` instead of `python` on Windows if needed.

## 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
JWT_SECRET=any-long-random-string
```

Run:

```bash
npx nodemon server.js
```

Check it at <http://localhost:3000/api/test-db>.

## 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>). `VITE_API_URL` in `frontend/.env` must point to the backend (default `http://localhost:3000`).

## Troubleshooting

- **`unable to open database file`:** run step 1 from the repo root.
- **Token/login errors:** check `JWT_SECRET` is set in `backend/.env`.
- **CORS or network errors:** make sure the backend is running and restart `npm run dev` after editing `.env`.
