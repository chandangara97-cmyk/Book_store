# Deploy the payments API on Supabase

Install the Supabase CLI, then from the repo root (the folder that contains `supabase/`):

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Razorpay (start with rzp_test_ keys)
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx

# Firebase (login + database stay on Firebase)
supabase secrets set FIREBASE_PROJECT_ID=data-for-development-11b00
supabase secrets set FIREBASE_DB_URL=https://data-for-development-11b00-default-rtdb.firebaseio.com
supabase secrets set DB_ROOT=bookstore ADMIN_EMAILS=you@example.com
supabase secrets set FIREBASE_SA_KEY="$(cat firebase-service-account.json)"   # Firebase Console > Project settings > Service accounts > Generate new private key
supabase secrets set DRIVE_SA_KEY="$(cat drive-service-account.json)"         # same Drive key you used before

supabase functions deploy api --no-verify-jwt
```

Then set the GitHub Actions variable (Settings > Secrets and variables > Actions > Variables):

    VITE_API_URL = https://YOUR_PROJECT_REF.supabase.co/functions/v1/api

Re-run the "Deploy to GitHub Pages" workflow. Opening that URL in a browser should show
`{"ok":true,"service":"kiddie-bloom-api"}`.

Notes
- Delete the downloaded service-account JSON files afterwards; never commit them.
- Allowed website origins default to kiddiebloom.in, www.kiddiebloom.in and your github.io site.
  Override with `supabase secrets set ALLOWED_ORIGINS=https://a.com,https://b.com`.
- Only the printable routes are ported: createPrintableOrder, verifyPrintablePayment, download, downloadOnce.
  The old book/toy cart routes (createOrder, verifyPayment) are not included, since the site no longer uses them.
