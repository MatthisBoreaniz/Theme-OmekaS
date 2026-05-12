/* ===== Activation du lien courant dans le menu ===== */
document.addEventListener("DOMContentLoaded", function () {
    const currentUrl = window.location.href.split('#')[0];
    const menuLinks = document.querySelectorAll('.block-listOfPages a');

    menuLinks.forEach(link => {
        if (link.href.split('#')[0] === currentUrl) {
            link.parentElement.classList.add('active');
            link.classList.add('active');
        }
    });
});
