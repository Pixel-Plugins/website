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

        var split = new SplitText(h1, { type: 'words,chars' });
        gsap.set([eyebrow, sub].filter(Boolean), { opacity: 0, y: 20 });
        gsap.set(split.chars, { opacity: 0, y: '1.1em', rotateZ: 6 });
        gsap.set(h1, { perspective: 400 });

        var tl = gsap.timeline({ defaults: { ease: 'back.out(1.6)' } });
        if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
        tl.to(split.chars, { opacity: 1, y: 0, rotateZ: 0, duration: 0.9, stagger: 0.022 }, '-=0.3');
        if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5');
    })();

    /* ---- filmstrip: pinned, scroll-scrubbed horizontal card row.
       Scroll position drives which cards are in view (real work, not
       decoration) but the section itself stays a normal-height part of
       the page — only the row scrubs sideways, nothing takes over the
       viewport. Degrades to a native swipeable row (CSS scroll-snap) on
       small screens / reduced motion. ---- */
    (function filmstrip() {
        var section = document.querySelector('.filmstrip-section');
        var stage = section && section.querySelector('.filmstrip-stage');
        var track = section && section.querySelector('.filmstrip-track');
        if (!section || !stage || !track) return;

        var isSmall = window.matchMedia('(max-width: 880px)').matches;
        if (!hasGsap || prefersReduced() || isSmall) {
            return; // CSS handles this as a native horizontal scroll-snap row
        }

        var scrollAmount = function () {
            return Math.max(0, track.scrollWidth - stage.clientWidth);
        };

        gsap.to(track, {
            x: function () { return -scrollAmount(); },
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top top+=84',
                end: function () { return '+=' + scrollAmount(); },
                scrub: 0.6,
                pin: stage,
                invalidateOnRefresh: true
            }
        });

        window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    })();

    /* ---- elevated entrance for every section's cards, batched ---- */
    (function sectionEntrance() {
        if (!hasGsap) return;

        var mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', function () {
            ScrollTrigger.batch('.card, .showcase-card, .product-card', {
                start: 'top 92%',
                once: true,
                onEnter: function (batch) {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 64, scale: 0.86, rotateZ: -1.5 },
                        { opacity: 1, y: 0, scale: 1, rotateZ: 0, duration: 0.8, ease: 'back.out(1.5)', stagger: 0.1 });
                }
            });
            ScrollTrigger.batch('.stat-item', {
                start: 'top 92%',
                once: true,
                onEnter: function (batch) {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 24, scale: 0.8 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.12 });
                }
            });
        });
        // Reduced-motion: elements are already visible by default (no CSS
        // hides them pre-JS), so there is nothing to do in that branch —
        // fail-open by construction.

        // Images (with fixed width/height + aspect-ratio, so no layout
        // shift) can still finish decoding after ScrollTrigger's first
        // measurement pass — refresh once more after full load so trigger
        // positions for anything further down the page stay accurate.
        window.addEventListener('load', function () { ScrollTrigger.refresh(); });
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

            if (!hasGsap || prefersReduced()) {
                cards.forEach(function (c) { c.hidden = !showSetHas(c); });
                announce(showSet.length);
                return;
            }

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
                    gsap.set(c, { opacity: 0, y: 20, scale: 0.9 });
                });
                announce(showSet.length);
            });
            if (toShow.length) {
                tl.to(toShow, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)', stagger: 0.045 });
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
                var od = new Odometer({ el: el, value: 0, format: 'd', duration: 1400 });
                requestAnimationFrame(function () { od.update(target); });
            });
        }, { threshold: 0.4 });
        io.observe(statsEl);
    })();
})();
