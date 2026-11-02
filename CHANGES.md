# Changes in this version (30 Oct 2026)

1. **Order path fixed** – `functions/index.js` now saves and verifies orders at `bookstore/orders/…` (same place the website and the rules use). Before, the server used `orders/…` at the database root.
2. **Server prices complete** – `functions/catalog.js` regenerated from the shop data (all 34 shop items incl. `-digital` editions). Items added later in Admin are priced from `bookstore/books|toys` in Firebase (`priceFor`).
3. **Checkout** – the Bank Transfer / Wise option was removed (it opened Razorpay anyway). Note now says what Razorpay really offers.
4. **Admin email** – everything uses `chandanpanwar001@gmail.com`: `.env.local`, `.env.example`, both rules files. **Edit `ADMIN_EMAILS` in your own `.env`** (not included in this zip).
5. **Rules** – `firebase-rules.json` (full) and `firebase-rules-ADD-bookstore-block.txt` (paste-in). Added `.indexOn razorpayOrderId` and the `downloadTokens` node. If other apps share this Firebase project, use the ADD block, not the full file.
6. Test updated for the new order path: 27 / 27 pass.

Not included on purpose: `.env`, `service-account.json`, `functions/.secret.local` (secrets). Keep your own copies in the project folder.

Still to do before going live: host the `server/` API on a public HTTPS URL and set `VITE_API_URL` (GitHub variable) to it; add that site to `ALLOWED_ORIGINS`.
