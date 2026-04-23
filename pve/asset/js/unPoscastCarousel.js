document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.unPodcast-carousel-track');
    const windowEl = document.querySelector('.unPodcast-carousel-window');
    const slides = document.querySelectorAll('.unPodcast-carousel-slide');
    const dotsContainer = document.querySelector('.unPodcast-carousel-dots');
    const prevBtn = document.querySelector('.unPodcast-carousel-prev');
    const nextBtn = document.querySelector('.unPodcast-carousel-next');

    if(!track || slides.length === 0) return;

    let currentIndex = 0;
    let slideInterval;
    let snapPoints = []; // NOUVEAU: calcul dynamique des positions pour ne jamais rater la fin

    // Variables pour le swipe
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let draggedDiff = 0;
    let indexAtDragStart = 0;

    // Cette fonction scanne le DOM tel qu'il est rendu, 
    // trouvant la véritable fin peu importe le CSS, les marges, ou les flex gaps.
    function calculateSnapPoints() {
        snapPoints = [];
        const trackRect = track.getBoundingClientRect();
        
        // scrollWidth = taille totale du contenu, clientWidth = fenêtre visible
        // maxTranslate = déplacement maximum possible pour atteindre la fin sans vide
        const maxTranslate = Math.max(0, track.scrollWidth - track.clientWidth);
        
        let reachedEnd = false;
        
        for (let i = 0; i < slides.length; i++) {
            if (reachedEnd) break; // fin atteinte, pas besoin d'ajouter les pages suivantes
            
            const slideRect = slides[i].getBoundingClientRect();
            
            // Différence invariante (indépendante de la translation actuelle)
            let slideLeft = slideRect.left - trackRect.left;
            let snapPos = Math.round(slideLeft);
            
            // Si la slide dépasse la limite qu'on peut scroller, on bloque au max.
            if (snapPos >= maxTranslate - 1) { // marge de sécurité
                snapPos = maxTranslate;
                reachedEnd = true; // C'est la toute dernière "page" possible
            }
            
            // Éviter de rajouter un snapPoint si la valeur est trop proche (doublons de fin)
            if (snapPoints.length === 0 || Math.abs(snapPoints[snapPoints.length - 1] - snapPos) > 1) {
                snapPoints.push(snapPos);
            }
        }
        
        // Fallback s'il y a un souci ou pas de scroll possible
        if (snapPoints.length === 0) {
            snapPoints.push(0);
        }
    }

    function buildDots() {
        if (!dotsContainer) return;
        
        // Reconstruire uniquement si le nombre de points change
        const currentDotCount = dotsContainer.children.length;
        if (currentDotCount !== snapPoints.length) {
            dotsContainer.innerHTML = '';
            // Créer les points si on a plus d'une page
            if (snapPoints.length > 1) {
                for (let i = 0; i < snapPoints.length; i++) {
                    const dot = document.createElement('span');
                    dot.className = 'unPodcast-dot' + (i === currentIndex ? ' active' : '');
                    dot.onclick = () => goToSlide(i);
                    dotsContainer.appendChild(dot);
                }
            }
        }
    }

    function updateCarousel() {
        if (snapPoints.length === 0) return;

        // Précaution de bornage (sécurité au redimensionnement)
        if (currentIndex >= snapPoints.length) {
            currentIndex = Math.max(0, snapPoints.length - 1);
        }
        if (currentIndex < 0) currentIndex = 0;

        currentTranslate = -snapPoints[currentIndex];
        track.style.transform = `translateX(${currentTranslate}px)`;

        // Mise à jour visuelle des points
        if (dotsContainer && dotsContainer.children.length > 0) {
            Array.from(dotsContainer.children).forEach((dot, index) => {
                if(index === currentIndex) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        }
    }

    function refreshLayout() {
        calculateSnapPoints();
        buildDots();
        updateCarousel();
    }

    function goToSlide(index) {
        track.style.transition = 'transform 0.4s ease-out';
        currentIndex = index;
        updateCarousel();
        resetInterval();
    }

    function nextSlide() {
        track.style.transition = 'transform 0.4s ease-out';
        if (currentIndex >= snapPoints.length - 1) {
            currentIndex = 0; // Retour au début
        } else {
            currentIndex++;
        }
        updateCarousel();
    }

    function prevSlide() {
        track.style.transition = 'transform 0.4s ease-out';
        if (currentIndex <= 0) {
            currentIndex = snapPoints.length - 1; // Mène à la toute fin
        } else {
            currentIndex--;
        }
        updateCarousel();
    }

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 10000); // Temps en millisecondes entre chaque slide
    }

    // --- LOGIQUE DE SWIPE / DRAG (POINTER EVENTS) ---

    if (windowEl) {
        windowEl.addEventListener('pointerdown', (e) => {
            // Uniquement clic gauche ou touch
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            
            isDragging = true;
            draggedDiff = 0;
            startPos = e.clientX;
            indexAtDragStart = currentIndex;
            
            clearInterval(slideInterval);
            
            // Empêcher les sauts si l'utilisateur drag pendant une transition en cours
            const style = window.getComputedStyle(track);
            if (style.transform !== 'none') {
                const matrix = new DOMMatrixReadOnly(style.transform);
                currentTranslate = matrix.m41;
            } else if (snapPoints[currentIndex] !== undefined) {
                currentTranslate = -snapPoints[currentIndex];
            }
            
            track.style.transition = 'none';
            track.style.transform = `translateX(${currentTranslate}px)`;
            
            windowEl.setPointerCapture(e.pointerId);
        });

        windowEl.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const currentPosition = e.clientX;
            draggedDiff = currentPosition - startPos;
            track.style.transform = `translateX(${currentTranslate + draggedDiff}px)`;
        });

        const handlePointerEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;
            windowEl.releasePointerCapture(e.pointerId);
            
            track.style.transition = 'transform 0.4s ease-out';
            
            // La position X traduite, de façon positive, pour comparer aux snapPoints
            const finalTranslate = -(currentTranslate + draggedDiff);
            
            // Trouver le snapPoint le plus proche
            let closestIndex = 0;
            let minDiff = Infinity;
            
            for (let i = 0; i < snapPoints.length; i++) {
                const diff = Math.abs(snapPoints[i] - finalTranslate);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = i;
                }
            }
            
            let newIndex = closestIndex;
            
            // Sensibilité (Momentum) pour les clics courts mais rapides
            if (Math.abs(draggedDiff) > 30 && newIndex === indexAtDragStart) {
                if (draggedDiff < 0 && newIndex < snapPoints.length - 1) newIndex++;
                else if (draggedDiff > 0 && newIndex > 0) newIndex--;
            }

            currentIndex = newIndex;
            updateCarousel();
            resetInterval();
            
            // Réinitialiser le draggedDiff un peu plus tard pour empêcher l'interception intempestive 
            setTimeout(() => { draggedDiff = 0; }, 50);
        };

        windowEl.addEventListener('pointerup', handlePointerEnd);
        windowEl.addEventListener('pointercancel', handlePointerEnd);

        // Intercepter les clics sur les enfants si on a dragué
        windowEl.addEventListener('click', (e) => {
            if (Math.abs(draggedDiff) > 10) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { capture: true });
    }

    // Boutons
    if(prevBtn) prevBtn.onclick = () => { prevSlide(); resetInterval(); };
    if(nextBtn) nextBtn.onclick = () => { nextSlide(); resetInterval(); };

    // Initial setup with a tiny timeout to ensure styles and fonts are applied
    setTimeout(() => {
        refreshLayout();
        resetInterval();
    }, 50);

    // Resize avec ResizeObserver pour plus de fiabilité et de fluidité
    if (window.ResizeObserver && windowEl) {
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(() => {
            track.style.transition = 'none';
            refreshLayout(); // Recalculer toutes les distances
            
            // Remettre la transition après le redimensionnement
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                track.style.transition = 'transform 0.4s ease-out';
            }, 100);
        });
        resizeObserver.observe(windowEl);
    } else {
        // Fallback
        window.addEventListener('resize', () => {
            track.style.transition = 'none';
            refreshLayout(); // Recalculer toutes les distances
        });
    }
});