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
        gsap.set([eyebrow, sub].filter(Boolean), { opacity: 0, y: 14 });
        gsap.set(split.chars, { opacity: 0, y: '0.6em' });

        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 });
        tl.to(split.chars, { opacity: 1, y: 0, duration: 0.6, stagger: 0.012 }, '-=0.25');
        if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
    })();

    /* ---- elevated entrance for every section's cards, batched ---- */
    (function sectionEntrance() {
        if (!hasGsap) return;

        var mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', function () {
            ScrollTrigger.batch('.card, .showcase-card, .product-card', {
                start: 'top 90%',
                once: true,
                onEnter: function (batch) {
                    gsap.fromTo(batch,
                        { opacity: 0, y: 26, scale: 0.97 },
                        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', stagger: 0.07 });
                }
            });
        });
        // Reduced-motion: elements are already visible by default (no CSS
        // hides them pre-JS), so there is nothing to do in that branch —
        // fail-open by construction.
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
                tl.to(toHide, { opacity: 0, y: 8, scale: 0.96, duration: 0.18, ease: 'power2.in', stagger: 0.012 });
            }
            tl.call(function () {
                toHide.forEach(function (c) { c.hidden = true; });
                toShow.forEach(function (c) {
                    c.hidden = false;
                    gsap.set(c, { opacity: 0, y: 8, scale: 0.96 });
                });
                announce(showSet.length);
            });
            if (toShow.length) {
                tl.to(toShow, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power2.out', stagger: 0.03 });
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
