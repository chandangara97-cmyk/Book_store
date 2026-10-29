# Run without the Firebase Blaze plan

Cloud Functions need Blaze, so the same payment code runs on a normal Node server instead (`server/server.js`, which loads `functions/index.js` unchanged). Firebase Auth and Realtime Database work on the free Spark plan.

## One-time
1. Firebase Console > Project settings > Service accounts > **Generate new private key**. Save the file as `service-account.json` in the project root (it is git-ignored).
2. Edit `.env`: set `ADMIN_EMAILS` and check `FIREBASE_DATABASE_URL`. Razorpay keys are already there.
3. Edit `.env.local`: set `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_ADMIN_EMAILS`. `VITE_API_URL` is `http://localhost:8080/api`.

## Run
```bash
./run-all.sh          # or: (cd functions && npm install); npm install; npm run api   + in a 2nd terminal: npm run dev
```
Open http://localhost:3000 and pay with card 4111 1111 1111 1111 or UPI success@razorpay.

## Going public (still free)
Deploy the `server/` API to a free Node host (Render, Railway, Fly) with the same variables as `.env` (store the service-account JSON as a secret file), then set `VITE_API_URL` to `https://<your-host>/api` and add your site to `ALLOWED_ORIGINS` in `functions/index.js`.
