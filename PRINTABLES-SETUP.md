# Paid printable PDFs

PDFs are NOT stored in this (public) repo. They live in the private repo `kiddie-bloom-api`, folder `private-pdfs/`, and are sent by the Render server after payment.

## Adding a printable (admin)
1. Admin -> Printable learning library -> fill the form (it shows the exact file name, e.g. `alphabet-tracing-fun.pdf`) -> choose the PDF for the cover -> **Save**.
2. In the `kiddie-bloom-api` repo, add the PDF to `private-pdfs/` with exactly that name, commit and push (Render redeploys).
3. Back in Admin press **Publish printables to Firebase**.

Firebase holds only public metadata (`bookstore/learningResources`) plus purchases (`entitlements`, `printableOrders`). Merge the blocks from `firebase-rules.json` into your live rules with your admin email.
