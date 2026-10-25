# Online payments: India + international customers

The website supports **Razorpay** for cards/UPI and **PayPal Checkout** for international customers. Both remain unavailable for real charges until you configure credentials and deploy the Firebase Cloud Function. Never collect or store raw card details on this website.

## 1. Set up the accounts

- **Razorpay (India):** complete business KYC and request international card payments to be enabled. Use Test Mode keys first.
- **PayPal:** create a PayPal Business account and an app in the PayPal Developer Dashboard. Copy the app's Client ID and Secret. Start in Sandbox; switch to Live only after successful tests and account approval. PayPal availability and cross-border receiving depend on your merchant country/account eligibility.

## 2. Configure Firebase Functions

Use Node.js 20 and the existing Firebase project. Upgrade to the Blaze plan if required for Cloud Functions, then run:

```sh
npm install -g firebase-tools
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase functions:secrets:set RAZORPAY_KEY_ID
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set PAYPAL_CLIENT_ID
firebase functions:secrets:set PAYPAL_CLIENT_SECRET
```

For Sandbox, keep the default `PAYPAL_ENVIRONMENT=sandbox`. For production, set `PAYPAL_ENVIRONMENT=live` in the Functions environment configuration (for example, the `functions/.env.YOUR_FIREBASE_PROJECT_ID` file) and deploy again. Do not commit credentials or `.env` files to GitHub.

In `functions/index.js`, replace `ALLOWED_ORIGINS` with your exact website origins, for example `https://YOUR-USERNAME.github.io` and/or `https://your-custom-domain.example`. Do not include a trailing slash. Add every real origin you use, and no wildcard.

## 3. Confirm your catalogue

Edit `functions/catalog.js`. The server uses this file as the authoritative INR price list; it deliberately ignores prices sent by the browser. Ensure each cart item ID in `js/store.js` matches a catalogue key and add every sellable product/format. Confirm shipping and fee assumptions in `CFG` in `functions/index.js` and `js/payments.js` against your actual provider terms. The current fee percentages are estimates, not guaranteed provider rates.

## 4. Deploy and connect the API

From the project root:

```sh
cd functions
npm install
cd ..
firebase deploy --only functions
```

Copy the deployed `api` function URL into `ORDER_API` in `js/payments.js`, for example `https://us-central1-YOUR_FIREBASE_PROJECT_ID.cloudfunctions.net/api`. Commit and deploy the static site after setting it.

## 5. Test before going live

- Test Razorpay using its test keys and test payment methods.
- Test PayPal with Sandbox buyer and business accounts.
- Verify successful payments are marked `paid` in Realtime Database and cancelled/failed payments are not marked paid.
- Check order totals, shipping, currency conversion, and mobile checkout.
- Switch to live Razorpay credentials and PayPal Live mode only after account approval and end-to-end tests.

## Important notes

- PayPal checkout uses supported international currencies. If INR is selected, the checkout automatically switches to USD for PayPal. The customer sees the converted estimate; PayPal may apply its own conversion/settlement rates.
- The exchange-rate feed is indicative and the final charge is created server-side using the rate available at checkout.
- `firebase-rules.json` must be reviewed against your existing app before deployment; do not overwrite working database rules blindly.
- Never put a Razorpay secret or PayPal secret in frontend JavaScript, HTML, or GitHub Pages files. Only the PayPal Client ID is returned to the browser for loading the official PayPal SDK.
