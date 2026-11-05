# Kiddie Bloom — payments

Payment API = Node server on **Render** (separate private repo `kiddie-bloom-api`). Frontend = GitHub Pages. Data and login = Firebase.
Full steps and the variable list: the `kiddie-bloom-api` repo's `RENDER-SETUP.md`.

Routes: `POST /createOrder`, `POST /verifyPayment`, `POST /createPrintableOrder`, `POST /verifyPrintablePayment`, `POST /download`, `GET /downloadOnce?token=...`

Never put `RAZORPAY_KEY_SECRET` or service-account JSON in Vite variables, source files or git.


## Frontend payment configuration

In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and set:

- `VITE_API_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`

Use the actual Render service hostname; do not include a trailing slash. The GitHub Pages build injects this value at build time, so redeploy after changing it.

The browser accepts both Razorpay Test keys and Live keys returned by the API. Test keys open Razorpay's genuine test checkout. A missing/invalid key now stops checkout with an error; the site no longer simulates a successful payment.

For a fast first payment, note that Render free services may sleep when idle and need time to wake. Frontend changes cannot eliminate that server cold start. Use an always-on instance or another non-sleeping host for consistently fast checkout. Keep order creation, amount calculation, signature verification and PDF entitlement issuance on the server.
