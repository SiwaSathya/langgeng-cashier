/**
 * SMARTPOS Multi-Page Navigation Engine & Smooth Transition Controller
 * Memastikan setiap halaman memiliki lifecycle script yang bersih, isolasi memori 100%,
 * dan seluruh pemanggilan API data langsung di-hit seketika tanpa perlu refresh manual.
 */

(function () {
  if (window.__SMARTPOS_ROUTER_INITIALIZED__) return;
  window.__SMARTPOS_ROUTER_INITIALIZED__ = true;

  // Top progress bar untuk feedback visual instan saat navigasi
  let progressBar = null;

  function initProgressBar() {
    if (progressBar || !document.body) return;
    progressBar = document.createElement("div");
    progressBar.id = "spa-progress-bar";
    progressBar.style.cssText =
      "position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: linear-gradient(90deg, #3B82F6, #10B981); z-index: 99999; transition: width 0.2s ease, opacity 0.3s ease; pointer-events: none; opacity: 0; box-shadow: 0 0 12px rgba(59, 130, 246, 0.9), 0 0 4px rgba(16, 185, 129, 0.7);";
    document.body.appendChild(progressBar);
  }

  function startProgress() {
    initProgressBar();
    if (!progressBar) return;
    progressBar.style.opacity = "1";
    progressBar.style.width = "40%";
    setTimeout(() => {
      if (progressBar && progressBar.style.opacity === "1") {
        progressBar.style.width = "85%";
      }
    }, 100);
  }

  function finishProgress() {
    if (!progressBar) return;
    progressBar.style.width = "100%";
    setTimeout(() => {
      progressBar.style.opacity = "0";
      setTimeout(() => {
        progressBar.style.width = "0%";
      }, 250);
    }, 100);
  }

  // Preload halaman tujuan pada hover / touch untuk navigasi secepat kilat
  const prefetchedUrls = new Set();
  function prefetchPage(url) {
    if (!url || typeof url !== "string") return;
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.origin !== window.location.origin) return;
      if (!parsed.pathname.endsWith(".html") && parsed.pathname.includes("."))
        return;
      if (prefetchedUrls.has(parsed.href)) return;
      prefetchedUrls.add(parsed.href);

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = parsed.href;
      document.head.appendChild(link);
    } catch (_) {}
  }

  // Navigasi halaman yang bersih dan aman (API langsung ter-hit di halaman tujuan)
  function navigateTo(url) {
    startProgress();
    window.location.href = url;
  }

  // Prefetch saat kursor hover (Desktop)
  document.addEventListener(
    "mouseover",
    function (e) {
      const link = e.target.closest("a");
      if (link && link.getAttribute("href")) {
        prefetchPage(link.getAttribute("href"));
      }
    },
    { passive: true },
  );

  // Prefetch saat disentuh (Mobile)
  document.addEventListener(
    "touchstart",
    function (e) {
      const link = e.target.closest("a");
      if (link && link.getAttribute("href")) {
        prefetchPage(link.getAttribute("href"));
      }
    },
    { passive: true },
  );

  // Berikan feedback visual progress bar saat link internal diklik
  document.addEventListener(
    "click",
    function (e) {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        link.getAttribute("target") === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      if (href.endsWith(".html") || !href.includes(".")) {
        startProgress();
      }
    },
    { passive: true },
  );

  window.SmartPOS_SPA = {
    navigateTo,
    startProgress,
    finishProgress,
    cleanupActivePageResources: function () {},
  };

  // Selesaikan animasi progress bar saat halaman selesai dimuat
  if (document.readyState === "complete") {
    finishProgress();
  } else {
    window.addEventListener("load", finishProgress);
  }
})();
