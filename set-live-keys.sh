#!/usr/bin/env bash
# Switches the backend to LIVE Razorpay keys. Secret is typed hidden and never saved to disk.
set -e
read -rp "Razorpay LIVE Key ID (rzp_live_...): " KID
[[ "$KID" == rzp_live_* ]] || { echo "That is not a live key (must start with rzp_live_)"; exit 1; }
read -rsp "Razorpay LIVE Key Secret: " KSEC; echo
printf '%s' "$KID"  | firebase functions:secrets:set RAZORPAY_KEY_ID --data-file=-
printf '%s' "$KSEC" | firebase functions:secrets:set RAZORPAY_KEY_SECRET --data-file=-
firebase deploy --only functions
echo "Live payments are ON. Make one small real payment (e.g. Rs 1 product) to confirm, then refund it in the Razorpay Dashboard."
