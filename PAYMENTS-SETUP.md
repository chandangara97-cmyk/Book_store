# Online payments (Razorpay only)

All payments (books/toys checkout and paid printable PDFs) go through **Razorpay** (cards, UPI, net banking, international cards if enabled on your account). PayPal has been removed.

## 1. Get keys
Razorpay Dashboard → Account & Settings → API Keys. Use **Test Mode** keys (`rzp_test_…`) first. For non-INR currencies, ask Razorpay to enable international payments.

## 2. Store keys as Firebase secrets (never in code)
```sh
firebase use YOUR_FIREBASE_PROJECT_ID
./set-secrets.sh          # keys are pre-filled; it also deploys the functions
```
or manually:
```sh
firebase functions:secrets:set RAZORPAY_KEY_ID
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set DRIVE_SA_KEY   # only needed for paid printable PDFs
```
Set your real site origins in `ALLOWED_ORIGINS` in `functions/index.js`.

## 3. Deploy
```sh
cd functions && npm install && cd ..
firebase deploy --only functions
```
Put the deployed `api` URL in `.env.local` as `VITE_API_URL=https://us-central1-<project-id>.cloudfunctions.net/api`.

## 4. Test (Test Mode)
- Card `4111 1111 1111 1111`, any future expiry, any CVV; UPI `success@razorpay`.
- Confirm orders become `paid` in Realtime Database only after the server verifies the signature.
- Printables: signed-in user pays → one-time download links appear.

## Notes
- Prices are always computed server-side (`functions/catalog.js` and the database); browser prices are ignored.
- Only the public Key ID is sent to the browser. The Key Secret stays in Firebase secrets.
- Switch to Live keys only after Razorpay approves your account and end-to-end tests pass.
