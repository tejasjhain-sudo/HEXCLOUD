import crypto from 'crypto';

const AUTH_URL =
  process.env.DIGILOCKER_AUTH_URL ||
  'https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize';
const TOKEN_URL =
  process.env.DIGILOCKER_TOKEN_URL ||
  'https://digilocker.meripehchaan.gov.in/public/oauth2/2/token';
const USER_URL =
  process.env.DIGILOCKER_USER_URL ||
  'https://digilocker.meripehchaan.gov.in/public/oauth2/1/user';

export function isDigilockerConfigured(): boolean {
  return Boolean(
    process.env.DIGILOCKER_CLIENT_ID &&
      process.env.DIGILOCKER_CLIENT_SECRET &&
      process.env.DIGILOCKER_REDIRECT_URI,
  );
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.DIGILOCKER_CLIENT_ID!,
    redirect_uri: process.env.DIGILOCKER_REDIRECT_URI!,
    state,
    scope: 'openid',
    acr: 'aadhaar',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<{ access_token: string; id_token?: string }> {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: process.env.DIGILOCKER_CLIENT_ID!,
    client_secret: process.env.DIGILOCKER_CLIENT_SECRET!,
    redirect_uri: process.env.DIGILOCKER_REDIRECT_URI!,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DigiLocker token error: ${err}`);
  }

  return res.json() as Promise<{ access_token: string; id_token?: string }>;
}

export interface DigilockerUserDetails {
  digilockerid: string;
  name: string;
  dob?: string;
  gender?: string;
  eaadhaar?: string;
  reference_key?: string;
}

export async function fetchDigilockerUser(accessToken: string): Promise<DigilockerUserDetails> {
  const res = await fetch(USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DigiLocker user error: ${err}`);
  }

  return res.json() as Promise<DigilockerUserDetails>;
}

/** Extract masked Aadhaar from OIDC id_token JWT payload (if present). */
export function maskedAadhaarFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const payload = idToken.split('.')[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      masked_aadhaar?: string;
    };
    const masked = json.masked_aadhaar;
    if (!masked) return null;
    const digits = masked.replace(/\D/g, '');
    return digits.length >= 4 ? digits.slice(-4) : null;
  } catch {
    return null;
  }
}
