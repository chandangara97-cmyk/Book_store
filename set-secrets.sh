#!/usr/bin/env bash
# Reads Razorpay keys from ./.env (not hardcoded here) and stores them in Firebase Secret Manager, then deploys.
set -e
[ -f .env ] || { echo ".env not found"; exit 1; }
set -a; . ./.env; set +a
: "${RAZORPAY_KEY_ID:?missing in .env}" "${RAZORPAY_KEY_SECRET:?missing in .env}"
printf '%s' "$RAZORPAY_KEY_ID"     | firebase functions:secrets:set RAZORPAY_KEY_ID --data-file=-
printf '%s' "$RAZORPAY_KEY_SECRET" | firebase functions:secrets:set RAZORPAY_KEY_SECRET --data-file=-
read -rp "Path to Google Drive service-account JSON (Enter to skip, uses a placeholder): " SA
if [ -n "$SA" ]; then firebase functions:secrets:set DRIVE_SA_KEY --data-file="$SA"
else printf '{}' | firebase functions:secrets:set DRIVE_SA_KEY --data-file=-; fi
firebase deploy --only functions
