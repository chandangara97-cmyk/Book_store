# Kiddie Bloom — Razorpay payment setup

This project uses **Render for the payment API**, GitHub Pages for the frontend, Razorpay for payment processing, and Firebase Realtime Database for orders/catalogue data. Follow `RENDER-SETUP.md` for the deployment steps. Do not deploy only `functions/api/index.ts`: that is a Supabase/Deno printable-PDF implementation and is not the Render Node server.

## Payment flows supported by the Render API

- Books and toys: `POST /createOrder` then `POST /verifyPayment`.
- Paid printable PDFs: `POST /createPrintableOrder`, `POST /verifyPrintablePayment`, `POST /download`, and `GET /downloadOnce`.

## Safe setup sequence

1. Deploy the repository root as a Render Web Service (Root Directory blank, Build Command `npm install`, Start Command `npm start`).
2. Add Razorpay Test Mode `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Render Environment.
3. Add the Firebase project/service-account environment variables described in `RENDER-SETUP.md`.
4. Open the Render URL and confirm the health response is `{"ok":true,"service":"kiddie-bloom-api","configured":{"razorpay":true,"firebase":true,"drive":true}} (true/false values indicate whether each group of environment variables is present)`.
5. Set GitHub Actions repository variable `VITE_API_URL` to that exact Render URL, without `/api` and without a trailing slash.
6. Re-run the GitHub Pages deployment workflow.
7. Complete a test-mode book purchase and a separate printable purchase before enabling live payments.

## Security

Never place `RAZORPAY_KEY_SECRET`, Firebase service-account JSON, or Google Drive service-account JSON in Vite variables, frontend source files, or committed files. Only the Razorpay Key ID is sent to the browser. Keep all private credentials in Render Environment.
