# Kiddie Bloom multi-page storefront redesign

## What changed
- Added a complete primary navigation for Home, Learning, Toys, Gift Finder and Printables.
- Added header shortcuts for Wishlist, Cart, Account and a clearly labelled day/night switch.
- Added a dedicated Wishlist page with add-to-cart and remove actions.
- Connected all existing page components through the app view router: Home, Learning catalogue, Toys, Gift Finder, Printables, Wishlist, Cart, Checkout, Order Summary, Account and Admin.
- Changed the initial landing page to Home while keeping Printables available from navigation.
- Added responsive mobile navigation and a five-item bottom navigation.
- Applied a unified Kiddie Bloom palette, cards, buttons, page spacing and light/dark theme tokens.
- Updated footer navigation to reach the redesigned sections.
- Removed the in-app simulated payment fallback. Checkout now proceeds only through the official Razorpay Checkout using a valid `rzp_` key (test keys are accepted) and server-side verification. If Razorpay is not configured, the app displays an error instead of pretending payment succeeded.

## Important setup
- Configure the real Razorpay API base URL and server-side key ID/secret in the payment API deployment.
- Keep the Razorpay secret only on the server; never put it in frontend environment variables.
- Test with Razorpay test-mode credentials before switching to live credentials.

## Verification note
The source archive was updated. Dependency installation timed out in this environment, so a production TypeScript/Vite build could not be completed here. Run `npm install` and `npm run build` in the project environment before deployment.
