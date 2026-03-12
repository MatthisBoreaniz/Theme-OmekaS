document.addEventListener('DOMContentLoaded', function() {
    // We look for any carousels, this allows multiple on page
    var carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(function(carousel) {
        var track = carousel.querySelector('.carousel-track');
        var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
        if (slides.length === 0) return;

        var current = 0;

        // Clean up any text nodes like Omeka S does for arrows if present
        var childNodes = Array.prototype.slice.call(carousel.childNodes);
        childNodes.forEach(function(node) {
            if (node.nodeType === 3 && node.textContent.trim().match(/^[‹›\s]+$/)) {
                carousel.removeChild(node);
            }
        });

        // Create buttons
        var btnPrev = document.createElement('a');
        btnPrev.href = '#';
        btnPrev.className = 'carousel-btn carousel-btn-prev';
        btnPrev.setAttribute('aria-label', 'Précédent');
        btnPrev.innerHTML = '&#8249;';
        carousel.appendChild(btnPrev);

        var btnNext = document.createElement('a');
        btnNext.href = '#';
        btnNext.className = 'carousel-btn carousel-btn-next';
        btnNext.setAttribute('aria-label', 'Suivant');
        btnNext.innerHTML = '&#8250;';
        carousel.appendChild(btnNext);

        // Create dots container
        var dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        carousel.appendChild(dotsContainer);

        slides.forEach(function(_, i) {
            var dot = document.createElement('span');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', function(e) {
                e.preventDefault();
                goTo(i);
            });
            dotsContainer.appendChild(dot);
        });

        function updateButtons() {
            // "quand l'image et a la fin on ne voit plus le bouton de fin et idem pour le debut"
            btnPrev.style.display = current === 0 ? 'none' : 'flex';
            btnNext.style.display = current === slides.length - 1 ? 'none' : 'flex';
        }

        function goTo(index) {
            if (index < 0) index = 0;
            if (index > slides.length - 1) index = slides.length - 1;

            // Remove active classes
            slides[current].classList.remove('active');
            if (dotsContainer.children[current]) {
                dotsContainer.children[current].classList.remove('active');
            }

            current = index;

            // Add active classes
            slides[current].classList.add('active');
            if (dotsContainer.children[current]) {
                dotsContainer.children[current].classList.add('active');
            }

            // Calculate translation sum of previous slides + gaps
            var offset = 0;
            var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            
            for (var i = 0; i < current; i++) {
                offset += slides[i].offsetWidth + gap;
            }

            // Pour la dernière slide, "appart sur la dernier slide" 
            // = on ne veut pas montrer un vide à droite, donc on cale la slide à l'extrême droite.
            if (current === slides.length - 1 && slides.length > 1) {
                var paddingLeft = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
                
                // R is the position of the right edge of the last slide inside the track (before transform)
                var R = paddingLeft;
                for (var j = 0; j < slides.length; j++) {
                    R += slides[j].offsetWidth;
                    if (j < slides.length - 1) R += gap;
                }
                
                // The visual space available in the wrapper
                var wrapperWidth = carousel.offsetWidth;
                
                // We want the last slide's right edge to have the same visual padding on the right as it has on the left.
                // So the target visual position of the right edge is `wrapperWidth - paddingLeft`.
                var targetRightEdge = wrapperWidth - paddingLeft;
                
                // Needed offset to make `R` align to `targetRightEdge`
                var maxOffset = R - targetRightEdge;
                
                // Only use it if it prevents over-scrolling
                if (offset > maxOffset && maxOffset >= 0) {
                    offset = maxOffset;
                }
            }

            track.style.transform = 'translateX(-' + offset + 'px)';

            updateButtons();
        }

        btnPrev.addEventListener('click', function(e) {
            e.preventDefault();
            goTo(current - 1);
        });
        
        btnNext.addEventListener('click', function(e) {
            e.preventDefault();
            goTo(current + 1);
        });

        // --- Touch Swipe Support ---
        var touchStartX = 0;
        var touchEndX = 0;

        track.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        track.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});

        function handleSwipe() {
            var swipeThreshold = 50; // Distance minimum pour valider un swipe
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe gauche -> slide suivante
                goTo(current + 1);
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe droite -> slide précédente
                goTo(current - 1);
            }
        }

        // Reposition on resize
        window.addEventListener('resize', function() {
            goTo(current);
        });

        // Initialize display and calculate properly without transition initially
        updateButtons();
        track.style.transition = 'none';
        
        // Wait for styles/images to be applied to compute widths properly
        setTimeout(function() {
            goTo(0);
            setTimeout(function() {
                track.style.transition = 'transform 0.5s cubic-bezier(0.77, 0, 0.18, 1)';
            }, 50);
        }, 10);
    });
});
