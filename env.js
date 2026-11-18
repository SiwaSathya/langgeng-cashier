/**
 * SmartPOS Environment Configuration, Real-Time Presence Heartbeat,
 * & Enterprise Security Guard (9-Hour Token TTL, 5-Hour Interactive Rolling Renewal,
 * Token Validity Verification, & Auto-Redirect to Login)
 */

(function () {
  // 0. Anti-Clickjacking Frame Buster (Defense-in-depth bersama X-Frame-Options: DENY di vercel.json)
  // Tidak memblokir iframe saat dibuka di lingkungan local, protokol file://, atau ekstensi simulator pengembang
  const isDevOrLocal =
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (window.top !== window.self && !isDevOrLocal) {
    try {
      if (window.top.location.hostname !== window.self.location.hostname) {
        window.top.location = window.self.location;
      }
    } catch (_) {
      console.warn(
        "[SmartPOS Security] Embedded iframe detected from external untrusted domain.",
      );
      window.location = "about:blank";
    }
  }

  // 0.2 Progressive Web App (PWA) Service Worker Registration
  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("sw.js")
        .then(function (reg) {
          console.log("[SmartPOS PWA] Service Worker aktif:", reg.scope);
        })
        .catch(function (err) {
          console.warn(
            "[SmartPOS PWA] Registrasi Service Worker dilewati:",
            err.message,
          );
        });
    });
  }

  // 0.1 Universal Anti-XSS Sanitizer Helper (Mencegah Stored & Reflected XSS pada .innerHTML)
  window.escapeHtml = function (str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  // 1. URL Default Configuration
  const LOCAL_BACKEND_URL = "http://127.0.0.1:4000";
  const PRODUCTION_BACKEND_URL =
    "https://langgeng-cashier-backend-production.up.railway.app";

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  // Izinkan auto-set via query param ?backend=https://... untuk kemudahan switch URL
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const paramBackend = urlParams.get("backend") || urlParams.get("api");
    if (paramBackend) {
      localStorage.setItem(
        "SMARTPOS_BACKEND_URL",
        paramBackend.trim().replace(/\/+$/, ""),
      );
    }
  } catch (_) {}

  const manualOverride = localStorage.getItem("SMARTPOS_BACKEND_URL");
  const selectedBaseUrl =
    manualOverride || (isLocal ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL);

  window.BASE_URL = selectedBaseUrl.replace(/\/+$/, "");
  window.API_URL = window.BASE_URL + "/api";

  console.log(
    `[SmartPOS Env] Active Backend URL: ${window.BASE_URL} (Auto-detected isLocal: ${isLocal})`,
  );

  // 2. Token Parsing & Expiration Verification Helper
  window.parseJwtPayload = function (token) {
    if (!token || typeof token !== "string") return null;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (_) {
      return null;
    }
  };

  window.getUserDataFromToken = function (optToken) {
    const token = optToken || localStorage.getItem("token");
    if (!token) return null;
    const data = window.parseJwtPayload(token);
    if (!data) return null;

    // Periksa kevalidan tanggal kadaluarsa (exp)
    if (
      data.exp != null &&
      (!Number.isFinite(Number(data.exp)) ||
        Number(data.exp) * 1000 <= Date.now())
    ) {
      return null; // Token telah kadaluarsa
    }
    return data;
  };

  // 3. Deteksi Halaman & Immediate Auth Route Guard
  const pathParts = window.location.pathname.split("/");
  const currentPage = pathParts[pathParts.length - 1] || "index.html";
  const isLoginPage = currentPage === "index.html" || currentPage === "";

  function redirectToLogin(reason) {
    localStorage.removeItem("token");
    sessionStorage.clear();
    const reasonParam = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    if (!isLoginPage) {
      window.location.replace(`index.html${reasonParam}`);
    }
  }

  // Pre-render Security Check: Jika membuka halaman internal tanpa token valid atau token sudah exp, langsung redirect
  if (!isLoginPage) {
    const rawToken = localStorage.getItem("token");
    const validUser = window.getUserDataFromToken(rawToken);
    if (!rawToken || !validUser) {
      console.warn(
        "[SmartPOS Security] Token tidak ditemukan atau telah kedaluwarsa. Mengalihkan ke login...",
      );
      redirectToLogin("session_expired");
      return;
    }
  }

  // 4. Token Rolling Renewal (Perpanjang 9 Jam saat user interaktif & usia token >= 5 jam)
  let isRefreshing = false;
  let lastRefreshAttempt = 0;

  async function checkAndRenewTokenOnInteraction() {
    if (isLoginPage) return;
    const curToken = localStorage.getItem("token");
    if (!curToken) return;

    const payload = window.parseJwtPayload(curToken);
    if (!payload || !payload.exp) return;

    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = Number(payload.exp);

    // Jika token sudah lewat waktu (expired), alihkan ke login
    if (nowSec >= expSec) {
      redirectToLogin("session_expired");
      return;
    }

    // Hitung usia token sejak diterbitkan (iat)
    const iatSec = Number(payload.iat) || expSec - 32400; // default 9 jam (32400 detik)
    const elapsedSec = nowSec - iatSec;
    const fiveHoursSec = 5 * 3600; // 18.000 detik

    // Syarat perpanjangan: Usia token sudah berjalan >= 5 jam (atau sisa <= 4 jam dari total 9 jam)
    const isEligible =
      elapsedSec >= fiveHoursSec || expSec - nowSec <= 4 * 3600;

    // Batasi frekuensi pemanggilan refresh minimal jeda 60 detik
    const nowMs = Date.now();
    if (isEligible && !isRefreshing && nowMs - lastRefreshAttempt > 60000) {
      isRefreshing = true;
      lastRefreshAttempt = nowMs;

      try {
        console.log(
          `[SmartPOS Security] Token telah berjalan ${Math.floor(elapsedSec / 3600)} jam. Memperpanjang 9 jam lagi karena interaksi pengguna...`,
        );
        const res = await fetch(`${window.API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${curToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.token) {
            localStorage.setItem("token", data.token);
            console.log(
              "[SmartPOS Security] Sesi berhasil diperpanjang 9 jam penuh (Rolling Session Aktif).",
            );
            window.dispatchEvent(
              new CustomEvent("token-refreshed", { detail: data }),
            );
          }
        } else if (res.status === 401) {
          redirectToLogin("session_expired");
        }
      } catch (err) {
        console.warn("[SmartPOS Security] Gagal memperbarui token:", err);
      } finally {
        isRefreshing = false;
      }
    }
  }

  // Daftarkan event listener aktivitas pengguna (Klik, Ketik, Sentuh, Gulir)
  const userActivityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
  let interactionThrottleTimer = null;
  userActivityEvents.forEach((evtName) => {
    window.addEventListener(
      evtName,
      () => {
        if (!interactionThrottleTimer) {
          interactionThrottleTimer = setTimeout(() => {
            interactionThrottleTimer = null;
            checkAndRenewTokenOnInteraction();
          }, 3000); // Throttle periksa setiap 3 detik interaksi
        }
      },
      { passive: true },
    );
  });

  // 5. Periodic Background Watcher: Pantau kadaluarsa token setiap 10 detik
  (window.setPermanentInterval || window.setInterval)(() => {
    if (isLoginPage) return;
    const curToken = localStorage.getItem("token");
    if (!curToken) {
      redirectToLogin("session_expired");
      return;
    }

    const payload = window.parseJwtPayload(curToken);
    if (!payload || !payload.exp) {
      redirectToLogin("session_expired");
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec >= Number(payload.exp)) {
      console.warn(
        "[SmartPOS Security] Masa aktif token 9 jam telah habis. Mengalihkan ke halaman login...",
      );
      if (window.Swal) {
        Swal.fire({
          icon: "warning",
          title: "Sesi Berakhir",
          text: "Masa aktif login Anda telah berakhir (9 jam). Mengalihkan ke halaman login demi keamanan...",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          redirectToLogin("session_expired");
        });
      } else {
        redirectToLogin("session_expired");
      }
    }
  }, 10000);

  // 6. Global Native Fetch Interceptor
  // - Menyisipkan header Authorization otomatis ke endpoint /api/
  // - Menangkap header X-Renewed-Token dari backend untuk perpanjangan rolling otomatis
  // - Menangkap respon 401 Unauthorized dan mengarahkan ke login
  const originalFetch = window.fetch;
  window.fetch = async function (input, init = {}) {
    let url = typeof input === "string" ? input : (input && input.url) || "";
    const options = { ...init };
    options.headers = new Headers(options.headers || {});

    // Jika memanggil API backend
    const isApiCall =
      url.includes("/api/") ||
      (window.API_URL && url.startsWith(window.API_URL));
    const isLoginCall = url.includes("/auth/login");

    const curToken = localStorage.getItem("token");
    if (isApiCall && curToken && !options.headers.has("Authorization")) {
      options.headers.set("Authorization", `Bearer ${curToken}`);
    }

    try {
      const response = await originalFetch(input, options);

      // Cek apakah ada perpanjangan token otomatis dari response header backend
      const renewedToken = response.headers.get("X-Renewed-Token");
      if (renewedToken) {
        localStorage.setItem("token", renewedToken);
        console.log(
          "[SmartPOS Security] Token otomatis diperbarui dari response server.",
        );
      }

      // Jika response 401 Unauthorized dari API (bukan saat login)
      if (response.status === 401 && isApiCall && !isLoginCall) {
        console.warn(
          "[SmartPOS Security] Respon 401 Unauthorized dari server. Mengalihkan ke login...",
        );
        redirectToLogin("session_expired");
      }

      return response;
    } catch (fetchErr) {
      throw fetchErr;
    }
  };

  // 7. Universal Presence Tracker (Heartbeat Ping)
  (function initUniversalPresence() {
    const token = localStorage.getItem("token");
    if (!token || isLoginPage) return;

    let sessionId = sessionStorage.getItem("SMARTPOS_SESSION_ID");
    if (!sessionId) {
      sessionId =
        "sess_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
      sessionStorage.setItem("SMARTPOS_SESSION_ID", sessionId);
    }

    function sendPresencePing() {
      const curToken = localStorage.getItem("token");
      if (!curToken) return;

      const apiUrl = window.API_URL || "http://127.0.0.1:4000/api";
      fetch(`${apiUrl}/presence/ping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${curToken}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          page: currentPage,
        }),
      }).catch(() => {});
    }

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      sendPresencePing();
    } else {
      window.addEventListener("DOMContentLoaded", sendPresencePing);
    }

    const pingTimer = (window.setPermanentInterval || window.setInterval)(
      sendPresencePing,
      25000,
    );

    window.addEventListener("beforeunload", function () {
      clearInterval(pingTimer);
      const curToken = localStorage.getItem("token");
      if (!curToken) return;
      const apiUrl = window.API_URL || "http://127.0.0.1:4000/api";
      const payload = JSON.stringify({ session_id: sessionId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${apiUrl}/presence/leave`,
          new Blob([payload], { type: "application/json" }),
        );
      }
    });
    // 10. Memory-Safe Header-based SSE Reader (Menggantikan EventSource bawaan untuk mencegah Token Leak di URL)
    window.__ACTIVE_SSE_READERS__ = window.__ACTIVE_SSE_READERS__ || [];
    window.createSSEReader = function (url, options = {}) {
      const controller = new AbortController();
      const token = localStorage.getItem("token");
      const headers = {
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      };

      let listeners = {};
      let isClosed = false;
      let activeReader = null;

      const instance = {
        onopen: null,
        onerror: null,
        onmessage: null,
        addEventListener(event, handler) {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(handler);
        },
        removeEventListener(event, handler) {
          if (!listeners[event]) return;
          listeners[event] = listeners[event].filter((cb) => cb !== handler);
        },
        close() {
          if (isClosed) return;
          isClosed = true;
          try {
            controller.abort();
          } catch (_) {}
          if (activeReader) {
            try {
              activeReader.cancel().catch(() => {});
            } catch (_) {}
            activeReader = null;
          }
          listeners = {};
          instance.onopen = null;
          instance.onerror = null;
          instance.onmessage = null;
          const idx = (window.__ACTIVE_SSE_READERS__ || []).indexOf(instance);
          if (idx > -1) {
            window.__ACTIVE_SSE_READERS__.splice(idx, 1);
          }
        },
      };

      window.__ACTIVE_SSE_READERS__.push(instance);

      function emit(event, dataObj) {
        if (isClosed) return;
        if (event === "open" && typeof instance.onopen === "function") {
          instance.onopen(dataObj);
        }
        if (event === "error" && typeof instance.onerror === "function") {
          instance.onerror(dataObj);
        }
        if (event === "message" && typeof instance.onmessage === "function") {
          instance.onmessage(dataObj);
        }
        if (listeners[event]) {
          listeners[event].forEach((cb) => {
            try {
              cb(dataObj);
            } catch (err) {
              console.error("[SSEReader] Listener error:", err);
            }
          });
        }
      }

      (async function startStreaming() {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          emit("open", { type: "open" });

          const reader = response.body.getReader();
          activeReader = reader;
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          while (!isClosed) {
            const { value, done } = await reader.read();
            if (done || isClosed) break;

            buffer += decoder.decode(value, { stream: true });
            if (buffer.length > 65536) buffer = ""; // safety cap against memory runaway
            const blocks = buffer.split("\n\n");
            buffer = blocks.pop() || "";

            for (const block of blocks) {
              if (!block.trim() || isClosed) continue;
              let eventName = "message";
              let dataStr = "";

              const lines = block.split("\n");
              for (const line of lines) {
                if (line.startsWith(":")) continue; // Comment / heartbeat
                if (line.startsWith("event:")) {
                  eventName = line.slice(6).trim();
                } else if (line.startsWith("data:")) {
                  const part = line.slice(5).trim();
                  dataStr = dataStr ? dataStr + "\n" + part : part;
                }
              }

              if (eventName && !isClosed) {
                emit(eventName, { type: eventName, data: dataStr });
              }
            }
          }
        } catch (err) {
          if (!isClosed && err.name !== "AbortError") {
            emit("error", { type: "error", error: err });
          }
        } finally {
          if (!isClosed) {
            instance.close();
          }
        }
      })();

      return instance;
    };
  })();

  // 8. Global Logout Logger Helper
  window.recordLogout = async function (logoutType, shift, location, notes) {
    const token = localStorage.getItem("token");
    const sessionId = sessionStorage.getItem("SMARTPOS_SESSION_ID");
    const apiUrl = window.API_URL || "http://127.0.0.1:4000/api";
    const payload = JSON.stringify({
      session_id: sessionId,
      logout_type: logoutType || "LOGOUT_ONLY",
      shift: shift ? Number(shift) : null,
      location: location || "",
      notes: notes || "",
    });

    try {
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
      // Prioritaskan fetch with keepalive agar Authorization header JWT terkirim lengkap ke backend
      if (window.fetch) {
        await fetch(`${apiUrl}/auth/logout${tokenParam}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: payload,
          keepalive: true,
        });
      } else if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${apiUrl}/auth/logout${tokenParam}`,
          new Blob([payload], { type: "application/json" }),
        );
      }
    } catch (e) {
      console.warn("[SmartPOS] Gagal mencatat log logout:", e);
    }
  };

  // 9. Universal Safe Sidebar Logout Function
  window.confirmLogout = async function () {
    if (typeof paymentPending !== "undefined" && paymentPending) return;

    if (!window.Swal) {
      if (confirm("Apakah Anda yakin ingin keluar dari sistem kasir?")) {
        if (window.recordLogout) {
          const curUser =
            (typeof getUserDataFromToken === "function"
              ? getUserDataFromToken()
              : null) || {};
          await window.recordLogout(
            "LOGOUT_ONLY",
            null,
            curUser.location || "",
            "Logout",
          );
        }
        localStorage.removeItem("token");
        window.location.href = "index.html";
      }
      return;
    }

    const result = await Swal.fire({
      title: "Konfirmasi Keluar",
      text: "Apakah Anda yakin ingin keluar dari sistem kasir?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText:
        '<i class="fas fa-sign-out-alt mr-1.5"></i> Ya, Keluar',
      cancelButtonText: '<i class="fas fa-times mr-1.5"></i> Batal',
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      if (window.recordLogout) {
        const curUser =
          (typeof getUserDataFromToken === "function"
            ? getUserDataFromToken()
            : null) || {};
        await window.recordLogout(
          "LOGOUT_ONLY",
          null,
          curUser.location || "",
          "Logout",
        );
      }
      localStorage.removeItem("token");
      window.location.href = "index.html";
    }
  };
})();
