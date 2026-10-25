# The Reading Nook

A beautiful, category-focused bookstore website.

## Structure

```
the-reading-nook/
├── index.html                  ← Homepage with 4 category cards
├── css/style.css               ← All styles
├── library/
│   ├── all.html                ← MASTER page – all books with Filter + Sort
│   ├── fiction.html            ← Fiction & Stories master library
│   ├── learning.html           ← Learning & Growth master library
│   ├── gifts.html              ← Gifts & Special Reads master library
│   └── children.html           ← Children’s Books (age overview)
│       └── children/
│           ├── ages-0-3.html
│           ├── ages-4-7.html
│           ├── ages-8-12.html
│           └── ages-13-plus.html
├── books/                      ← Individual book pages (auto-generated concept)
│   ├── atomic-habits.html
│   └── the-very-hungry-caterpillar.html
└── admin/
    └── index.html              ← Admin form to assign category + generate book page
```

## Categories & Linking Rules

| Category                  | Master Library Path              | Notes |
|---------------------------|----------------------------------|-------|
| Fiction & Stories         | `/library/fiction.html`          | — |
| Learning & Growth         | `/library/learning.html`         | — |
| Children’s Books          | `/library/children.html`         | Age-based sub-pages |
| Gifts & Special Reads     | `/library/gifts.html`            | Separate gift section |

### Children’s Books – Age Factor
- Ages 0–3
- Ages 4–7
- Ages 8–12
- Ages 13+

## How Admin Works
1. Go to `/admin/`
2. Fill in book details
3. Select the **category slug** (this decides which library the book appears in)
4. The system is designed so a backend can auto-create `/books/book-slug.html` and list it in the correct master library.

## Upload Instructions
1. Unzip this folder
2. Upload the entire contents to your hosting / GitHub repository root
3. Open `index.html` to start

© 2026 The Reading Nook
```
## Premium storefront and Admin Studio

- Admin workspace: `admin/index.html`
- The admin workspace can create/update book records under `/books/{slug}` and toy/gift records under `/toys/{slug}` in Firebase Realtime Database.
- Before using the admin workspace, replace `YOUR-ADMIN-EMAIL@example.com` with the same verified admin email in **both** `js/admin-guard.js` and `firebase-rules.json`.
- Publish the updated `firebase-rules.json` rules to Firebase Realtime Database. Do not make database writes public. The admin email must be verified in Firebase Authentication.
- The order count is read-only and depends on the current database rules and existing order structure. Payment status should be verified by the server-side payment functions.
- GitHub Pages is static hosting, so creating a database product does not automatically generate a new standalone HTML file. Products are saved as catalogue data.
