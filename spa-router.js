/**
 * SMARTPOS SPA Router with Alpine.js & Autonomous Memory Garbage Collector
 * Menghilangkan Full Page Reload pada seluruh navigasi internal aplikasi saat dijalankan di web server.
 * Navigasi antar halaman menjadi instan, ringan, dan responsif tanpa kedipan putih (white flash).
 * Dilengkapi Autonomous Lifecycle Garbage Collector untuk membebaskan RAM secara optimal.
 */

(function () {
  // Hindari duplikasi inisialisasi
  if (window.__SMARTPOS_SPA_INITIALIZED__) return;
  window.__SMARTPOS_SPA_INITIALIZED__ = true;

  // JIKA DIBUKA LANGSUNG SEBAGAI FILE LOKAL (file://):
  if (window.location.protocol === "file:") {
    console.info(
      "SmartPOS: Berjalan dalam protokol file:// lokal. Menggunakan navigasi file standar.",
    );
    return;
  }

  // ========================================================
  // 1. AUTONOMOUS LIFECYCLE & MEMORY GARBAGE COLLECTOR
  // ========================================================
  const originalSetInterval = window.setInterval.bind(window);
  const originalClearInterval = window.clearInterval.bind(window);
  const originalSetTimeout = window.setTimeout.bind(window);
  const originalClearTimeout = window.clearTimeout.bind(window);
  const originalWindowAddEventListener = window.addEventListener.bind(window);
  const originalWindowRemoveEventListener = window.removeEventListener.bind(window);
  const originalDocAddEventListener = document.addEventListener.bind(document);
  const originalDocRemoveEventListener = document.removeEventListener.bind(document);

  const pageIntervals = new Set();
  const pageTimeouts = new Set();
  const pageWindowListeners = [];
  const pageDocListeners = [];

  // Expose primitive permanen untuk background service global
  window.setPermanentInterval = originalSetInterval;
  window.setPermanentTimeout = originalSetTimeout;
  window.addPermanentEventListener = originalWindowAddEventListener;
  document.addPermanentEventListener = originalDocAddEventListener;

  // Intercept addEventListener pada window & document
  window.addEventListener = function (type, listener, options) {
    if (
      (options && options.permanent) ||
      type.startsWith("spa:") ||
      !document.body
    ) {
      return originalWindowAddEventListener(type, listener, options);
    }
    pageWindowListeners.push({ type, listener, options });
    return originalWindowAddEventListener(type, listener, options);
  };

  document.addEventListener = function (type, listener, options) {
    if (
      (options && options.permanent) ||
      type.startsWith("spa:") ||
      !document.body
    ) {
      return originalDocAddEventListener(type, listener, options);
    }
    pageDocListeners.push({ type, listener, options });
    return originalDocAddEventListener(type, listener, options);
  };

  // Intercept setInterval & setTimeout untuk membersihkan interval halaman lama
  window.setInterval = function (fn, delay, ...args) {
    if (!document.body || (args[0] && args[0].permanent)) {
      return originalSetInterval(fn, delay, ...args);
    }
    const id = originalSetInterval(fn, delay, ...args);
    pageIntervals.add(id);
    return id;
  };

  window.clearInterval = function (id) {
    pageIntervals.delete(id);
    return originalClearInterval(id);
  };

  window.setTimeout = function (fn, delay, ...args) {
    if (!document.body || (args[0] && args[0].permanent)) {
      return originalSetTimeout(fn, delay, ...args);
    }
    let id;
    const wrappedFn = function (...cbArgs) {
      pageTimeouts.delete(id);
      if (typeof fn === "function") {
        fn(...cbArgs);
      }
    };
    id = originalSetTimeout(wrappedFn, delay, ...args);
    pageTimeouts.add(id);
    return id;
  };

  window.clearTimeout = function (id) {
    pageTimeouts.delete(id);
    return originalClearTimeout(id);
  };

  // Fungsi utama pembersihan memori halaman sebelum berpindah
  function cleanupActivePageResources() {
    // A. Bersihkan seluruh timer interval halaman
    pageIntervals.forEach((id) => {
      try {
        originalClearInterval(id);
      } catch (_) {}
    });
    pageIntervals.clear();

    // B. Bersihkan pending timeout halaman
    pageTimeouts.forEach((id) => {
      try {
        originalClearTimeout(id);
      } catch (_) {}
    });
    pageTimeouts.clear();

    // C. Lepaskan seluruh event listener window & document halaman
    pageWindowListeners.forEach(({ type, listener, options }) => {
      try {
        originalWindowRemoveEventListener(type, listener, options);
      } catch (_) {}
    });
    pageWindowListeners.length = 0;

    pageDocListeners.forEach(({ type, listener, options }) => {
      try {
        originalDocRemoveEventListener(type, listener, options);
      } catch (_) {}
    });
    pageDocListeners.length = 0;

    // D. Hancurkan seluruh canvas/WebGL Chart.js aktif
    if (window.Chart && window.Chart.instances) {
      try {
        Object.values(window.Chart.instances).forEach((inst) => {
          if (inst && typeof inst.destroy === "function") {
            inst.destroy();
          }
        });
      } catch (_) {}
    }

    // E. Tutup seluruh koneksi SSE aktif
    if (Array.isArray(window.__ACTIVE_SSE_READERS__)) {
      window.__ACTIVE_SSE_READERS__.forEach((reader) => {
        try {
          if (reader && typeof reader.close === "function") {
            reader.close();
          }
        } catch (_) {}
      });
      window.__ACTIVE_SSE_READERS__ = [];
    }

    // F. Bersihkan sisa-sisa iframe print nota
    document.querySelectorAll("iframe[srcdoc]").forEach((frame) => {
      try {
        frame.remove();
      } catch (_) {}
    });

    // G. Dereferensikan penampung data besar yang sempat masuk window
    const largeDataKeys = [
      "localSalesData",
      "allSalesData",
      "allProducts",
      "products",
      "allPurchases",
      "allExpenses",
      "allReturs",
      "allJournals",
      "allLedgers",
      "allOpnames",
      "auditRecords",
      "filteredLogs",
      "usersOnlineData",
      "presenceLogs",
      "reportDataCache",
      "chartTren",
      "chartMetodeDetail",
      "chartMargin",
      "chartProfitKat",
      "chartHours",
      "chartForecastingCash",
      "chartStockHealth",
    ];
    largeDataKeys.forEach((key) => {
      if (window[key] !== undefined && window[key] !== null) {
        try {
          window[key] = null;
        } catch (_) {}
      }
    });

    // H. Bersihkan window.onload
    window.onload = null;
  }

  // Top progress loading bar element
  let progressBar = null;

  // 1. In-Memory Page Cache untuk Navigasi Instan 0ms
  const pageCache = new Map();

  // Prefetching halaman ke memory cache saat hover (PC) atau touchstart (HP)
  function prefetchPage(url) {
    if (!url || typeof url !== "string") return;
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.origin !== window.location.origin) return;
      if (!parsed.pathname.endsWith(".html") && parsed.pathname.includes(".")) return;
      if (pageCache.has(parsed.href)) return;

      fetch(parsed.href, { priority: "low" })
        .then((res) => (res.ok ? res.text() : null))
        .then((html) => {
          if (html) pageCache.set(parsed.href, html);
        })
        .catch(() => {});
    } catch (_) {}
  }

  // Inject CSS Style untuk Native View Transitions & Smooth Micro-Animations (Cross-browser)
  function injectSpaTransitionStyles() {
    if (document.getElementById("spa-transitions-style")) return;
    const style = document.createElement("style");
    style.id = "spa-transitions-style";
    style.textContent = `
      @view-transition {
        navigation: auto;
      }
      #main-content {
        view-transition-name: spa-main-content;
      }
      #app-sidebar, #ios-bottom-bar, #ios-menu-wrapper, #spa-progress-bar {
        view-transition-name: none !important;
      }
      @keyframes spaContentFadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-4px); }
      }
      @keyframes spaContentFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      ::view-transition-old(spa-main-content) {
        animation: 0.14s cubic-bezier(0.16, 1, 0.3, 1) both spaContentFadeOut;
      }
      ::view-transition-new(spa-main-content) {
        animation: 0.20s cubic-bezier(0.16, 1, 0.3, 1) both spaContentFadeIn;
      }

      /* Fallback animasi sangat halus untuk Safari iOS & browser lawas */
      .spa-fade-out {
        opacity: 0 !important;
        transform: translateY(-4px) !important;
        transition: opacity 0.14s cubic-bezier(0.16, 1, 0.3, 1), transform 0.14s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .spa-fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: opacity 0.20s cubic-bezier(0.16, 1, 0.3, 1), transform 0.20s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function initProgressBar() {
    injectSpaTransitionStyles();
    if (progressBar) return;
    progressBar = document.createElement("div");
    progressBar.id = "spa-progress-bar";
    progressBar.style.cssText =
      "position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: linear-gradient(90deg, #3B82F6, #10B981); z-index: 99999; transition: width 0.2s ease, opacity 0.3s ease; pointer-events: none; opacity: 0; box-shadow: 0 0 12px rgba(59, 130, 246, 0.9), 0 0 4px rgba(16, 185, 129, 0.7);";
    document.body.appendChild(progressBar);
  }

  function startProgress() {
    initProgressBar();
    progressBar.style.opacity = "1";
    progressBar.style.width = "30%";
    setTimeout(() => {
      if (progressBar && progressBar.style.opacity === "1") {
        progressBar.style.width = "70%";
      }
    }, 150);
  }

  function finishProgress() {
    if (!progressBar) return;
    progressBar.style.width = "100%";
    setTimeout(() => {
      progressBar.style.opacity = "0";
      setTimeout(() => {
        progressBar.style.width = "0%";
      }, 300);
    }, 150);
  }

  // Eksekusi skrip halaman baru secara global
  function runPageScripts(doc) {
    // 1. Script external di head atau body
    const externalScripts = doc.querySelectorAll("script[src]");
    externalScripts.forEach((s) => {
      const src = s.getAttribute("src");
      if (src && !document.querySelector("script[src='" + src + "']")) {
        const newScript = document.createElement("script");
        Array.from(s.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        document.head.appendChild(newScript);
      }
    });

    // 2. Inline scripts di body
    const inlineScripts = doc.body.querySelectorAll("script:not([src])");
    inlineScripts.forEach((s) => {
      const code = s.textContent || "";
      if (!code.trim()) return;

      // Lewati helper toggleSidebar standar jika sudah tersedia di window
      if (
        code.includes("function toggleSidebar()") &&
        typeof window.toggleSidebar === "function"
      ) {
        return;
      }

      // Ubah const/let tingkat atas menjadi var agar tersimpan di window & bisa dideklarasi ulang antar halaman
      const transformed = code.replace(/^(\s*)(const|let)\s+/gm, "$1var ");

      const newScript = document.createElement("script");
      newScript.textContent = transformed;
      document.body.appendChild(newScript);
      setTimeout(() => {
        try {
          document.body.removeChild(newScript);
        } catch (_) {}
      }, 50);
    });

    // 3. Jalankan lifecycle inisialisasi untuk halaman yang baru dimuat
    setTimeout(() => {
      if (typeof window.onload === "function") {
        try {
          window.onload(new Event("load"));
        } catch (err) {
          console.warn("SPA window.onload warning:", err);
        }
      }
      try {
        document.dispatchEvent(new Event("DOMContentLoaded"));
      } catch (err) {
        console.warn("SPA DOMContentLoaded warning:", err);
      }
    }, 20);
  }

  // Perbarui active state pada navigasi sidebar
  function updateSidebarActiveMenu(targetPath) {
    const navLinks = document.querySelectorAll(
      "#app-sidebar nav a, nav.space-y-1\\.5 a",
    );
    const cleanPath = targetPath.split("/").pop() || "dashboard.html";

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const linkPath = href.split("/").pop();

      if (linkPath === cleanPath) {
        link.className =
          "flex items-center gap-4 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold transition-all border border-blue-100 shadow-2xs";
      } else {
        link.className =
          "flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-all";
      }
    });

    // Tutup sidebar di HP jika terbuka
    if (typeof window.toggleSidebar === "function") {
      const sidebar = document.getElementById("app-sidebar");
      if (
        sidebar &&
        !sidebar.classList.contains("-translate-x-full") &&
        window.innerWidth < 1024
      ) {
        window.toggleSidebar();
      }
    }
  }

  // Fungsi Navigasi SPA Tanpa Reload dengan Instant Cache & Butter-Smooth Transitions
  async function navigateTo(url, pushState = true) {
    const targetUrl = new URL(url, window.location.href);

    // Abaikan jika menuju halaman yang sama persis
    if (
      targetUrl.pathname === window.location.pathname &&
      targetUrl.search === window.location.search
    ) {
      return;
    }

    startProgress();

    try {
      // 1. Ambil HTML: Cek memory cache terlebih dahulu untuk respon instan (0ms)
      let htmlText = pageCache.get(targetUrl.href);
      if (!htmlText) {
        const res = await fetch(targetUrl.href);
        if (!res.ok) throw new Error("HTTP " + res.status);
        htmlText = await res.text();
        pageCache.set(targetUrl.href, htmlText);
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, "text/html");

      const newContent = doc.getElementById("main-content");
      const currentContent = document.getElementById("main-content");

      if (newContent && currentContent) {
        // Trigger cleanup event tepat sebelum DOM di-swap (bukan saat request dimulai)
        window.dispatchEvent(
          new CustomEvent("spa:before-navigate", {
            detail: { targetUrl: targetUrl.href },
          }),
        );
        cleanupActivePageResources();

        const applyDOMUpdates = () => {
          // A. Update title
          if (doc.title) {
            document.title = doc.title;
          }

          // B. Sinkronisasi Mobile Top Bar (header atas mobile)
          const newTopBar = doc.querySelector(".lg\\:hidden.bg-white.border-b, .lg\\:hidden.sticky");
          const curTopBar = document.querySelector(".lg\\:hidden.bg-white.border-b, .lg\\:hidden.sticky");
          if (newTopBar && curTopBar) {
            curTopBar.innerHTML = newTopBar.innerHTML;
          }

          // C. Sinkronisasi Modals Halaman Baru (pindahkan modal baru ke document.body)
          document.querySelectorAll("div.fixed.inset-0[id*=Modal]:not(#shortcut-guide-modal):not(#ios-menu-backdrop), div.fixed.inset-0[id*=modal]:not(#shortcut-guide-modal):not(#ios-menu-backdrop)").forEach((m) => {
            try { m.remove(); } catch (_) {}
          });
          doc.querySelectorAll("div.fixed.inset-0[id*=Modal]:not(#shortcut-guide-modal):not(#ios-menu-backdrop), div.fixed.inset-0[id*=modal]:not(#shortcut-guide-modal):not(#ios-menu-backdrop)").forEach((m) => {
            document.body.appendChild(m.cloneNode(true));
          });

          // D. Bersihkan dan ganti konten main-content
          while (currentContent.firstChild) {
            currentContent.removeChild(currentContent.firstChild);
          }
          currentContent.innerHTML = newContent.innerHTML;
          Array.from(newContent.attributes).forEach((attr) => {
            currentContent.setAttribute(attr.name, attr.value);
          });

          // Reset scroll container ke posisi paling atas
          currentContent.scrollTop = 0;
          window.scrollTo({ top: 0, behavior: "instant" });

          // E. Update URL browser history
          if (pushState) {
            window.history.pushState(
              { spaUrl: targetUrl.href },
              doc.title,
              targetUrl.href,
            );
          }

          // F. Update active menu sidebar desktop
          updateSidebarActiveMenu(targetUrl.pathname);

          // G. Eksekusi skrip halaman baru secara aman
          try {
            runPageScripts(doc);
          } catch (err) {
            console.warn("Script execution warning:", err);
          }

          // H. Re-inisialisasi Alpine.js jika ada
          if (window.Alpine && window.Alpine.initTree) {
            try {
              window.Alpine.initTree(currentContent);
            } catch (_) {}
          }

          // I. Update info user jika ada helper
          if (typeof window.renderUserDisplay === "function") {
            try {
              window.renderUserDisplay();
            } catch (_) {}
          }

          // J. Dispatch event selesai navigasi
          window.dispatchEvent(
            new CustomEvent("spa:navigated", {
              detail: { targetUrl: targetUrl.href },
            }),
          );
        };

        // PILIHAN TRANSISI:
        // 1. Native View Transitions API (Chrome, Edge, Brave 1.67+, Safari 18+)
        if (document.startViewTransition) {
          const transition = document.startViewTransition(() => {
            applyDOMUpdates();
          });
          transition.finished.finally(() => {
            finishProgress();
          });
        } else {
          // 2. Silky CSS Cross-Fade Fallback (Safari iOS PWA & Browser Lama)
          currentContent.classList.add("spa-fade-out");

          setTimeout(() => {
            applyDOMUpdates();
            currentContent.classList.remove("spa-fade-out");
            currentContent.classList.add("spa-fade-in");

            setTimeout(() => {
              currentContent.classList.remove("spa-fade-in");
              finishProgress();
            }, 200);
          }, 140);
        }
      } else {
        // Fallback jika halaman tanpa main-content (misal login index.html)
        window.location.href = targetUrl.href;
      }
    } catch (err) {
      console.warn("SPA navigation error, falling back to clean reload:", err);
      finishProgress();
      window.location.href = targetUrl.href;
    }
  }

  // Prefetching Otomatis pada Hover (Desktop) & TouchStart (HP)
  document.addEventListener(
    "mouseover",
    function (e) {
      const link = e.target.closest("a");
      if (link && link.getAttribute("href")) {
        prefetchPage(link.getAttribute("href"));
      }
    },
    { passive: true, permanent: true },
  );

  document.addEventListener(
    "touchstart",
    function (e) {
      const link = e.target.closest("a");
      if (link && link.getAttribute("href")) {
        prefetchPage(link.getAttribute("href"));
      }
    },
    { passive: true, permanent: true },
  );

  // Intercept click pada seluruh link internal
  document.addEventListener(
    "click",
    function (e) {
      if (window.location.protocol === "file:") return;

      // Cari elemen <a> terdekat
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Abaikan link external, link telpon/mail, download, hash, atau link yang memiliki atribut target / no-spa
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        link.getAttribute("target") === "_blank" ||
        link.hasAttribute("download") ||
        link.hasAttribute("no-spa")
      ) {
        return;
      }

      // Khusus link halaman internal (.html)
      if (href.endsWith(".html") || !href.includes(".")) {
        e.preventDefault();
        navigateTo(href);
      }
    },
    { permanent: true },
  );

  // Handle Back / Forward tombol browser
  window.addEventListener(
    "popstate",
    function () {
      if (window.location.protocol === "file:") return;
      navigateTo(window.location.href, false);
    },
    { permanent: true },
  );

  // Expose helper ke window
  window.SmartPOS_SPA = {
    navigateTo,
    startProgress,
    finishProgress,
    cleanupActivePageResources,
  };
})();
