THE READING NOOK - multi-page website
Pages: index.html, library.html, reviews.html, story.html, contact.html
Shared: style.css (design), app.js (books, reviews, prices, gifts, cart)

1. Open app.js. Edit the block at the top:
   - CONFIG (email, phone, WhatsApp, address, UPI ID, payment link, giftWrapFee)
   - GIFTS (free toy / sketchbook / colour set / bookmark + eligibility thresholds)
   - PRICES, OPTS (borrow/digital rates)
   - BOOKS — each book supports full metadata:
       t title, a author, c category, k cover colour,
       pub, isbn, ed, lang, pages, bind, age,
       mrp (MRP), p (selling price)
   - REVIEWS (replace samples; set sample:false for real ones)

2. Every book card shows: title, author, category, price, MRP, discount %, savings,
   pages/binding/age, quantity selector, Add to bag, Enquire, Wishlist ♥, and
   “Full details” modal with publisher, ISBN, edition, language, WhatsApp & email links.

3. Bag supports quantity, gift-wrap request, live gift eligibility banners, and
   WhatsApp order confirmation.

4. Library page includes a dedicated Offers & Terms section driven by GIFTS config.

5. Upload ALL files in this folder to any web hosting (keep them in the same folder)
   and open index.html. Mobile-responsive throughout.

6. Payments: UPI goes to your UPI ID. Add a Razorpay/PayU link in CONFIG.payLink for cards.
   Orders are confirmed when the customer sends the order on WhatsApp; there is no server
   to verify payments.
