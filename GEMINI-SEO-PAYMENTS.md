# Kiddie Bloom SEO and payment updates

- Added canonical URL, Google crawler metadata, Open Graph and Twitter previews.
- Added OnlineStore JSON-LD structured data for search/AI understanding.
- Added `robots.txt` allowing Googlebot and Google-Extended, plus a sitemap.
- Removed the simulated payment-success modal. Both Razorpay Test and Live keys now use Razorpay Checkout.
- Kept server-side signature verification before confirming payment or issuing printable download tokens.
- Added explicit missing-API configuration errors instead of silently calling a same-origin `/api` route.
- Razorpay checkout script loading is asynchronous, cached, retryable after load failure, and preloaded by the printable checkout UI.

Important: Google/Gemini do not provide a special guaranteed-ranking "Gemini meta tag". Standard crawlable content, structured data, accurate metadata and sitemap are the supported discoverability signals. Gemini visibility is not guaranteed.
