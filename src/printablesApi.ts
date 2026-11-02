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
  postJson<{ orderId: string; orderRef: string; amount: number; currency: string; keyId: string }>('/createPrintableOrder', { resourceIds, currency });
export const verifyPrintablePayment = (body: { orderRef: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
  postJson<{ ok: boolean; resourceIds: string[]; downloadTokens: Record<string, string> }>('/verifyPrintablePayment', body);

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
