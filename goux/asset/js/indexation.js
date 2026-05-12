/* ===== Séparation des vocabulaires : dcterms vs indexation (bibo, custom vocab, etc.) ===== */
document.addEventListener("DOMContentLoaded", function () {
    const dlList = document.querySelectorAll(
        'body.item.resource.show dl, ' +
        'body.page.site-page-archives.resource.show dl, ' +
        '.block-itemWithMetadata .resource dl'
    );
    if (!dlList.length) return;

    // Préfixes considérés comme "indexation"
    const indexationPrefixes = ['bibo:', 'index:'];

    dlList.forEach(dl => {
        const allProperties = Array.from(dl.querySelectorAll('.property[data-term]'));
        if (!allProperties.length) return;

        // Séparer les propriétés en deux groupes
        const propsDescription = [];
        const propsIndexation = [];

        allProperties.forEach(prop => {
            const term = prop.getAttribute('data-term');
            const isIndexation = indexationPrefixes.some(prefix => term.startsWith(prefix));
            if (isIndexation) {
                propsIndexation.push(prop);
            } else {
                propsDescription.push(prop);
            }
        });

        // S'il n'y a pas de propriétés indexation, on ne touche pas à ce dl
        let indexTitle = null;
        if (propsIndexation.length > 0) {
            indexTitle = document.createElement('h4');
            indexTitle.className = 'vocab-group-title';

            const titleText = document.createElement('span');
            titleText.textContent = 'Indexation';

            const chevron = document.createElement('span');
            chevron.className = 'vocab-toggle-icon';
            const plusSvg = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            const minusSvg = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            chevron.innerHTML = plusSvg; // Plier par défaut
            chevron.style.display = 'inline-flex';
            chevron.style.alignItems = 'center';
            chevron.style.justifyContent = 'center';
            chevron.style.width = '24px';
            chevron.style.height = '24px';
            chevron.style.borderRadius = '50%';
            chevron.style.backgroundColor = 'var(--accent)';
            chevron.style.color = '#ffffff';
            chevron.style.transition = 'all 0.2s ease';

            indexTitle.appendChild(titleText);
            indexTitle.appendChild(chevron);

            indexTitle.style.cursor = 'pointer';
            indexTitle.style.display = 'flex';
            indexTitle.style.justifyContent = 'flex-start';
            indexTitle.style.gap = '20px';
            indexTitle.style.alignItems = 'center';
            indexTitle.style.userSelect = 'none';

            let isExpanded = false;
            dl.classList.add('indexation-collapsed');
            indexTitle.addEventListener('click', function () {
                isExpanded = !isExpanded;
                chevron.innerHTML = isExpanded ? minusSvg : plusSvg;
                dl.classList.toggle('indexation-collapsed', !isExpanded);
            });
        }

        // S'il n'y a pas de propriétés indexation, on ne change rien au DL original
        // Cela évite de vider la liste inutilement et d'ajouter un titre nul
        if (propsIndexation.length > 0 && indexTitle) {
            // Vider le dl original pour réorganiser
            dl.innerHTML = '';

            // Remettre les propriétés de description
            propsDescription.forEach(prop => dl.appendChild(prop));

            // Ajouter le titre et les propriétés d'indexation
            dl.appendChild(indexTitle);
            propsIndexation.forEach(prop => {
                prop.classList.add('indexation-prop');
                dl.appendChild(prop);
            });
        }
    });
});
