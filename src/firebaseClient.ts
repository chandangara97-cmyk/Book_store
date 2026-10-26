/** Firebase REST client. Configure VITE_FIREBASE_* in .env.local before use. */
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  adminEmails: (import.meta.env.VITE_FIREBASE_ADMIN_EMAILS as string | undefined || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean)
};
const TOKEN_KEY = 'kb_firebase_id_token';
const REFRESH_KEY = 'kb_firebase_refresh_token';
const USER_KEY = 'kb_firebase_user';
export const firebaseConfigured = Boolean(cfg.apiKey && cfg.databaseURL);
export const firebaseAdminEmails = cfg.adminEmails;
export const getFirebaseUser = (): { email: string; localId: string; displayName?: string } | null => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
};
export const getIdToken = () => localStorage.getItem(TOKEN_KEY);
async function authRequest(method: 'signInWithPassword' | 'signUp', email: string, password: string, displayName?: string) {
  if (!cfg.apiKey) throw new Error('Firebase is not configured. Add VITE_FIREBASE_API_KEY to .env.local.');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${cfg.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true, ...(displayName ? { displayName } : {}) })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(String(data?.error?.message || 'Firebase authentication failed').replaceAll('_', ' '));
  localStorage.setItem(TOKEN_KEY, data.idToken);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  const user = { email: data.email || email, localId: data.localId, displayName };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
export const firebaseSignIn = (email: string, password: string) => authRequest('signInWithPassword', email, password);
export const firebaseSignUp = (email: string, password: string, name: string) => authRequest('signUp', email, password, name);
export function firebaseSignOut() { [TOKEN_KEY, REFRESH_KEY, USER_KEY].forEach(k => localStorage.removeItem(k)); }
export function isFirebaseAdmin(email?: string | null) { return Boolean(email && cfg.adminEmails.includes(email.toLowerCase())); }
export async function databaseRequest<T>(path: string, method: 'GET' | 'PUT' | 'PATCH' = 'GET', value?: unknown): Promise<T> {
  if (!cfg.databaseURL) throw new Error('Firebase is not configured. Add VITE_FIREBASE_DATABASE_URL to .env.local.');
  const token = getIdToken();
  const url = `${cfg.databaseURL.replace(/\/$/, '')}/${path.replace(/^\//, '').replace(/\/$/, '')}.json${token ? `?auth=${encodeURIComponent(token)}` : ''}`;
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(method !== 'GET' ? { body: JSON.stringify(value) } : {}) });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Firebase database request failed (${response.status})`);
  return data as T;
}
export async function refreshFirebaseToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!cfg.apiKey || !refreshToken) return false;
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${cfg.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }) });
  const data = await response.json();
  if (!response.ok) { firebaseSignOut(); return false; }
  localStorage.setItem(TOKEN_KEY, data.id_token); localStorage.setItem(REFRESH_KEY, data.refresh_token); return true;
}
