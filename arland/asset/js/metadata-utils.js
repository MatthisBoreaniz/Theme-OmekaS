/* ===== Auto-link des URLs dans les métadonnées ===== */
document.addEventListener("DOMContentLoaded", function () {
  const metadataValues = document.querySelectorAll(
    ".resource.show dl .value-content, .hierarchy-metadata-custom dl .value-content",
  );

  metadataValues.forEach(function (el) {
    let html = el.innerHTML;

    // Cette regex cherche les URL qui ne sont PAS déjà dans une balise <a>
    const urlPattern = /(?<!href="|">)(https?:\/\/[^\s<]+)/g;

    const linkedHTML = html.replace(urlPattern, function (url) {
      let cleanUrl = url.replace(/[.,;]$/, "");
      return (
        '<a href="' +
        cleanUrl +
        '" target="_blank" rel="noopener noreferrer">' +
        cleanUrl +
        "</a>"
      );
    });

    el.innerHTML = linkedHTML;
  });
});

/* ===== "Lire la suite" — Truncate des valeurs longues ===== */
document.addEventListener("DOMContentLoaded", function () {
  const dds = document.querySelectorAll(
    ".resource.show dl dd, .block-itemWithMetadata .resource dd, .hierarchy-metadata-custom dl dd",
  );
  const maxHeight = 150; // Hauteur avant coupure

  dds.forEach((dd) => {
    // Sécurité : on ne rajoute pas le bouton si le script a déjà tourné
    if (dd.querySelector(".btn-read-more")) return;

    if (dd.offsetHeight > maxHeight) {
      const originalHTML = dd.innerHTML;
      dd.innerHTML = "";

      const container = document.createElement("div");
      container.className = "value-truncate-container is-truncated";
      container.style.maxHeight = maxHeight + "px";
      container.innerHTML = originalHTML;

      dd.appendChild(container);

      const btn = document.createElement("button");
      btn.className = "btn-read-more";
      btn.type = "button";
      btn.innerText = "Lire la suite";

      dd.appendChild(btn);

      btn.addEventListener("click", function () {
        if (container.classList.contains("is-truncated")) {
          container.style.maxHeight = container.scrollHeight + "px";
          container.classList.remove("is-truncated");
          btn.innerText = "Réduire";
        } else {
          container.style.maxHeight = maxHeight + "px";
          container.classList.add("is-truncated");
          btn.innerText = "Lire la suite";
        }
      });
    }
  });
});
