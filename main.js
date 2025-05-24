// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const numberOfParticles = 100;

    for (let i = 0; i < numberOfParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Make particles more square-like
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // Randomize animation durations and delays for more natural twinkling
        const floatDuration = Math.random() * 3 + 4;
        const twinkleDuration = Math.random() * 2 + 2;
        particle.style.animationDuration = `${floatDuration}s, ${twinkleDuration}s`;
        particle.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 2}s`;

        particlesContainer.appendChild(particle);
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollTop = 0;
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function onSubmit(token) {
    const form = document.querySelector("form[action*='formspree']");
    if (form) {
        if (!form.checkValidity()) {
            debugger;
            form.reportValidity(); // shows the validation errors in the browser
            return;
        }
        form.submit();
    }
}

// Initialize particles on load
window.addEventListener('load', createParticles);