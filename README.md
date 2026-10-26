# Kiddie Bloom

A modern, responsive React + TypeScript e-commerce and learning studio application for children's tutorial books, fiction, learning titles, toys, and gift finder recommendations.

## Overview

Kiddie Bloom is built with React 19, TypeScript, and Vite. It preserves all original features and business logic:
- **Interactive Age Finder**: Slider from age 0 to 15 matching custom tutorial stages (Ages 0–3, 4–7, 8–12, 13–15) with dynamic preview images and instant Printed vs Digital edition format selection.
- **Master Library & Search**: Complete catalog browsing with category filtering (Fiction & Stories, Learning & Growth, Children's Books, Gifts & Special Reads), search, and multiple sorting options.
- **Toys & Learning Kits**: Creative craft kits, puzzles, plush toys, and pairing suggestions for reading corners.
- **Cart & Threshold Rewards**: Real-time quantity adjustment, persistent storage, and automatic unlockable gift tiers (Spend ₹999 for a Free Colouring Kit; Spend ₹1,499 for a Free Mini Toy; Free shipping over ₹499).
- **Gift Finder Wizard**: 3-step recommendation quiz guiding shoppers by recipient, reading interests, and age group.
- **Multi-Currency Checkout**: Real-time exchange rate calculation from live currency feeds (`INR`, `USD`, `EUR`, `GBP`, `AED`, `SGD`, `AUD`, `CAD`), dynamic fee calculation, and payment method support (Cards, PayPal, UPI, Bank/Wise).
- **Printable Order Summary / Invoice**: Detailed order confirmation with customer information, item breakdown, currency conversion, and print/PDF support.
- **User Account & Wishlist**: Save items to wishlist, view past orders, and manage authentication state.
- **Studio Admin Workspace**: Curate products, manage books and toys, inspect statistics, edit items, and seed/restore catalog defaults.

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite (listening on port 3000)
- **State Management**: React Context (`StoreContext`) with persistent LocalStorage backup
- **Icons**: Lucide icons & themed SVG graphics

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

© 2026 Kiddie Bloom. All rights reserved.

## Kiddie Bloom logo assets

- Main logo: `public/img/kiddie-bloom-logo.png` (used on the homepage hero and social preview).
- Compact logo: `public/img/kiddie-bloom-logo-sm.png` (used in the header, footer, favicon, and mobile-friendly brand areas).
- The same source assets are retained in `img/` for repository compatibility. App references use root-relative `/img/...` paths so they are included in Vite production builds.
