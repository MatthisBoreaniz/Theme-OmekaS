/* ══════════════════════════════════════════
   Elliadd Header JS – neles copy theme
   ══════════════════════════════════════════ */

/* ── Page loader ── */
window.addEventListener('load', function() {
    var loader = document.querySelector('#elliadd-loader');
    if (loader) {
        loader.classList.add('loader-hidden');
    }
});

document.addEventListener('DOMContentLoaded', function() {

    /* ── Burger menu toggle ── */
    var burgerBtn = document.querySelector('#elliadd-header .elliadd-mobile-toggle');
    var mobileMenu = document.querySelector('#elliadd-header .elliadd-header-content');
    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            burgerBtn.classList.toggle('is-active');
            mobileMenu.classList.toggle('is-open');
            var isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
            burgerBtn.setAttribute('aria-expanded', String(!isExpanded));
            /* Reset slide panels when closing */
            if (!mobileMenu.classList.contains('is-open')) {
                var navUl = document.querySelector('#elliadd-header ul.navigation');
                if (navUl) navUl.classList.remove('submenu-active');
            }
        });
    }

    /* ── Submenu toggle buttons ── */
    var isMobile = function() { return window.innerWidth <= 10000; };

    var navItems = document.querySelectorAll('#elliadd-header .elliadd-header-nav ul.navigation > li');
    navItems.forEach(function(li) {
        var submenu = li.querySelector(':scope > ul');
        if (!submenu) return;

        /* Create toggle arrow */
        var toggle = document.createElement('button');
        toggle.className = 'child-toggle';
        toggle.setAttribute('type', 'button');
        toggle.setAttribute('aria-label', 'Ouvrir le sous-menu');
        toggle.textContent = isMobile() ? '\u203A' : '\u25BC';

        var link = li.querySelector(':scope > a');
        if (link) {
            link.after(toggle);
        } else {
            li.prepend(toggle);
        }

        /* Create back button for mobile slide panel */
        var backBtn = document.createElement('button');
        backBtn.className = 'submenu-back';
        backBtn.setAttribute('type', 'button');
        var parentText = link ? link.textContent.trim() : 'Menu';
        backBtn.innerHTML = '\u2190 ' + parentText;
        submenu.prepend(backBtn);

        /* Toggle click handler */
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (isMobile()) {
                /* Slide panel: slide main menu left, show submenu */
                var navUl = li.closest('ul.navigation');
                var navWrapper = li.closest('.elliadd-header-nav');
                if (navUl) navUl.classList.add('submenu-active');
                if (navWrapper) navWrapper.style.minHeight = submenu.scrollHeight + 'px';
            } else {
                /* Desktop: toggle open class */
                var isOpen = submenu.classList.toggle('open');
                toggle.textContent = isOpen ? '\u25B2' : '\u25BC';
                /* Close sibling submenus */
                var parentUl = li.closest('ul');
                if (parentUl) {
                    parentUl.querySelectorAll(':scope > li > ul.open').forEach(function(openMenu) {
                        if (openMenu !== submenu) {
                            openMenu.classList.remove('open');
                            var otherToggle = openMenu.parentElement.querySelector(':scope > .child-toggle');
                            if (otherToggle) otherToggle.textContent = '\u25BC';
                        }
                    });
                }
            }
        });

        /* Back button handler */
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var navUl = li.closest('ul.navigation');
            var navWrapper = li.closest('.elliadd-header-nav');
            if (navUl) navUl.classList.remove('submenu-active');
            if (navWrapper) navWrapper.style.minHeight = '';
        });
    });

    /* Update toggle icons on resize */
    window.addEventListener('resize', function() {
        var toggles = document.querySelectorAll('#elliadd-header .child-toggle');
        toggles.forEach(function(t) {
            if (isMobile()) {
                t.textContent = '\u203A';
            } else {
                var sub = t.parentElement.querySelector(':scope > ul');
                t.textContent = (sub && sub.classList.contains('open')) ? '\u25B2' : '\u25BC';
            }
        });
    });

    /* ══════════════════════════════════════════
       Back-to-top button
       ══════════════════════════════════════════ */
    var backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
