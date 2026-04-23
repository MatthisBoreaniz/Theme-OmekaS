/* ===== Info-bulle alt-text sur les images ===== */
document.addEventListener("DOMContentLoaded", function () {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-alt-tooltip';
    document.body.appendChild(tooltip);

    const images = document.querySelectorAll('img');

    images.forEach(img => {
        const altText = (img.getAttribute('alt') || '').trim();

        // S'il n'y a pas de texte alt, on ignore cette image
        if (!altText) return;

        // Quand la souris ENTRE sur l'image
        img.addEventListener('mouseenter', function () {
            tooltip.textContent = altText;
            tooltip.classList.add('is-visible');
        });

        // Quand la souris BOUGE sur l'image, l'info-bulle suit le curseur
        img.addEventListener('mousemove', function (e) {
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY + 15) + 'px';
        });

        // Quand la souris SORT de l'image
        img.addEventListener('mouseleave', function () {
            tooltip.classList.remove('is-visible');
        });
    });
});