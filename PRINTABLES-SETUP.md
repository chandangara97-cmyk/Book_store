# Paid printable PDFs: Firebase metadata + Google Drive files + Razorpay

Flow: customer picks a section (worksheet, activity, puzzle, cut-and-paste, coloring) and age band -> pays with Razorpay -> the Cloud Function confirms payment -> the PDF streams from your private Google Drive folder to the customer.

- **Firebase Realtime Database**: public metadata at `bookstore/learningResources` (title, section, ages, price, thumbnail). Private Drive file IDs at `bookstore/learningPrivate/{id}` (admin only). Purchases at `bookstore/entitlements/{uid}/{id}` and `bookstore/printableOrders/{ref}` (written only by the server).
- **Google Drive**: the PDF files. Keep the folder private. Google Sheets cannot store PDFs, so Drive is used.
- **Cloud Function** (`functions/index.js`): `/createPrintableOrder`, `/capturePrintableOrder`, `/download`. Prices come from the database, never the browser.

## One-time setup
1. **Drive service account**: Google Cloud Console (same project) -> IAM -> Service Accounts -> create one -> Keys -> add JSON key. Enable the **Google Drive API** for the project.
2. Create a Drive folder for PDFs and **share it (Viewer)** with the service account's `client_email`.
3. Store the key as a secret: `firebase functions:secrets:set DRIVE_SA_KEY` (paste the whole JSON).
4. Create `functions/.env.YOUR_PROJECT_ID` with `ADMIN_EMAILS=you@example.com` (and `DB_ROOT=` only if you changed it). Set your real site origin in `ALLOWED_ORIGINS` in `functions/index.js`.
5. `cd functions && npm install && cd .. && firebase deploy --only functions`
6. Set `VITE_API_URL` (e.g. `https://us-central1-PROJECT.cloudfunctions.net/api`) in `.env.local` and as a GitHub Actions **variable**.
7. Merge the new blocks (`learningPrivate`, `entitlements`, `printableOrders`) from `firebase-rules.json` into your live Realtime Database rules, with your admin email.
8. Razorpay secrets as in `PAYMENTS-SETUP.md`. Test in Test Mode first.

## Adding a printable (admin)
Upload the PDF to the Drive folder -> copy its share link -> Admin -> Printable learning library -> fill the form with the link -> **Save** (this writes the private Drive ID) -> **Publish printables to Firebase** (public metadata).

## Notes
- Customers must sign in (Email/Password) to buy or download, so purchases follow them across devices.
- Customers can pay in INR or USD/EUR/GBP/AED/SGD/AUD/CAD (non-INR needs international payments enabled on your Razorpay account). Prices stay in INR in the catalogue; fees (`CFG` in `functions/index.js`) are added on top.
- Files are delivered through the function (max ~30 MB each). Drive links themselves are never exposed.
- Legacy records that still have a `pdfUrl` and price 0 can still be opened directly; re-add them with a Drive ID to protect them.

## Go-live checklist (tick in order)
- [ ] Firebase: Email/Password sign-in on; Realtime Database created; web app config copied into `.env.local`
- [ ] Rules merged (`firebase-rules.json`) with your admin email; Firebase Blaze plan on
- [ ] `.firebaserc` has your project ID
- [ ] Drive API enabled; service account created; key saved with `firebase functions:secrets:set DRIVE_SA_KEY`
- [ ] Drive folder "Kiddie Bloom PDFs" shared (Viewer) with the service account email; folder is NOT public
- [ ] `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `DRIVE_SA_KEY` set as secrets
- [ ] `functions/.env.YOUR_PROJECT_ID` created from `functions/.env.example`; `ALLOWED_ORIGINS` edited in `functions/index.js`
- [ ] `firebase deploy --only functions`; copy the `api` URL into `VITE_API_URL` (local + GitHub variable)
- [ ] GitHub Pages domain added to Firebase Authentication > Authorized domains
- [ ] Admin: add one cheap test printable, buy it with a Razorpay test payment, confirm **Download PDF** works, then confirm a second account cannot download it
- [ ] Switch to live Razorpay keys and redeploy
