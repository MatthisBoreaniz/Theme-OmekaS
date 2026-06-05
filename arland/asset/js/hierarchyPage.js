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
  // DÉTECTION MOBILE (Safari mobile = pas de requestIdleCallback)
  // ====================================================

  const isMobile = window.innerWidth < 1200;

  // ====================================================
  // STRATÉGIE MOBILE : DETACH
  // On retire du DOM tous les ul[hidden] → Safari n'a rien à layouter
  // Stockés dans une WeakMap, réinjectés à la demande
  // ====================================================

  // detachedMap : li → ul (retiré du DOM)
  const detachedMap = new WeakMap();

  function detachHiddenSubMenus(root) {
    // Parcours itératif (pas récursif) pour éviter la stack overflow sur 2500 nœuds
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      // On cherche le ul direct de chaque li
      for (const li of node.children) {
        if (li.tagName !== "LI") continue;
        let subMenu = null;
        for (const child of li.children) {
          if (child.tagName === "UL") {
            subMenu = child;
            break;
          }
        }
        if (subMenu) {
          if (subMenu.hidden) {
            // Retire du DOM et stocke la référence
            li.removeChild(subMenu);
            detachedMap.set(li, subMenu);
          } else {
            // Sous-menu visible (chemin actif) → descend dedans
            stack.push(subMenu);
          }
        }
      }
    }
  }

  // ====================================================
  // INIT ARBRE (commun desktop + mobile)
  // Sur mobile le HTML est déjà pré-traité côté serveur / script précédent
  // On ré-attache juste l'event delegation
  // ====================================================

  const BATCH_SIZE = 100;

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
    if (li.firstElementChild?.classList.contains("item-wrapper")) return;

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

    let node = li.firstChild;
    while (node) {
      const next = node.nextSibling;
      if (node !== subMenu) wrapper.appendChild(node);
      node = next;
    }

    li.insertBefore(wrapper, li.firstChild);
  }

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
  // EVENT DELEGATION — gère les ul detachés sur mobile
  // ====================================================

  document.querySelectorAll(".hierarchy-list").forEach((list) => {
    list.addEventListener("click", (e) => {
      const toggle = e.target.closest(".toc-toggle");
      if (!toggle) return;

      const li = toggle.closest("li");
      if (!li) return;

      e.preventDefault();
      e.stopPropagation();

      const isOpen = li.classList.toggle("is-open");

      if (isOpen) {
        // Réinjecte le ul s'il était détaché
        const detached = detachedMap.get(li);
        if (detached) {
          detached.hidden = false;
          li.appendChild(detached);
          detachedMap.delete(li);
          // Sur mobile, détache immédiatement les petits-enfants cachés
          if (isMobile) detachHiddenSubMenus(detached);
        } else {
          const subMenu = li.querySelector(":scope > ul");
          if (subMenu) subMenu.hidden = false;
        }
        if (toggle.classList.contains("style-box")) toggle.textContent = "-";
      } else {
        const subMenu = li.querySelector(":scope > ul");
        if (subMenu) {
          subMenu.hidden = true;
          // Sur mobile : re-détache pour libérer le DOM
          if (isMobile) {
            li.removeChild(subMenu);
            detachedMap.set(li, subMenu);
          }
        }
        if (toggle.classList.contains("style-box")) toggle.textContent = "+";
      }
    });
  });

  // ====================================================
  // OUVERTURE AUTOMATIQUE DU CHEMIN ACTIF
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

      // Réinjecte si détaché
      const detached = detachedMap.get(cur);
      if (detached) {
        detached.hidden = false;
        cur.appendChild(detached);
        detachedMap.delete(cur);
      } else {
        const sub = cur.querySelector(":scope > ul");
        if (sub) sub.hidden = false;
      }

      const box = cur.querySelector(":scope > .item-wrapper > .style-box");
      if (box) box.textContent = "-";

      cur = cur.parentElement?.closest("li");
    }
  }

  // ====================================================
  // LANCEMENT
  // ====================================================

  function onInitDone() {
    if (isMobile) {
      // Détache tous les ul fermés du DOM → Safari n'a rien à peindre
      document
        .querySelectorAll(".hierarchy-list")
        .forEach(detachHiddenSubMenus);
    }
    openActivePath();
  }

  const allItems = document.querySelectorAll(".hierarchy-list li");

  if (isMobile) {
    // Sur mobile : pas de requestIdleCallback sur Safari → on batch quand même
    // mais on le fait le plus tôt possible
    processBatch(allItems, 0, onInitDone);
  } else {
    processBatch(allItems, 0, onInitDone);
  }
});
