document.addEventListener('DOMContentLoaded', function() {
  // Omeka S sanitise les blocs HTML : supprime les id="" et les <button>.
  // On utilise donc les classes CSS pour trouver les éléments.
  var wrapper = document.querySelector('.affiche-carousel-wrapper');
  if (!wrapper) return;

  var track = wrapper.querySelector('.affiche-carousel-track');
  if (!track) return;

  var slides = Array.prototype.slice.call(track.querySelectorAll('.affiche-slide'));
  if (slides.length === 0) return;

  var current = 0;

  // === Supprimer les résidus texte des boutons sanitisés (‹ ›) ===
  // Omeka supprime les <button> mais laisse le texte. On nettoie.
  var childNodes = Array.prototype.slice.call(wrapper.childNodes);
  childNodes.forEach(function(node) {
    if (node.nodeType === 3 && node.textContent.trim().match(/^[‹›\s]+$/)) {
      wrapper.removeChild(node);
    }
  });

  // === Créer les boutons prev/next via JS ===
  var btnPrev = document.createElement('a');
  btnPrev.href = '#';
  btnPrev.className = 'affiche-btn affiche-btn-prev';
  btnPrev.setAttribute('aria-label', 'Précédent');
  btnPrev.innerHTML = '&#8249;';
  wrapper.appendChild(btnPrev);

  var btnNext = document.createElement('a');
  btnNext.href = '#';
  btnNext.className = 'affiche-btn affiche-btn-next';
  btnNext.setAttribute('aria-label', 'Suivant');
  btnNext.innerHTML = '&#8250;';
  wrapper.appendChild(btnNext);

  // === Créer le conteneur de dots via JS ===
  var dotsContainer = document.createElement('div');
  dotsContainer.className = 'affiche-dots';
  wrapper.appendChild(dotsContainer);

  // Créer les dots
  slides.forEach(function(_, i) {
    var dot = document.createElement('span');
    dot.className = 'affiche-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', function(e) {
      e.preventDefault();
      goTo(i);
    });
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dotsContainer.children[current]) {
      dotsContainer.children[current].classList.remove('active');
    }
    current = ((index % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dotsContainer.children[current]) {
      dotsContainer.children[current].classList.add('active');
    }

    // Centrer la slide active en utilisant sa position réelle dans le DOM
    var slideCenterInTrack = slides[current].offsetLeft + slides[current].offsetWidth / 2;
    var wrapperCenter = wrapper.offsetWidth / 2;
    var offset = slideCenterInTrack - wrapperCenter;
    track.style.transform = 'translateX(' + (-offset) + 'px)';
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
      var swipeThreshold = 50; 
      if (touchEndX < touchStartX - swipeThreshold) {
          goTo(current + 1);
      }
      if (touchEndX > touchStartX + swipeThreshold) {
          goTo(current - 1);
      }
  }

  // Init : afficher la deuxième slide
  goTo(1);

  // Gérer le redimensionnement de la fenêtre pour garder la slide centrée
  window.addEventListener('resize', function() {
    goTo(current);
  });
});