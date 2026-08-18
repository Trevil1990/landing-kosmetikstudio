document.addEventListener("DOMContentLoaded", function () {
  initNavCloseOnNavigate();
  initAboutVideoFallback();
  initGallerySlider();
  initReportError();
});

function initNavCloseOnNavigate() {
  var nav = document.getElementById("primaryNav");
  if (!nav || typeof bootstrap === "undefined" || !bootstrap.Collapse) {
    return;
  }

  var collapse = bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href^='#']");
    if (!link) {
      return;
    }

    if (link.getAttribute("data-bs-toggle") === "modal") {
      return;
    }

    var href = link.getAttribute("href");
    if (!href || href === "#") {
      return;
    }

    var target = document.querySelector(href);
    if (!target) {
      return;
    }

    if (!nav.classList.contains("show")) {
      return;
    }

    event.preventDefault();

    var onHidden = function () {
      nav.removeEventListener("hidden.bs.collapse", onHidden);
      scrollToHashTarget(target, href);
    };

    nav.addEventListener("hidden.bs.collapse", onHidden);
    collapse.hide();
  });
}

function scrollToHashTarget(target, href) {
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  target.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start"
  });

  if (history.replaceState) {
    history.replaceState(null, "", href);
  }
}

function initAboutVideoFallback() {
  var video = document.querySelector(".about__video");
  if (!video) {
    return;
  }

  var mp4Src = "assets/video/video_about_me.MP4";

  function switchToMp4() {
    if (video.getAttribute("data-fallback") === "mp4") {
      return;
    }

    video.setAttribute("data-fallback", "mp4");
    video.src = mp4Src;
    video.load();

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  video.addEventListener("error", switchToMp4);
}

function initGallerySlider() {
  var slider = document.querySelector(".gallery-slider");
  var track = document.querySelector("[data-gallery-track]");
  var prevBtn = document.querySelector("[data-gallery-prev]");
  var nextBtn = document.querySelector("[data-gallery-next]");

  if (!slider || !track) {
    return;
  }

  var originals = Array.prototype.slice.call(track.children);
  if (originals.length === 0) {
    return;
  }

  // Duplicate the set so the strip can loop like a circle.
  originals.forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach(function (img) {
      img.setAttribute("alt", "");
      img.removeAttribute("loading");
    });
    track.appendChild(clone);
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    slider.classList.add("gallery-slider--static");
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  slider.classList.add("gallery-slider--marquee");

  var offset = 0;
  var loopWidth = 0;
  var direction = 1;
  var paused = false;
  var speedPxPerSec = 28;
  var lastTime = 0;
  var rafId = 0;

  function measureLoopWidth() {
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    var width = 0;

    for (var i = 0; i < originals.length; i++) {
      width += originals[i].getBoundingClientRect().width;
    }

    // Include the gap after the last original card (before the clone set).
    loopWidth = width + gap * originals.length;
  }

  function setDirection(dir) {
    direction = dir === "reverse" ? -1 : 1;
    slider.dataset.direction = direction === 1 ? "forward" : "reverse";
    if (prevBtn) prevBtn.setAttribute("aria-pressed", direction === -1 ? "true" : "false");
    if (nextBtn) nextBtn.setAttribute("aria-pressed", direction === 1 ? "true" : "false");
  }

  function tick(now) {
    if (!lastTime) {
      lastTime = now;
    }

    var delta = Math.min((now - lastTime) / 1000, 0.064);
    lastTime = now;

    if (!paused && loopWidth > 0) {
      offset += direction * speedPxPerSec * delta;

      if (offset >= loopWidth) {
        offset -= loopWidth;
      } else if (offset < 0) {
        offset += loopWidth;
      }

      track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
    }

    rafId = window.requestAnimationFrame(tick);
  }

  function onResize() {
    var progress = loopWidth > 0 ? offset / loopWidth : 0;
    measureLoopWidth();
    offset = progress * loopWidth;
    track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
  }

  setDirection("forward");
  measureLoopWidth();
  rafId = window.requestAnimationFrame(tick);

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      setDirection("reverse");
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      setDirection("forward");
    });
  }

  slider.addEventListener("pointerenter", function () {
    paused = true;
  });
  slider.addEventListener("pointerleave", function () {
    paused = false;
    lastTime = 0;
  });
  slider.addEventListener("focusin", function () {
    paused = true;
  });
  slider.addEventListener("focusout", function () {
    paused = false;
    lastTime = 0;
  });

  window.addEventListener("resize", onResize);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      window.cancelAnimationFrame(rafId);
      lastTime = 0;
    } else {
      rafId = window.requestAnimationFrame(tick);
    }
  });
}

function initReportError() {
  var modalEl = document.getElementById("report-error-modal");
  var form = document.getElementById("report-error-form");
  var textarea = document.getElementById("report-error-description");

  if (!modalEl || !form || !textarea) {
    return;
  }

  var reportEmail = "kosmetik.suhl@gmail.com";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var description = textarea.value.trim();
    if (!description) {
      textarea.setCustomValidity("Bitte beschreiben Sie das Problem.");
      textarea.reportValidity();
      return;
    }

    textarea.setCustomValidity("");
    window.location.href = buildReportMailto(reportEmail, description);
  });

  textarea.addEventListener("input", function () {
    textarea.setCustomValidity("");
  });

  modalEl.addEventListener("shown.bs.modal", function () {
    textarea.focus();
  });

  modalEl.addEventListener("hidden.bs.modal", function () {
    form.reset();
    textarea.setCustomValidity("");
  });
}

function buildReportMailto(email, description) {
  var subject = "Fehler auf der Website";
  var body = [
    "Beschreibung:",
    description,
    "",
    "URL:",
    window.location.href,
    "",
    "Browser:",
    detectBrowserName(),
    "",
    "OS:",
    detectOsName(),
    "",
    "Screen:",
    screen.width + " x " + screen.height,
    "",
    "Viewport:",
    window.innerWidth + " x " + window.innerHeight,
    "",
    "User Agent:",
    navigator.userAgent || "Unbekannt",
    "",
    "Zeit:",
    new Date().toISOString()
  ].join("\n");

  return (
    "mailto:" +
    email +
    "?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body)
  );
}

function detectBrowserName() {
  var ua = navigator.userAgent || "";

  if (/Edg\//.test(ua) || /EdgiOS/.test(ua)) {
    return "Microsoft Edge";
  }
  if (/OPR\//.test(ua) || /OPiOS/.test(ua) || /Opera/.test(ua)) {
    return "Opera";
  }
  if (/Firefox\//.test(ua) || /FxiOS/.test(ua)) {
    return "Firefox";
  }
  if (/Chrome\//.test(ua) || /CriOS/.test(ua)) {
    return "Chrome";
  }
  if (/Safari\//.test(ua)) {
    return "Safari";
  }

  return "Unbekannt";
}

function detectOsName() {
  var ua = navigator.userAgent || "";
  var hintsPlatform = "";

  if (navigator.userAgentData && navigator.userAgentData.platform) {
    hintsPlatform = navigator.userAgentData.platform;
  }

  if (
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  ) {
    return "iOS";
  }
  if (/Android/.test(ua) || /^Android$/i.test(hintsPlatform)) {
    return "Android";
  }
  if (/Windows/.test(ua) || /^Win/i.test(hintsPlatform)) {
    return "Windows";
  }
  if (/Mac OS X/.test(ua) || /^macOS$/i.test(hintsPlatform)) {
    return "macOS";
  }
  if (/CrOS/.test(ua) || /^Chrome OS$/i.test(hintsPlatform)) {
    return "Chrome OS";
  }
  if (/Linux/.test(ua) || /^Linux$/i.test(hintsPlatform)) {
    return "Linux";
  }

  return hintsPlatform || "Unbekannt";
}
