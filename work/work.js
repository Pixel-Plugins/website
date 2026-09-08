/* ============================================================
   PIXEL PLUGINS — work/work.js
   Page-specific: hero reveal, elevated section entrance, the
   "Websites We've Built" filter grid, and the stat strip.
   Loaded only on /work/index.html, after gsap, ScrollTrigger,
   SplitText, Odometer, and /main.js.
   ============================================================ */
(function () {
    var prefersReduced = function () {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    var hasGsap = !!(window.gsap && window.ScrollTrigger);
    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ---- hero: one-time SplitText reveal on load ---- */
    (function heroReveal() {
        var h1 = document.querySelector('.page-hero .page-title');
        var sub = document.querySelector('.page-hero .page-sub');
        var eyebrow = document.querySelector('.page-hero .eyebrow');
        if (!h1) return;

        if (!hasGsap || !window.SplitText || prefersReduced()) {
            return; // elements are visible by default in CSS — nothing to fix
        }

        // heroReveal runs first among five sequential top-level IIFEs in
        // this file with no shared error boundary — an uncaught throw
        // here (e.g. a corrupted/partial SplitText CDN response) would
        // otherwise also silently prevent the filmstrip, card entrance,
        // filter pills, and stat counter below from ever initializing.
        try {
            var split = new SplitText(h1, { type: 'words,chars' });
            gsap.set([eyebrow, sub].filter(Boolean), { opacity: 0, y: 20 });
            gsap.set(split.chars, { opacity: 0, y: '1.1em', rotateZ: 6 });
            gsap.set(h1, { perspective: 400 });

            var tl = gsap.timeline({ defaults: { ease: 'back.out(1.6)' } });
            if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
            tl.to(split.chars, { opacity: 1, y: 0, rotateZ: 0, duration: 0.9, stagger: 0.022 }, '-=0.3');
            if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5');
        } catch (e) {
            // Elements are visible by default in CSS regardless — worst
            // case here is a missed reveal animation, not hidden content.
        }
    })();

    /* ---- filmstrip: pinned, scroll-scrubbed horizontal card row.
       Scroll position drives which cards are in view (real work, not
       decoration) but the section itself stays a normal-height part of
       the page — only the row scrubs sideways, nothing takes over the
       viewport. Base CSS (style.css) always leaves this as a native
       swipeable/scrollable row; gsap.matchMedia() below only *adds* the
       pin+scrub on top when conditions genuinely allow it, and — this
       is the point of using matchMedia here rather than a one-time
       check — automatically tears it back down (via the returned
       cleanup function) the moment the viewport crosses 880px or the
       user's reduced-motion preference changes live, no page reload
       needed either direction. ---- */
    (function filmstrip() {
        var section = document.querySelector('.filmstrip-section');
        var stage = section && section.querySelector('.filmstrip-stage');
        var track = section && section.querySelector('.filmstrip-track');
        if (!section || !stage || !track || !hasGsap) return;

        var scrollAmount = function () {
            return Math.max(0, track.scrollWidth - stage.clientWidth);
        };

        var mm = gsap.matchMedia();
        mm.add('(min-width: 881px) and (prefers-reduced-motion: no-preference)', function () {
            var tween;
            try {
                // Only flip to pinned mode once GSAP has actually confirmed
                // it can set this up — if anything in here throws, the
                // catch below removes the class again instead of leaving
                // the row stuck in overflow:hidden with no scrub running.
                section.classList.add('is-pinned');
                tween = gsap.to(track, {
                    x: function () { return -scrollAmount(); },
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top+=84',
                        end: function () { return '+=' + scrollAmount(); },
                        scrub: 0.6,
                        pin: stage,
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                });
            } catch (e) {
                section.classList.remove('is-pinned');
                return undefined;
            }

            // gsap.matchMedia() calls this automatically when the query
            // above stops matching (resize back under 881px, or the user
            // turns on reduced motion mid-session) — full teardown back
            // to the native scrollable row, not just a visual reset.
            return function () {
                section.classList.remove('is-pinned');
                if (tween && tween.scrollTrigger) tween.scrollTrigger.kill();
                if (tween) tween.kill();
                gsap.set(track, { clearProps: 'transform' });
            };
        });
    })();

    /* ---- elevated entrance for every section's cards, batched ---- */
    (function sectionEntrance() {
        if (!hasGsap) return;

        var mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', function () {
            var cardEls = gsap.utils.toArray('.card, .showcase-card, .product-card');
            var statEls = gsap.utils.toArray('.stat-item');

            // Hide immediately on load, not inside onEnter. Nothing else
            // hides these in CSS, so they render fully visible the instant
            // the page paints; if the "hidden" state only got applied at
            // the moment each batch's scroll trigger fired, the user would
            // already have seen the card normally, then watched GSAP snap
            // it invisible and pop it back in right as they scrolled to
            // it — that snap-then-reveal is exactly the flicker. Setting
            // it once here means anything below the fold is already
            // invisible long before the user ever scrolls near it.
            gsap.set(cardEls, { opacity: 0, y: 30, scale: 0.97 });
            gsap.set(statEls, { opacity: 0, y: 18, scale: 0.96 });

            ScrollTrigger.batch(cardEls, {
                start: 'top 88%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
                }
            });
            ScrollTrigger.batch(statEls, {
                start: 'top 88%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.1 });
                }
            });

            // If reduced-motion gets turned on live mid-session, this
            // query stops matching and gsap.matchMedia() calls this —
            // without it, anything not yet revealed would stay stuck at
            // opacity:0 forever once the branch above no longer applies.
            return function () {
                gsap.set(cardEls, { clearProps: 'all' });
                gsap.set(statEls, { clearProps: 'all' });
            };
        });
        // Reduced-motion (or hasGsap false, handled by the early return
        // above): elements are never touched, so they stay in their
        // natural fully-visible CSS state — fail-open by construction.
    })();

    /* ---- Websites We've Built: filter pills + grid ---- */
    (function showcase() {
        var grid = document.querySelector('.showcase-grid');
        var filterBar = document.querySelector('.showcase-filters');
        if (!grid || !filterBar) return;

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.showcase-card'));
        var liveRegion = document.getElementById('showcase-live-region');

        function announce(count) {
            if (liveRegion) liveRegion.textContent = 'Showing ' + count + ' of ' + cards.length + ' websites';
        }

        var animating = false;

        function applyFilter(tag) {
            if (animating) return;
            var showSet = cards.filter(function (c) {
                return tag === 'all' || (c.dataset.tags || '').split(' ').indexOf(tag) !== -1;
            });
            var showSetHas = function (c) { return showSet.indexOf(c) !== -1; };
            var toHide = cards.filter(function (c) { return !showSetHas(c) && !c.hidden; });
            var toShow = cards.filter(function (c) { return showSetHas(c) && c.hidden; });

            function applyInstantly() {
                cards.forEach(function (c) { c.hidden = !showSetHas(c); });
                announce(showSet.length);
            }

            if (!hasGsap || prefersReduced()) {
                applyInstantly();
                return;
            }

            try {
                animating = true;
                gsap.killTweensOf(cards);
                var tl = gsap.timeline({ onComplete: function () { animating = false; } });

                if (toHide.length) {
                    tl.to(toHide, { opacity: 0, y: 14, scale: 0.92, duration: 0.2, ease: 'power2.in', stagger: 0.015 });
                }
                tl.call(function () {
                    toHide.forEach(function (c) { c.hidden = true; });
                    toShow.forEach(function (c) {
                        c.hidden = false;
                        gsap.set(c, { opacity: 0, y: 14, scale: 0.96 });
                    });
                    announce(showSet.length);
                });
                if (toShow.length) {
                    tl.to(toShow, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out', stagger: 0.035 });
                }
            } catch (e) {
                // If GSAP throws mid-setup, don't leave `animating` stuck
                // true forever (which would freeze every future click) —
                // fall back to an instant, unanimated filter switch.
                animating = false;
                applyInstantly();
            }
        }

        filterBar.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter-pill');
            if (!btn) return;
            filterBar.querySelectorAll('.filter-pill').forEach(function (p) {
                var active = p === btn;
                p.classList.toggle('is-active', active);
                p.setAttribute('aria-pressed', String(active));
            });
            applyFilter(btn.dataset.filter);
        });
    })();

    /* ---- stat strip: Odometer count-up, fires once ---- */
    (function statStrip() {
        var statsEl = document.querySelector('.showcase-stats');
        if (!statsEl) return;

        var nums = Array.prototype.slice.call(statsEl.querySelectorAll('.stat-number'));

        function showFinalValues() {
            nums.forEach(function (el) {
                el.textContent = Number(el.dataset.odometerValue || 0);
            });
        }

        // The HTML's pre-JS fallback text is literal "0" — if this never
        // runs (no IntersectionObserver support, or fires before values
        // are set), the stats stay stuck showing 0 instead of the real
        // numbers. Guard it the same way the Odometer branch below does.
        if (!window.IntersectionObserver) {
            showFinalValues();
            return;
        }

        var io = new IntersectionObserver(function (entries, obs) {
            var hit = entries.some(function (en) { return en.isIntersecting; });
            if (!hit) return;
            obs.disconnect();
            nums.forEach(function (el) {
                var target = Number(el.dataset.odometerValue || 0);
                if (prefersReduced() || !window.Odometer) {
                    el.textContent = target;
                    return;
                }
                try {
                    var od = new Odometer({ el: el, value: 0, format: 'd', duration: 1400 });
                    requestAnimationFrame(function () { od.update(target); });
                } catch (e) {
                    el.textContent = target;
                }
            });
        }, { threshold: 0.4 });
        io.observe(statsEl);
    })();
})();
