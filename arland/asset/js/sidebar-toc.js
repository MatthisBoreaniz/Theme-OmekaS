/* ===== Sidebar collapsible + Arbre TOC (+ / -) + Dépliage actif ===== */
document.addEventListener("DOMContentLoaded", function () {
    const menus = document.querySelectorAll('.block-listOfPages');

    menus.forEach(menu => {
        // --- 1. BOUTON POUR REPLIER LA COLONNE (❮ / ❯) ---
        const blocksInner = menu.closest('.blocks-inner');
        if (blocksInner && !menu.querySelector('.sidebar-toggle')) {
            const toggleMenuBtn = document.createElement('div');
            toggleMenuBtn.className = 'sidebar-toggle';
            toggleMenuBtn.innerHTML = '❮';
            menu.appendChild(toggleMenuBtn);

            toggleMenuBtn.addEventListener('click', () => {
                // Réinitialiser la taille manuelle lors du pliage
                menu.style.width = '';
                menu.style.height = '';

                blocksInner.classList.toggle('is-collapsed');
                toggleMenuBtn.innerHTML = blocksInner.classList.contains('is-collapsed') ? '❯' : '❮';
            });
        }

        // --- 2. GESTION DE L'ARBRE (+ / -) ---
        const items = menu.querySelectorAll('li');

        items.forEach((li, index) => {
            const nextEl = li.nextElementSibling;
            const hasActualSubMenu = nextEl && nextEl.tagName.toLowerCase() === 'ul' && nextEl.children.length > 0;

            if (index === 0) {
                li.classList.add('menu-root-title');
                if (nextEl && nextEl.tagName.toLowerCase() === 'ul') {
                    nextEl.style.display = 'block';
                }
                return;
            }

            const toggleBtn = document.createElement('span');
            toggleBtn.className = 'toc-toggle';

            let depth = 0;
            let parent = li.parentElement;
            while (parent && !parent.classList.contains('block-listOfPages')) {
                if (parent.tagName.toLowerCase() === 'ul') depth++;
                parent = parent.parentElement;
            }

            if (depth === 2) {
                toggleBtn.classList.add('style-box');
                toggleBtn.innerText = '+';
            } else if (!hasActualSubMenu) {
                toggleBtn.classList.add('style-document');
            } else {
                toggleBtn.classList.add('style-chevron');
                toggleBtn.innerText = '›';
            }

            const link = li.querySelector('a');
            if (link) {
                const wrapper = document.createElement('div');
                wrapper.className = 'item-wrapper';
                li.insertBefore(wrapper, link);
                wrapper.appendChild(toggleBtn);
                wrapper.appendChild(link);
            }

            toggleBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (!hasActualSubMenu) {
                    if (link && link.href) {
                        window.location.href = link.href;
                    }
                    return;
                }

                li.classList.toggle('is-open');
                if (li.classList.contains('is-open')) {
                    toggleBtn.innerText = toggleBtn.classList.contains('style-box') ? '-' : 'v';
                } else {
                    toggleBtn.innerText = toggleBtn.classList.contains('style-box') ? '+' : '›';
                }
            });
        });

        // --- 3. DÉPLIER L'ARBRE POUR LA PAGE ACTIVE ---
        const activeLink = menu.querySelector('a.active, li.active a, li.current a');
        if (activeLink) {
            let currentLi = activeLink.closest('li');
            let parentUl = currentLi.parentElement;
            const rootUl = menu.querySelector('ul');

            while (parentUl && parentUl !== rootUl && parentUl !== menu) {
                const parentLi = parentUl.previousElementSibling;

                if (parentLi && parentLi.tagName.toLowerCase() === 'li' && !parentLi.classList.contains('menu-root-title')) {
                    parentLi.classList.add('is-open');
                    const btn = parentLi.querySelector('.toc-toggle');
                    if (btn) {
                        btn.innerText = btn.classList.contains('style-box') ? '-' : 'v';
                    }
                }
                parentUl = parentUl.parentElement;
            }
        }
    });
});
