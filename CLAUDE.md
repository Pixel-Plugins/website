# pixelplugins-website

Static marketing site for pixelplugins.com — plain HTML/CSS/JS, Vite for local dev, deployed via GitHub Pages. See `README.md` for content strategy, shared-partials details, and the analytics/consent model.

## Context7 by Default
Always use Context7 for library docs, API syntax, and setup steps — even for well-known libraries (GSAP, Vite, etc). Prefer it over web search.

## Branch + PR for Every Change, No Exceptions by Default
Never commit directly to `main`. Create a feature branch, commit there, push, and open a PR — every time, regardless of how small the change looks. A prior conversation's standing permission to push straight to `main` does not carry forward to a new piece of work; if direct-to-`main` is really wanted again, that has to be said again, explicitly, in the moment. When in doubt, branch.

## Every Non-Trivial Task Gets a Plan + Tracker in `.local`
`.local/tracker.md` is the running log of what's done, in-progress, and blocked across sessions — read it before starting work, update it as you go (not just at the end). For anything bigger than a one-line fix, also write a dedicated `.local/<task-name>-plan.md` capturing context and the approach, so a fresh session (compacted, restarted, or a different person) can pick up without re-deriving everything.

## Never Reference `.local/` From Committed Code or Docs
`.local/` is gitignored — it doesn't exist for anyone besides the current checkout. Never write "see `.local/whatever.md`" into anything tracked by git (HTML, `README.md`, JS, commit messages). If a comment needs to explain *why*, write the actual reasoning inline.

## Always Run Through the Documented npm Scripts
Don't hand-roll a dev server or validation pass.
- `npm run dev` — Vite dev server
- `npm run validate` (aliased as `npm run build`) — runs `scripts/validate-site.mjs`: single `<h1>` per page, canonical/OG/Twitter meta present and matching, shared nav/footer/analytics markers present, consent controls present, no duplicate `id`s, every local `href`/`src` resolves to a real file, `target="_blank"` has `rel="noopener"`, JSON-LD is valid, canonical URLs are listed in `sitemap.xml`. **Run this before considering any HTML change done** — it's the closest thing this repo has to a test suite.
- `npm run sync:partials` — after editing `partials/nav.html`, `partials/footer.html`, or `partials/analytics.html`, propagate the change to every page, then review the diff before committing. Never hand-edit nav/footer markup inside an individual page's `<!-- nav:start/end -->` / `<!-- footer:start/end -->` region — it'll just get overwritten (or drift) the next time partials sync runs.

## Always Check the Codebase First
Before writing new CSS or JS, search for an existing pattern and match it:
- Design tokens live in `style.css`'s `:root` (colors, fonts, radius, easing, shadow) — reuse them, never hardcode a color or font.
- `main.js` already has a generic scroll-reveal (`IntersectionObserver` tagging `.card, .sec-head, .client-logo, .contact-form, .product-card` with `.reveal`) — know about it before adding a second reveal system on the same elements, or you'll get double-animation.
- Page-specific CSS/JS (used by exactly one page) still lives in the shared `style.css`/gets its own file loaded only on that page — see the `SHOPIFY SHOWCASE`, `OUR LINKS`, and `WEBSITES SHOWCASE` banner comments in `style.css` for the existing convention, and `work/work.js` for a page-scoped script.

## Verify UI Changes for Real Before Reporting Done
Run `npm run validate` first (catches structural/SEO regressions), then actually look at the page. If a headless-browser tool (`chromium-cli`, an MCP browser tool) is available, use it. If not, fall back to Playwright:
```bash
cd /tmp && npm init -y && npm install playwright && npx playwright install chromium
```
```js
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://127.0.0.1:<vite-port>', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/screenshot.png' });
await browser.close();
```
Read the resulting `.png` with the Read tool. Don't claim a visual/animation change works from source-reading alone — screenshot it, or say plainly that it wasn't visually verified.

## Keep `README.md` in Sync
When a structural convention changes (new shared-partial region, new validator rule, new top-level nav item), update `README.md` in the same session — don't leave it describing a prior version of the site.
