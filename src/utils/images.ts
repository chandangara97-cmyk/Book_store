import type React from 'react';

/** True for short emoji-style covers such as "📖". */
export const isEmojiCover = (c?: string): boolean =>
  !!c && c.length <= 4 && !c.includes('/') && !c.includes('.');

/** Prefix local paths (e.g. /img/x.svg) with Vite's BASE_URL so they work on GitHub Pages sub-paths. */
export const asset = (p: string): string => {
  if (!p || /^(https?:|data:|blob:)/.test(p)) return p;
  return p.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p;
};

/** Attach a local fallback to a remote URL. Kept in the #fragment so it is never sent to the server. */
export const withFallback = (url: string, localPath: string): string =>
  `${url}#fb=${encodeURIComponent(localPath)}`;

export const fallbackOf = (src?: string): string | null => {
  const m = src?.match(/#fb=([^&]+)/);
  return m ? asset(decodeURIComponent(m[1])) : null;
};

/** Strip the fallback fragment so the browser requests the clean URL. */
export const cleanSrc = (src: string): string => src.replace(/#fb=.*$/, '');

/** Free book covers from Open Library (by ISBN-13). Falls back to the local SVG cover. */
export const bookCover = (isbn: string, slug: string): string =>
  withFallback(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`, `/img/covers/${slug}.svg`);

/** Free keyword photos from LoremFlickr (Flickr, Creative Commons). `lock` keeps the same photo every time. */
export const photo = (keywords: string, lock: number, fallbackPath?: string, w = 640, h = 420): string => {
  const url = `https://loremflickr.com/${w}/${h}/${keywords}?lock=${lock}`;
  return fallbackPath ? withFallback(url, fallbackPath) : url;
};

/** onError handler for plain <img> tags: swap in the local fallback once, then hide. */
export const imgFallback = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  const img = e.currentTarget;
  const fb = fallbackOf(img.getAttribute('data-src') || '');
  if (fb && img.dataset.fbDone !== '1') {
    img.dataset.fbDone = '1';
    img.src = fb;
  } else {
    img.style.display = 'none';
  }
};
