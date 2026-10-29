# Kiddie Bloom

React + TypeScript + Vite storefront for printable PDFs, paid via Razorpay.
Payment API (`server/server.cjs`, wraps `functions/index.js`) uses Firebase Auth + Realtime Database.
Paid PDFs are stored in `private-pdfs/` — **keep this repo private**.

## Deploy (Render, both from this repo)
**Web Service (API)** — Build: `cd functions && npm install` — Start: `node server/server.cjs`
Env vars: see `.env.example` (API section). Secret File: `service-account.json`.

**Static Site (storefront)** — Build: `npm install && npm run build` — Publish dir: `dist`
Env vars: see `.env.example` (Storefront section). Add custom domain `kiddiebloom.in`.

## Add a printable
1. Put `name.pdf` in `private-pdfs/`, commit, push.
2. Admin → PDF field: `local_name` → Publish printables to Firebase.

## Local dev
Copy `.env.example` to `.env` (API) and `.env.local` (storefront), add `service-account.json`, then:
`(cd functions && npm install) && npm install && npm run api` and in another terminal `npm run dev`.

Firebase DB rules: `firebase-rules.json`. Test: `cd functions && npm test`.
