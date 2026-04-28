document.addEventListener("DOMContentLoaded", () => {

  fetch('/api/items?sort_by=created&sort_order=desc&limit=1&_embed=media')
    .then(res => res.json())
    .then(data => {
      if (!data.length) return;

      const item = data[0];

      // 🔥 ID sécurisé (Omeka S friendly)
      const itemId = item["o:id"] ?? item.id ?? null;

      const lastPopupId = localStorage.getItem("lastPopupId");

      // 🔥 empêche de réafficher la même actu
      if (itemId && lastPopupId == itemId) return;

      const title = item["o:title"] || "Actualité";

      // 🔒 sécurité : n'afficher que si le titre commence par 'actualité' ou 'actu'
      // 🔒 sécurité : titre doit commencer par 'actualité' ou 'actu' (mot entier)
      // ex: "Actualité du jour" ✅ | "Actu 2024" ✅ | "Actucscs" ❌
      const titleNorm = title.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (!/^actualite/.test(titleNorm) && !/^actu([^a-z]|$)/.test(titleNorm)) return;

      const content =
        item["dcterms:description"]?.[0]?.["@value"] ||
        item["o:description"]?.[0]?.["@value"] ||
        "Aucune description disponible.";

      // 🔥 image fallback solide
      let image =
        "/themes/goux/asset/img/image-actu.jpg";

      if (item._embedded?.media?.length) {
        const media = item._embedded.media[0];

        image =
          media?.["o:thumbnail_urls"]?.large ||
          media?.["o:original_url"] ||
          image;
      }

      // 🔥 création popup
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
          </div>

        </div>
      `;

      // 🔥 afficher + bloquer scroll
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      // 🔥 fonction fermeture propre
      const closePopup = () => {
        overlay.remove();
        document.body.style.overflow = "";
        if (itemId) {
          localStorage.setItem("lastPopupId", itemId);
        }
      };

      // bouton croix
      document.getElementById("closePopup").onclick = closePopup;

      // clic sur fond
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closePopup();
        }
      });

    })
    .catch(err => {
      console.error("Popup error:", err);
    });

});