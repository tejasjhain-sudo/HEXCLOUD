# HEXCloud

SaaS control plane for VPS instances, GPU Cloud PC sessions, billing, and an enterprise admin console.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind, Zustand, React Router |
| API | Node.js, Express, Socket.io |
| Data & Auth | Supabase (Postgres + Auth) |
| Payments | Stripe, Razorpay (optional) |

## Quick start (local)

```bash
npm install
cp backend/.env.example backend/.env    # add Supabase + keys
cp frontend/.env.example frontend/.env
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000  
- Admin: http://localhost:5173/admin (requires `ADMIN` role in Supabase)

## Production hosting

| Service | Platform |
|---------|----------|
| Frontend | **Vercel** (`frontend/`) |
| API | **Render** (`backend/`, see `render.yaml`) |
| Database | **Supabase** |

Full step-by-step: **[deployment_guide.md](./deployment_guide.md)**

## Project layout

```
backend/          Express API + Socket.io
frontend/         React SPA (Vite)
supabase_*.sql    Database migrations / setup
render.yaml       Render blueprint for API
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + frontend concurrently |
| `npm run build` | Production build both packages |
| `npm run dev:api` | Backend only |
| `npm run dev:web` | Frontend only |
