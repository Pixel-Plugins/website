# PixelPlugins Website

Static marketing website for [pixelplugins.com](https://pixelplugins.com), built with plain HTML, CSS, and JavaScript. Vite is used for local development and production validation.

## Local development

```bash
npm install
npm run dev
```

Run `npm run build` before shipping. For this static site, the build command validates all 50 public pages, metadata, internal references, JSON-LD, sitemap coverage, shared partials, and analytics gates rather than producing a deployment bundle. Production is hosted from the repository through GitHub Pages; `CNAME` contains the custom domain.

## Content strategy

The primary promise is: PixelPlugins is the business-first technology partner that lets clients focus on their business while PixelPlugins owns the technology from roadmap through launch and ongoing improvement.

The main navigation is deliberately limited to:

- Services: six broad client needs, with specialized service pages retained for search and contextual links
- Platforms: BuildFire and Shopify expertise
- Work: proof and case studies
- Process: how the partnership works
- About: company, approach, and experience
- Start a conversation: primary conversion path

Industry, solution, product, and insight pages remain indexed and internally linked without competing for space in the primary header.

## Shared partials

The sources of truth for shared markup are:

- `partials/nav.html`
- `partials/footer.html`
- `partials/analytics.html`

After changing a partial, propagate it to every HTML page:

```bash
npm run sync:partials
```

Review the resulting diff before committing. `scripts/sync-partials.mjs` only rewrites regions marked with matching `<!-- name:start -->` and `<!-- name:end -->` comments.

## Analytics and consent

The site uses the existing Google Analytics 4 property `G-LD08GQX17E` and Microsoft Clarity project `xq1eetta6q`. Firebase Analytics is not needed for this static marketing site; the Firebase web analytics SDK reports to Google Analytics and would duplicate the existing web tag setup.

The implementation follows a strict, basic-consent model:

- Google Consent Mode v2 defaults are set synchronously to denied before any analytics tag can load.
- Google Analytics and Clarity scripts load only after the visitor selects **Accept analytics**.
- Advertising storage, ad-user-data, ad-personalization, and personalization storage remain denied.
- Rejecting or revoking consent disables GA events, sends denied consent updates, asks Clarity to revoke consent, and attempts to remove first-party analytics cookies.
- The choice is stored in local storage under `pixelplugins_analytics_consent_v1` so it can be honored on future pages.
- A persistent **Cookie preferences** control is available in the footer.
- Analytics events never include contact-form field values.

Consent-aware events are sent from `main.js`:

- `page_view` through GA4's standard configuration
- `select_content` for contact CTAs, consultation links, and case-study selections
- `generate_lead` after a valid contact form passes reCAPTCHA and is submitted

Mark `generate_lead` as a key event in the GA4 property. If consultation clicks should be a reporting goal, create a key event from `select_content` where `content_type` equals `consultation` and `item_id` equals `book_consultation`.

## Forms and external services

- Contact delivery: Formspree (`https://formspree.io/f/mdkgbraj`)
- Spam protection: Google reCAPTCHA v2 invisible
- Scheduling: Google Calendar appointment schedule
- Icons: Phosphor Icons 2.1.1
- Fonts: Google Fonts

reCAPTCHA and Formspree are functional/security services, not analytics, and are disclosed separately in the privacy policy.

## Important paths

```text
index.html                 Homepage and primary conversion narrative
about/                     Partnership positioning and company background
process/                   Delivery and ongoing-support model
contact/                   Short inquiry form and consultation booking
services/                  Service landing pages
platforms/                 BuildFire and Shopify landing pages
industries/                Industry landing pages
solutions/                 Solution landing pages
products/dmnexa/           DMNexa product page
work/                      Case studies and proof
articles/                  Guides and insight content
privacy-policy/            Privacy and analytics disclosures
assets/                    Brand, project, product, and showcase assets
style.css                  Shared Prism design system and consent UI
analytics.js              Consent state, GA4/Clarity loading, and analytics API
main.js                    Shared UI, form, consent, and event behavior
sitemap.xml                Search-engine URL inventory
llms.txt                   Machine-readable company and content index
```

## Content and trust guardrails

- Lead with business outcomes and accountability; use technology names only when they help a buyer make a decision.
- Support trust with specific, verifiable work. Do not invent testimonials, client relationships, or performance figures.
- Keep previous-employer experience clearly attributed to the team rather than presenting it as PixelPlugins client work.
- Do not imply that a platform logo is a direct client relationship when the work was an integration built on that platform.
- Keep specialized pages accurate and internally linked even when they are not in the primary navigation.
- Update page title, meta description, canonical URL, Open Graph tags, structured data, sitemap, and `llms.txt` when adding or moving content.

## Adding a page

1. Copy the closest existing page template.
2. Add a unique title, meta description, canonical URL, H1, and useful next step.
3. Preserve the shared partial markers.
4. Add the canonical URL to `sitemap.xml` and the appropriate section in `llms.txt`.
5. Run `npm run sync:partials` and `npm run build`.
6. Check the page at desktop and mobile widths and verify keyboard navigation, focus states, forms, and consent behavior.
