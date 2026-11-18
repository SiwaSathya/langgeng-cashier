/**
 * Langgeng SmartPOS - Progressive Web App (PWA) Service Worker
 * Menyediakan caching aset offline, waktu muat super cepat, dan instalasi native di Windows, Mac, Android, dan iOS.
 */

const CACHE_NAME = "langgeng-smartpos-v11";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./dashboard.html",
  "./product.html",
  "./riwayat.html",
  "./purchase.html",
  "./expense.html",
  "./retur.html",
  "./akuntansi.html",
  "./absensi.html",
  "./report.html",
  "./opname.html",
  "./online-users.html",
  "./logo.svg",
  "./manifest.json",
  "./env.js",
  "./shortcuts.js",
  "./mobile-nav.js",
  "./spa-router.js",
  "./vendor/tailwindcss.js",
  "./vendor/alpine.min.js",
  "./vendor/sweetalert2.all.min.js",
];

// 1. Install Event: Cache Aset Inti Aplikasi
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SmartPOS SW] Pre-caching aset aplikasi offline...");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn(
          "[SmartPOS SW] Sebagian aset gagal di-cache saat install:",
          err,
        );
      });
    }),
  );
});

// 2. Activate Event: Bersihkan Cache Versi Lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[SmartPOS SW] Menghapus cache versi lama:", key);
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch Event: Strategi Network-First untuk API dan Stale-While-Revalidate untuk Aset Statis
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan sentuh API / SSE stream / backend dynamic calls (selalu real-time via network)
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/stream/") ||
    url.protocol === "chrome-extension:"
  ) {
    return;
  }

  // Untuk navigasi HTML dan aset statis: Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Jika koneksi internet terputus (offline), kembalikan response dari cache
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      });
    }),
  );
});
