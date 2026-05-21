/** Comma-separated origins from FRONTEND_URL + ALLOWED_ORIGINS (Vercel previews). */
export function getAllowedOrigins(): string[] {
  const raw = [
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGINS,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]
    .filter(Boolean)
    .join(',');

  return [...new Set(raw.split(',').map((o) => o.trim()).filter(Boolean))];
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return true;
  // Vercel preview deployments: https://hexcloud-frontend-*.vercel.app
  if (/^https:\/\/[\w-]+-[\w-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}
