#!/usr/bin/env python3
"""
Generate a dedicated HTML page for every book defined in app.js.

Usage:
  1. Edit BOOKS array in app.js (add/remove/change books).
  2. Run:  python3 generate-book-pages.py
  3. New/updated book-*.html files are written into this folder.
  4. Upload the whole folder to your host.

Pages are permanent static files — they stay until you delete or regenerate them.
"""
import re, html
from pathlib import Path

base = Path(__file__).resolve().parent.parent  # site root (parent of tools/)
app = (base / "assets" / "js" / "app.js").read_text(encoding="utf-8")
m = re.search(r"const BOOKS\s*=\s*(\[[\s\S]*?\]);\s*\nconst REVIEWS", app)
if not m:
    raise SystemExit("Could not find BOOKS array in app.js")
raw = m.group(1)
objs = re.findall(r"\{[^{}]+\}", raw)
books = []
for o in objs:
    d = {}
    for key in ["t","a","c","k","pub","isbn","ed","lang","pages","bind","age","mrp","p"]:
        mm = re.search(rf'{key}\s*:\s*"([^"]*)"', o) or re.search(rf"{key}\s*:\s*'([^']*)'", o)
        if mm:
            d[key] = mm.group(1)
        else:
            mm = re.search(rf"{key}\s*:\s*(\d+)", o)
            if mm:
                d[key] = int(mm.group(1))
    if "t" in d:
        books.append(d)

def slug(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")

def page_html(b, all_books):
    title = b.get("t", "")
    author = b.get("a", "")
    cat = b.get("c", "")
    color = b.get("k", "#254f42")
    pub = b.get("pub", "—")
    isbn = b.get("isbn", "—")
    ed = b.get("ed", "—")
    lang = b.get("lang", "—")
    pages = b.get("pages", "—")
    bind = b.get("bind", "—")
    age = b.get("age", "—")
    mrp = b.get("mrp") or 0
    price = b.get("p") or 0
    disc = round((mrp - price) / mrp * 100) if mrp and price and mrp > price else 0
    save = max(0, (mrp or 0) - (price or 0))
    related = [x for x in all_books if x.get("c") == cat and x.get("t") != title][:3]
    related_html = ""
    for r in related:
        rs = slug(r["t"])
        related_html += f"""
        <a class="book" href="book-{rs}.html" style="text-decoration:none;color:inherit">
          <div class="cover" style="background:{r.get("k","#254f42")}"><small>{html.escape(r.get("c",""))}</small><strong>{html.escape(r.get("t",""))}</strong><small>{html.escape(r.get("a",""))}</small></div>
          <div class="book-body">
            <div class="meta">{html.escape(r.get("c",""))}</div>
            <h3>{html.escape(r.get("t",""))}</h3>
            <p class="author">{html.escape(r.get("a",""))}</p>
          </div>
        </a>"""
    disc_html = f"<span class='mrp'>₹{mrp}</span><span class='disc'>{disc}% off</span>" if disc else ""
    save_html = f"<span class='save'>You save ₹{save}</span>" if save else ""
    related_section = ""
    if related_html:
        related_section = f"""<div class="sec alt"><div class="wrap"><div class="head"><span class="eyebrow">More in {html.escape(cat)}</span><h2>You may also like</h2></div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">{related_html}</div></div></div>"""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{html.escape(title)} by {html.escape(author)}. {html.escape(str(pages))} pages, {html.escape(str(bind))}. Buy, borrow or digital from The Reading Nook.">
<title>{html.escape(title)} — {html.escape(author)} | The Reading Nook</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body data-page="book">
<div class="top">A LITTLE SPACE FOR BIG IDEAS · WELCOME, BOOK LOVERS</div>
<header class="nav"><div class="wrap">
<a class="brand" href="../index.html"><span class="mark">✦</span><span>The Reading Nook<small>Books · Ideas · Possibilities</small></span></a>
<nav class="links" id="links"><a href="../index.html" data-v="home">Home</a><a href="../library.html" data-v="books">Library</a><a href="../reviews.html" data-v="reviews">Reader Love</a><a href="../story.html" data-v="story">Our Story</a><a href="../contact.html" data-v="contact">Contact</a></nav>
<div class="row" style="gap:10px"><button class="saved" id="savedBtn" title="Your saved books">♥ <span id="sc">0</span></button><button class="saved" id="cartBtn" title="Your bag">🛒 <span id="cc">0</span></button><button class="burger" id="burger" aria-label="Menu">☰</button></div>
</div></header>
<main>
<section class="view">
<div class="sec"><div class="wrap">
  <p class="crumb"><a href="../library.html">Library</a> · <a href="../library.html">{html.escape(cat)}</a> · {html.escape(title)}</p>
  <div class="modal-grid" style="margin-top:12px">
    <div>
      <div class="cover" style="background:{color};max-width:260px;margin:0 auto"><small>{html.escape(cat)}</small><strong>{html.escape(title)}</strong><small>{html.escape(author)}</small></div>
    </div>
    <div>
      <div class="meta">{html.escape(cat)}</div>
      <h1 style="font-size:clamp(28px,4vw,40px);margin:8px 0 6px">{html.escape(title)}</h1>
      <p class="author" style="font-size:16px">by {html.escape(author)}</p>
      <div class="price-block" style="margin:14px 0">
        <span class="price">₹{price}</span>
        {disc_html}
        {save_html}
      </div>
      <dl class="book-meta">
        <div><dt>Publisher</dt><dd>{html.escape(str(pub))}</dd></div>
        <div><dt>ISBN</dt><dd>{html.escape(str(isbn))}</dd></div>
        <div><dt>Edition</dt><dd>{html.escape(str(ed))}</dd></div>
        <div><dt>Language</dt><dd>{html.escape(str(lang))}</dd></div>
        <div><dt>Pages</dt><dd>{pages}</dd></div>
        <div><dt>Binding</dt><dd>{html.escape(str(bind))}</dd></div>
        <div><dt>Age / Class</dt><dd>{html.escape(str(age))}</dd></div>
      </dl>
      <div style="margin-top:18px">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:6px">How would you like it?</label>
        <select class="opt" id="bookOpt" aria-label="Choose option" style="max-width:320px">
          <option value="buy">Buy · paperback — ₹{price}</option>
          <option value="r7">Borrow · 7 days — ₹{max(1,round(price*0.2))}</option>
          <option value="r14">Borrow · 14 days — ₹{max(1,round(price*0.3))}</option>
          <option value="r30">Borrow · 30 days — ₹{max(1,round(price*0.45))}</option>
          <option value="dig">Digital copy (PDF) — ₹{max(1,round(price*0.6))}</option>
        </select>
      </div>
      <div class="qty-row" style="margin-top:12px">
        <label>Qty</label>
        <div class="qty">
          <button type="button" class="qty-btn" data-qty="-1" aria-label="Decrease">−</button>
          <input type="number" class="qty-val" id="bookQty" value="1" min="1" max="20" aria-label="Quantity">
          <button type="button" class="qty-btn" data-qty="1" aria-label="Increase">+</button>
        </div>
      </div>
      <div class="acts" style="margin-top:16px;max-width:360px">
        <button class="btn" data-add="{html.escape(title)}" id="addBtn">Add to bag</button>
        <button class="btn ghost" data-enq="{html.escape(title)}">Ask</button>
        <button class="heart" data-save="{html.escape(title)}" aria-label="Wishlist">♡</button>
      </div>
      <div class="wrap-promo" style="margin-top:14px;max-width:360px">🎀 <div><b>Premium gift wrap</b> · ₹49<br><span style="opacity:.85">Soft tissue, ribbon &amp; handwritten tag — add a message in your bag</span></div></div>
      <div class="enq-links">
        <a class="btn ghost" target="_blank" rel="noopener"
           href="https://wa.me/910000000000?text=Hi!%20I%E2%80%99d%20like%20to%20know%20more%20about%20%E2%80%9C{html.escape(title)}%E2%80%9D%20(ISBN%20{html.escape(str(isbn))}).">WhatsApp</a>
        <a class="btn ghost" href="mailto:bookstore@example.com?subject=Enquiry:%20{html.escape(title)}">Email</a>
      </div>
    </div>
  </div>
</div></div>
{related_section}
</section>
</main>
<footer class="foot"><div class="wrap"><div><b>The Reading Nook</b><br>Curiosity, one page at a time.</div><div>Welcome from Tanuja Sharma · © <span id="yr"></span></div><div class="row" style="gap:16px"><a href="../library.html">Books</a><a href="../reviews.html">Reader Love</a><a href="../contact.html">Contact</a></div></div></footer>
<div class="drawer" id="drawer"><div class="dbk" data-close></div><aside class="dp"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Your library bag</h3><button class="burger" style="display:block" data-close aria-label="Close">×</button></div><div id="items"></div><div class="li"><b>Total</b><b id="tot">₹0</b></div>
<form id="co" style="margin-top:14px"><input id="on" required placeholder="Your name"><input id="op" required type="tel" placeholder="Phone / WhatsApp" style="margin-top:8px"><textarea id="oa" rows="2" placeholder="Delivery address (or write ‘pickup’)" style="margin-top:8px"></textarea><label style="font-size:12px;font-weight:700;margin:12px 0 6px;display:block">Pay with</label><div class="pm"><label><input type="radio" name="pm" value="upi" checked> UPI · scan or tap (GPay, PhonePe, Paytm)</label><label><input type="radio" name="pm" value="card"> Card / Net banking (secure link)</label><label><input type="radio" name="pm" value="store"> Pay at store / on delivery</label></div><button class="btn" style="width:100%;margin-top:14px" type="submit">Place order &amp; pay →</button></form><div id="done" style="display:none"></div></aside></div>
<div class="toast" id="toast"></div>
<script src="../assets/js/app.js"></script>
<style>
.crumb{{font-size:12px;color:var(--muted);margin:0 0 8px}}
.crumb a{{color:var(--gold2);font-weight:600}}
body[data-page="book"] h1{{font-family:'Playfair Display',Georgia,serif}}
</style>
</body>
</html>
"""

print(f"Found {len(books)} books in app.js")
for b in books:
    s = slug(b["t"])
    fname = f"book-{s}.html"
    (base / "books" / fname).write_text(page_html(b, books), encoding="utf-8")
    print(f"  ✓ {fname}")
print("Done. Individual book pages are saved and ready to upload.")
