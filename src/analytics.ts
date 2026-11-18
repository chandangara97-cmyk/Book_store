/** Google Analytics 4 helper. The gtag script itself is added at build time (see vite.config.ts) only when VITE_GA_MEASUREMENT_ID is set, so every call here is a safe no-op until then. */
declare global { interface Window { gtag?: (...args: unknown[]) => void } }

export const track = (event: string, params: Record<string, unknown> = {}) => {
  try { window.gtag?.('event', event, params); } catch { /* analytics must never break the shop */ }
};

export const gaItem = (r: { id: string; title: string; section: string; price: number }) => ({
  item_id: r.id, item_name: r.title, item_category: r.section, price: r.price, quantity: 1,
});
