(function () {
  var STORAGE_KEY = "versal-consent-v1";
  var UMAMI_SRC = "https://cloud.umami.is/script.js";
  var UMAMI_WEBSITE_ID = "07e20020-88ff-4dad-904c-0dc1d95ca5b4";
  var MAP_SRC =
    "https://maps.google.com/maps?q=Beauty%20Studio%20Versal%20Kirchgasse%207%20Suhl&z=15&output=embed";

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function writeConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (error) {
      // Ignore quota / private mode write failures.
    }
  }

  function assetPath(file) {
    var path = window.location.pathname || "";
    if (path.indexOf("/legal/") !== -1) {
      return "../" + file;
    }
    return file;
  }

  function loadUmami() {
    if (document.querySelector('script[data-umami-consent="1"]')) {
      return;
    }

    var script = document.createElement("script");
    script.defer = true;
    script.src = UMAMI_SRC;
    script.setAttribute("data-website-id", UMAMI_WEBSITE_ID);
    script.setAttribute("data-umami-consent", "1");
    document.head.appendChild(script);
  }

  function ensureMapPlaceholder(container) {
    if (container.querySelector("[data-map-placeholder]")) {
      return;
    }

    var placeholder = document.createElement("div");
    placeholder.className = "map-container__consent";
    placeholder.setAttribute("data-map-placeholder", "");
    placeholder.innerHTML =
      "<p class=\"map-container__consent-text\">Zum Anzeigen der interaktiven Karte werden Daten an Google übertragen. Details in der <a href=\"" +
      assetPath("legal/datenschutz.html") +
      "#privacy-maps\">Datenschutzerklärung</a>.</p>" +
      "<button type=\"button\" class=\"btn btn-primary map-container__consent-btn\" data-map-load>Karte laden</button>";
    container.appendChild(placeholder);
  }

  function unloadMap() {
    var container = document.getElementById("map-container");
    if (!container) {
      return;
    }

    var iframe = container.querySelector("iframe");
    if (iframe) {
      iframe.remove();
    }

    ensureMapPlaceholder(container);
  }

  function loadMap() {
    var container = document.getElementById("map-container");
    if (!container) {
      return;
    }

    var mapSrc = container.getAttribute("data-map-src") || MAP_SRC;
    var placeholder = container.querySelector("[data-map-placeholder]");
    if (placeholder) {
      placeholder.remove();
    }

    var existing = container.querySelector("iframe");
    if (existing) {
      existing.src = mapSrc;
      return;
    }

    var iframe = document.createElement("iframe");
    iframe.className = "map-container__iframe";
    iframe.src = mapSrc;
    iframe.title = "Standort von Beauty Studio Versal auf Google Maps";
    iframe.width = "600";
    iframe.height = "450";
    iframe.loading = "lazy";
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    iframe.allowFullscreen = true;
    container.appendChild(iframe);
  }

  function applyConsent(consent) {
    if (consent.analytics) {
      loadUmami();
    }

    if (consent.maps) {
      loadMap();
    } else {
      unloadMap();
    }
  }

  function hideBanner() {
    var banner = document.getElementById("consent-banner");
    if (banner) {
      banner.hidden = true;
    }
  }

  function showBanner() {
    var banner = document.getElementById("consent-banner");
    if (banner) {
      banner.hidden = false;
    }
  }

  function saveAndApply(analytics, maps) {
    var consent = {
      analytics: !!analytics,
      maps: !!maps,
      updatedAt: new Date().toISOString()
    };
    writeConsent(consent);
    applyConsent(consent);
    hideBanner();
  }

  function buildBanner() {
    if (document.getElementById("consent-banner")) {
      return;
    }

    var privacyHref = assetPath("legal/datenschutz.html");
    var banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "consent-banner-title");
    banner.setAttribute("aria-describedby", "consent-banner-text");
    banner.innerHTML =
      "<div class=\"consent-banner__inner\">" +
      "<div class=\"consent-banner__copy\">" +
      "<p class=\"consent-banner__title\" id=\"consent-banner-title\">Datenschutz-Einstellungen</p>" +
      "<p class=\"consent-banner__text\" id=\"consent-banner-text\">" +
      "Wir verwenden Umami Analytics zur Reichweitenmessung und können Google Maps zur Kartendarstellung laden. " +
      "Beides erfolgt nur mit Ihrer Einwilligung. Weitere Informationen in der " +
      "<a href=\"" +
      privacyHref +
      "\">Datenschutzerklärung</a>." +
      "</p>" +
      "</div>" +
      "<div class=\"consent-banner__actions\">" +
      "<button type=\"button\" class=\"btn consent-banner__btn consent-banner__btn--secondary\" data-consent-reject>Nur notwendige</button>" +
      "<button type=\"button\" class=\"btn btn-primary consent-banner__btn\" data-consent-accept>Alle akzeptieren</button>" +
      "</div>" +
      "</div>";

    document.body.appendChild(banner);
  }

  function initMapLoadButton() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-map-load]");
      if (!button) {
        return;
      }

      var current = readConsent() || { analytics: false, maps: false };
      current.maps = true;
      current.updatedAt = new Date().toISOString();
      writeConsent(current);
      loadMap();
    });
  }

  function initBannerButtons() {
    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-consent-accept]")) {
        saveAndApply(true, true);
        return;
      }

      if (event.target.closest("[data-consent-reject]")) {
        saveAndApply(false, false);
      }
    });
  }

  function initConsentResetLinks() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest("[data-consent-reset]");
      if (!link) {
        return;
      }

      event.preventDefault();
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        // Ignore.
      }
      unloadMap();
      showBanner();
    });
  }

  function initConsent() {
    buildBanner();
    initBannerButtons();
    initMapLoadButton();
    initConsentResetLinks();

    var container = document.getElementById("map-container");
    if (container) {
      ensureMapPlaceholder(container);
    }

    var consent = readConsent();
    if (!consent) {
      showBanner();
      return;
    }

    hideBanner();
    applyConsent(consent);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initConsent);
  } else {
    initConsent();
  }
})();
