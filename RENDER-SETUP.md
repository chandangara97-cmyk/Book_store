# Kiddie Bloom — Render payment API setup

The Render server is the **repository-root `index.js`**. Do not set the Root Directory to `render-api` (that folder is not present in this project).

## Render Web Service

Create a Web Service connected to this GitHub repository and use:

| Setting | Value |
|---|---|
| Root Directory | leave blank (repository root) |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/` |

The root `package.json` starts `index.js`. The server supports both normal book/toy checkout (`/createOrder`, `/verifyPayment`) and paid printable checkout (`/createPrintableOrder`, `/verifyPrintablePayment`, `/download`, `/downloadOnce`).

## Render environment variables

Add these under Render → your service → Environment. Never put secrets in GitHub or frontend variables.

| Variable | Value |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay Test Mode key ID (`rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | Matching Razorpay Test Mode secret |
| `FIREBASE_PROJECT_ID` | `data-for-development-11b00` (must match the website Firebase project) |
| `FIREBASE_DB_URL` | `https://data-for-development-11b00-default-rtdb.firebaseio.com` (confirm exact URL in Firebase Console) |
| `FIREBASE_SA_KEY` | Entire Firebase service-account JSON, pasted as one value |
| `DRIVE_SA_KEY` | Google Drive service-account JSON; needed for printable PDF delivery |
| `DB_ROOT` | `bookstore` |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `ALLOWED_ORIGINS` | `https://kiddiebloom.in,https://www.kiddiebloom.in,https://chandangara97-cmyk.github.io` plus your actual GitHub Pages origin if different |

If the Render deployment is only for book checkout and not printable PDFs, `DRIVE_SA_KEY` is not needed to create book orders; printable delivery will need it.

## Connect GitHub Pages to Render

In GitHub → repository → Settings → Secrets and variables → Actions → Variables, create/update:

`VITE_API_URL` = your Render service URL, for example `https://kiddie-bloom-api.onrender.com`

Use the real URL shown in Render. Do not append `/api` and do not add a trailing slash. Then run the **Deploy to GitHub Pages** workflow again so Vite embeds the value into the published site.

## Test

Open the Render service URL in a browser. It should return:

`{"ok":true,"service":"kiddie-bloom-api","configured":{"razorpay":true,"firebase":true,"drive":true}} (true/false values indicate whether each group of environment variables is present)`

Then test checkout with Razorpay Test Mode credentials and test payment details from Razorpay's official test documentation. Do not switch to live keys until test orders are verified end-to-end.

## Important

- Render free services may sleep when idle, delaying the first API call.
- The Razorpay Key ID is returned to the browser; the Key Secret must remain only in Render environment variables.
- Confirm that the Firebase service account has access to the Realtime Database.
