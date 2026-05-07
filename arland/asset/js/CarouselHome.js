(function() {
  var carousel = document.getElementById('arlandCarousel');
  if (!carousel) return;

  var track = document.getElementById('arlandTrack');
  var slides = carousel.querySelectorAll('.arland-slide');
  var dots = carousel.querySelectorAll('.arland-dot');
  var prev = document.getElementById('arlandPrev');
  var next = document.getElementById('arlandNext');

  var current = 0;
  var total = slides.length;
  var autoTimer = null;

  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;

    track.style.transform = 'translateX(-' + (current * 100) + '%)';

    // Update background color
    var color = slides[current].getAttribute('data-color');
    slides[current].style.background = color;

    // Update dots
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  // Init background colors
  slides.forEach(function(slide) {
    slide.style.background = slide.getAttribute('data-color');
  });

  prev.addEventListener('click', function() {
    goTo(current - 1);
    resetAuto();
  });

  next.addEventListener('click', function() {
    goTo(current + 1);
    resetAuto();
  });

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      goTo(parseInt(this.getAttribute('data-index')));
      resetAuto();
    });
  });

  // Auto-play
  function startAuto() {
    autoTimer = setInterval(function() {
      goTo(current + 1);
    }, 10000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Touch/swipe support
  var startX = 0;
  carousel.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
      resetAuto();
    }
  }, { passive: true });

  // Keyboard support
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') { goTo(current - 1); resetAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
  });

  goTo(0);
  startAuto();
})();