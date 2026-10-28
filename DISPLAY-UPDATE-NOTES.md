# Kiddie Bloom display update

## What changed
- Preserved the existing home hero banner image file and its original reference exactly: `public/img/kiddie-bloom-banner.jpg`.
- Improved shared page spacing, headings, cards, forms, filters, modal scrolling, focus states, and responsive layouts.
- Fixed the mobile menu control so it can be shown by the existing mobile breakpoint CSS (removed the inline `display: none` override).
- Kept the existing one-time PDF download/payment code and Firebase configuration files in the project.

## Install and build
Use Node.js 20 or newer:

```bash
npm ci
npm run build
npm run dev
```

The build could not be verified in the preparation environment because the bundled dependency directory was incomplete and package installation did not finish. The ZIP intentionally excludes `node_modules`; run `npm ci` after extraction to install a clean dependency tree.

## Important
The home hero artwork was not replaced or edited. Payment processing and one-time PDF delivery still require the documented Firebase/PayPal secrets and deployment of the Cloud Function before they work on the live site.
