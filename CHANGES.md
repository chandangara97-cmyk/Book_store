# Site repo (public) — 2 Nov 2026

- Split from the old single project. This repo = website only (GitHub Pages). Backend and PDFs moved to the private repo `kiddie-bloom-api`.
- GitHub Actions variables needed: VITE_API_URL (Render URL), VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_DATABASE_URL, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_ADMIN_EMAILS, VITE_FIREBASE_DB_ROOT (optional, default bookstore).
- Workflow uses `npm install` (no lockfile).
