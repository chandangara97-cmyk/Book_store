# Kiddie Bloom — platform transformation notes (November 2026)

This upgrade changes the customer-facing experience and reconnects the existing store views rather than replacing the product catalogue or Firebase data model.

## What changed

- Rebuilt the global navigation as a boutique storefront header with Books, Toys & Play, Learning Studio and Gift Finder destinations.
- Added a mobile-first quick navigation bar for Home, Books, Learn, Bag and Account.
- Changed the first page to the Home landing page and restored explicit routing for every existing customer view: home, library, toys, printables, gift finder, cart, wishlist, checkout, order summary, authentication and admin.
- Applied a cohesive warm-cream, botanical-green and soft-rose design system with responsive layouts, accessible focus states and reduced-motion support.
- Updated the footer to expose the main shopping destinations.
- Removed the in-browser payment simulator and fabricated payment IDs. Book/toy and printable purchases now fail closed unless the API returns a valid live Razorpay key; payment success requires the server verification endpoint to succeed.
- Changed the global admin order ledger to read-only for client SDKs. Customer-owned order history remains under the authenticated customer's own account. The payment API must create the admin-visible `/bookstore/orders` records using Firebase Admin SDK only after verified payment.
- Updated page metadata for the broader Books, Toys, Learning & Gifts positioning.

## Important production requirements — do not skip

1. This repository contains the frontend, not the payment API implementation. Configure `VITE_API_URL` to a deployed trusted backend implementing `POST /createOrder`, `POST /verifyPayment`, `POST /createPrintableOrder`, `POST /verifyPrintablePayment`, and protected PDF download routes.
2. The backend must calculate prices from trusted catalogue data, create Razorpay orders using a server-held live secret, verify HMAC signatures server-side, verify the captured payment amount/currency/order status with Razorpay, and be idempotent.
3. After successful verification, the backend must create the admin-visible `/bookstore/orders/{orderId}` record and paid PDF entitlements using Firebase Admin SDK. Never allow the browser to write these records.
4. Store Razorpay secrets and Firebase service credentials only in backend environment secrets. Never put them in `VITE_*` variables or this repository.
5. Review and deploy `firebase-rules.json` only after merging it with the complete rules used by the live database. This file is a scoped bookstore rules example, not a replacement for unrelated application rules. It deliberately blocks client writes to the global admin order ledger.
6. The frontend's displayed exchange-rate conversion is indicative. The backend must return the authoritative payable amount and currency at order creation.
7. Test with Razorpay test mode in a private staging environment using an explicitly configured test-only backend. The production frontend intentionally rejects test keys. Do not simulate successful payment in production.

## Deploy

- Set the correct Firebase web configuration and `VITE_API_URL` in the GitHub Actions build environment.
- Install dependencies and run `npm ci` followed by `npm run build` in CI.
- Deploy the `dist/` output to GitHub Pages or the configured static host.
- Validate all page destinations, mobile navigation, login, cart, checkout failure paths, admin access, and PDF entitlement checks before launch.

## Build verification

A full local TypeScript/Vite build could not be completed in the packaging environment because dependency installation timed out and left an incomplete `node_modules` directory. Run the CI build after a clean dependency install; do not treat this ZIP as a production payment certification.
