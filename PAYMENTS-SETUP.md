# Kiddie Bloom — payments

Payment API = Node server on **Render** (separate private repo `kiddie-bloom-api`). Frontend = GitHub Pages. Data and login = Firebase. The browser now fails closed: there is no simulated payment or fabricated payment ID.
Full steps and the variable list: the `kiddie-bloom-api` repo's `RENDER-SETUP.md`.

Routes: `POST /createOrder`, `POST /verifyPayment`, `POST /createPrintableOrder`, `POST /verifyPrintablePayment`, `POST /download`, `GET /downloadOnce?token=...`

Never put `RAZORPAY_KEY_SECRET` or service-account JSON in Vite variables, source files or git.


## Production checklist

- Configure `VITE_API_URL` to the deployed HTTPS API base URL.
- Configure the live Razorpay key ID and secret only on the API server; never put the secret in Vite variables.
- `/createOrder` must calculate item prices from the trusted server catalogue (never trust browser-supplied prices).
- `/verifyPayment` must verify the Razorpay signature using the server secret and confirm the order amount, currency, order ID, payment status and capture status before returning success.
- Make verification idempotent and reject replayed or mismatched payment IDs.
- Store the verified order from the server using Firebase Admin credentials. Do not let a browser write a `Paid` status or grant a digital entitlement.
- Test with Razorpay test credentials first; switch to live credentials only after webhook/signature, cancellation, duplicate callback and amount-mismatch tests pass.

**Important Firebase note:** the included `firebase-rules.json` still permits a signed-in customer to create a customer order record. Because the current frontend writes its order history directly to Firebase after checkout, this rule set is not a complete production payment-security boundary. Before accepting live payments, move order creation/status and entitlement writes to the trusted API (Firebase Admin SDK), then deny client writes to `/orders` and `/users/$uid/orders`.
