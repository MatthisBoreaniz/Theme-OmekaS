/* ===== Sidebar collapsible + Arbre TOC (+ / -) + Dépliage actif ===== */
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

  // --- 2. GESTION DE L'ARBRE (ICÔNES ET FERMETURE) ---
  const hierarchyLists = document.querySelectorAll(".hierarchy-list");

  hierarchyLists.forEach((list) => {
    const items = list.querySelectorAll("li");

    items.forEach((li) => {
      if (li.querySelector(":scope > .item-wrapper")) return;

      const subMenu = Array.from(li.children).find(
        (child) => child.tagName && child.tagName.toLowerCase() === "ul",
      );
      const hasActualSubMenu = !!subMenu;

      // Calcul de la profondeur pour attribuer + / - ou les flèches
      let depth = 0;
      let parent = li.parentElement;
      while (
        parent &&
        !parent.classList.contains("hierarchy-sidebar-content")
      ) {
        if (parent.tagName && parent.tagName.toLowerCase() === "ul") depth++;
        parent = parent.parentElement;
      }

      const toggleBtn = document.createElement("span");
      toggleBtn.className = "toc-toggle";

      if (!hasActualSubMenu) {
        // Document final
        toggleBtn.classList.add("style-document");
      } else if (depth === 1) {
        // Parent principal (+ / -)
        toggleBtn.classList.add("style-box");
        toggleBtn.innerText = "+";
        subMenu.style.display = "none";
        li.classList.remove("is-open");
      } else {
        // Sous-dossier (flèche › gérée par CSS pour la rotation)
        toggleBtn.classList.add("style-chevron");
        toggleBtn.innerText = "›";
        subMenu.style.display = "none";
        li.classList.remove("is-open");
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
          // Ouverture
          if (toggleBtn.classList.contains("style-box"))
            toggleBtn.innerText = "-";
          subMenu.style.display = "block";
        } else {
          // Fermeture
          if (toggleBtn.classList.contains("style-box"))
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
      let parentUl = currentLi.parentElement;

      while (
        parentUl &&
        !parentUl.classList.contains("hierarchy-sidebar-content")
      ) {
        if (parentUl.tagName && parentUl.tagName.toLowerCase() === "ul") {
          parentUl.style.display = "block";
          let parentLi = parentUl.closest("li");

          if (parentLi) {
            parentLi.classList.add("is-open");
            // Changer uniquement le bouton box si c'est un parent principal
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
