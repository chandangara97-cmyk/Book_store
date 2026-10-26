# Kiddie Bloom — Firebase connection setup

The app now uses Firebase Authentication REST endpoints and the Realtime Database REST API. No service-account key is required in the browser.

## 1. Create/select a Firebase project
1. Open https://console.firebase.google.com/ and select your project (or create one).
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → General → Your apps**, register a Web app and copy its config values.
4. In **Build → Realtime Database**, create/select a database and copy its database URL.

## 2. Configure local/build environment
Copy `.env.example` to `.env.local` and fill in `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, and `VITE_FIREBASE_PROJECT_ID`. Set `VITE_FIREBASE_ADMIN_EMAILS` to the exact admin email address(es), comma-separated. Restart Vite after changing env values. For hosting/CI, set the same VITE variables in the hosting provider's build environment.

## 3. Set up admin access
1. In Firebase Authentication → Users, create the admin account or register through the app, then verify the email.
2. Set the exact same admin email in `.env.local` and in `firebase-rules.json` (replace `REPLACE-WITH-ADMIN-EMAIL@example.com`).
3. Publish rules through Firebase Console → Realtime Database → Rules, or use Firebase CLI after selecting the correct project. Never leave placeholder rules in production.

The admin allowlist in the frontend only controls the interface; **Realtime Database rules are the actual security boundary**. Do not deploy until the rules use your real admin email. If you need multiple admin accounts, expand the rules explicitly for each approved email.

## 4. Catalog data structure
- `/bookstore/books/{productId}` — public catalog book records
- `/bookstore/toys/{productId}` — public toy records

The storefront reads these branches on startup when Firebase is configured. If a branch is empty, the app continues showing local seed data. In Admin → Firebase data control:
- **Fetch from Firebase** loads the remote books and toys into the current admin workspace.
- **Push catalog to Firebase** replaces both `/books` and `/toys` with the current workspace. Confirm the prompt before pushing; this is a full catalog overwrite.
- Editing/saving a product changes the current workspace/local browser cache. Push after editing to publish the full catalog to Firebase.

## 4b. Sharing a Firebase project with other apps (e.g. PLFS)
The store saves everything under a `bookstore/` folder (`bookstore/books`, `bookstore/toys`, `bookstore/users`, `bookstore/orders`), so it can live in a project that already holds other data. Do **not** replace your existing rules. In Realtime Database → Rules, add the block from `firebase-rules-ADD-bookstore-block.txt` as one more entry inside your current `"rules": { ... }` object, put your admin email in, and Publish. To use a different folder name, set `VITE_FIREBASE_DB_ROOT`.

## 5. Customer accounts: login, favourites, cart and purchases
Customers register and sign in with Firebase Authentication (Email/Password). The password is kept only by Firebase Auth (hashed); it is never written to the database. After sign-up/sign-in the app saves:
- `/bookstore/users/{uid}/profile` — name, email, createdAt, lastLoginAt
- `/bookstore/users/{uid}/cart` and `/bookstore/users/{uid}/wishlist` — saved automatically about half a second after every change, and loaded again on any device after login
- `/bookstore/users/{uid}/orders/{orderId}` — every purchase made by that customer
- `/bookstore/orders/{orderId}` — a copy of each purchase for the admin (customers can create it once but cannot read or change it afterwards; only the admin can update its `status`)

Signing out clears the cart, favourites and orders from that device (they stay in the account). Publish the updated `firebase-rules.json` or none of this will save.

### GitHub Pages: add the Firebase settings
The site is built by GitHub Actions, so it needs the values too. In the repo go to **Settings → Secrets and variables → Actions → Variables** and add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_ADMIN_EMAILS`. Then re-run the deploy workflow. (These web config values are not secrets.) Also add your GitHub Pages domain (`YOUR-USERNAME.github.io`) under **Authentication → Settings → Authorized domains**.

## 6. Important limitations
- Orders and checkout payment flows are not moved by the catalog sync buttons. Payment endpoints/secrets still require the existing secure Cloud Functions setup described in `PAYMENTS-SETUP.md`.
- Do not put Firebase service-account JSON or payment secrets in the frontend or GitHub.
- The database URL and project ID are project-specific; they cannot be safely guessed. This package intentionally uses placeholders until you provide your Firebase web config.
