THE READING NOOK — folder layout & paths
========================================

reading-nook-site/
├── index.html                 ← Home (open this)
├── library.html               ← Browse by age
├── reviews.html
├── story.html
├── contact.html
├── assets/
│   ├── css/
│   │   └── style.css          ← shared styles
│   └── js/
│       └── app.js             ← books, prices, gifts, cart
├── books/
│   ├── book-the-sleepy-sun.html
│   ├── book-little-worlds.html
│   └── … (one page per book)
├── tools/
│   └── generate-book-pages.py ← regenerates books/*.html
└── README.txt

PATHS (already wired)
---------------------
From root pages (index, library, …):
  CSS  → assets/css/style.css
  JS   → assets/js/app.js
  Book → books/book-<slug>.html

From book pages (books/*.html):
  CSS  → ../assets/css/style.css
  JS   → ../assets/js/app.js
  Nav  → ../index.html, ../library.html, …
  Peer books → book-<slug>.html (same folder)

app.js detects whether it is on a book page and builds
correct links via BASE / pageUrl() / bookUrl().

ADD A NEW BOOK
--------------
1. Edit BOOKS in assets/js/app.js (set band: toddler|early|primary|middle|teen)
2. Run:  python3 tools/generate-book-pages.py
3. New file appears in books/
4. Upload the whole reading-nook-site folder

FEATURES
--------
• Children’s books organised by age (0–3, 3–6, 6–9, 9–12, 12+)
• Age-matched complimentary gift when buy-subtotal ≥ ₹499
• Premium gift wrap (+₹49) with optional message
• Full metadata, MRP/discount, qty, wishlist, WhatsApp enquiry
