/* ===== Bouton "Voir plus / Voir moins" sur les blocs browsePreview ===== */
document.addEventListener("DOMContentLoaded", function () {
    const previewBlocks = document.querySelectorAll('.block-browsePreview');

    previewBlocks.forEach(block => {
        const toggleBtn = block.querySelector('.preview-block > a');
        const resourceList = block.querySelector('.resource-list');

        if (toggleBtn && resourceList) {
            const totalItems = resourceList.querySelectorAll('.resource').length;

            // On mémorise le texte d'origine
            const textVoirPlus = toggleBtn.textContent;
            const textVoirMoins = "Voir moins";

            if (totalItems > 4) {
                toggleBtn.addEventListener('click', function (e) {
                    e.preventDefault(); // Empêche de changer de page

                    // On bascule l'état d'affichage
                    resourceList.classList.toggle('show-all');

                    if (resourceList.classList.contains('show-all')) {
                        toggleBtn.textContent = textVoirMoins;
                    } else {
                        toggleBtn.textContent = textVoirPlus;
                        block.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            } else {
                // Puisque le CSS a un !important, on force la disparition en JS
                toggleBtn.style.setProperty('display', 'none', 'important');
            }
        }
    });
});
