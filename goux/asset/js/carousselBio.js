document.addEventListener('DOMContentLoaded', function() {
    const trackContainer = document.querySelector('.biographie-carousel-track-container');
    const prevBtn = document.querySelector('.biographie-carousel-prev');
    const nextBtn = document.querySelector('.biographie-carousel-next');

    if (!trackContainer || !prevBtn || !nextBtn) return;

    // Calcul dynamique de la largeur de défilement (1 slide + 1 gap)
    const getScrollAmount = () => {
        const slide = document.querySelector('.biographie-carousel-slide');
        if (slide) {
            return slide.offsetWidth + 20; // 20 est le 'gap' défini dans le CSS
        }
        return 200; // Valeur de sécurité
    };

    // Clic Précédent
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        trackContainer.scrollBy({ 
            left: -getScrollAmount(), 
            behavior: 'smooth' 
        });
    });

    // Clic Suivant
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        trackContainer.scrollBy({ 
            left: getScrollAmount(), 
            behavior: 'smooth' 
        });
    });
});