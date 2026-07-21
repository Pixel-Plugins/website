/* ============================================================
   PIXEL PLUGINS — main.js
   ============================================================ */

/* ---- logo mark: mint chevrons + amber pixel ---- */
function markSVG(variant) {
    var C = { brand: { s: '#5FBE85', f: '#FFB020' }, paper: { s: '#FFFCF6', f: '#FFB020' } }[variant] || { s: '#5FBE85', f: '#FFB020' };
    return '<svg viewBox="17.5 27.5 85 65" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block" xmlns="http://www.w3.org/2000/svg"><polyline points="48,32 22,60 48,88" fill="none" stroke="' + C.s + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><polyline points="72,32 98,60 72,88" fill="none" stroke="' + C.s + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><rect x="52" y="52" width="16" height="16" rx="3.5" fill="' + C.f + '"/></svg>';
}
document.querySelectorAll('[data-mk]').forEach(function (el) { el.innerHTML = markSVG(el.getAttribute('data-mk')); });

/* ---- Pixel Bloom: floating, twinkling pixel field ---- */
function mulberry(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
var PRISM = ['#95DDAC', '#FF6B57', '#14B88A', '#FFB020'];
function generateFloatField(el, opts) {
    opts = opts || {};
    var count = opts.count || 32, seed = opts.seed || 7, r = mulberry(seed);
    el.classList.add('pixel-bloom');
    for (var i = 0; i < count; i++) {
        var d = document.createElement('div');
        var size = 6 + r() * 13;
        var color = PRISM[Math.floor(r() * PRISM.length)];
        var dur = 3.5 + r() * 3.5, delay = -r() * 6, op = 0.24 + r() * 0.4;
        d.style.cssText = 'position:absolute;border-radius:3px;left:' + (r() * 100).toFixed(1) + '%;top:' + (r() * 100).toFixed(1) + '%;'
            + 'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;background:' + color + ';'
            + '--o:' + op.toFixed(2) + ';opacity:' + op.toFixed(2) + ';'
            + 'animation:pbFloat ' + dur.toFixed(2) + 's ease-in-out ' + delay.toFixed(2) + 's infinite;';
        el.appendChild(d);
    }
}
document.querySelectorAll('[data-field]').forEach(function (el) {
    var k = el.getAttribute('data-field');
    generateFloatField(el, { seed: k === 'hero' ? 11 : 33, count: k === 'hero' ? 34 : 16 });
});

/* ---- Color Bloom: soft watercolor wash ---- */
function wcFilter(id, seed, scale, blur, freq) { return '<filter id="' + id + '" x="-45%" y="-45%" width="190%" height="190%"><feTurbulence type="fractalNoise" baseFrequency="' + (freq || 0.013) + '" numOctaves="4" seed="' + seed + '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="' + scale + '" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="' + (blur == null ? 1.4 : blur) + '"/></filter>'; }
function watercolor(id, w, h, blobs) {
    var defs = '', body = '';
    blobs.forEach(function (b, i) {
        var fid = id + '-f' + i;
        defs += wcFilter(fid, b.seed != null ? b.seed : i * 7 + 3, b.scale || 34, b.blur, b.freq);
        body += '<g style="mix-blend-mode:multiply" filter="url(#' + fid + ')"><ellipse cx="' + b.cx + '" cy="' + b.cy + '" rx="' + b.rx + '" ry="' + b.ry + '" fill="' + b.c + '" opacity="' + b.op + '" transform="rotate(' + (b.rot || 0) + ' ' + b.cx + ' ' + b.cy + ')"/></g>';
    });
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>' + defs + '</defs>' + body + '</svg>';
}
function aboutBloom() {
    return watercolor('cba', 560, 420, [
        { c: '#95DDAC', cx: 220, cy: 220, rx: 200, ry: 170, op: 0.22, seed: 6, scale: 40, rot: -8 },
        { c: '#14B88A', cx: 330, cy: 260, rx: 160, ry: 140, op: 0.2, seed: 14, scale: 36, rot: 10 },
        { c: '#FFB020', cx: 270, cy: 180, rx: 110, ry: 95, op: 0.18, seed: 22, scale: 32, rot: 0 }
    ]);
}
function contactBloom() {
    return watercolor('cbc', 480, 480, [
        { c: '#FF6B57', cx: 260, cy: 220, rx: 180, ry: 160, op: 0.2, seed: 18, scale: 38, rot: 6 },
        { c: '#95DDAC', cx: 180, cy: 300, rx: 150, ry: 130, op: 0.18, seed: 26, scale: 34, rot: -12 }
    ]);
}
document.querySelectorAll('[data-cb]').forEach(function (el) {
    el.innerHTML = el.getAttribute('data-cb') === 'contact' ? contactBloom() : aboutBloom();
});

/* ---- Pixel-strip divider (rounded squares, like Atelier) ---- */
function dotStrip(w) {
    var r = mulberry(9), cell = 16, body = '<g style="mix-blend-mode:multiply">';
    for (var gx = 0; gx < w; gx += cell) {
        for (var row = 0; row < 2; row++) {
            var t = gx / w, fade = Math.sin(t * Math.PI);
            if (r() > fade * 0.85) continue;
            var color = PRISM[Math.floor(r() * PRISM.length)];
            var s = cell - 4 - (r() * 3);
            body += '<rect x="' + (gx + r() * 1.5).toFixed(1) + '" y="' + (row * cell + r() * 1.5).toFixed(1) + '" width="' + s.toFixed(1) + '" height="' + s.toFixed(1) + '" rx="' + (s * 0.28).toFixed(1) + '" fill="' + color + '" opacity="' + (0.55 * fade + 0.15).toFixed(2) + '"/>';
        }
    }
    body += '</g>';
    return '<svg viewBox="0 0 ' + w + ' ' + (cell * 2) + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
}
document.querySelectorAll('[data-strip]').forEach(function (el) { el.innerHTML = dotStrip(520); });


/* ---- Mobile menu ---- */
(function () {
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open);
    });

    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', false);
        });
    });
})();


/* ---- Nav dropdowns (Services, Platforms, Industries, Solutions) ---- */
(function () {
    const items = document.querySelectorAll('.nav-item.has-dropdown');
    if (!items.length) return;

    function closeAll() {
        items.forEach(item => {
            item.classList.remove('open');
            const t = item.querySelector('.nav-drop-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
        });
    }

    items.forEach(item => {
        const toggle = item.querySelector('.nav-drop-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !item.classList.contains('open');
            closeAll();
            item.classList.toggle('open', willOpen);
            toggle.setAttribute('aria-expanded', String(willOpen));
        });
    });

    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
})();


/* ---- Scroll reveal (IntersectionObserver) ---- */
(function () {
    const els = document.querySelectorAll('.card, .sec-head, .client-logo, .contact-form, .product-card');
    if (!els.length) return;

    els.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const grid = entry.target.closest('.cards, .clients-row');
            const index = grid ? [...grid.children].indexOf(entry.target) : 0;
            setTimeout(() => entry.target.classList.add('visible'), index * 85);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => observer.observe(el));
})();


/* ---- reCAPTCHA callback ---- */
function onSubmit(token) {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.submit();
}

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
