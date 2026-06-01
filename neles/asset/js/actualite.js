document.addEventListener("DOMContentLoaded", function () {

    const ITEMS_PER_PAGE = 3;

    /* ── 1. Récupère tous les blocs article ── */
    /* Omeka S génère les blocs HTML dans des .block ou .block-html
       On cible tous les .ActualitesStyles-page présents dans la page */
    const allArticles = Array.from(
        document.querySelectorAll(".ActualitesStyles-page")
    );

    if (allArticles.length <= ITEMS_PER_PAGE) return; /* rien à faire */

    let currentPage = 1;
    const totalPages = Math.ceil(allArticles.length / ITEMS_PER_PAGE);

    /* ── 2. Fonction d'affichage ── */
    function showPage(page) {
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;

      allArticles.forEach(function (article, index) {
        article.style.display =
          index >= start && index < end ? "block" : "none";
      });

      updatePagination(page);

      /* Scroll vers le haut de la page */
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /* ── 3. Crée le bloc pagination ── */
    const paginationWrapper = document.createElement("div");
    paginationWrapper.className = "ActualitesStyles-pagination";

    function updatePagination(page) {
        paginationWrapper.innerHTML = "";

        /* Bouton Précédent */
        const btnPrev = document.createElement("button");
        btnPrev.className = "ActualitesStyles-pagination-btn";
        btnPrev.textContent = "← Précédent";
        btnPrev.disabled = (page === 1);
        btnPrev.addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });
        paginationWrapper.appendChild(btnPrev);

        /* Numéros de pages */
        const pagesGroup = document.createElement("div");
        pagesGroup.className = "ActualitesStyles-pagination-pages";

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.className = "ActualitesStyles-pagination-num" +
                            (i === page ? " active" : "");
            btn.textContent = i;
            btn.addEventListener("click", function () {
                currentPage = i;
                showPage(currentPage);
            });
            pagesGroup.appendChild(btn);
        }

        paginationWrapper.appendChild(pagesGroup);

        /* Bouton Suivant */
        const btnNext = document.createElement("button");
        btnNext.className = "ActualitesStyles-pagination-btn";
        btnNext.textContent = "Suivant →";
        btnNext.disabled = (page === totalPages);
        btnNext.addEventListener("click", function () {
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });
        paginationWrapper.appendChild(btnNext);
    }

    /* ── 4. Injecte la pagination après le dernier article ── */
    const lastArticle = allArticles[allArticles.length - 1];
    lastArticle.parentNode.insertBefore(
        paginationWrapper,
        lastArticle.nextSibling
    );

    /* ── 5. Init ── */
    showPage(1);
});
