# Deploy the payments API on Render

Put this `render-api/` folder in the root of your GitHub repo and push.

## Render settings (New > Web Service > pick your repo)
| Field | Value |
|---|---|
| Root Directory | `render-api` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/` |

## Environment Variables (enter them in Render only, never in the repo)
| Key | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_...` first, `rzp_live_...` when you go live |
| `RAZORPAY_KEY_SECRET` | the matching secret |
| `FIREBASE_PROJECT_ID` | `data-for-development-11b00` |
| `FIREBASE_DB_URL` | `https://data-for-development-11b00-default-rtdb.firebaseio.com` |
| `FIREBASE_SA_KEY` | whole JSON of the Firebase Admin service-account key (Firebase Console > Project settings > Service accounts > Generate new private key) |
| `DRIVE_SA_KEY` | whole JSON of the Google Drive service-account key |
| `DB_ROOT` | `bookstore` |
| `ADMIN_EMAILS` | your admin email(s), comma-separated |
| `ALLOWED_ORIGINS` | optional; defaults to kiddiebloom.in, www.kiddiebloom.in and your github.io site |

## Connect the website
GitHub repo > Settings > Secrets and variables > Actions > Variables:

    VITE_API_URL = https://YOUR-SERVICE-NAME.onrender.com

No `/api` and no trailing slash. Then re-run the "Deploy to GitHub Pages" workflow.

## Check it
Open the Render URL in a browser. It should show `{"ok":true,"service":"kiddie-bloom-api"}`.

## Notes
- Render's free plan sleeps after ~15 minutes idle; the first request then takes ~50 seconds.
  For real customers use the $7 plan so checkout opens instantly.
- Routes: POST /createPrintableOrder, /verifyPrintablePayment, /download and GET /downloadOnce.
