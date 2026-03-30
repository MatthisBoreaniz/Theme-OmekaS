/* ===== Bouton retour sur les pages item/show ===== */
document.addEventListener("DOMContentLoaded", function () {
    if (!document.body.classList.contains('item') || !document.body.classList.contains('show')) return;

    const content = document.querySelector('.content');
    if (!content) return;

    const wrap = document.createElement('div');
    wrap.className = 'btn-back-wrap';

    const btn = document.createElement('a');
    btn.className = 'btn-back-item';
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg> Retour';

    // Si on vient d'une page du même site, on y retourne ; sinon on va au browse
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
            history.back();
        } else {
            // Fallback : remonter d'un niveau dans l'URL
            window.location.href = window.location.href.replace(/\/item\/\d+.*$/, '/page/archives');
        }
    });

    wrap.appendChild(btn);

    // Insérer juste en dessous du titre H2
    const title = content.querySelector('h2');
    if (title && title.nextSibling) {
        content.insertBefore(wrap, title.nextSibling);
    } else {
        content.insertBefore(wrap, content.firstChild);
    }
});

/* ===== Barre d'outils pour les métadonnées ===== */
document.addEventListener("DOMContentLoaded", function () {
    const metadataDl = document.querySelector('.resource.show dl, .block-itemWithMetadata .resource dl');
    if (!metadataDl) return;

    // Récupérer les données PHP via les data-attributes
    const config = document.getElementById('neles-config');
    let manifestUrl = config ? config.dataset.manifestUrl : '';
    const iiifLogoUrl = config ? config.dataset.iiifLogo : '';

    // On cherche l'email dans le footer pour le bouton Signaler
    const mailtoLink = document.querySelector('footer a[href^="mailto:"]');
    const emailHref = mailtoLink ? mailtoLink.getAttribute('href') : 'mailto:';

    // Fallback: chercher le manifest IIIF par d'autres moyens
    const iiifLink = document.querySelector('link[rel="alternate"][type="application/ld+json"][href*="manifest"]');
    if (!manifestUrl && iiifLink) {
        manifestUrl = iiifLink.href;
    }
    if (!manifestUrl && window.location.pathname.includes('/item/')) {
        const matches = window.location.pathname.match(/\/item\/(\d+)/);
        if (matches && matches[1]) {
            manifestUrl = window.location.origin + '/iiif/2/' + matches[1] + '/manifest';
        }
    }
    if (!manifestUrl && typeof window.miradors !== 'undefined') {
        const miradorKeys = Object.keys(window.miradors);
        if (miradorKeys.length > 0) {
            const configM = window.miradors[miradorKeys[0]];
            if (configM && configM.windows && configM.windows.length > 0) {
                manifestUrl = configM.windows[0].manifestId || configM.windows[0].loadedManifest;
            }
        }
    }

    // Création de la barre
    const toolbar = document.createElement('div');
    toolbar.className = 'metadata-toolbar';

    // Toast notifications
    const toast = document.createElement('div');
    toast.className = 'mirador-toast';
    toast.innerText = 'Lien copié !';
    document.body.appendChild(toast);

    // SVG checkmark pour le feedback visuel
    const checkSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    // Fallback copie pour HTTP (navigator.clipboard nécessite HTTPS)
    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        return Promise.resolve();
    }

    // Helper : feedback visuel sur un bouton après copie
    function showCopySuccess(button, toastText) {
        const originalHTML = button.innerHTML;
        button.innerHTML = checkSvg;
        button.classList.add('is-copied');
        toast.innerText = toastText;
        toast.classList.add('show');
        setTimeout(function () {
            toast.classList.remove('show');
            button.innerHTML = originalHTML;
            button.classList.remove('is-copied');
        }, 2000);
    }

    if (manifestUrl) {
        const btnIiif = document.createElement('button');
        btnIiif.className = 'metadata-btn-action btn-iiif';
        btnIiif.title = 'Copier le manifest IIIF';
        btnIiif.innerHTML = '<img src="' + iiifLogoUrl + '" alt="IIIF" width="20" height="20" style="vertical-align: middle; display: block;">';
        toolbar.appendChild(btnIiif);

        btnIiif.addEventListener('click', function () {
            copyToClipboard(manifestUrl).then(function () {
                showCopySuccess(btnIiif, 'Manifest IIIF copié !');
            });
        });
    }

    const btnShare = document.createElement('button');
    btnShare.className = 'metadata-btn-action btn-share';
    btnShare.title = 'Copier le lien de cette page';
    btnShare.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

    const btnReport = document.createElement('a');
    btnReport.className = 'metadata-btn-action btn-report';
    btnReport.title = 'Signaler un problème sur cette page';
    btnReport.href = emailHref + '?subject=Signalement sur la page ' + encodeURIComponent(window.location.href);
    btnReport.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';

    const btnHelp = document.createElement('a');
    btnHelp.className = 'metadata-btn-action btn-help';
    btnHelp.title = 'Aide';
    btnHelp.href = '/s/neles/page/aide';
    btnHelp.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';

    toolbar.appendChild(btnShare);
    toolbar.appendChild(btnReport);
    toolbar.appendChild(btnHelp);

    btnShare.addEventListener('click', function () {
        copyToClipboard(window.location.href).then(function () {
            showCopySuccess(btnShare, 'Lien copié !');
        });
    });

    // Insérer au-dessus du tableau des métadonnées (avant le dl)
    metadataDl.parentNode.insertBefore(toolbar, metadataDl);
});
