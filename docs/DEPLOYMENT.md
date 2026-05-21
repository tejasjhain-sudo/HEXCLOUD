# Deployment — Vercel + VPS

## 1. PostgreSQL

```bash
cd docker
docker compose up -d postgres
```

Or use managed Postgres (Neon, RDS, etc.) and set `DATABASE_URL`.

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

## 2. Backend (VPS)

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, TURNSTILE_SECRET_KEY, FRONTEND_URL

npm ci
npm run build
npm start
```

### Docker on VPS

```bash
cd docker
export JWT_SECRET=$(openssl rand -hex 32)
docker compose up -d --build
```

Open port **5000** (or put Caddy/Nginx reverse proxy with TLS).

### Environment (production)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=long-random-string
FRONTEND_URL=https://your-app.vercel.app
TURNSTILE_SECRET_KEY=...
VPS_PROVIDER=demo
DISCORD_WEBHOOK_URL=...
```

## 3. Frontend (Vercel)

1. Import repo → set **Root Directory** to `apps/web`
2. Framework: Next.js
3. Env:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
```

4. Deploy

## 4. Cloudflare Turnstile

- Create widget at https://dash.cloudflare.com/
- Site key → Vercel `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Secret → VPS `TURNSTILE_SECRET_KEY`

## 5. CORS

Set `FRONTEND_URL` on the API to your exact Vercel URL (no trailing slash).

## 6. Health check

```bash
curl https://api.yourdomain.com/health
```

## 7. Legacy Vite app

The `frontend/` folder is the older SPA. New work should use `apps/web`. You can keep both during migration.

## Security checklist

- [ ] Strong `JWT_SECRET`
- [ ] TLS on API (Caddy/Let's Encrypt)
- [ ] Turnstile enabled in production
- [ ] Postgres not publicly exposed
- [ ] Firewall: only 80/443/22 on VPS
- [ ] Rotate secrets if committed accidentally
