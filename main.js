/* ============================================================
   PIXEL PLUGINS — main.js
   ============================================================ */

/* ---- Pixel Star Background (particles.js) ---- */
particlesJS('particles-js', {
    particles: {
        number: { value: 180, density: { enable: true, value_area: 1200 } },
        color: {
            value: ['#00d4ff', '#00d4ff', '#00d4ff', '#8b5cf6', '#ffffff', '#cce8ff', '#00eeff']
        },
        shape: { type: 'edge' },
        opacity: {
            value: 0.45,
            random: true,
            anim: { enable: true, speed: 0.55, opacity_min: 0.04, sync: false }
        },
        size: { value: 2, random: true, anim: { enable: false } },
        line_linked: { enable: false },
        move: {
            enable: true,
            speed: 0.22,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: false }, onclick: { enable: false }, resize: true }
    },
    retina_detect: true
});


/* ---- Header: add background once user scrolls ---- */
(function () {
    const header = document.getElementById('header');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', update, { passive: true });
    update();
})();


/* ---- Mobile menu ---- */
(function () {
    const toggle = document.querySelector('.menu-toggle');
    const links  = document.querySelector('.nav-links');
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


/* ---- Anchor smooth scroll (native, no library) ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


/* ---- Scroll reveal (IntersectionObserver) ---- */
(function () {
    const els = document.querySelectorAll('.card, .section-header, .client-item, .contact-inner, .product-card');
    if (!els.length) return;

    els.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const grid  = entry.target.closest('.cards-grid, .clients-row');
            const index = grid ? [...grid.children].indexOf(entry.target) : 0;
            setTimeout(() => entry.target.classList.add('visible'), index * 85);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => observer.observe(el));
})();


/* ---- reCAPTCHA callback ---- */
function onSubmit(token) {
    const form = document.querySelector("form[action*='formspree']");
    if (!form) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.submit();
}
