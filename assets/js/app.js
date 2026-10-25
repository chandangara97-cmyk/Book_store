/* ====== EDIT THESE: your real details, books, offers and reviews ====== */
const CONFIG = {
  email: "bookstore@example.com",
  phone: "+91 00000 00000",
  whatsapp: "910000000000",
  address: "Add your bookstore address here",
  upi: "yourname@upi",
  payLink: "", // optional Razorpay / PayU link
  giftWrapFee: 49, // ₹ for gift wrapping
  giftWrapLabel: "Premium gift wrap",
  giftWrapBlurb: "Soft tissue, ribbon & a handwritten tag — ready to gift",
  giftMinSpend: 499 // minimum buy-subtotal (₹) to unlock a complimentary age-matched gift
};

/*
  AGE BANDS used across the shop:
    toddler  → Ages 0–3 / Pre-nursery
    early    → Ages 3–6 / Nursery–UKG
    primary  → Ages 6–9 / Class 1–3
    middle   → Ages 9–12 / Class 4–6
    teen     → Ages 12+ / Class 7+
*/
const AGE_BANDS = {
  toddler: { label: "Ages 0–3", short: "0–3", class: "Pre-nursery", order: 1 },
  early:   { label: "Ages 3–6", short: "3–6", class: "Nursery–UKG", order: 2 },
  primary: { label: "Ages 6–9", short: "6–9", class: "Class 1–3", order: 3 },
  middle:  { label: "Ages 9–12", short: "9–12", class: "Class 4–6", order: 4 },
  teen:    { label: "Ages 12+", short: "12+", class: "Class 7+", order: 5 }
};

// Complimentary gifts by age band (unlocked when buy-subtotal >= CONFIG.giftMinSpend)
// Pick the gift that matches the dominant age band of children's books in the bag.
const AGE_GIFTS = {
  toddler: [
    { id: "soft-rattle", label: "Soft Rattle Toy", icon: "🧸", desc: "Safe, squishy companion for little hands" },
    { id: "board-bookmark", label: "Chunky Board Bookmark", icon: "🔖", desc: "Sturdy bookmark for board books" }
  ],
  early: [
    { id: "crayon-set", label: "Jumbo Crayon Set", icon: "🖍️", desc: "Easy-grip colours for early mark-making" },
    { id: "sticker-sheet", label: "Reward Sticker Sheet", icon: "⭐", desc: "Stars & animals to celebrate reading" }
  ],
  primary: [
    { id: "colour-set", label: "Colouring Pencil Set", icon: "🎨", desc: "12 bright pencils for story-inspired art" },
    { id: "mini-sketch", label: "Mini Sketch Pad", icon: "📓", desc: "Pocket pad for doodles after reading" }
  ],
  middle: [
    { id: "sketchbook", label: "Story Sketchbook", icon: "📒", desc: "Lined + blank pages for fan stories" },
    { id: "bookmark-pack", label: "Adventure Bookmark Pack", icon: "🔖", desc: "3 illustrated bookmarks" }
  ],
  teen: [
    { id: "journal", label: "Reading Journal", icon: "📔", desc: "Track books, quotes and thoughts" },
    { id: "enamel-pin", label: "Book Lover Pin", icon: "📌", desc: "Small enamel pin for bags or jackets" }
  ]
};

// Fallback generic gifts if bag has no children's books (still need min spend)
const GENERIC_GIFTS = [
  { id: "bookmark", label: "Free Bookmark", icon: "🔖", desc: "A little something for your next read" },
  { id: "colour", label: "Free Colour Set", icon: "🎨", desc: "Colours to go with a good story" }
];

const PRICES = { Children: 199, Fiction: 299, Learning: 349, Gifts: 399 };
const OPTS = {
  buy: ["Buy · paperback", 1],
  r7: ["Borrow · 7 days", 0.2],
  r14: ["Borrow · 14 days", 0.3],
  r30: ["Borrow · 30 days", 0.45],
  dig: ["Digital copy (PDF)", 0.6]
};

// Full book records.
// band = toddler|early|primary|middle|teen (drives age-matched gifts)
// age  = human-readable label shown on cards
const BOOKS = [
  // ——— Children · Toddler (0–3) ———
  {
    t: "The Sleepy Sun", a: "Ananya Rao", c: "Children", k: "#c2813a", band: "toddler",
    pub: "Story Garden", isbn: "978-81-950001-9-8", ed: "1st", lang: "English",
    pages: 48, bind: "Board Book", age: "Ages 0–3 / Pre-nursery",
    mrp: 249, p: 179
  },
  {
    t: "Tiny Toes", a: "Rhea Malhotra", c: "Children", k: "#e8a87c", band: "toddler",
    pub: "Story Garden", isbn: "978-81-950002-3-5", ed: "1st", lang: "English",
    pages: 24, bind: "Board Book", age: "Ages 0–3 / Pre-nursery",
    mrp: 229, p: 169
  },
  // ——— Children · Early (3–6) ———
  {
    t: "Little Worlds", a: "Meera Kapoor", c: "Children", k: "#b7764e", band: "early",
    pub: "Story Garden", isbn: "978-81-950001-2-9", ed: "2nd", lang: "English",
    pages: 96, bind: "Hardcover", age: "Ages 3–6 / Nursery–UKG",
    mrp: 299, p: 199
  },
  {
    t: "Moonbeam Picnic", a: "Sana Iqbal", c: "Children", k: "#d4a574", band: "early",
    pub: "Story Garden", isbn: "978-81-950002-4-2", ed: "1st", lang: "English",
    pages: 40, bind: "Hardcover", age: "Ages 3–6 / Nursery–UKG",
    mrp: 279, p: 209
  },
  // ——— Children · Primary (6–9) ———
  {
    t: "Ziggy and the Stars", a: "Dev Sharma", c: "Children", k: "#3f7a5a", band: "primary",
    pub: "Story Garden", isbn: "978-81-950002-0-4", ed: "1st", lang: "English",
    pages: 64, bind: "Hardcover", age: "Ages 6–9 / Class 1–3",
    mrp: 299, p: 219
  },
  {
    t: "The Cloud Collector", a: "Arjun Patel", c: "Children", k: "#5b8a9a", band: "primary",
    pub: "Story Garden", isbn: "978-81-950002-5-9", ed: "1st", lang: "English",
    pages: 88, bind: "Paperback", age: "Ages 6–9 / Class 1–3",
    mrp: 269, p: 199
  },
  {
    t: "Piku's Puzzle Day", a: "Neha Joshi", c: "Children", k: "#7c9a5e", band: "primary",
    pub: "Story Garden", isbn: "978-81-950002-6-6", ed: "1st", lang: "English",
    pages: 72, bind: "Paperback", age: "Ages 6–9 / Class 1–3",
    mrp: 259, p: 189
  },
  // ——— Children · Middle (9–12) ———
  {
    t: "The Lantern Keeper", a: "Kavya Patel", c: "Children", k: "#3b4f7a", band: "middle",
    pub: "Moonlight House", isbn: "978-81-950001-5-0", ed: "1st", lang: "English",
    pages: 180, bind: "Paperback", age: "Ages 9–12 / Class 4–6",
    mrp: 350, p: 269
  },
  {
    t: "River of Secrets", a: "Aditya Rao", c: "Children", k: "#4a6b7c", band: "middle",
    pub: "Moonlight House", isbn: "978-81-950002-7-3", ed: "1st", lang: "English",
    pages: 210, bind: "Paperback", age: "Ages 9–12 / Class 4–6",
    mrp: 379, p: 289
  },
  // ——— Children · Teen (12+) ———
  {
    t: "The Art of Wonder", a: "Tanuja Sharma", c: "Children", k: "#254f42", band: "teen",
    pub: "Reading Nook Press", isbn: "978-81-950001-1-2", ed: "1st", lang: "English",
    pages: 248, bind: "Paperback", age: "Ages 12+ / Class 7+",
    mrp: 399, p: 299
  },
  {
    t: "Midnight in the Library", a: "Sahil Desai", c: "Children", k: "#5a3d6b", band: "teen",
    pub: "Page Turners", isbn: "978-81-950001-6-7", ed: "1st", lang: "English",
    pages: 276, bind: "Paperback", age: "Ages 12+ / Class 7+",
    mrp: 399, p: 299
  },
  // ——— Gifts & a couple of learning titles still available ———
  {
    t: "A Book for Every Birthday", a: "Tanuja Sharma", c: "Gifts", k: "#a14a63", band: "early",
    pub: "Reading Nook Press", isbn: "978-81-950002-1-1", ed: "1st", lang: "English",
    pages: 144, bind: "Hardcover", age: "Ages 3–8 / Gift",
    mrp: 549, p: 429
  },
  {
    t: "Make Room for Magic", a: "Aisha Khan", c: "Gifts", k: "#7c8a69", band: "primary",
    pub: "Reading Nook Press", isbn: "978-81-950001-4-3", ed: "1st", lang: "English",
    pages: 128, bind: "Hardcover", age: "Ages 6–10 / Gift",
    mrp: 499, p: 399
  },
  {
    t: "Ideas for Life", a: "Rohan Mehta", c: "Learning", k: "#a87532", band: "teen",
    pub: "Insight Books", isbn: "978-81-950001-3-6", ed: "1st", lang: "English",
    pages: 192, bind: "Paperback", age: "Ages 12+ / Class 7+",
    mrp: 449, p: 349
  },
  {
    t: "Small Habits, Big Days", a: "Imran Ali", c: "Learning", k: "#2f6b6b", band: "teen",
    pub: "Insight Books", isbn: "978-81-950001-7-4", ed: "3rd", lang: "English",
    pages: 168, bind: "Paperback", age: "Ages 12+ / Self-help",
    mrp: 399, p: 299
  }
];

const REVIEWS = [
  { n: "Meera K.", s: 5, b: "Little Worlds", t: "My daughter asks for it every single night. Perfect for Nursery age — the gift crayon set was a lovely surprise.", sample: true },
  { n: "Anita R.", s: 5, b: "The Sleepy Sun", t: "Board book quality is excellent. Ideal for our 2-year-old. Soft rattle gift matched the age perfectly.", sample: true },
  { n: "Rohan M.", s: 5, b: "Ziggy and the Stars", t: "Class 2 reader loved it. Clear print, great story, and the colouring set was a hit.", sample: true },
  { n: "Sahil D.", s: 4, b: "The Lantern Keeper", t: "My Class 5 child finished it in two days. Age label helped us pick the right level.", sample: true },
  { n: "Kavya P.", s: 5, b: "The Art of Wonder", t: "Teen shelf done right. Thoughtful recommendation and the reading journal gift was spot on.", sample: true },
  { n: "Imran A.", s: 5, b: "Piku's Puzzle Day", t: "Fun, light, and exactly right for Class 1–2. We unlocked the mini sketch pad at ₹499.", sample: true }
];
/* ============================================================== */

const BASE = (function(){
  const p = (location.pathname || "").replace(/\\/g,"/");
  if (p.includes("/books/")) return "..";
  return ".";
})();
const pageUrl = f => BASE + "/" + f;
const NIL = { style: {}, value: "", classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, textContent: "", innerHTML: "", href: "" };
const goContact = (m, i) => { try { localStorage.setItem("rn_pre", JSON.stringify({ m, i })); } catch (e) {} location.href = pageUrl("contact.html"); };
const $ = s => document.querySelector(s) || NIL;
const $$ = s => [...document.querySelectorAll(s)];
const COL = ["#245747", "#b7764e", "#7c8a69", "#a87532", "#3b4f7a", "#a14a63"];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const bookUrl = t => BASE + "/books/book-" + slug(t) + ".html";
const init = n => (n || "?").trim()[0].toUpperCase();
const colr = n => COL[(n || "").length % COL.length];

let saved = [], mine = [], bag = [], cat = "All", stars = 0, giftWrap = false, detailBook = null;
try {
  saved = JSON.parse(localStorage.getItem("rn_saved") || "[]");
  mine = JSON.parse(localStorage.getItem("rn_rev") || "[]");
  bag = JSON.parse(localStorage.getItem("rn_bag") || "[]");
} catch (e) {}

const persist = () => {
  try {
    localStorage.setItem("rn_saved", JSON.stringify(saved));
    localStorage.setItem("rn_rev", JSON.stringify(mine));
    localStorage.setItem("rn_bag", JSON.stringify(bag));
  } catch (e) {}
};

const toast = m => {
  const t = $("#toast");
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2400);
};

const bookByTitle = t => BOOKS.find(b => b.t === t);

const bandOf = b => b.band || "early";
const ageLabel = b => (AGE_BANDS[bandOf(b)] || {}).label || b.age || "";

/** Dominant age band from children's (or gifted) books in the bag */
function dominantBand() {
  const counts = {};
  bag.forEach(item => {
    const b = bookByTitle(item.t);
    if (!b || item.opt !== "buy") return;
    const band = bandOf(b);
    counts[band] = (counts[band] || 0) + item.qty;
  });
  let best = null, bestN = 0;
  Object.keys(counts).forEach(k => {
    if (counts[k] > bestN) { best = k; bestN = counts[k]; }
  });
  return best;
}

/** Complimentary gift options for current bag (age-matched when possible) */
function giftOptionsForBag(buyTotal) {
  if (buyTotal < CONFIG.giftMinSpend) return [];
  const band = dominantBand();
  if (band && AGE_GIFTS[band]) return AGE_GIFTS[band];
  return GENERIC_GIFTS;
}

const sellPrice = b => b.p || PRICES[b.c] || 0;
const mrpOf = b => b.mrp || Math.round(sellPrice(b) * 1.3);
const discPct = b => {
  const m = mrpOf(b), p = sellPrice(b);
  return m > p ? Math.round(((m - p) / m) * 100) : 0;
};
const savings = b => Math.max(0, mrpOf(b) - sellPrice(b));
const price = (b, k) => Math.round(sellPrice(b) * OPTS[k][1]);

const cover = (b, x = "") =>
  `<div class="cover" style="background:${b.k};${x}"><small>${esc(b.c)}</small><strong>${esc(b.t)}</strong><small>${esc(b.a || "The Reading Nook")}</small></div>`;

const priceBlock = b => {
  const m = mrpOf(b), p = sellPrice(b), d = discPct(b), s = savings(b);
  return `<div class="price-block">
    <span class="price">₹${p}</span>
    ${d ? `<span class="mrp">₹${m}</span><span class="disc">${d}% off</span>` : ""}
    ${s ? `<span class="save">You save ₹${s}</span>` : ""}
  </div>`;
};

const metaLine = b => {
  const parts = [];
  if (b.pages) parts.push(b.pages + " pages");
  if (b.bind) parts.push(esc(b.bind));
  return parts.join(" · ");
};
const ageBadge = b => {
  const band = bandOf(b);
  const info = AGE_BANDS[band];
  const label = info ? info.label : (b.age || "");
  return label ? `<span class="age-badge" data-band="${esc(band)}">${esc(label)}</span>` : "";
};

const optHtml = b => Object.keys(OPTS).map(k =>
  `<option value="${k}">${OPTS[k][0]} — ₹${price(b, k)}</option>`
).join("");

const card = b => `<article class="book" data-title="${esc(b.t)}">
  ${cover(b)}
  <div class="book-body">
    <div class="meta">${esc(b.c)}</div>
    <h3><a href="${bookUrl(b.t)}" style="color:inherit;text-decoration:none">${esc(b.t)}</a></h3>
    <p class="author">${esc(b.a || "")}</p>
    ${ageBadge(b)}
    ${priceBlock(b)}
    <p class="meta-line">${metaLine(b)}</p>
    <select class="opt" aria-label="Choose option">${optHtml(b)}</select>
    <div class="qty-row">
      <label>Qty</label>
      <div class="qty">
        <button type="button" class="qty-btn" data-qty="-1" aria-label="Decrease">−</button>
        <input type="number" class="qty-val" value="1" min="1" max="20" aria-label="Quantity">
        <button type="button" class="qty-btn" data-qty="1" aria-label="Increase">+</button>
      </div>
    </div>
    <div class="acts">
      <button class="btn" data-add="${esc(b.t)}">Add to bag</button>
      <button class="btn ghost" data-enq="${esc(b.t)}" title="Enquire">Ask</button>
      <button class="heart ${saved.includes(b.t) ? "on" : ""}" data-save="${esc(b.t)}" aria-label="Wishlist ${esc(b.t)}">${saved.includes(b.t) ? "♥" : "♡"}</button>
    </div>
    <div class="wrap-promo">🎀 Gift wrap available · <b>₹${CONFIG.giftWrapFee}</b> · ribbon &amp; tag</div>
    <a class="link-btn" href="${bookUrl(b.t)}">Full details →</a>
  </div>
</article>`;

const all = () => [...mine, ...REVIEWS];

const revCard = r => `<article class="rev">
  <div class="stars">${"★".repeat(r.s)}${"☆".repeat(5 - r.s)}</div>
  <p>“${esc(r.t)}”</p>
  <div class="who"><i style="background:${colr(r.n)}">${esc(init(r.n))}</i>
  <div><b>${esc(r.n)}${r.sample ? '<span class="tag">Sample</span>' : ""}</b> on ${esc(r.b)}</div></div>
</article>`;

function drawShelf() {
  const qEl = $("#q");
  const q = (qEl.value || "").toLowerCase();
  const l = BOOKS.filter(b => {
    let catOk = cat === "All" || b.c === cat;
    if (cat.startsWith("band:")) catOk = bandOf(b) === cat.slice(5);
    const qOk = !q || b.t.toLowerCase().includes(q) || (b.a || "").toLowerCase().includes(q) || (b.isbn || "").includes(q) || (b.age || "").toLowerCase().includes(q);
    return catOk && qOk;
  });
  const shelf = $("#shelf");
  if (shelf !== NIL) {
    shelf.innerHTML = l.map(card).join("");
    $("#none").style.display = l.length ? "none" : "block";
  }
}



function bagTotals() {
  let sub = 0, buyOnly = 0;
  bag.forEach(item => {
    const b = bookByTitle(item.t);
    if (!b) return;
    const unit = price(b, item.opt);
    const line = unit * item.qty;
    sub += line;
    if (item.opt === "buy") buyOnly += line;
  });
  const wrap = giftWrap ? CONFIG.giftWrapFee : 0;
  return { sub, buyOnly, wrap, total: sub + wrap };
}

function drawCart() {
  const itemsEl = $("#items");
  const totEl = $("#tot");
  const cc = $("#cc");
  if (cc !== NIL) cc.textContent = bag.reduce((n, i) => n + i.qty, 0);
  if (itemsEl === NIL) return;

  if (!bag.length) {
    itemsEl.innerHTML = `<p class="empty-bag">Your bag is empty. Add a book from the library.</p>`;
    if (totEl !== NIL) totEl.textContent = "₹0";
    const giftEl = $("#giftOffer");
    if (giftEl) giftEl.innerHTML = "";
    return;
  }

  itemsEl.innerHTML = bag.map((item, idx) => {
    const b = bookByTitle(item.t);
    if (!b) return "";
    const unit = price(b, item.opt);
    return `<div class="li bag-item">
      <div>
        <b>${esc(item.t)}</b>
        <small>${OPTS[item.opt][0]} × ${item.qty}</small>
      </div>
      <div class="bag-right">
        <span>₹${unit * item.qty}</span>
        <button type="button" class="rm" data-rm="${idx}" aria-label="Remove">×</button>
      </div>
    </div>`;
  }).join("");

  const { sub, buyOnly, wrap, total } = bagTotals();
  if (totEl !== NIL) totEl.textContent = "₹" + total;

  // Age-matched complimentary gift status
  let giftHtml = "";
  const opts = giftOptionsForBag(buyOnly);
  const need = Math.max(0, CONFIG.giftMinSpend - buyOnly);
  if (opts.length) {
    const band = dominantBand();
    const bandLabel = band && AGE_BANDS[band] ? AGE_BANDS[band].label : "your reader";
    const list = opts.map(g => `${g.icon} ${esc(g.label)}`).join(" · ");
    giftHtml = `<div class="gift-banner on">🎁 Complimentary gift unlocked for <b>${esc(bandLabel)}</b>!<br><small>Choose: ${list}. Tell us on WhatsApp.</small></div>`;
  } else if (need > 0) {
    giftHtml = `<div class="gift-banner">Add ₹${need} more in book purchases to unlock a <b>free age-matched gift</b> 🎁</div>`;
  }
  let giftSlot = $("#giftOffer");
  if (!giftSlot) {
    giftSlot = document.createElement("div");
    giftSlot.id = "giftOffer";
    itemsEl.parentNode.insertBefore(giftSlot, itemsEl.nextSibling);
  }
  giftSlot.innerHTML = giftHtml;

  // Attractive gift-wrap option card
  let wrapEl = $("#wrapToggle");
  if (!wrapEl || wrapEl === NIL) {
    wrapEl = document.createElement("div");
    wrapEl.id = "wrapToggle";
    wrapEl.className = "wrap-card";
    const anchor = giftSlot.nextSibling;
    if (anchor) giftSlot.parentNode.insertBefore(wrapEl, anchor);
    else giftSlot.parentNode.appendChild(wrapEl);
  }
  wrapEl.innerHTML = `
    <button type="button" class="wrap-choice ${giftWrap ? "on" : ""}" id="giftWrapBtn" aria-pressed="${giftWrap}">
      <span class="wrap-icon">🎀</span>
      <span class="wrap-text">
        <strong>${esc(CONFIG.giftWrapLabel || "Premium gift wrap")}</strong>
        <small>${esc(CONFIG.giftWrapBlurb || "Tissue, ribbon & handwritten tag")}</small>
      </span>
      <span class="wrap-price">+₹${CONFIG.giftWrapFee}</span>
      <span class="wrap-check" aria-hidden="true">${giftWrap ? "✓" : ""}</span>
    </button>
    <div class="wrap-note-wrap" style="display:${giftWrap ? "block" : "none"}">
      <label for="wrapNote">Gift message <span>(optional)</span></label>
      <textarea id="wrapNote" rows="2" maxlength="120" placeholder="Happy birthday, Aanya! From Mum & Dad">${esc(window.__wrapNote || "")}</textarea>
      <p class="wrap-hint">We’ll hand-write this on the tag · max 120 characters</p>
    </div>`;
  const btn = $("#giftWrapBtn");
  if (btn !== NIL) {
    btn.onclick = () => {
      giftWrap = !giftWrap;
      drawCart();
    };
  }
  const note = $("#wrapNote");
  if (note !== NIL) {
    note.addEventListener("input", e => { window.__wrapNote = e.target.value; });
  }
}

function openDetail(title) {
  const b = bookByTitle(title);
  if (!b) return;
  detailBook = b;
  let modal = $("#detailModal");
  if (!modal || modal === NIL) {
    modal = document.createElement("div");
    modal.id = "detailModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }
  const d = discPct(b), s = savings(b);
  modal.innerHTML = `
    <div class="modal-bk" data-close-modal></div>
    <div class="modal-panel">
      <button class="modal-x" data-close-modal aria-label="Close">×</button>
      <div class="modal-grid">
        ${cover(b, "max-width:200px;margin:0 auto")}
        <div>
          <div class="meta">${esc(b.c)}</div>
          <h2 style="margin:6px 0 4px">${esc(b.t)}</h2>
          <p class="author">by ${esc(b.a || "Unknown")}</p>
          ${priceBlock(b)}
          <dl class="book-meta">
            <div><dt>Publisher</dt><dd>${esc(b.pub || "—")}</dd></div>
            <div><dt>ISBN</dt><dd>${esc(b.isbn || "—")}</dd></div>
            <div><dt>Edition</dt><dd>${esc(b.ed || "—")}</dd></div>
            <div><dt>Language</dt><dd>${esc(b.lang || "—")}</dd></div>
            <div><dt>Pages</dt><dd>${b.pages || "—"}</dd></div>
            <div><dt>Binding</dt><dd>${esc(b.bind || "—")}</dd></div>
            <div><dt>Age / Class</dt><dd>${esc(b.age || "—")}</dd></div>
          </dl>
          <div class="acts" style="margin-top:16px">
            <button class="btn" data-add="${esc(b.t)}">Add to bag</button>
            <button class="btn ghost" data-enq="${esc(b.t)}">Enquire</button>
            <button class="heart ${saved.includes(b.t) ? "on" : ""}" data-save="${esc(b.t)}">${saved.includes(b.t) ? "♥" : "♡"}</button>
          </div>
          <div class="enq-links">
            <a class="btn ghost" target="_blank" rel="noopener"
               href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hi! I’d like to know more about “" + b.t + "” (ISBN " + (b.isbn || "") + ").")}">WhatsApp</a>
            <a class="btn ghost" href="mailto:${CONFIG.email}?subject=${encodeURIComponent("Enquiry: " + b.t)}&body=${encodeURIComponent("Hi,\n\nI’d like details / availability for “" + b.t + "”.\n\nThanks")}">Email</a>
          </div>
        </div>
      </div>
    </div>`;
  modal.classList.add("open");
}

function drawOffers() {
  const el = $("#offersBlock");
  if (el === NIL) return;
  const bands = ["toddler","early","primary","middle","teen"];
  el.innerHTML = `
    <div class="head"><span class="eyebrow">Children first · Age-matched gifts</span>
    <h2>Free gift when you spend ₹${CONFIG.giftMinSpend}+</h2>
    <p>Shop children’s books and unlock a complimentary gift chosen for the age of the readers in your bag. One gift per order — pick from the options for that age band.</p></div>
    <div class="gift-grid age-gift-grid">
      ${bands.map(band => {
        const info = AGE_BANDS[band];
        const gifts = AGE_GIFTS[band] || [];
        return `<div class="gift-card" data-band="${band}">
          <span class="age-pill">${esc(info.label)}</span>
          <p class="age-class">${esc(info.class)}</p>
          <ul class="gift-list">
            ${gifts.map(g => `<li><span>${g.icon}</span> ${esc(g.label)}</li>`).join("")}
          </ul>
        </div>`;
      }).join("")}
    </div>
    <div class="terms-box">
      <h3>Gift offers &amp; terms</h3>
      <ul>
        <li>Spend <strong>₹${CONFIG.giftMinSpend} or more</strong> on <strong>buy (paperback)</strong> items to unlock one complimentary gift.</li>
        <li>The gift is matched to the <strong>dominant age band</strong> of books in your bag (based on quantity).</li>
        <li>Borrow and digital options do not count toward the gift threshold.</li>
        <li>Choose your preferred gift from the age band options when you confirm on WhatsApp.</li>
        <li><strong>Premium gift wrap</strong> (₹${CONFIG.giftWrapFee}): soft tissue, ribbon and a handwritten tag. Add an optional message in the bag.</li>
        <li>Age labels (0–3, 3–6, 6–9, 9–12, 12+) help you pick the right book and unlock the right gift.</li>
        <li>Stock and offers may change. Final confirmation is via WhatsApp / email.</li>
      </ul>
    </div>`;
}

function drawAll() {
  const hs = $("#heroStack");
  if (hs !== NIL) {
    hs.innerHTML = [0, 1, 2].map(i =>
      `<div style="display:contents">${cover(BOOKS[i]).replace('class="cover"', 'class="cover s' + (i + 1) + '"')}</div>`
    ).join("");
  }
  const feat = $("#featured");
  if (feat !== NIL) feat.innerHTML = BOOKS.slice(0, 4).map(card).join("");

  const tk = all().map(r => `★ “${esc(r.t.split(".")[0])}” — ${esc(r.n)}`);
  const ticker = $("#ticker");
  if (ticker !== NIL) ticker.innerHTML = [...tk, ...tk].map(t => `<span>${t}</span>`).join("");

  const hr = $("#homeRev");
  if (hr !== NIL) hr.innerHTML = all().slice(0, 3).map(revCard).join("");

  const rl = $("#revList");
  if (rl !== NIL) rl.innerHTML = all().map(revCard).join("");

  const a = all(), n = a.length || 1;
  const avg = a.reduce((x, r) => x + r.s, 0) / n;
  const avgEl = $("#avg");
  if (avgEl !== NIL) {
    avgEl.textContent = avg.toFixed(1);
    $("#avgStars").textContent = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
    $("#cnt").textContent = `Based on ${a.length} reader review${a.length !== 1 ? "s" : ""}`;
    $("#bars").innerHTML = [5, 4, 3, 2, 1].map(s => {
      const c = a.filter(r => r.s === s).length;
      return `<div class="bar"><span>${s}★</span><span><em style="width:${(c / n) * 100}%"></em></span><span>${c}</span></div>`;
    }).join("");
  }

  const sc = $("#sc");
  if (sc !== NIL) sc.textContent = saved.length;
  drawShelf();
  drawOffers();
}

// chips
const chips = $("#chips");
if (chips !== NIL) {
  chips.innerHTML = ["All", "Fiction", "Learning", "Children", "Gifts"]
    .map(c => `<button class="chip ${c === "All" ? "on" : ""}" data-cat="${c}">${c}</button>`).join("");
}
const rb = $("#rb");
if (rb !== NIL) rb.innerHTML = BOOKS.map(b => `<option>${esc(b.t)}</option>`).join("");
const rate = $("#rate");
if (rate !== NIL) rate.innerHTML = [1, 2, 3, 4, 5].map(i => `<span data-s="${i}">★</span>`).join("");

document.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.cat) {
    cat = t.dataset.cat;
    $$(".chip").forEach(c => c.classList.toggle("on", c === t));
    drawShelf();
  }
  if (t.dataset.save) {
    const k = t.dataset.save;
    saved = saved.includes(k) ? saved.filter(x => x !== k) : [...saved, k];
    persist();
    toast(saved.includes(k) ? "Saved to wishlist ♥" : "Removed from wishlist");
    drawAll();
    drawCart();
  }
  if (t.dataset.enq) {
    goContact(
      "Hi! I’d like to enquire about “" + t.dataset.enq + "”. Is it available, and at what price?",
      "A specific title or author"
    );
  }
  if (t.dataset.detail) openDetail(t.dataset.detail);
  if (t.dataset.s) {
    stars = +t.dataset.s;
    $$("#rate span").forEach(s => s.classList.toggle("on", +s.dataset.s <= stars));
  }
  if (t.closest("#savedBtn")) {
    if (!saved.length) return toast("Tap ♥ on a book to save it");
    goContact("I’d love to enquire about these books:\n- " + saved.join("\n- "), "Book recommendations");
  }
  if (t.closest("#cartBtn") || t.dataset.close !== undefined) {
    const dr = $("#drawer");
    if (t.closest("#cartBtn")) dr.classList.add("open");
    if (t.dataset.close !== undefined) dr.classList.remove("open");
  }
  if (t.dataset.add) {
    const title = t.dataset.add;
    const art = t.closest(".book") || t.closest(".modal-panel");
    let opt = "buy", qty = 1;
    if (art) {
      const sel = art.querySelector(".opt");
      if (sel) opt = sel.value;
      const qv = art.querySelector(".qty-val");
      if (qv) qty = Math.max(1, Math.min(20, parseInt(qv.value, 10) || 1));
    }
    const existing = bag.find(i => i.t === title && i.opt === opt);
    if (existing) existing.qty += qty;
    else bag.push({ t: title, opt, qty });
    persist();
    drawCart();
    toast("Added to bag");
    $("#drawer").classList.add("open");
  }
  if (t.dataset.rm !== undefined) {
    bag.splice(+t.dataset.rm, 1);
    persist();
    drawCart();
  }
  if (t.dataset.qty) {
    const row = t.closest(".qty");
    const input = row && row.querySelector(".qty-val");
    if (input) {
      let v = parseInt(input.value, 10) || 1;
      v = Math.max(1, Math.min(20, v + +t.dataset.qty));
      input.value = v;
    }
  }
  if (t.dataset.closeModal !== undefined || t.classList.contains("modal-bk")) {
    const m = $("#detailModal");
    if (m !== NIL) m.classList.remove("open");
  }
});

const qInput = $("#q");
if (qInput !== NIL) qInput.addEventListener("input", drawShelf);

const revForm = $("#revForm");
if (revForm !== NIL) {
  revForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!stars) return toast("Please pick a star rating");
    mine.unshift({
      n: $("#rn").value.trim(),
      s: stars,
      b: $("#rb").value,
      t: $("#rt").value.trim()
    });
    persist();
    e.target.reset();
    stars = 0;
    $$("#rate span").forEach(s => s.classList.remove("on"));
    drawAll();
    toast("Thank you! Your review is up ♥");
  });
}

const cForm = $("#cForm");
if (cForm !== NIL) {
  cForm.addEventListener("submit", e => {
    e.preventDefault();
    const b = "Name: " + $("#cn").value + "\nEmail: " + $("#ce").value +
      "\nInterested in: " + $("#ci").value + "\n\n" + $("#cm").value;
    location.href = "mailto:" + CONFIG.email +
      "?subject=" + encodeURIComponent("Book enquiry from " + $("#cn").value) +
      "&body=" + encodeURIComponent(b);
  });
}

// Contact page fields
["cPhone", "cEmail", "cAddr"].forEach(id => {
  const el = $("#" + id);
  if (el === NIL) return;
  if (id === "cPhone") el.textContent = CONFIG.phone;
  if (id === "cEmail") el.textContent = CONFIG.email;
  if (id === "cAddr") el.textContent = CONFIG.address;
});
const cWa = $("#cWa");
if (cWa !== NIL) cWa.href = "https://wa.me/" + CONFIG.whatsapp;
const cMail = $("#cMail");
if (cMail !== NIL) cMail.href = "mailto:" + CONFIG.email;

const yr = $("#yr");
if (yr !== NIL) yr.textContent = new Date().getFullYear();

const burger = $("#burger");
if (burger !== NIL) {
  burger.addEventListener("click", () => {
    const l = $("#links");
    l.classList.toggle("open");
    burger.textContent = l.classList.contains("open") ? "×" : "☰";
  });
}

// Checkout form
const co = $("#co");
if (co !== NIL) {
  co.addEventListener("submit", e => {
    e.preventDefault();
    if (!bag.length) return toast("Bag is empty");
    const name = $("#on").value.trim();
    const phone = $("#op").value.trim();
    const addr = $("#oa").value.trim();
    const pm = (document.querySelector('input[name="pm"]:checked') || {}).value || "upi";
    const { sub, buyOnly, wrap, total } = bagTotals();
    const gifts = eligibleGifts(buyOnly);
    const giftNote = gifts.length ? "\nGift: " + gifts[0].label : "";
    const wrapMsg = (window.__wrapNote || "").trim();
    const wrapNote = giftWrap
      ? "\nGift wrap: Yes (+₹" + CONFIG.giftWrapFee + ")" + (wrapMsg ? "\nGift message: " + wrapMsg : "")
      : "";
    const lines = bag.map(i => {
      const b = bookByTitle(i.t);
      return `- ${i.t} (${OPTS[i.opt][0]}) × ${i.qty} = ₹${price(b, i.opt) * i.qty}`;
    }).join("\n");
    const msg = `Order from ${name}\nPhone: ${phone}\nAddress: ${addr}\nPayment: ${pm}\n\nItems:\n${lines}${giftNote}${wrapNote}\n\nSubtotal: ₹${sub}\nTotal: ₹${total}`;
    // Prefer WhatsApp confirmation
    const wa = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
    window.open(wa, "_blank");
    const done = $("#done");
    if (done !== NIL) {
      done.style.display = "block";
      done.innerHTML = `<p>Order prepared. Complete payment &amp; confirmation on WhatsApp.</p>
        <a class="btn" href="${wa}" target="_blank">Open WhatsApp →</a>
        ${CONFIG.payLink ? `<a class="btn ghost" href="${CONFIG.payLink}" target="_blank">Pay by card →</a>` : ""}`;
    }
  });
}

function route() {
  const v = document.body.dataset.page;
  $$(".links a").forEach(a => a.classList.toggle("on", a.dataset.v === v));
  const l = $("#links");
  if (l !== NIL) l.classList.remove("open");
  if (burger !== NIL) burger.textContent = "☰";
}

drawAll();
drawCart();
route();

if (document.body.dataset.page === "contact") {
  try {
    const p = JSON.parse(localStorage.getItem("rn_pre") || "null");
    if (p) {
      $("#cm").value = p.m;
      $("#ci").value = p.i;
      localStorage.removeItem("rn_pre");
    }
  } catch (e) {}
}
