import { useEffect, useRef } from 'react';

/**
 * Browser Back-button support for a single-page app that has no router.
 *
 *  - Popups (details, cart, filters) push one history entry while open, so Back closes the popup
 *    instead of leaving the website.
 *  - When a popup is closed by its ✕ / backdrop / Esc, that entry is removed again (silentBack),
 *    so history never fills up with dead entries.
 *  - `silentBack` pops are swallowed here (first popstate listener, registered at import time) so the
 *    other listeners only ever see real Back/Forward presses made by the visitor.
 */
let ignore = 0;
let timer: number | undefined;
const queue: Array<() => void> = [];

const flush = () => {
  ignore = 0;
  if (timer !== undefined) { window.clearTimeout(timer); timer = undefined; }
  queue.splice(0).forEach(fn => fn());
};

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', e => {
    if (ignore > 0) {
      e.stopImmediatePropagation();
      ignore--;
      if (ignore === 0) flush();
    }
  });
}

/** history.back() that our own listeners ignore. */
export const silentBack = () => {
  ignore++;
  history.back();
  if (timer !== undefined) window.clearTimeout(timer);
  timer = window.setTimeout(flush, 600); // safety net if the browser never fires popstate
};

/** Run a history change now, or right after a pending silentBack has finished (history.back() is async). */
export const whenHistorySettled = (fn: () => void) => { if (ignore > 0) queue.push(fn); else fn(); };

/** Make the browser Back button close a popup while `open` is true. */
export function useBackClose(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const marker = `kb-popup-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let pushed = false, cancelled = false, poppedByVisitor = false;

    const onPop = () => {
      if (history.state?.kbPopup === marker) return; // a popup stacked above this one was closed; this one stays
      poppedByVisitor = true;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);

    whenHistorySettled(() => {
      if (cancelled) return;
      history.pushState({ ...(history.state || {}), kbPopup: marker }, '');
      pushed = true;
    });

    return () => {
      cancelled = true;
      window.removeEventListener('popstate', onPop);
      if (pushed && !poppedByVisitor && history.state?.kbPopup === marker) silentBack();
    };
  }, [open]);
}
