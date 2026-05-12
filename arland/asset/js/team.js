document.addEventListener('DOMContentLoaded', () => {
    const accordionItems = document.querySelectorAll('.accordion__item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion__header');
        const content = item.querySelector('.accordion__content');

        header.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Fermer tous les autres
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('is-open');
                    const otherContent = otherItem.querySelector('.accordion__content');
                    otherContent.style.maxHeight = null;
                }
            });

            // Toggle actuel
            if (isOpen) {
                item.classList.remove('is-open');
                content.style.maxHeight = null;
            } else {
                item.classList.add('is-open');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});