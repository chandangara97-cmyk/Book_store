/**
 * Per-user cloud storage (Firebase Realtime Database over REST).
 *   users/{uid}/profile   name, email, createdAt, lastLoginAt   (never the password: Firebase Auth keeps that, hashed)
 *   users/{uid}/cart      the signed-in user's cart
 *   users/{uid}/wishlist  the signed-in user's favourites
 *   users/{uid}/orders    purchases made by this user
 *   orders/{orderId}      copy of each purchase so the admin can see all orders
 */
import { databaseRequest, firebaseConfigured, getFirebaseUser, refreshFirebaseToken } from './firebaseClient';
import type { CartItem, Order, WishlistItem } from './types';

export const cloudUid = (): string | null => (firebaseConfigured ? getFirebaseUser()?.localId ?? null : null);

// Realtime Database rejects `undefined`, so strip it by round-tripping through JSON.
const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? null));

/** Call the database; if the 1-hour login token has expired, refresh it once and retry. */
async function call<T>(path: string, method: 'GET' | 'PUT' | 'PATCH' = 'GET', value?: unknown): Promise<T> {
  try {
    return await databaseRequest<T>(path, method, value);
  } catch (e) {
    if (/token|auth|expired|permission/i.test(String((e as Error)?.message)) && (await refreshFirebaseToken())) {
      return databaseRequest<T>(path, method, value);
    }
    throw e;
  }
}

/** Firebase returns arrays as {0:…,1:…} objects (or null when empty). */
const toList = <T,>(v: unknown): T[] =>
  Array.isArray(v) ? (v.filter(Boolean) as T[]) : v && typeof v === 'object' ? (Object.values(v as object) as T[]) : [];

export interface UserCloudData {
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: Order[];
}

export async function saveProfile(uid: string, p: { name?: string; email: string }, isNew: boolean) {
  const now = new Date().toISOString();
  if (isNew) await call(`users/${uid}/profile`, 'PUT', clean({ name: p.name || '', email: p.email, createdAt: now, lastLoginAt: now }));
  else await call(`users/${uid}/profile`, 'PATCH', clean({ email: p.email, ...(p.name ? { name: p.name } : {}), lastLoginAt: now }));
}

export async function loadUserData(uid: string): Promise<UserCloudData> {
  const [cart, wishlist, orders] = await Promise.all([
    call<unknown>(`users/${uid}/cart`),
    call<unknown>(`users/${uid}/wishlist`),
    call<unknown>(`users/${uid}/orders`)
  ]);
  return { cart: toList<CartItem>(cart), wishlist: toList<WishlistItem>(wishlist), orders: toList<Order>(orders) };
}

export const saveCart = (uid: string, cart: CartItem[]) => call(`users/${uid}/cart`, 'PUT', clean(cart));
export const saveWishlist = (uid: string, wishlist: WishlistItem[]) => call(`users/${uid}/wishlist`, 'PUT', clean(wishlist));

export async function saveOrderCloud(uid: string, order: Order) {
  const o = clean(order);
  await call(`users/${uid}/orders/${order.orderId}`, 'PUT', o);
  // Admin-visible copy. Rules allow creating it once; only the admin can change its status later.
  await call(`orders/${order.orderId}`, 'PUT', { ...o, uid });
}

/** Admin only: every order from every customer. */
export async function loadAllOrders(): Promise<Order[]> {
  return toList<Order>(await call<unknown>('orders'));
}

/** Merge two lists by id; items in `primary` win. */
export function mergeById<T extends { id: string }>(primary: T[], other: T[]): T[] {
  const ids = new Set(primary.map((i) => i.id));
  return [...primary, ...other.filter((i) => !ids.has(i.id))];
}

export function mergeOrders(primary: Order[], other: Order[]): Order[] {
  const ids = new Set(primary.map((o) => o.orderId));
  return [...primary, ...other.filter((o) => !ids.has(o.orderId))].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}
