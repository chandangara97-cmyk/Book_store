import { getIdToken, refreshFirebaseToken, getFirebaseUser, databaseRequest } from './firebaseClient';

export const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) || '').replace(/\/$/, '');
export const apiConfigured = Boolean(API_URL);

async function post(path: string, body: unknown): Promise<Response> {
  if (!API_URL) throw new Error('Payments are not set up yet (VITE_API_URL is missing).');
  const call = () => fetch(API_URL + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getIdToken() || ''}` }, body: JSON.stringify(body) });
  let r = await call();
  if (r.status === 401 && (await refreshFirebaseToken())) r = await call();
  return r;
}
async function postJson<T>(path: string, body: unknown): Promise<T> {
  const r = await post(path, body);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.error || `Request failed (${r.status})`);
  return d as T;
}

/** IDs of paid printables this signed-in customer owns. */
export async function loadOwnedPrintables(): Promise<string[]> {
  const u = getFirebaseUser();
  if (!u?.localId) return [];
  try { return Object.keys((await databaseRequest<Record<string, unknown> | null>(`entitlements/${u.localId}`)) || {}); } catch { return []; }
}

export const createPrintableOrder = (resourceIds: string[], currency: string) =>
  postJson<{ id: string; orderRef: string; currency: string; amount: string }>('/createPrintableOrder', { resourceIds, currency });
export const capturePrintableOrder = (orderRef: string, paypalOrderId: string) =>
  postJson<{ ok: boolean; resourceIds: string[]; downloadTokens: Record<string, string> }>('/capturePrintableOrder', { orderRef, paypalOrderId });
export const getPayPalConfig = () => postJson<{ clientId: string; environment: string }>('/paypalConfig', {});

/** Fetches the PDF through the server (which checks payment) and saves it on the device. */
export async function downloadPrintable(resourceId: string, title: string) {
  const r = await post('/download', { resourceId });
  if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d?.error || `Download failed (${r.status})`); }
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = url; a.download = `${title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || resourceId}.pdf`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

declare global { interface Window { paypal?: any } }
let sdkKey = '';
export function loadPayPalSdk(clientId: string, currency: string): Promise<any> {
  const key = `${clientId}|${currency}`;
  if (window.paypal && sdkKey === key) return Promise.resolve(window.paypal);
  document.querySelectorAll('script[data-kb-paypal]').forEach(n => n.remove());
  delete window.paypal;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    s.setAttribute('data-kb-paypal', '1');
    s.onload = () => { sdkKey = key; window.paypal ? resolve(window.paypal) : reject(new Error('PayPal failed to load.')); };
    s.onerror = () => reject(new Error('Could not load PayPal. Check your connection.'));
    document.head.appendChild(s);
  });
}
