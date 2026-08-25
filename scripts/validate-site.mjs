import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.pixelplugins.com";
const errors = [];

function walk(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if ([".git", "dist", "node_modules", "partials"].includes(entry.name)) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (entry.name.endsWith(".html")) out.push(full);
    }
    return out;
}

function publicUrlFor(file) {
    const rel = relative(root, file).replaceAll("\\", "/");
    if (rel === "index.html") return `${origin}/`;
    if (rel.endsWith("/index.html")) return `${origin}/${rel.slice(0, -"index.html".length)}`;
    return `${origin}/${rel}`;
}

function localTarget(fromFile, raw) {
    const withoutHash = raw.split("#")[0].split("?")[0];
    if (!withoutHash || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(withoutHash)) return null;
    let decoded;
    try { decoded = decodeURIComponent(withoutHash); } catch { decoded = withoutHash; }
    const target = decoded.startsWith("/")
        ? join(root, decoded.slice(1))
        : join(dirname(fromFile), decoded);
    return normalize(decoded.endsWith("/") ? join(target, "index.html") : target);
}

function check(condition, file, message) {
    if (!condition) errors.push(`${relative(root, file)}: ${message}`);
}

const htmlFiles = walk(root);
const excluded = new Set([
    join(root, "assets/brand/Pixel Plugins Design System - Prism.html"),
    join(root, "shopify-showcase/index.html")
]);
const publicPages = htmlFiles.filter((file) => !excluded.has(file));
const canonicals = new Map();

for (const file of publicPages) {
    const html = readFileSync(file, "utf8");
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1];
    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1]?.trim();
    const ogDescription = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)?.[1]?.trim();
    const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1];
    const twitterCard = html.match(/<meta\s+name="twitter:card"\s+content="([^"]+)"/i)?.[1];
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    check(Boolean(title), file, "missing title");
    check(Boolean(description), file, "missing meta description");
    check(Boolean(canonical), file, "missing canonical URL");
    check(canonical === publicUrlFor(file), file, `canonical should be ${publicUrlFor(file)}, found ${canonical || "none"}`);
    check(ogUrl === canonical, file, `og:url should match canonical, found ${ogUrl || "none"}`);
    check(Boolean(ogTitle && ogDescription && ogImage), file, "missing required Open Graph metadata");
    check(Boolean(twitterCard), file, "missing Twitter card metadata");
    check(!html.includes("https://pixelplugins.com"), file, "contains the redirected non-www production origin");
    check(!/(?:7670\s+Opportunity|Opportunity\s+Rd|92111)/i.test(html), file, "contains the retired street address");
    check((html.match(/<h1\b/gi) || []).length === 1, file, "must contain exactly one h1");
    check(html.includes("<!-- nav:start -->") && html.includes("<!-- nav:end -->"), file, "missing shared navigation");
    check(html.includes("<!-- footer:start -->") && html.includes("<!-- footer:end -->"), file, "missing shared footer");
    check(html.includes('<script src="/analytics.js"></script>'), file, "missing consent bootstrap");
    check(html.includes("data-consent-accept") && html.includes("data-consent-reject") && html.includes("data-consent-settings"), file, "missing consent controls");
    check(!/googletagmanager\.com\/gtag|clarity\.ms\/tag/.test(html), file, "loads a third-party analytics script before consent");
    check(duplicateIds.length === 0, file, `duplicate id values: ${[...new Set(duplicateIds)].join(", ")}`);

    if (canonical) {
        const existing = canonicals.get(canonical);
        check(!existing, file, `duplicate canonical also used by ${existing || "unknown"}`);
        canonicals.set(canonical, relative(root, file));
    }

    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/gi)) {
        const target = localTarget(file, match[1]);
        check(!target || existsSync(target), file, `broken local reference ${match[1]}`);
    }

    for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
        try { JSON.parse(match[1]); }
        catch (error) { errors.push(`${relative(root, file)}: invalid JSON-LD (${error.message})`); }
    }

    for (const match of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/gi)) {
        check(/rel="[^"]*noopener[^"]*"/i.test(match[1]), file, "target=_blank link is missing rel=noopener");
    }
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));

for (const canonical of canonicals.keys()) {
    if (!sitemapUrls.has(canonical)) errors.push(`sitemap.xml: missing ${canonical}`);
}
for (const url of sitemapUrls) {
    if (!canonicals.has(url)) errors.push(`sitemap.xml: ${url} has no canonical public HTML page`);
}

const analyticsPartial = readFileSync(join(root, "partials/analytics.html"), "utf8").trim();
if (analyticsPartial !== '<script src="/analytics.js"></script>') {
    errors.push("partials/analytics.html: expected the first-party consent bootstrap only");
}

if (errors.length) {
    console.error(`Site validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log(`Validated ${publicPages.length} public HTML pages, ${sitemapUrls.size} sitemap URLs, local references, metadata, JSON-LD, shared partials, and consent gates.`);
