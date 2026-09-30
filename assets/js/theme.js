(function () {
  var STORAGE_KEY = "versal-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Ignore private mode failures.
    }
  }

  function browserPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function resolveTheme() {
    var stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return browserPrefersDark() ? "dark" : "light";
  }

  function updateThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      return;
    }
    meta.setAttribute("content", theme === "dark" ? "#141210" : "#825850");
  }

  function updateToggleButtons(theme) {
    var label =
      theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren";

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      button.dataset.themeState = theme;
    });
  }

  function applyTheme(theme, persist) {
    var next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    updateThemeColor(next);
    updateToggleButtons(next);
    if (persist) {
      storeTheme(next);
    }
  }

  function initTheme() {
    applyTheme(resolveTheme(), false);

    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-theme-toggle]");
      if (!button) {
        return;
      }

      var current = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark", true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();
