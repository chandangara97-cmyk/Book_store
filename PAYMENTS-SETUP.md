# Turn on online payments (Razorpay, India + international)

The checkout is wired for Razorpay and stays in demo mode until you finish these steps.

1. **Razorpay account**: complete KYC, then ask Razorpay to enable *International Payments*
   (Dashboard > Settings > Payment Methods / contact support). Note your Key ID and Key Secret
   (use *Test mode* keys first).
2. **Firebase**: upgrade the project to the Blaze plan (needed for Cloud Functions), then in a terminal:
   ```
   npm install -g firebase-tools && firebase login
   firebase init functions        # choose the existing project, JavaScript, keep the files in /functions
   firebase functions:secrets:set RAZORPAY_KEY_ID
   firebase functions:secrets:set RAZORPAY_KEY_SECRET
   ```
3. In `functions/index.js` set `ALLOWED_ORIGINS` to your website address.
4. Keep prices in `functions/catalog.js` (the server ignores browser prices). Add every book you sell.
5. `firebase deploy --only functions`. Copy the `api` function URL into `ORDER_API` in `js/payments.js`.
6. Confirm the fee percentages (`FEE_*` in `js/payments.js` and `CFG` in `functions/index.js`) against razorpay.com/pricing.
7. Paste `firebase-rules.json` into Realtime Database rules. Orders are then written only by the server.
8. Test with Razorpay test cards, then switch the two secrets to live keys.

Never put the Key Secret in any file inside the website.
