/* ============================================================
   PIXEL PLUGINS — home.js
   Homepage-only enhancements layered on top of main.js's existing
   reveal/bloom system: hero SplitText reveal, GSAP-powered card
   entrance (upgrades main.js's plain CSS fade to the punchier
   pop-in used on /work/ when GSAP is available — main.js's own
   system is untouched and still runs, so this always fails open),
   and a cursor-follow 3D tilt on the DMNexa product card.
   Loaded only on index.html, after gsap, ScrollTrigger, SplitText.
   ============================================================ */
(function () {
    var prefersReduced = function () {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    var hasGsap = !!(window.gsap && window.ScrollTrigger);
    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ---- hero: one-time SplitText reveal on load (same proven
       pattern as work/work.js) ---- */
    (function heroReveal() {
        var h1 = document.querySelector('.hero h1');
        var sub = document.querySelector('.hero-sub');
        var eyebrow = document.querySelector('.hero .eyebrow');
        var actions = document.querySelector('.hero-actions');
        if (!h1) return;

        if (!hasGsap || !window.SplitText || prefersReduced()) {
            return; // elements are visible by default in CSS — nothing to fix
        }

        try {
            var split = new SplitText(h1, { type: 'words,chars' });
            gsap.set([eyebrow, sub, actions].filter(Boolean), { opacity: 0, y: 20 });
            gsap.set(split.chars, { opacity: 0, y: '1.1em', rotateZ: 6 });
            gsap.set(h1, { perspective: 400 });

            var tl = gsap.timeline({ defaults: { ease: 'back.out(1.6)' } });
            if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
            tl.to(split.chars, { opacity: 1, y: 0, rotateZ: 0, duration: 0.9, stagger: 0.018 }, '-=0.3');
            if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5');
            if (actions) tl.to(actions, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
        } catch (e) {
            // Elements are visible by default in CSS regardless.
        }
    })();

    /* ---- elevated entrance for every card, batched. main.js's own
       IntersectionObserver reveal already fired .reveal/.visible on
       these same elements — its CSS fade stays as the fail-open
       baseline; this only replaces the visual with GSAP's punchier
       pop-in when GSAP is actually available. ---- */
    (function sectionEntrance() {
        if (!hasGsap) return;

        var mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', function () {
            var cardEls = gsap.utils.toArray('.card, .showcase-card, .product-card');
            gsap.set(cardEls, { opacity: 0, y: 30, scale: 0.97 });

            ScrollTrigger.batch(cardEls, {
                start: 'top 88%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 });
                }
            });

            return function () {
                gsap.set(cardEls, { clearProps: 'all' });
            };
        });
    })();

    /* ---- DMNexa product card: cursor-follow 3D tilt. Desktop/hover-
       capable pointers only — matchMedia handles teardown if the
       pointer type changes (rare, but free correctness via the same
       gsap.matchMedia pattern used above and in work/work.js). ---- */
    (function productTilt() {
        var card = document.querySelector('.product-card');
        if (!card || !hasGsap) return;

        var mm = gsap.matchMedia();
        mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
            var rotX, rotY;
            try {
                rotX = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3.out' });
                rotY = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3.out' });
            } catch (e) {
                return undefined;
            }

            function onMove(e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                rotY(px * 10);
                rotX(py * -10);
            }
            function onLeave() {
                rotX(0);
                rotY(0);
            }

            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);

            return function () {
                card.removeEventListener('mousemove', onMove);
                card.removeEventListener('mouseleave', onLeave);
                gsap.set(card, { clearProps: 'transform' });
            };
        });
    })();

    /* ---- dot-strip dividers: scatter apart, then assemble back into
       the strip on scroll-enter. main.js's dotStrip() already rendered
       every rect at its correct final position by the time this runs
       (main.js loads and executes before this script) — GSAP just
       offsets them out with a random x/y and animates back to (0,0),
       which is their real position, so a GSAP failure leaves every dot
       exactly where it belongs, just without the assemble effect. ---- */
    (function dotStripScatter() {
        if (!hasGsap) return;

        var mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', function () {
            document.querySelectorAll('.dot-div').forEach(function (strip, stripIndex) {
                var dots = strip.querySelectorAll('svg rect');
                if (!dots.length) return;

                var seed = stripIndex * 97 + 11;
                function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed % 1000) / 1000; }

                var dotsArr = Array.prototype.slice.call(dots);
                gsap.set(dotsArr, {
                    x: function () { return (rand() - 0.5) * 260; },
                    y: function () { return (rand() - 0.5) * 90; },
                    opacity: 0,
                    rotation: function () { return (rand() - 0.5) * 180; }
                });

                ScrollTrigger.create({
                    trigger: strip,
                    start: 'top 90%',
                    once: true,
                    onEnter: function () {
                        gsap.to(dotsArr, { x: 0, y: 0, opacity: 1, rotation: 0, duration: 0.9, ease: 'power3.out', stagger: { each: 0.006, from: 'random' } });
                    }
                });
            });

            return function () {
                document.querySelectorAll('.dot-div svg rect').forEach(function (dot) {
                    gsap.set(dot, { clearProps: 'all' });
                });
            };
        });
    })();

    /* ---- icon cards: border traces itself in on scroll-enter, once.
       CSS defaults --draw to 100% (fully drawn) so a card looks
       intentional even if this never runs — JS only pulls it back to
       0% first, then animates up, never leaving a half-drawn state
       stuck on screen if something fails mid-way (the proxy tween's
       onUpdate is the only thing touching the property, and once:true
       + a single ScrollTrigger per card keeps that simple). ---- */
    (function cardBorderDraw() {
        if (!hasGsap) return;

        var mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', function () {
            var cards = document.querySelectorAll('.icon-mint, .icon-coral, .icon-amber, .icon-emerald, .icon-nexa');
            cards.forEach(function (card) {
                card.style.setProperty('--draw', '0%');
                var proxy = { v: 0 };
                ScrollTrigger.create({
                    trigger: card,
                    start: 'top 90%',
                    once: true,
                    onEnter: function () {
                        gsap.to(proxy, {
                            v: 100,
                            duration: 0.9,
                            delay: 0.15,
                            ease: 'power2.inOut',
                            onUpdate: function () { card.style.setProperty('--draw', proxy.v + '%'); }
                        });
                    }
                });
            });

            return function () {
                cards.forEach(function (card) { card.style.removeProperty('--draw'); });
            };
        });
    })();
})();
