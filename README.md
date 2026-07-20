# Pixel Plugins — Website

Marketing and company website for **Pixel Plugins** (pixelplugins.com).  
Plain HTML/CSS/JS — no framework, no build step beyond Vite for local dev.

---

## Quick Start

```bash
npm install
npm run dev        # starts Vite dev server and opens the browser automatically
```

Production: the site is static — deploy the root directory as-is (Vite is only used for local dev). The `CNAME` file points to `pixelplugins.com` for GitHub Pages.

---

## File Structure

```
/
├── index.html                        # Homepage (single-page)
├── style.css                         # Global stylesheet — all pages share this
├── main.js                           # Global JS — particles, scroll reveal, nav, form
├── package.json                      # Vite dev dependency only
├── CNAME                             # GitHub Pages custom domain
│
├── assets/
│   ├── brand/                        # Pixel Plugins brand assets
│   │   ├── pixel-mark.svg            # Default mark (used in nav/footer)
│   │   ├── pixel-mark-cyan.svg       # Cyan variant
│   │   ├── pixel-mark-white.svg      # White variant
│   │   ├── pixel-mark-ink.svg        # Dark/ink variant
│   │   ├── pixel-lockup.svg          # Full wordmark lockup
│   │   ├── pixel-appicon.svg         # App icon (square)
│   │   ├── pixel-appicon-512.png     # App icon 512px PNG
│   │   ├── og-image.svg              # OG/Twitter social card (1200×630)
│   │   ├── favicon.svg               # SVG favicon
│   │   ├── favicon-32.png            # 32px PNG favicon
│   │   ├── favicon-16.png            # 16px PNG favicon
│   │   ├── apple-touch-icon-180.png  # iOS home screen icon
│   │   └── Pixel Plugins Design System (standalone).html  # Full design system reference
│   │
│   ├── dmnexa/                       # Dm Nexa product assets
│   │   ├── logo.png                  # Full wordmark (used in Products section)
│   │   └── icon.png                  # Square icon
│   │
│   ├── projects/                     # Client/partner logos
│   │   ├── flywheel.png              # Flywheel logo
│   │   ├── flywheel-logo.svg         # Flywheel SVG variant
│   │   ├── buildfire.svg             # BuildFire logo (used in Clients section)
│   │   ├── buildfire-logo.svg        # BuildFire alternate SVG
│   │   ├── buildfire.webp            # BuildFire webp variant
│   │   └── shopify-logo.png          # Shopify logo
│   │
│   └── shopify-showcase/             # Screenshots for the Shopify showcase page
│       ├── 1.png                     # Shopify Login screen
│       ├── 2.png                     # Account page with Connect button
│       ├── 3.png                     # Phone entry popup
│       ├── 4.png                     # OTP verification screen
│       ├── 5.png                     # Rewards modal
│       └── 6.png                     # Connected status screen
│
├── work/
│   └── shopify-loyalty-integration/
│       └── index.html                # Shopify Loyalty Integration case study (slideshow)
│
├── articles/
│   ├── buildfire-ai-chatbot.html     # Article: BuildFire AI Chatbot plugin setup guide
│   └── hipaa-dynamic-form-builder.html  # Article: HIPAA Dynamic Form Builder guide
│
├── privacy-policy/
│   └── index.html                    # Privacy Policy page
│
├── return-policy/
│   └── index.html                    # Return Policy page
│
└── terms-and-conditions/
    └── index.html                    # Terms & Conditions page
```

---

## Homepage Sections (`index.html`)

The homepage is a single scrolling page with anchor-linked sections. Nav order matches section order.

| Section ID  | Nav Label   | Purpose |
|-------------|-------------|---------|
| `#hero`     | —           | Full-viewport hero with headline, subtitle, two CTAs |
| `#about`    | About       | Three cards: Growth Architecture, Collaborative Partners, Secure by Design |
| `#services` | Services    | Six cards covering SaaS Architecture, Compliance, AI/ML, Migrations, Plugins, DevOps |
| `#products` | Products    | Dm Nexa product card — Pixel Plugins' own SaaS product |
| `#clients`  | Clients     | Logo row: Flywheel, BuildFire, Shopify |
| `#why`      | —           | Six cards: Proven Growth, Zero-Downtime Migrations, Audit Confidence, Advisory, Custom-Built, Scalable |
| `#contact`  | Get In Touch | Contact form via Formspree + reCAPTCHA |

### Contact Form

- **Provider:** Formspree (`https://formspree.io/f/mdkgbraj`)
- **Spam protection:** Google reCAPTCHA v2 invisible (`data-sitekey` on submit button)
- **Callback:** `onSubmit(token)` in `main.js` validates the form before submitting

---

## Products Section

The `#products` section showcases **Dm Nexa** — an AI Order Assistant for social sellers, owned and built by Pixel Plugins.

- **URL:** https://dmnexa.com
- **Logo:** `/assets/dmnexa/logo.png` (with text fallback if image fails)
- **What it does:** Turns Instagram DMs, WhatsApp threads, and customer conversations into clean, seller-reviewed draft orders using AI
- **Features listed:** Instagram inbox (webhook-driven), AI extraction, draft orders, multi-platform support

To add more products in the future, duplicate the `.product-card` structure inside `#products` and wrap them in a grid.

---

## Inner Pages

All inner pages share `style.css` and `main.js` from the root. They use the `.policy-content` CSS class for a consistent card layout. Header shows logo only (no nav links). Footer shows legal links only.

| Page | Path | Description |
|------|------|-------------|
| Privacy Policy | `/privacy-policy/` | Data collection and usage policy |
| Terms & Conditions | `/terms-and-conditions/` | Service terms |
| Return Policy | `/return-policy/` | Refund and return terms |

---

## Showcases

### Shopify Loyalty Integration
**Path:** `/work/shopify-loyalty-integration/` (moved from `/shopify-showcase/`, which now redirects here)

A 7-slide interactive case study showcasing a custom Shopify private app that connects in-store loyalty programs to an online Shopify store.

- **Slides:** Overview → What We Did → Customer Flow → Admin Panel → Screens & Flow → Tech Stack → Built by Pixel Plugins
- **Tech Stack shown:** Shopify Custom App, Loyalty System Integration, Node.js, MongoDB, MySQL, AWS
- **Screenshots:** `/assets/shopify-showcase/1–6.png` (login, connect, phone entry, OTP, rewards modal, connected status)
- **Modal:** clicking any screenshot opens a full-size lightbox modal
- **Navigation:** Previous/Next buttons with disabled state on first/last slide

---

## Articles

Article pages use the `.policy-content` layout class (same as legal pages). They share the root `style.css` via relative path `../../style.css`.

| Article | Path | Description |
|---------|------|-------------|
| BuildFire AI Chatbot Setup | `/articles/buildfire-ai-chatbot.html` | Step-by-step guide: generating an OpenAI API key, configuring the BuildFire AI Chatbot plugin, setting up a Vector Store |
| HIPAA Dynamic Form Builder | `/articles/hipaa-dynamic-form-builder.html` | Guide to building and using the Dynamic Form Builder plugin in BuildFire: adding controls, editing fields, previewing, saving, email integration |

---

## Design System

The full standalone design system reference lives at:
`/assets/brand/Pixel Plugins Design System (standalone).html`

### CSS Variables (`style.css`)

```css
--bg:            #06060e    /* page background */
--surface:       #0d0d1a    /* card/panel background */
--surface-2:     #13131f    /* secondary surface */
--border:        rgba(0, 212, 255, 0.12)   /* default border */
--border-hover:  rgba(0, 212, 255, 0.38)   /* hover border */
--primary:       #00d4ff    /* cyan — primary accent */
--primary-dim:   rgba(0, 212, 255, 0.07)   /* primary tint for backgrounds */
--secondary:     #8b5cf6    /* purple — secondary accent */
--text:          #f0f0f8    /* primary text */
--text-muted:    #64748b    /* secondary/muted text */
--glow:          rgba(0, 212, 255, 0.22)
--glow-lg:       rgba(0, 212, 255, 0.1)
--font-display:  'Orbitron', monospace      /* headings, labels, nav */
--font-body:     'Inter', sans-serif        /* body text */
--radius:        12px
--radius-lg:     20px
--ease:          cubic-bezier(0.4, 0, 0.2, 1)
```

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display / headings | Orbitron | 400–900 | `h1`, `h2`, `.section-label`, `.hero-tag`, nav links |
| Logo | Space Grotesk | 600–700 | `.logo-row`, `.logo-sub` |
| Body | Inter | 300–600 | All body copy, form fields, buttons |

### Key Components

**Cards** (`.card`)
- Background: `var(--surface)`, border: `var(--border)`, radius: `var(--radius-lg)`
- On hover: lifts `-5px`, border brightens, inner cyan glow activates, top accent line appears
- Used in: About, Services, Why sections

**Buttons**
- `.btn-primary` — cyan-to-purple gradient, white text, pill shape, hover lifts + glows
- `.btn-ghost` — transparent with border, muted text, hover fills with primary dim
- `.btn-product` — same gradient as `.btn-primary`, used in the Products section

**Section Label** (`.section-label`)
- Orbitron, 0.65rem, cyan, all-caps, letter-spaced
- Decorative line before and after via `::before`/`::after`

**Scroll Reveal**
- JS adds `.reveal` class (opacity 0, translateY 22px) to: `.card`, `.section-header`, `.client-item`, `.contact-inner`, `.product-card`
- IntersectionObserver adds `.visible` when element enters viewport (threshold 0.08)
- Cards inside grids stagger with 85ms delay per index

**Particles Background**
- `particles.js` CDN, fixed canvas behind everything (`z-index: 0`)
- 180 cyan/purple/white pixel particles, slow drift, no links

**Grid Overlay**
- Fixed `64px` cyan grid pattern at 2.5% opacity — gives the sci-fi tech feel

### Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| `≤ 900px` | Stats grid goes 2-col; product card goes single-column |
| `≤ 768px` | Nav collapses to hamburger; hero font scales down; contact form goes single-col; clients gap reduces |
| `≤ 540px` | Stats go 1-col; hero buttons go full-width stacked |

---

## Brand Assets

| Asset | File | Use |
|-------|------|-----|
| Nav/footer mark | `pixel-mark.svg` | Default in all pages |
| Cyan mark | `pixel-mark-cyan.svg` | On dark colored backgrounds |
| White mark | `pixel-mark-white.svg` | On dark solid fills |
| Dark mark | `pixel-mark-ink.svg` | On light backgrounds |
| Full lockup | `pixel-lockup.svg` | Marketing materials |
| App icon | `pixel-appicon.svg` / `pixel-appicon-512.png` | App stores, app icon |
| OG image | `og-image.svg` | Social sharing card (1200×630) |
| Favicon | `favicon.svg`, `favicon-32.png`, `favicon-16.png` | Browser tabs |
| iOS icon | `apple-touch-icon-180.png` | iOS home screen |

---

## Clients / Projects

| Client | Logo File | Notes |
|--------|-----------|-------|
| Flywheel | `assets/projects/flywheel.png` | Shown in `#clients` section |
| BuildFire | `assets/projects/buildfire.svg` | Shown in `#clients`; also has articles and a plugin showcase |
| Shopify | `assets/projects/shopify-logo.png` | Shown in `#clients`; full case study at `/work/shopify-loyalty-integration/` |

---

## Adding New Content

### Add a new product to `#products`
Duplicate the `.product-card` div in `index.html`. Add the logo to `/assets/<product>/`. Add `.product-card` is already in the scroll reveal observer — no JS changes needed.

### Add a new article
Create a new `.html` file in `/articles/`. Copy the head/header/footer from an existing article. Use `<div class="policy-content">` for the body. Link to `../../style.css` and `../../main.js`.

### Add a new showcase
Create a folder at the root (e.g., `/buildfire-showcase/index.html`). Use the Shopify showcase as a template for the slideshow structure.

### Add a new client logo
Drop the image in `/assets/projects/` and add a `.client-item` div in the `#clients` section of `index.html`.

---

## External Dependencies (CDN)

| Library | Version | Purpose |
|---------|---------|---------|
| particles.js | 2.0.0 | Animated background particles |
| Phosphor Icons | 2.1.1 | All icons across the site |
| Google Fonts | — | Orbitron, Inter, Space Grotesk |
| Google reCAPTCHA | v2 | Contact form spam protection |

---

## Deployment

- Hosted on **GitHub Pages** via the `main` branch
- Custom domain set via `CNAME` file → `pixelplugins.com`
- No build step required — push to `main` and it's live
- Always create a branch + PR before merging to `main`
