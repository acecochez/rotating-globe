// Menu toggle functionality
const menuToggle = document.getElementById('menu-toggle');
const menuNav = document.getElementById('menu-nav');

menuToggle.addEventListener('click', () => {
    menuNav.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.menu-container')) {
        menuNav.classList.remove('active');
    }
});

// Profile image and LinkedIn URL are set directly in the HTML code

// Save name to localStorage
const authorName = document.getElementById('author-name');
const savedName = localStorage.getItem('authorName');
if (savedName) {
    authorName.textContent = savedName;
}

authorName.addEventListener('blur', () => {
    localStorage.setItem('authorName', authorName.textContent);
});

// Add particle effect on hover over card
const card = document.querySelector('.card');
card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.background = '#7DC95E';
    particle.style.pointerEvents = 'none';
    particle.style.opacity = '0.6';
    particle.style.transition = 'all 1s ease-out';

    card.appendChild(particle);

    setTimeout(() => {
        particle.style.transform = 'translate(' + (Math.random() - 0.5) * 100 + 'px, ' + (Math.random() - 0.5) * 100 + 'px) scale(0)';
        particle.style.opacity = '0';
    }, 10);

    setTimeout(() => {
        particle.remove();
    }, 1000);
});
