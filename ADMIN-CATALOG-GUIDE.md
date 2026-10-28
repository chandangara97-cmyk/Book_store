# Kiddie Bloom — Admin catalogue guide

## Open the admin workspace

1. Deploy the website and configure Firebase using `FIREBASE-SETUP.md`.
2. Sign in with a Firebase Authentication account whose email is included in the configured admin allowlist. A normal customer account must not have admin privileges.
3. Open the Admin view from the site's admin navigation/control. If you are not signed in with an allowed account, the page will show the sign-in prompt.

## Add or edit a book

1. In **Product studio**, choose **Books**.
2. Enter a title, product ID/slug, author, price, category, cover image URL (or emoji), age range, description, and comma-separated tags.
3. Select **Save product**. Existing products with the same ID are updated; a new ID creates a new book.
4. Use **Book & product manager** to search the catalogue and select **Edit** to load an existing product into the form.
5. Use **Remove** to remove a product from the local admin workspace. Confirm the prompt before removal.

## Publish changes

- **Fetch from Firebase** loads the currently published books and toys into the admin workspace. Fetch first if another admin may have changed the catalogue.
- **Push catalog to Firebase** publishes the current workspace to the public `books` and `toys` branches. Review changes first: this replaces both catalogue branches with the workspace contents, including removals.
- Saving a product or removing it locally does not publish automatically. Push when the catalogue is ready.

## Paid PDF printables

Use the **Printable learning library** section for paid printable PDF products. Keep the Google Drive PDF private and save its file ID only in the admin-only `learningPrivate` branch. Do not put private PDF file IDs or unrestricted download links in public book metadata. Publish the printable metadata after saving its private file reference.

## Security notes

- Keep Firebase admin allowlist configuration and server/payment secrets private.
- Do not put service-account keys or payment secret keys in browser code or this ZIP.
- Test with a non-admin account to verify it cannot edit, publish, or remove catalogue data.
- Test a real payment in the payment provider's test mode before accepting live orders.
