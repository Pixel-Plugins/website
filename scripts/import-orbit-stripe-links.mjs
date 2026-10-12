#!/usr/bin/env node
/* Imports Stripe's LIVE orbit_checkout_links_live.csv into the public,
   non-secret Payment Link manifest for /orbit/pricing/.
   Nothing is sent to Stripe, and the source CSV is never committed. */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const usage = 'Usage: node scripts/import-orbit-stripe-links.mjs /path/to/orbit_checkout_links_live.csv';
const csvPath = process.argv[2];
if (!csvPath || process.argv.length !== 3) {
    console.error(usage);
    process.exit(1);
}
if (!csvPath.endsWith('orbit_checkout_links_live.csv')) {
    console.error('Refusing non-live checkout CSV. Expected orbit_checkout_links_live.csv.');
    process.exit(1);
}

const planSlugs = new Map([
    ['Orbit | Website Care', 'website_care'],
    ['Orbit | Search & Analytics', 'search_analytics'],
    ['Orbit | Managed Website', 'managed_website'],
    ['Orbit | Organic Growth', 'organic_growth']
]);
const monthlyCents = new Map([
    ['website_care', 2900],
    ['search_analytics', 9900],
    ['managed_website', 14900],
    ['organic_growth', 29900]
]);
const expected = new Map();
for (const [slug, monthly] of monthlyCents) {
    expected.set(`orbit_v1_${slug}_monthly`, monthly);
    expected.set(`orbit_v1_${slug}_annual`, Math.round(monthly * 12 * 0.85));
}
const outputPath = resolve(fileURLToPath(new URL('../orbit/pricing/checkout-links.json', import.meta.url)));

function parseCsv(input) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (c === '"') {
            if (quoted && input[i + 1] === '"') { field += '"'; i++; }
            else quoted = !quoted;
        } else if (!quoted && c === ',') {
            row.push(field); field = '';
        } else if (!quoted && (c === '\n' || c === '\r')) {
            if (c === '\r' && input[i + 1] === '\n') i++;
            row.push(field); field = '';
            if (row.some(x => x.trim())) rows.push(row);
            row = [];
        } else field += c;
    }
    if (quoted) throw new Error('Malformed CSV: unmatched quote');
    row.push(field);
    if (row.some(x => x.trim())) rows.push(row);
    return rows;
}
function isLiveLink(raw) {
    try {
        const url = new URL(raw);
        return url.protocol === 'https:' && url.hostname === 'buy.stripe.com' &&
            url.pathname.length > 1 && !url.pathname.startsWith('/test_') &&
            !url.username && !url.password && !url.search && !url.hash;
    } catch { return false; }
}

try {
    const rows = parseCsv(readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''));
    const headers = rows.shift();
    const required = ['plan', 'interval', 'amount_usd', 'stripe_price_id', 'checkout_url'];
    const positions = Object.fromEntries(required.map(h => [h, headers?.indexOf(h) ?? -1]));
    if (Object.values(positions).some(p => p < 0)) throw new Error('CSV missing required headers');

    const urls = {};
    for (const cells of rows) {
        const get = (key) => (cells[positions[key]] || '').trim();
        const slug = planSlugs.get(get('plan'));
        const interval = get('interval') === 'month' ? 'monthly' : get('interval') === 'year' ? 'annual' : null;
        if (!slug || !interval) throw new Error(`Unexpected plan/interval: ${get('plan')} / ${get('interval')}`);
        const key = `orbit_v1_${slug}_${interval}`;
        if (key in urls) throw new Error(`Duplicate checkout link: ${key}`);
        const amount = get('amount_usd');
        if (!/^\d+\.\d{2}$/.test(amount) || Math.round(Number(amount) * 100) !== expected.get(key)) {
            throw new Error(`Unexpected price for ${key}: ${amount}`);
        }
        if (!/^price_[a-zA-Z0-9]+$/.test(get('stripe_price_id'))) throw new Error(`Invalid price ID for ${key}`);
        const url = get('checkout_url');
        if (!isLiveLink(url)) throw new Error(`Missing or non-live Stripe Payment Link for ${key}`);
        urls[key] = url;
    }

    if (Object.keys(urls).length !== expected.size) {
        throw new Error(`Expected ${expected.size} checkout links, found ${Object.keys(urls).length}`);
    }
    const ordered = Object.fromEntries([...expected.keys()].map(key => [key, urls[key]]));
    writeFileSync(outputPath, JSON.stringify(ordered, null, 2) + '\n');
    console.log(`Validated and imported ${expected.size} LIVE Stripe Payment Links to ${outputPath}`);
    console.log('Review the diff before committing. The URLs are public checkout URLs, not secret keys.');
} catch (error) {
    console.error(`Stripe checkout import failed: ${error.message}`);
    process.exitCode = 1;
}
