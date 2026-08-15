document.addEventListener("DOMContentLoaded", function () {
  initNavCloseOnNavigate();
  initGallerySlider();
});

function initNavCloseOnNavigate() {
  var nav = document.getElementById("primaryNav");
  if (!nav || typeof bootstrap === "undefined" || !bootstrap.Collapse) {
    return;
  }

  var collapse = bootstrap.Collapse.getOrCreateInstance(nav, { toggle: false });

  nav.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      if (nav.classList.contains("show")) {
        collapse.hide();
      }
    });
  });
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
