# DivSprout — Project Architecture

## Stack
- HTML5 + CSS3 + Vanilla JS
- Cloudflare Pages (deploy from GitHub)
- Zero build tools, zero frameworks, zero complexity

---

## Folder Structure

```
divsprout/
├── index.html                          ← Homepage
├── calculators/
│   ├── index.html                      ← Calculators directory page
│   ├── dividend-yield/index.html       ← Dividend Yield Calculator
│   ├── drip/index.html                 ← DRIP Calculator
│   ├── income-goal/index.html          ← Income Goal Calculator
│   ├── fire-dividend/index.html        ← FIRE Dividend Calculator
│   ├── yield-on-cost/index.html        ← Yield on Cost Calculator
│   ├── monthly-income/index.html       ← Monthly Income Calculator
│   ├── ex-dividend-tracker/index.html  ← Ex-Dividend Tracker
│   └── dividend-snowball/index.html    ← Dividend Snowball Calculator
├── guides/
│   ├── index.html                      ← Guides directory
│   └── [slug]/index.html               ← Individual guide pages
├── tools/
│   └── index.html
├── about/index.html
├── privacy/index.html
├── disclaimer/index.html
├── affiliate-disclosure/index.html
├── assets/
│   ├── css/
│   │   ├── tokens.css       ← Design tokens (EDIT THIS FIRST)
│   │   ├── base.css         ← Reset + typography + layout
│   │   ├── components.css   ← All reusable UI components
│   │   └── animations.css   ← Micro-interactions
│   ├── js/
│   │   └── core.js          ← Nav, FAQ, ScrollReveal, Analytics, Utils
│   ├── icons/
│   │   ├── favicon.svg
│   │   └── apple-touch-icon.png
│   └── og-image.png
├── components/
│   └── snippets.html        ← Copy-paste component templates
├── _templates/
│   ├── calculator.html      ← Base template for new calculators
│   └── guide.html           ← Base template for new guides
├── sitemap.xml
├── robots.txt
├── _redirects               ← Cloudflare Pages redirects
└── README.md
```

---

## CSS Architecture

**Layer order (always load in this sequence):**
1. `tokens.css` — CSS custom properties. Only file to edit for theming.
2. `base.css` — Reset, typography classes, layout primitives.
3. `components.css` — UI components (.btn, .card, .calc-widget, .faq, etc.)
4. `animations.css` — Keyframes, scroll reveal, micro-interactions.
5. Page-specific styles — `<style>` block in `<head>` or separate file.

**Rules:**
- Never hardcode colors, spacing, or font values in page CSS. Use CSS vars.
- Component styles live in `components.css`, not in page files.
- Page-specific CSS only for layout unique to that page.

---

## Adding a New Calculator (Checklist)

1. Copy `_templates/calculator.html` → `calculators/[slug]/index.html`
2. Update: title, description, canonical URL, OG tags
3. Update: JSON-LD structured data (WebPage + FAQPage)
4. Write calculator logic in the `<script>` block
5. Add 5+ FAQ items with schema markup
6. Add 3 related calculators (always cross-link)
7. Add to nav / footer link lists
8. Add to calculators/index.html grid
9. Add to sitemap.xml
10. Test on mobile + tablet before deploying

---

## SEO System

**Every page must have:**
- Unique `<title>` (50-60 chars) with keyword + brand
- Unique `<meta name="description">` (120-155 chars)
- `<link rel="canonical">` pointing to itself
- H1 tag with primary keyword
- JSON-LD structured data
- Internal links to ≥3 related pages
- Breadcrumb navigation
- FAQ section with FAQPage schema

**Calculator pages target keywords:**
- Primary: "[calculator type] calculator" (e.g. "dividend yield calculator")
- Secondary: "how to calculate [metric]", "what is [metric]"
- Long-tail: "[metric] formula", "[metric] example"

---

## Performance Rules

1. Fonts: Use `display=swap`, preconnect before stylesheet link
2. Images: Always include `width` + `height` + `loading="lazy"`
3. JS: All scripts use `defer` attribute. No render-blocking JS.
4. CSS: Critical path CSS can be inlined in `<style>` in `<head>`
5. No external dependencies beyond Google Fonts
6. All calculator logic is synchronous — no async/await in calc functions
7. Cloudflare Pages auto-handles: gzip, brotli, HTTP/2, CDN

**Core Web Vitals targets:**
- LCP: < 1.5s (fonts load fast, no above-fold images)
- CLS: 0 (explicit dimensions on all elements)
- INP: < 100ms (lightweight JS, no heavy frameworks)

---

## Analytics Setup

Add to `<head>` of every page (before `</head>`):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

`DS.Analytics` in core.js wraps gtag calls. Use:
- `DS.Analytics.trackCalculator(name, inputs)` — when calc is used
- `DS.Analytics.trackAffiliate(name, position)` — on affiliate click
- `DS.Analytics.trackShare(method, calculator)` — on share/copy

---

## Affiliate System

**Link structure:** `/go/[broker-name]/` → Cloudflare redirect to affiliate URL

Add redirects to `_redirects`:
```
/go/interactive-brokers/  https://ibkr.com/?ref=YOUR_REF  301
/go/tastytrade/           https://tastytrade.com/?ref=...  301
```

This keeps affiliate URLs clean, trackable, and changeable without editing pages.

---

## Deployment (Cloudflare Pages)

1. Push to GitHub `main` branch
2. Cloudflare Pages auto-deploys
3. Custom domain: set in Cloudflare Pages dashboard
4. SSL: automatic

`_redirects` file handles:
- Affiliate link redirects
- Old URL redirects
- 404 custom page

---

## When You Have 20+ Pages

Consider a minimal build step:
```bash
# Simple Node.js script to inject nav + footer into each HTML file
node build.js
```

Or use Cloudflare HTMLRewriter for SSI-style includes.
This is the only complexity you'll ever need to add.
