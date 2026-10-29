#!/usr/bin/env bash
# Free plan (no Blaze): runs the payment API locally on :8080 and the website on :5173.
set -e
[ -f service-account.json ] || { echo "Put your Firebase service-account.json in this folder first (see FREE-PLAN-SETUP.md)"; exit 1; }
(cd functions && npm install)
npm install
npm run api &
sleep 2
npm run dev
