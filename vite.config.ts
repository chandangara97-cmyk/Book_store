import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** Adds Google Search Console verification + Google Analytics 4 to index.html at build time, only when the ids are provided. */
function googleTags(env: Record<string, string>): Plugin {
  const ga = (env.VITE_GA_MEASUREMENT_ID || 'G-QS8V8XEDRK').trim(); // Measurement IDs are public; the GitHub variable overrides this default
  const gsc = (env.VITE_GSC_VERIFICATION || '').trim();
  return {
    name: 'kb-google-tags',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [];
      if (/^[\w-]{10,}$/.test(gsc)) tags.push({ tag: 'meta', attrs: { name: 'google-site-verification', content: gsc }, injectTo: 'head-prepend' });
      if (/^G-[A-Z0-9]{4,}$/.test(ga)) {
        tags.push({ tag: 'script', attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${ga}` }, injectTo: 'head' });
        tags.push({ tag: 'script', children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`, injectTo: 'head' });
      }
      return tags;
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), googleTags(loadEnv(mode, process.cwd(), 'VITE_'))],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
}));
