/* Orbit pricing: zero-dependency billing toggle and Stripe Payment Link wiring.
   URLs are imported from Stripe's live checkout CSV into checkout-links.json.
   Missing or invalid links fall back to contacting PixelPlugins rather than
   navigating to a nonexistent or untrusted payment page. */
(() => {
    const cards = [...document.querySelectorAll('[data-orbit-plan]')];
    const toggles = [...document.querySelectorAll('[data-billing-toggle]')];
    const summary = document.getElementById('orbit-pricing-billing-summary');
    if (!cards.length || !toggles.length) return;

    const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const links = {};
    let billing = 'monthly';

    const isLiveStripeLink = (candidate) => {
        if (typeof candidate !== 'string') return false;
        try {
            const url = new URL(candidate);
            return url.protocol === 'https:' && url.hostname === 'buy.stripe.com' &&
                url.pathname.length > 1 && !url.pathname.startsWith('/test_') &&
                !url.username && !url.password && !url.search && !url.hash;
        } catch {
            return false;
        }
    };

    const updateCheckout = (card) => {
        const link = card.querySelector('[data-checkout-plan]');
        if (!link) return;
        const slug = card.dataset.orbitPlan;
        const planName = card.querySelector('h3')?.textContent || 'Orbit';
        const key = `orbit_v1_${slug}_${billing}`;
        const destination = links[key];
        const icon = link.querySelector('i');
        if (isLiveStripeLink(destination)) {
            link.href = destination;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', `Choose ${planName}, ${billing} subscription. Secure Stripe checkout opens in a new tab.`);
            // Replace only the text node, preserving the icon.
            link.firstChild.textContent = 'Continue to Stripe checkout ';
        } else {
            link.href = '/contact/?service=website';
            link.removeAttribute('target');
            link.removeAttribute('rel');
            link.setAttribute('aria-label', `Ask PixelPlugins about ${planName}`);
            link.firstChild.textContent = 'Ask about this plan ';
        }
        if (icon) icon.setAttribute('aria-hidden', 'true');
    };

    const updateBilling = (period) => {
        billing = period;
        const annual = period === 'annual';
        for (const button of toggles) {
            const active = button.dataset.billingToggle === period;
            button.classList.toggle('is-current', active);
            button.setAttribute('aria-pressed', String(active));
        }
        for (const card of cards) {
            const monthly = Number(card.dataset.monthly);
            const yearly = Number(card.dataset.annual);
            card.querySelector('[data-price-value]').textContent = usd.format(annual ? yearly : monthly).replace(/\.00$/, '');
            card.querySelector('[data-price-unit]').textContent = annual ? '/ year' : '/ month';
            card.querySelector('[data-billing-detail]').textContent = annual
                ? `${usd.format(yearly / 12)} /mo equivalent · Save ${usd.format(monthly * 12 - yearly)} yearly. Billed upfront.`
                : 'Pay monthly. Cancel at the end of your current billing period.';
            updateCheckout(card);
        }
        if (summary) summary.textContent = annual
            ? 'Save 15% with 12 months paid upfront.'
            : 'Flexible month-to-month billing.';
    };

    toggles.forEach((button) => button.addEventListener('click', () => {
        updateBilling(button.dataset.billingToggle);
    }));

    cards.forEach((card) => {
        const link = card.querySelector('[data-checkout-plan]');
        if (!link) return;
        link.addEventListener('click', () => {
            if (link.hostname !== 'buy.stripe.com') return;
            if (window.PixelAnalytics) {
                window.PixelAnalytics.track('select_content', {
                    content_type: 'stripe_checkout',
                    item_id: `orbit_v1_${card.dataset.orbitPlan}_${billing}`
                });
            }
        });
    });

    updateBilling('monthly');
    fetch('/products/orbit/pricing/checkout-links.json', { cache: 'no-store', credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw new Error('Checkout link configuration unavailable');
            return response.json();
        })
        .then((data) => {
            if (!data || typeof data !== 'object' || Array.isArray(data)) return;
            for (const [key, value] of Object.entries(data)) {
                if (isLiveStripeLink(value)) links[key] = value;
            }
            updateBilling(billing);
        })
        .catch(() => { /* Contact links stay available until checkout is configured. */ });
})();
