document.addEventListener("DOMContentLoaded", function () {
  // --- 1. BOUTON POUR REPLIER LA COLONNE (❮ / ❯) ---
  const sidebars = document.querySelectorAll(".hierarchy-sidebar-content");

  sidebars.forEach((sidebar) => {
    const row = sidebar.closest(".hierarchy-row");
    if (row && !sidebar.querySelector(".sidebar-toggle")) {
      const toggleMenuBtn = document.createElement("div");
      toggleMenuBtn.className = "sidebar-toggle";
      toggleMenuBtn.innerHTML = "❮";
      sidebar.appendChild(toggleMenuBtn);

      toggleMenuBtn.addEventListener("click", () => {
        sidebar.style.width = "";
        sidebar.style.height = "";
        row.classList.toggle("is-collapsed");
        toggleMenuBtn.innerHTML = row.classList.contains("is-collapsed")
          ? "❯"
          : "❮";
      });
    }
  });

  // --- 2. GESTION DE L'ARBRE (TOUT FERMER STRICTEMENT) ---
  const hierarchyLists = document.querySelectorAll(".hierarchy-list");

  hierarchyLists.forEach((list) => {
    const items = list.querySelectorAll("li");

    items.forEach((li) => {
      if (li.querySelector(":scope > .item-wrapper")) return;

      const subMenu = Array.from(li.children).find(
        (child) => child.tagName && child.tagName.toLowerCase() === "ul",
      );
      const hasActualSubMenu = !!subMenu;

      const toggleBtn = document.createElement("span");
      toggleBtn.className = "toc-toggle";

      if (hasActualSubMenu) {
        toggleBtn.classList.add("style-box");
        toggleBtn.innerText = "+";
        // On force la fermeture du sous-menu quoi qu'il arrive
        subMenu.style.display = "none";
        li.classList.remove("is-open");
      } else {
        toggleBtn.classList.add("style-document");
      }

      const wrapper = document.createElement("div");
      wrapper.className = "item-wrapper";

      const children = Array.from(li.childNodes);
      children.forEach((child) => {
        if (child !== subMenu) {
          wrapper.appendChild(child);
        }
      });

      wrapper.prepend(toggleBtn);
      li.prepend(wrapper);

      // --- ACTION AU CLIC ---
      toggleBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!hasActualSubMenu) return;

        li.classList.toggle("is-open");
        if (li.classList.contains("is-open")) {
          toggleBtn.innerText = "-";
          subMenu.style.display = "block";
        } else {
          toggleBtn.innerText = "+";
          subMenu.style.display = "none";
        }
      });
    });
  });

  // --- 3. DÉPLIER UNIQUEMENT LE CHEMIN DES PARENTS DE LA PAGE ACTIVE ---
  const currentUrl = window.location.href.split("#")[0].split("?")[0];

  document.querySelectorAll(".hierarchy-list a").forEach((link) => {
    if (link.href.split("#")[0].split("?")[0] === currentUrl) {
      link.classList.add("active");

      let currentLi = link.closest("li");

      // On remonte l'arbre depuis l'élément actif pour n'ouvrir QUE ses parents
      let parentUl = currentLi.parentElement;

      while (
        parentUl &&
        !parentUl.classList.contains("hierarchy-sidebar-content")
      ) {
        if (parentUl.tagName && parentUl.tagName.toLowerCase() === "ul") {
          // On affiche le dossier parent
          parentUl.style.display = "block";
          let parentLi = parentUl.closest("li");

          if (parentLi) {
            parentLi.classList.add("is-open");
            // On cherche spécifiquement le bouton du parent pour le passer en "-"
            const btn = parentLi.querySelector(
              ":scope > .item-wrapper .toc-toggle.style-box",
            );
            if (btn) btn.innerText = "-";
          }
        }
        parentUl = parentUl.parentElement;
      }
    }
  });
});
