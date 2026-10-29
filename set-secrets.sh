#!/usr/bin/env bash
# Pre-filled with your Razorpay TEST keys. Stores them in Firebase Secret Manager.
# Do NOT commit this file to GitHub (it is listed in .gitignore).
set -e
KID="rzp_test_Tteam0J8teWRiX"
KSEC="KKhpAS21fIP6rOScA742ge8m"
printf '%s' "$KID"  | firebase functions:secrets:set RAZORPAY_KEY_ID --data-file=-
printf '%s' "$KSEC" | firebase functions:secrets:set RAZORPAY_KEY_SECRET --data-file=-
read -rp "Path to Google Drive service-account JSON (Enter to skip, uses a placeholder): " SA
if [ -n "$SA" ]; then firebase functions:secrets:set DRIVE_SA_KEY --data-file="$SA"
else printf '{}' | firebase functions:secrets:set DRIVE_SA_KEY --data-file=-; fi
firebase deploy --only functions
