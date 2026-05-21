const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function api<T>(path: string, opts: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...init } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...init, headers, cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || res.statusText);
  return body as T;
}

export async function getFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const data = [navigator.userAgent, navigator.language, screen.width, screen.height].join('|');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
