document.addEventListener("DOMContentLoaded", () => {
  // ====================================================
  // SIDEBAR COLLAPSIBLE
  // ====================================================

  document.querySelectorAll(".hierarchy-sidebar-content").forEach((sidebar) => {
    const row = sidebar.closest(".hierarchy-row");
    if (!row || sidebar.querySelector(".sidebar-toggle")) return;

    const btn = document.createElement("div");
    btn.className = "sidebar-toggle";
    btn.innerHTML = "❮";
    sidebar.appendChild(btn);

    btn.addEventListener("click", () => {
      const collapsed = row.classList.toggle("is-collapsed");
      btn.innerHTML = collapsed ? "❯" : "❮";
    });
  });

  // ====================================================
  // INIT ARBRE
  // ====================================================

  const BATCH_SIZE = 100;

  // Remonte les ancêtres pour compter la profondeur — O(depth) au lieu de querySelectorAll
  function getDepth(li) {
    let depth = 0;
    let node = li.parentElement;
    while (node) {
      if (node.tagName === "UL") depth++;
      node = node.parentElement;
    }
    return depth;
  }

  function initItem(li) {
    // Skip si déjà traité
    if (li.firstElementChild?.classList.contains("item-wrapper")) return;

    // Trouve le sous-menu direct sans querySelector récursif
    let subMenu = null;
    for (const child of li.children) {
      if (child.tagName === "UL") {
        subMenu = child;
        break;
      }
    }

    const wrapper = document.createElement("div");
    wrapper.className = "item-wrapper";

    const toggle = document.createElement("span");
    toggle.className = "toc-toggle";

    if (!subMenu) {
      toggle.classList.add("style-document");
    } else {
      if (getDepth(li) <= 1) {
        toggle.classList.add("style-box");
        toggle.textContent = "+";
      } else {
        toggle.classList.add("style-chevron");
        toggle.textContent = "›";
      }
      subMenu.hidden = true;
    }

    wrapper.appendChild(toggle);

    // Déplace les childNodes (hors subMenu) dans le wrapper — sans Array.from ni filter
    let node = li.firstChild;
    while (node) {
      const next = node.nextSibling;
      if (node !== subMenu) wrapper.appendChild(node);
      node = next;
    }

    li.insertBefore(wrapper, li.firstChild);
  }

  // Traitement par tranches idle pour ne pas bloquer le rendu
  function processBatch(items, index, onDone) {
    const end = Math.min(index + BATCH_SIZE, items.length);
    for (let i = index; i < end; i++) initItem(items[i]);

    if (end < items.length) {
      (window.requestIdleCallback || window.setTimeout)(() =>
        processBatch(items, end, onDone),
      );
    } else {
      onDone?.();
    }
  }

  // ====================================================
  // EVENT DELEGATION
  // ====================================================

  document.querySelectorAll(".hierarchy-list").forEach((list) => {
    list.addEventListener("click", (e) => {
      const toggle = e.target.closest(".toc-toggle");
      if (!toggle) return;

      const li = toggle.closest("li");
      if (!li) return;

      const subMenu = li.querySelector(":scope > ul");
      if (!subMenu) return;

      e.preventDefault();
      e.stopPropagation();

      const isOpen = li.classList.toggle("is-open");
      subMenu.hidden = !isOpen;

      if (toggle.classList.contains("style-box"))
        toggle.textContent = isOpen ? "-" : "+";
    });
  });

  // ====================================================
  // OUVERTURE AUTOMATIQUE DU CHEMIN ACTIF
  // Appelée après la fin du batch
  // ====================================================

  function openActivePath() {
    const currentUrl = window.location.href.split("#")[0].split("?")[0];

    const links = document.querySelectorAll(".hierarchy-list a");
    let activeLink = null;
    for (const a of links) {
      if (a.href.split("#")[0].split("?")[0] === currentUrl) {
        activeLink = a;
        break;
      }
    }

    if (!activeLink) return;
    activeLink.classList.add("active");

    let cur = activeLink.closest("li");
    while (cur) {
      cur.classList.add("is-open");

      const sub = cur.querySelector(":scope > ul");
      if (sub) sub.hidden = false;

      const box = cur.querySelector(":scope > .item-wrapper > .style-box");
      if (box) box.textContent = "-";

      cur = cur.parentElement?.closest("li");
    }
  }

  // ====================================================
  // LANCEMENT
  // ====================================================

  const allItems = document.querySelectorAll(".hierarchy-list li");
  processBatch(allItems, 0, openActivePath);
});
