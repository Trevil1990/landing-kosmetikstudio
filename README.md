# landing-kosmetikstudio

Static landing page for **Beauty Studio Versal** (Suhl). Stack: plain HTML5, self-hosted Bootstrap 5, vanilla CSS, and vanilla JS — no frameworks, no build step, and no backend.

**Domain:** [www.beautystudioversal.de](https://www.beautystudioversal.de)  
**Title format:** Beauty Studio Versal | Kosmetikstudio in Suhl

Business details (name, address, phone, email, hours, Google links) are written directly in the HTML.

## Local preview

There is no build step. Open the site in a browser:

- Double-click `index.html`, or
- Serve with any static file server, for example:

```bash
# Python 3
python3 -m http.server 8080

# Node (if npx is available)
npx --yes serve .
```

Then open `http://localhost:8080` (or the port shown by the server).

Legal pages: `legal/impressum.html`, `legal/datenschutz.html`.

## Project structure

- `index.html` — main landing page
- `legal/` — Impressum and Datenschutz
- `assets/` — CSS, JS, images, video, favicon
- `scripts/convert-gallery-to-webp.sh` — optional local helper for gallery images
- `sitemap.xml`, `robots.txt` — SEO crawl files

## Deploy notes

Canonical URL in the code: `https://www.beautystudioversal.de`.

After publishing (GitHub Pages or Cloudflare Pages):

1. Point DNS to the chosen host and keep one canonical host (`www` or apex).
2. Enable HTTPS.
3. Verify the site in Google Search Console and submit `sitemap.xml`.
