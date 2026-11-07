# Kiddie Bloom — payments

Payment API = Node server on **Render** (separate private repo `kiddie-bloom-api`). Frontend = GitHub Pages. Data and login = Firebase.
Full steps and the variable list: the `kiddie-bloom-api` repo's `RENDER-SETUP.md`.

Routes: `POST /createOrder`, `POST /verifyPayment`, `POST /createPrintableOrder`, `POST /verifyPrintablePayment`, `POST /download`, `GET /downloadOnce?token=...`

Never put `RAZORPAY_KEY_SECRET` or service-account JSON in Vite variables, source files or git.
