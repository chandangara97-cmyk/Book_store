# Kiddie Bloom upgrade notes

## Included in this upgrade

- Restored dedicated rendering for Home, Books, Toys, Cart, Checkout, Order Summary, Wishlist, Gift Finder, Account, Admin and Learning Studio views. Previously most routes fell through to the Learning Studio view.
- Set the initial storefront route to Home.
- Added desktop navigation for Home, Books, Toys & Gifts, Learning Studio, Gift Finder and Cart.
- Expanded the mobile drawer and five-item mobile navigation.
- Refreshed the storefront styling with a softer premium pastel palette, clearer navigation states, improved cards, header treatment and responsive spacing.
- Removed the in-browser payment simulator and all generated fake payment IDs. Checkout now requires a Razorpay order/key and server-side signature verification; it fails closed if secure payment is unavailable.
- Removed the fabricated `PAY-...` fallback payment ID from order summaries.
- Added production payment/API hardening guidance in `PAYMENTS-SETUP.md`.

## Before deployment

1. Configure the deployed HTTPS API URL in `VITE_API_URL`.
2. Confirm the API creates orders using trusted catalogue prices and verifies Razorpay signatures server-side.
3. Move order persistence and paid-entitlement writes to the trusted API/Firebase Admin SDK, then deny browser writes to paid order records. See `PAYMENTS-SETUP.md`.
4. Verify Firebase rules and ensure admin access is enforced by Firebase rules/server claims, not only by frontend email configuration.
5. Run `npm ci` and `npm run build` in CI or a machine with npm registry access, then test all routes and the payment flow with Razorpay test credentials.

## Build verification limitation

A local production build could not be completed in this environment because dependency installation from the npm registry timed out and left incomplete type packages. The source changes are packaged, but a successful TypeScript/Vite build has not been verified here.
