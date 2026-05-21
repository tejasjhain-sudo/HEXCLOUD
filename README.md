# HEXCloud

SaaS control plane for VPS instances, GPU Cloud PC sessions, billing, and an enterprise admin console.

## Stack

| Layer | Tech |
|-------|------|
| Frontend (new) | **Next.js 14** — `apps/web` (Vercel, dark dashboard) |
| Frontend (legacy) | React 18, Vite — `frontend/` |
| API | Node.js, Express, Socket.io |
| Database | **PostgreSQL** (Prisma) + legacy Supabase |
| Auth (v2) | Email OTP + JWT sessions |
| Anti-abuse | Turnstile, fingerprint, IP/VPN checks |
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
| Frontend | **Vercel** (`apps/web/`) |
| API | **Your VPS** (Docker or Node) |
| Database | **PostgreSQL** |

- Architecture: **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**
- Deploy guide: **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**
- Legacy Render guide: **[deployment_guide.md](./deployment_guide.md)**

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
