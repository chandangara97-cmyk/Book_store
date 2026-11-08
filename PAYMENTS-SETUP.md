# Kiddie Bloom — production payments

Payment API = trusted Node server on Render (separate private repo `kiddie-bloom-api`). Frontend = GitHub Pages. Data and login = Firebase.

Required routes:

- `POST /createOrder`
- `POST /verifyPayment`
- `POST /createPrintableOrder`
- `POST /verifyPrintablePayment`
- `POST /download`
- `GET /downloadOnce?token=...`

The frontend now fails closed: it will not show a pretend checkout or invent a payment ID. It requires a live Razorpay key from the API and a successful server verification response before confirming a paid order or issuing printable download tokens.

## Backend must enforce

1. Calculate product prices and discounts from trusted server-side catalogue data; never trust browser-supplied totals.
2. Create Razorpay orders with the secret stored only in backend environment variables.
3. Verify Razorpay payment signatures on the server, then verify the payment's captured status, amount and currency against the server-created order.
4. Make payment verification and order creation idempotent.
5. After verification, write the global admin order ledger and PDF entitlements using Firebase Admin SDK. The browser is deliberately denied write access to the global `/bookstore/orders` ledger and `/bookstore/entitlements`.
6. Serve paid PDFs only after checking authenticated ownership/entitlement or a short-lived, single-use download token.

Never put `RAZORPAY_KEY_SECRET` or service-account JSON in Vite variables, source files or git. `VITE_API_URL` may contain only the public HTTPS API base URL.

The production frontend rejects test Razorpay keys. Test payments only against a separate staging deployment configured for test mode; never enable a client-side payment simulator in production.
