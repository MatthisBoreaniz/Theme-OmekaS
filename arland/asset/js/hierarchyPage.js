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
  // CHARGEMENT DU JSON
  // ====================================================

  const dataEl = document.getElementById("hierarchy-data");
  if (!dataEl) return;

  let treeData;
  try {
    treeData = JSON.parse(dataEl.textContent);
  } catch (e) {
    console.error("hierarchy-data JSON invalide", e);
    return;
  }

  const { nodes: nodeList, roots, activePath } = treeData;

  // Index rapide id → node
  const nodeMap = new Map();
  for (const n of nodeList) nodeMap.set(n.id, n);

  // Index rapide parentId → [childId, ...]
  const childrenMap = new Map();
  for (const n of nodeList) {
    if (!childrenMap.has(n.parent)) childrenMap.set(n.parent, []);
    childrenMap.get(n.parent).push(n.id);
  }

  const activeSet = new Set(activePath);

  // ====================================================
  // CONSTRUCTION D'UN NŒUD
  // ====================================================

  function buildLi(nodeId) {
    const n = nodeMap.get(nodeId);
    if (!n) return null;

    const li = document.createElement("li");
    const hasChildren = !!childrenMap.get(nodeId)?.length;
    const isActive = activeSet.has(nodeId);

    if (isActive) li.classList.add("is-open");

    const wrapper = document.createElement("div");
    wrapper.className = "item-wrapper";

    const toggle = document.createElement("span");
    toggle.className = "toc-toggle";

    if (!hasChildren) {
      toggle.classList.add("style-document");
    } else {
      // depth : compte les ul ancêtres
      let depth = 0,
        node = li;
      // on ne peut pas remonter encore (li pas dans le DOM) — on passe depth via data
      // depth sera fixé après insertion, mais le style dépend du niveau
      // On utilise un attribut temporaire
      li.dataset.nodeId = nodeId;
      toggle.classList.add("style-chevron");
      toggle.textContent = "›";
    }

    wrapper.appendChild(toggle);

    // Contenu texte / lien
    if (n.url) {
      const a = document.createElement("a");
      a.href = n.url;
      a.textContent = n.label;
      if (n.active) a.classList.add("active");
      if (n.bold) {
        const b = document.createElement("b");
        b.appendChild(a);
        wrapper.appendChild(b);
      } else {
        wrapper.appendChild(a);
      }
    } else {
      const span = document.createElement("span");
      span.textContent = n.label;
      wrapper.appendChild(span);
    }

    li.appendChild(wrapper);

    // Enfants ouverts immédiatement si dans le chemin actif
    if (hasChildren && isActive) {
      const ul = buildUl(nodeId);
      li.appendChild(ul);
    }

    return li;
  }

  function buildUl(parentId) {
    const ul = document.createElement("ul");
    const children = childrenMap.get(parentId) || [];
    for (const childId of children) {
      const li = buildLi(childId);
      if (li) ul.appendChild(li);
    }
    // Fixe le style-box sur les nœuds de 1er niveau
    fixDepthStyles(ul, 1);
    return ul;
  }

  // Applique style-box (depth<=1) vs style-chevron (depth>1)
  function fixDepthStyles(ul, depth) {
    for (const li of ul.children) {
      const toggle = li.querySelector(":scope > .item-wrapper > .toc-toggle");
      if (!toggle) continue;
      if (toggle.classList.contains("style-document")) continue;

      toggle.classList.remove("style-box", "style-chevron");
      if (depth <= 1) {
        toggle.classList.add("style-box");
        toggle.textContent = li.classList.contains("is-open") ? "-" : "+";
      } else {
        toggle.classList.add("style-chevron");
        toggle.textContent = "›";
      }

      // Récursif sur les enfants déjà ouverts
      const childUl = li.querySelector(":scope > ul");
      if (childUl) fixDepthStyles(childUl, depth + 1);
    }
  }

  // ====================================================
  // RENDU DES RACINES
  // ====================================================

  const rootList = document.getElementById("hierarchy-root-list");
  if (!rootList) return;

  // Construit les racines (1er niveau uniquement, léger)
  for (const rootId of roots) {
    const li = buildLi(rootId);
    if (li) rootList.appendChild(li);
  }
  fixDepthStyles(rootList, 0);

  // ====================================================
  // EVENT DELEGATION — ouvre/ferme à la demande
  // ====================================================

  rootList.addEventListener("click", (e) => {
    const toggle = e.target.closest(".toc-toggle");
    if (!toggle) return;

    const li = toggle.closest("li");
    if (!li) return;

    const nodeId = parseInt(li.dataset.nodeId, 10);
    if (!nodeId) return;

    const hasChildren = !!childrenMap.get(nodeId)?.length;
    if (!hasChildren) return;

    e.preventDefault();
    e.stopPropagation();

    const isOpen = li.classList.toggle("is-open");

    if (isOpen) {
      // Construit les enfants si pas encore fait
      let ul = li.querySelector(":scope > ul");
      if (!ul) {
        // Calcule la profondeur réelle
        let depth = 0,
          node = li.parentElement;
        while (node) {
          if (node.tagName === "UL") depth++;
          node = node.parentElement;
        }
        ul = buildUl(nodeId);
        fixDepthStyles(ul, depth);
        li.appendChild(ul);
      } else {
        ul.hidden = false;
      }
      if (toggle.classList.contains("style-box")) toggle.textContent = "-";
    } else {
      const ul = li.querySelector(":scope > ul");
      if (ul) ul.hidden = true;
      if (toggle.classList.contains("style-box")) toggle.textContent = "+";
    }
  });

  // Nettoie les data-node-id inutiles après init
  rootList.querySelectorAll("[data-node-id]").forEach((el) => {
    // Garde uniquement sur les li qui ont des enfants potentiels
    const id = parseInt(el.dataset.nodeId, 10);
    if (!childrenMap.get(id)?.length) delete el.dataset.nodeId;
  });
});
