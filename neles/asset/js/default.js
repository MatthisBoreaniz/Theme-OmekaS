(function($) {

    function fixIframeAspect() {
        $('iframe').each(function () {
            var aspect = $(this).attr('height') / $(this).attr('width');
            $(this).height($(this).width() * aspect);
        });
    }

    function framerateCallback(callback) {
        var waiting = false;
        callback = callback.bind(this);
        return function () {
            if (!waiting) {
                waiting = true;
                window.requestAnimationFrame(function () {
                    callback();
                    waiting = false;
                });
            }
        }
    }


    $(document).ready(function() {
        var navElement = $('header nav');
        var expandString = Omeka.jsTranslate('Expand');
        var collapseString = Omeka.jsTranslate('Collapse');

        var closeChildNav = function(parentLi) {
            var childToggle = parentLi.find('.child-toggle').first();
            var childMenu = parentLi.find('ul').first();
            childMenu.removeClass('open');
            childToggle.removeClass('open');
            childToggle.attr('aria-label', expandString).attr('aria-expanded', "false");
        };

        var openChildNav = function(parentLi) {
            var childToggle = parentLi.find('.child-toggle').first();
            var childMenu = parentLi.find('ul').first();
            childMenu.addClass('open');
            childToggle.addClass('open');
            childToggle.attr('aria-label', collapseString).attr('aria-expanded', "true");
        };

        navElement.on('click', '#mobile-nav-toggle', function() {
            navElement.toggleClass('open');
            if (navElement.hasClass('open')) {
                $(this).attr('aria-expanded', "true");
            } else {
                $(this).attr('aria-expanded', "false");
            }
        });
        
        navElement.find('ul ul').each(function(){
          var childMenu = $(this);
          var parentItem = childMenu.parent('li');
          var toggleButton = $('<button type="button" class="child-toggle" aria-expanded="false"></button>');
          toggleButton.attr('aria-label', expandString);
          parentItem.addClass('parent');
          parentItem.children('a').first().wrap('<div class="parent-link"></div>');
          parentItem.find('.parent-link').append(toggleButton);
        });
        
        navElement.on('click', '.child-toggle', function() {
          var parentLi = $(this).parents('.parent').first();
          if ($(this).hasClass('open')) {
            closeChildNav(parentLi);
          } else {
            openChildNav(parentLi);
          }
        });

        navElement.on('keydown', '.child-toggle, .open a', function(e) {
            var parentLi = $(this).parents('.parent');
            var childToggle = parentLi.find('.child-toggle').first();
            if (e.keyCode == '27') {
                closeChildNav(parentLi);
                childToggle.focus();
            }
        });

        navElement.on('mouseenter', '.parent', function() {            
            openChildNav($(this));
        });

        navElement.on('mouseleave', '.parent', function() {            
            closeChildNav($(this));
        });

        navElement.on('mouseleave', '.child-toggle', function() {            
            var parentLi = $(this).parents('.parent').first();
            closeChildNav(parentLi);
        });

        navElement.on('keydown', '.open li:last-child > a:only-child', function(e) {
            var currentLink = $(this);
            var parentBranch = currentLink.parents('.navigation > .parent');
            var lastBranchLink = parentBranch.find('a').last();
            if ((currentLink.is(lastBranchLink)) && (e.keyCode == "9") && !e.shiftKey) {
                e.preventDefault();
                var parentLi = currentLink.parents('.parent').last();
                var nextParentLi = parentLi.next().find('a').first();
                if (nextParentLi.length > 0) {
                    nextParentLi.focus();
                } else {
                    $('#search-form input:first-child').focus();
                }
                closeChildNav(parentLi);
            }
        });

        navElement.on('keydown', '.navigation > .parent > .parent-link > a', function(e) {
            if ((e.keyCode == "9") && e.shiftKey) {
                var parentLi = $(this).parents('.parent').first();
                closeChildNav(parentLi);
            }
        });
        
        // Back-to-top footer overlapping detection
        var backToTop = document.getElementById('back-to-top');
        var footer = document.querySelector('footer');
        var partnersLogo = document.querySelector('.elliadd-footer-logos');
        
        if (backToTop && footer) {
            // Observer 1 : Change de style quand on entre dans le footer
            var footerObserver = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) {
                    backToTop.classList.add('over-footer');
                } else {
                    backToTop.classList.remove('over-footer');
                }
            }, { root: null, rootMargin: '0px', threshold: 0 });
            footerObserver.observe(footer);
        }

        if (backToTop && partnersLogo) {
            // Observer 2 : Masque le bouton quand on arrive aux logos partenaires
            var logoObserver = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) {
                    backToTop.classList.add('hide-on-logos');
                } else {
                    backToTop.classList.remove('hide-on-logos');
                }
            }, { root: null, rootMargin: '0px', threshold: 0 });
            logoObserver.observe(partnersLogo);
        }

        
        // Maintain iframe aspect ratios
        $(window).on('load resize', framerateCallback(fixIframeAspect));
        fixIframeAspect();

        /**
         * ANIMATIONS AU SCROLL (REVEAL EFFECT)
         * Utilise IntersectionObserver pour déclencher l'apparition des éléments
         */
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // On arrête d'observer une fois animé
                }
            });
        }, observerOptions);

        // Sélection des éléments à animer
        // On cible les blocs de mise en page, les ressources, et les titres de sections
        const selectors = '.block, .resource, .item, .vocab-group-title, .metadata-toolbar, .unfond-fonds-hero, .biblio-hero, .neles-advanced-search';
        document.querySelectorAll(selectors).forEach(el => {
            el.classList.add('reveal'); // Ajout de la classe de base (invisible)
            revealObserver.observe(el);  // Mise en observation
        });

    });
})(jQuery);
