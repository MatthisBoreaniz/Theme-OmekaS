document.addEventListener("DOMContentLoaded", () => {

  const slugMatch = window.location.pathname.match(/^\/s\/([^\/]+)/);
  if (!slugMatch) return;
  const siteSlug = slugMatch[1];

  fetch(`/api/sites?slug=${siteSlug}`)
    .then(res => res.json())
    .then(sites => {
      if (!sites.length) return;
      const siteId = sites[0]["o:id"];
      return fetch(`/api/items?sort_by=created&sort_order=desc&limit=1&_embed=media&site_id=${siteId}`);
    })
    .then(res => res?.json())
    .then(data => {
      if (!data?.length) return;

      const item = data[0];
      const itemId = item["o:id"] ?? item.id ?? null;

      if (itemId && localStorage.getItem("lastPopupId") == itemId) return;

      const title = item["o:title"] || "Actualité";

      // Filtre : titre doit commencer par "actualité" ou "actu" (mot entier)
      const titleNorm = title.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (!/^actualite/.test(titleNorm) && !/^actu([^a-z]|$)/.test(titleNorm)) return;

      const content =
        item["dcterms:description"]?.find(v => v["@value"]?.trim())?.[" @value"] ||
        item["dcterms:description"]?.[0]?.["@value"] ||
        "Aucune description disponible.";

      const uriValue = item["dcterms:description"]?.find(v => v["@id"]);
      const linkUrl   = uriValue?.["@id"]    || null;
      const linkLabel = uriValue?.["o:label"] || "Voir plus";

      let image = window.popupNewsDefaultImage || "/themes/neles/asset/img/image-actu.jpg";
      if (item._embedded?.media?.length) {
        const media = item._embedded.media[0];
        image = media?.["o:thumbnail_urls"]?.large || media?.["o:original_url"] || image;
      }

      const overlay = document.createElement("div");
      overlay.className = "popup-overlay";

      overlay.innerHTML = `
        <div class="popup-center">
          <button class="popup-close" id="closePopup">✕</button>
          <div class="popup-image">
            <img src="${image}" alt="actualité">
          </div>
          <div class="popup-body">
            <h2>${title}</h2>
            <p class="popup-text">${content}</p>
            ${linkUrl ? `<a class="popup-btn" href="${linkUrl}" onclick="localStorage.setItem('lastPopupId', '${itemId}')">${linkLabel}</a>` : ""}
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      const closePopup = () => {
        overlay.remove();
        document.body.style.overflow = "";
        if (itemId) localStorage.setItem("lastPopupId", itemId);
      };

      document.getElementById("closePopup").onclick = closePopup;
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closePopup();
      });

    })
    .catch(err => console.error("Popup error:", err));

});
