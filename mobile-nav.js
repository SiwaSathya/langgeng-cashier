/**
 * Langgeng SmartPOS - iOS Style Floating Glass Bottom Navigation Engine
 * HANYA aktif pada tampilan mobile (< 1024px).
 * Tampilan Desktop (>= 1024px) DIJAMIN 100% UTUH tanpa modifikasi layout/padding apa pun.
 */

(function initIosMobileNav() {
  // Jangan pasang di halaman login
  const pathParts = window.location.pathname.split("/");
  const currentPage = (
    pathParts[pathParts.length - 1] || "dashboard.html"
  ).toLowerCase();
  if (
    currentPage === "index.html" ||
    currentPage === "" ||
    currentPage === "login.html"
  )
    return;

  // Cek apakah sudah terpasang
  if (document.getElementById("ios-bottom-bar")) return;

  // 1. Inject Stylesheet KHUSUS MOBILE (< 1024px)
  // Semua aturan diwajibkan berada di dalam @media (max-width: 1023px)
  // agar tampilan Desktop tidak tersentuh sama sekali.
  const style = document.createElement("style");
  style.id = "ios-nav-custom-styles";
  style.innerHTML = `
        /* JAMINAN DESKTOP: Sembunyikan mutlak seluruh komponen mobile di layar >= 1024px */
        @media (min-width: 1024px) {
            #ios-bottom-bar,
            #ios-menu-wrapper,
            #ios-menu-backdrop,
            #ios-menu-sheet {
                display: none !important;
                visibility: hidden !important;
                pointer-events: none !important;
            }
        }

        /* ATURAN EKSKLUSIF MOBILE (< 1024px) */
        @media (max-width: 1023px) {
            /* Dukungan Safe Area Penuh: Dynamic Island & Notch iPhone 14 Pro, 15 Pro, 15 Pro Max, 16 */
            body {
                padding-top: env(safe-area-inset-top, 0px) !important;
                padding-bottom: calc(6rem + env(safe-area-inset-bottom, 16px)) !important;
            }

            /* Mobile Top Bar (Header Sticky) agar tidak tertabrak Dynamic Island */
            .lg\:hidden.sticky.top-0,
            div[class*="sticky top-0"],
            .mobile-top-bar {
                padding-top: max(0.5rem, env(safe-area-inset-top, 0px)) !important;
                height: auto !important;
                min-height: calc(3.5rem + env(safe-area-inset-top, 0px)) !important;
                box-sizing: border-box !important;
            }

            /* Header sekunder di halaman kasir/dashboard agar aman dari Dynamic Island */
            main header:first-of-type {
                padding-top: max(0.625rem, calc(0.25rem + env(safe-area-inset-top, 0px) / 2)) !important;
            }

            /* Floating Glass Bottom Navbar Styling (iPhone Retina Display Ready) */
            #ios-bottom-bar {
                backdrop-filter: blur(28px) saturate(190%);
                -webkit-backdrop-filter: blur(28px) saturate(190%);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.74) 100%) !important;
                border: 1.5px solid rgba(255, 255, 255, 0.95) !important;
                box-shadow: 0 16px 36px -6px rgba(15, 23, 42, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95);
                will-change: transform;
                bottom: calc(env(safe-area-inset-bottom, 12px) + 0.85rem) !important;
                transform: translateZ(0);
                -webkit-transform: translateZ(0);
            }

            main:not(.overflow-hidden), #main-content:not(.overflow-hidden) {
                padding-bottom: calc(5.25rem + env(safe-area-inset-bottom, 16px)) !important;
            }
            /* Pastikan tabel & scroll container tabel fit rapat ke data tanpa gap di bawah */
            .overflow-x-auto,
            .overflow-x-auto.custom-scroll,
            table,
            tbody {
                padding-bottom: 0 !important;
                margin-bottom: 0 !important;
            }

            /* Hilangkan off-canvas sidebar bawaan agar tidak bentrok dengan iOS nav */
            #sidebar-backdrop {
                display: none !important;
            }
            #app-sidebar {
                display: none !important;
            }

            /* Nonaktifkan seluruh elemen shortcut di mobile */
            .shortcut-header-btn,
            #shortcut-helper-fab,
            #shortcut-guide-modal,
            #shortcut-feedback-toast,
            .shortcut-btn-badge,
            .shortcut-tab-badge,
            .search-shortcut-badge,
            .bon-kbd-badge,
            .dp-kbd-badge,
            .kbd-pay-hint,
            .kbd-add-hint,
            .kbd-val-hint,
            #search-kbd-hint,
            button[onclick*="toggleShortcutModal"],
            button[onclick*="ShortcutModal"],
            .keycap-badge,
            kbd:not(.keep-mobile),
            [id*="shortcut-"],
            [class*="shortcut-"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: absolute !important;
                width: 0 !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                border: none !important;
            }

            /* Micro-interactions untuk tab bar iOS */
            .ios-tab-btn {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            }
            .ios-tab-btn:active {
                transform: scale(0.92);
            }

            /* iOS Menu Sheet Transitions & Refined Liquid Glass */
            #ios-menu-backdrop {
                transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                background: rgba(15, 23, 42, 0.45) !important;
                z-index: 85 !important;
            }
            #ios-menu-sheet {
                transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                backdrop-filter: blur(30px) saturate(190%) !important;
                -webkit-backdrop-filter: blur(30px) saturate(190%) !important;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(248, 250, 252, 0.76) 100%) !important;
                border-top: 1.5px solid rgba(255, 255, 255, 0.95) !important;
                border-left: 1px solid rgba(255, 255, 255, 0.80) !important;
                border-right: 1px solid rgba(255, 255, 255, 0.80) !important;
                box-shadow: 0 -20px 48px -8px rgba(15, 23, 42, 0.20), inset 0 2px 2px 0 rgba(255, 255, 255, 1), inset 0 0 25px 0 rgba(255, 255, 255, 0.45) !important;
                padding-bottom: calc(5rem + env(safe-area-inset-bottom, 24px)) !important;
                z-index: 90 !important;
            }

            /* Liquid Glass Tiles untuk Modul Operasional (Elegan & Highlight Responsif) */
            #ios-menu-sheet .grid a {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                align-items: center !important;
                overflow: hidden !important;
                backdrop-filter: blur(16px) saturate(170%) !important;
                -webkit-backdrop-filter: blur(16px) saturate(170%) !important;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(248, 250, 252, 0.52) 100%) !important;
                border: 1px solid rgba(255, 255, 255, 0.85) !important;
                box-shadow: 0 3px 12px -2px rgba(15, 23, 42, 0.04), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95) !important;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            #ios-menu-sheet .grid a:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.82) 100%) !important;
                border-color: rgba(255, 255, 255, 1) !important;
                box-shadow: 0 8px 24px -3px rgba(15, 23, 42, 0.08), inset 0 1.5px 2px 0 rgba(255, 255, 255, 1) !important;
                transform: translateY(-2px) !important;
            }
            #ios-menu-sheet .grid a:active {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.80) 0%, rgba(248, 250, 252, 0.60) 100%) !important;
                transform: scale(0.97) !important;
                box-shadow: 0 2px 6px -1px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.90) !important;
            }

            /* Icon badge container - Highlight membesar & bersinar tanpa memutihkan icon */
            #ios-menu-sheet .grid a > div:first-child {
                flex-shrink: 0 !important;
                border: 1px solid rgba(255, 255, 255, 0.85) !important;
                box-shadow: inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95), 0 2px 5px -1px rgba(15, 23, 42, 0.04) !important;
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, filter 0.22s ease !important;
            }
            #ios-menu-sheet .grid a:hover > div:first-child {
                transform: scale(1.10) !important;
                filter: brightness(1.05) saturate(1.15) !important;
                box-shadow: inset 0 1px 2px 0 rgba(255, 255, 255, 1), 0 5px 12px -2px rgba(15, 23, 42, 0.10) !important;
            }

            /* Jaminan Render SVG iOS Safari (Mencegah icon menciut ke 0px) */
            #ios-menu-sheet .grid a svg {
                width: 22px !important;
                height: 22px !important;
                min-width: 22px !important;
                min-height: 22px !important;
                display: block !important;
                flex-shrink: 0 !important;
                overflow: visible !important;
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), filter 0.22s ease !important;
            }
            #ios-menu-sheet .grid a:hover svg {
                transform: scale(1.12) !important;
                filter: brightness(1.1) !important;
            }
            #ios-bottom-bar svg {
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;
                min-height: 20px !important;
                display: block !important;
                flex-shrink: 0 !important;
            }
            #ios-menu-sheet .grid a i {
                transition: transform 0.2s ease, filter 0.2s ease !important;
            }
            #ios-menu-sheet .grid a:hover i {
                transform: scale(1.08) !important;
            }

            /* Typography modul */
            #ios-menu-sheet .grid a span:first-child {
                color: #0f172a !important;
                font-weight: 750 !important;
                font-size: 11.5px !important;
                letter-spacing: -0.01em !important;
            }
            #ios-menu-sheet .grid a span:last-child {
                color: #64748b !important;
                font-weight: 500 !important;
                font-size: 9.5px !important;
            }

            /* Glass Close Button */
            #ios-menu-sheet button[title="Tutup Menu"] {
                backdrop-filter: blur(16px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
                background: rgba(255, 255, 255, 0.70) !important;
                border: 1px solid rgba(255, 255, 255, 0.85) !important;
                box-shadow: 0 2px 8px -1px rgba(15, 23, 42, 0.05), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95) !important;
                color: #475569 !important;
            }
            #ios-menu-sheet button[title="Tutup Menu"]:hover {
                background: rgba(255, 255, 255, 0.90) !important;
                color: #0f172a !important;
            }

            /* Glass Logout Button Styling */
            #ios-menu-sheet button[onclick*="triggerMobileLogout"] {
                backdrop-filter: blur(20px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                background: linear-gradient(135deg, rgba(255, 241, 242, 0.65) 0%, rgba(255, 228, 230, 0.45) 100%) !important;
                border: 1.5px solid rgba(254, 205, 211, 0.75) !important;
                color: #e11d48 !important;
                box-shadow: 0 4px 16px -2px rgba(225, 29, 72, 0.08), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.95) !important;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
                margin-top: 0.75rem !important;
                margin-bottom: 2.5rem !important;
                padding-top: 0.95rem !important;
                padding-bottom: 0.95rem !important;
            }
            #ios-menu-sheet button[onclick*="triggerMobileLogout"]:hover {
                background: linear-gradient(135deg, rgba(255, 241, 242, 0.85) 0%, rgba(255, 228, 230, 0.65) 100%) !important;
                border-color: rgba(254, 205, 211, 0.95) !important;
                box-shadow: 0 6px 20px -2px rgba(225, 29, 72, 0.14), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 1) !important;
                transform: translateY(-1.5px) !important;
            }
            #ios-menu-sheet button[onclick*="triggerMobileLogout"]:active {
                background: linear-gradient(135deg, rgba(255, 241, 242, 0.75) 0%, rgba(255, 228, 230, 0.55) 100%) !important;
                transform: scale(0.98) !important;
            }
            #ios-menu-sheet .grid a > div:first-child {
                flex-shrink: 0 !important;
            }
            #ios-menu-sheet .grid a > div:last-child {
                min-width: 0 !important;
                flex: 1 1 0% !important;
                overflow: hidden !important;
            }
            #ios-menu-sheet .grid a span {
                display: block !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
        }

        /* Saat berjalan sebagai Standalone PWA di iPhone (< 1024px) */
        @media (max-width: 1023px) and (display-mode: standalone) {
            body {
                padding-top: env(safe-area-inset-top, 0px) !important;
                padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 6.25rem) !important;
            }
            #ios-bottom-bar {
                bottom: calc(env(safe-area-inset-bottom, 14px) + 0.75rem) !important;
            }
            #ios-menu-sheet {
                padding-bottom: calc(env(safe-area-inset-bottom, 20px) + 6.5rem) !important;
            }
            main:not(.overflow-hidden), #main-content:not(.overflow-hidden) {
                padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 5.5rem) !important;
            }
        }
    `;
  document.head.appendChild(style);

  // 2. Identifikasi Tab Aktif
  const isKasir = currentPage.includes("dashboard");
  const isRiwayat = currentPage.includes("riwayat");
  const isProduct = currentPage.includes("product");
  const isReport = currentPage.includes("report");
  const isOtherModule = !isKasir && !isRiwayat && !isProduct && !isReport;

  // 3. Bangun Floating Glass Bottom Navbar (Instagram / iOS Style)
  const nav = document.createElement("nav");
  nav.id = "ios-bottom-bar";
  nav.className =
    "lg:hidden fixed inset-x-3 sm:inset-x-8 max-w-md mx-auto z-40 rounded-[2.2rem] px-2 py-1.5 flex items-center justify-between";

  nav.innerHTML = `
        <!-- TAB 1: KASIR (DASHBOARD) -->
        <a
            href="dashboard.html"
            class="ios-tab-btn flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-2xl transition-all duration-200 select-none ${isKasir ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/35 scale-105" : "text-slate-600 hover:text-blue-600"}"
        >
            <svg width="20" height="20" style="width: 20px; height: 20px; min-width: 20px; min-height: 20px; display: block;" class="w-5 h-5 shrink-0 transition-transform ${isKasir ? "text-white" : "text-slate-500"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="text-[9.5px] font-black tracking-tight leading-none">Kasir</span>
        </a>

        <!-- TAB 2: RIWAYAT -->
        <a
            href="riwayat.html"
            class="ios-tab-btn flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-2xl transition-all duration-200 select-none ${isRiwayat ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/35 scale-105" : "text-slate-600 hover:text-blue-600"}"
        >
            <svg width="20" height="20" style="width: 20px; height: 20px; min-width: 20px; min-height: 20px; display: block;" class="w-5 h-5 shrink-0 transition-transform ${isRiwayat ? "text-white" : "text-slate-500"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span class="text-[9.5px] font-black tracking-tight leading-none">Riwayat</span>
        </a>

        <!-- TAB 3: PRODUK -->
        <a
            href="product.html"
            class="ios-tab-btn flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-2xl transition-all duration-200 select-none ${isProduct ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/35 scale-105" : "text-slate-600 hover:text-blue-600"}"
        >
            <svg width="20" height="20" style="width: 20px; height: 20px; min-width: 20px; min-height: 20px; display: block;" class="w-5 h-5 shrink-0 transition-transform ${isProduct ? "text-white" : "text-slate-500"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="text-[9.5px] font-black tracking-tight leading-none">Produk</span>
        </a>

        <!-- TAB 4: LAPORAN -->
        <a
            href="report.html"
            class="ios-tab-btn flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-2xl transition-all duration-200 select-none ${isReport ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/35 scale-105" : "text-slate-600 hover:text-blue-600"}"
        >
            <svg width="20" height="20" style="width: 20px; height: 20px; min-width: 20px; min-height: 20px; display: block;" class="w-5 h-5 shrink-0 transition-transform ${isReport ? "text-white" : "text-slate-500"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <span class="text-[9.5px] font-black tracking-tight leading-none">Laporan</span>
        </a>

        <!-- TAB 5: MENU (LAINNYA / DRAWER SHEET) -->
        <button
            type="button"
            onclick="window.toggleIosMenuSheet(true)"
            class="ios-tab-btn flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1.5 rounded-2xl transition-all duration-200 cursor-pointer select-none ${isOtherModule ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/35 scale-105" : "text-slate-600 hover:text-blue-600"}"
            title="Buka Menu Lainnya"
        >
            <svg width="20" height="20" style="width: 20px; height: 20px; min-width: 20px; min-height: 20px; display: block;" class="w-5 h-5 shrink-0 transition-transform ${isOtherModule ? "text-white" : "text-slate-500"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span class="text-[9.5px] font-black tracking-tight leading-none">Menu</span>
        </button>
    `;
  document.body.appendChild(nav);

  // 4. Bangun iOS Glass Bottom Sheet Menu (Drawer Sheet)
  const sheetContainer = document.createElement("div");
  sheetContainer.id = "ios-menu-wrapper";
  sheetContainer.className = "lg:hidden";

  // Ambil info nama staf jika ada
  const userDisplay =
    document.querySelector(".user-name-display")?.innerText?.trim() ||
    "Pengguna";

  sheetContainer.innerHTML = `
        <!-- Dimmed Backdrop -->
        <div
            id="ios-menu-backdrop"
            onclick="window.toggleIosMenuSheet(false)"
            class="fixed inset-0 bg-slate-950/25 backdrop-blur-sm z-[85] opacity-0 pointer-events-none transition-opacity duration-300"
        ></div>

        <!-- Bottom Sheet Modal (Liquid Glass Semi-Transparent) -->
        <div
            id="ios-menu-sheet"
            class="fixed inset-x-0 bottom-0 z-[90] rounded-t-[2.5rem] p-6 pb-20 max-h-[88vh] overflow-y-auto transform translate-y-full transition-transform duration-300 pointer-events-auto"
        >
            <!-- Grab Handle -->
            <div class="w-12 h-1.5 bg-slate-300/80 rounded-full mx-auto mb-5"></div>

            <!-- Profile & Header Section -->
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/50">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/25 shrink-0">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div class="min-w-0">
                        <p class="text-xs font-black text-slate-800 truncate user-name-display">${userDisplay}</p>
                        <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Langgeng POS &bull; Cabang Aktif</p>
                    </div>
                </div>
                <button
                    type="button"
                    onclick="window.toggleIosMenuSheet(false)"
                    class="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-slate-500 border border-white/60 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    title="Tutup Menu"
                >
                    <svg width="18" height="18" style="width: 18px; height: 18px; min-width: 18px; min-height: 18px; display: block;" class="text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Grid Menu Modules (App Icons iOS Style) -->
            <p class="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 ml-1">Modul Operasional</p>
            <div class="grid grid-cols-2 gap-3 mb-6">
                <!-- Purchase -->
                <a
                    href="purchase.html"
                    class="flex flex-row items-center flex-nowrap gap-2.5 p-3 rounded-2xl border border-slate-100/80 hover:border-amber-300/80 transition-all active:scale-95 group overflow-hidden"
                >
                    <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                        <span class="text-xs font-bold text-slate-800 block truncate group-hover:text-amber-700 transition-colors">Purchase</span>
                        <span class="text-[10px] text-slate-400 block truncate">Nota Pembelian</span>
                    </div>
                </a>

                <!-- Pengeluaran -->
                <a
                    href="expense.html"
                    class="flex flex-row items-center flex-nowrap gap-2.5 p-3 rounded-2xl border border-slate-100/80 hover:border-rose-300/80 transition-all active:scale-95 group overflow-hidden"
                >
                    <div class="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                        <span class="text-xs font-bold text-slate-800 block truncate group-hover:text-rose-700 transition-colors">Pengeluaran</span>
                        <span class="text-[10px] text-slate-400 block truncate">Biaya & Operasional</span>
                    </div>
                </a>

                <!-- Retur -->
                <a
                    href="retur.html"
                    class="flex flex-row items-center flex-nowrap gap-2.5 p-3 rounded-2xl border border-slate-100/80 hover:border-purple-300/80 transition-all active:scale-95 group overflow-hidden"
                >
                    <div class="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                        <span class="text-xs font-bold text-slate-800 block truncate group-hover:text-purple-700 transition-colors">Retur Barang</span>
                        <span class="text-[10px] text-slate-400 block truncate">Pengembalian Stok</span>
                    </div>
                </a>

                <!-- Akuntansi -->
                <a
                    href="akuntansi.html"
                    class="flex flex-row items-center flex-nowrap gap-2.5 p-3 rounded-2xl border border-slate-100/80 hover:border-cyan-300/80 transition-all active:scale-95 group overflow-hidden"
                >
                    <div class="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-cyan-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                        <span class="text-xs font-bold text-slate-800 block truncate group-hover:text-cyan-700 transition-colors">Akuntansi</span>
                        <span class="text-[10px] text-slate-400 block truncate">Jurnal & Buku Besar</span>
                    </div>
                </a>

                <!-- Absensi -->
                <a
                    href="absensi.html"
                    class="flex flex-row items-center flex-nowrap gap-2.5 p-3 rounded-2xl border border-slate-100/80 hover:border-teal-300/80 transition-all active:scale-95 group overflow-hidden"
                >
                    <div class="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                        <span class="text-xs font-bold text-slate-800 block truncate group-hover:text-teal-700 transition-colors">Absensi</span>
                        <span class="text-[10px] text-slate-400 block truncate">Kehadiran Karyawan</span>
                    </div>
                </a>

                <!-- Opname -->
                <a
                    href="opname.html"
                    class="flex flex-row items-center flex-nowrap gap-2.5 p-3 rounded-2xl border border-slate-100/80 hover:border-orange-300/80 transition-all active:scale-95 group overflow-hidden"
                >
                    <div class="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-orange-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                        <span class="text-xs font-bold text-slate-800 block truncate group-hover:text-orange-700 transition-colors">Stock Opname</span>
                        <span class="text-[10px] text-slate-400 block truncate">Penyesuaian Fisik</span>
                    </div>
                </a>

                <!-- Pengguna & Log -->
                <a
                    href="online-users.html"
                    class="col-span-2 flex flex-row items-center flex-nowrap gap-2.5 p-3 rounded-2xl border border-slate-100/80 hover:border-violet-300/80 transition-all active:scale-95 group overflow-hidden"
                >
                    <div class="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <svg width="22" height="22" style="width: 22px; height: 22px; min-width: 22px; min-height: 22px; display: block;" class="text-violet-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden">
                        <span class="text-xs font-bold text-slate-800 block truncate group-hover:text-violet-700 transition-colors">Pengguna & Log Aktivitas</span>
                        <span class="text-[10px] text-slate-400 block truncate">Manajemen Hak Akses & Monitoring Kasir</span>
                    </div>
                </a>
            </div>

            <!-- Tombol Keluar (Logout) -->
            <button
                type="button"
                onclick="triggerMobileLogout()"
                class="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center justify-center gap-2.5 border border-rose-200/80 shadow-2xs active:scale-98 transition-all cursor-pointer"
            >
                <svg width="18" height="18" style="width: 18px; height: 18px; min-width: 18px; min-height: 18px; display: block;" class="text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span class="text-xs font-extrabold uppercase tracking-wide">Keluar dari Akun (Logout)</span>
            </button>
        </div>
    `;
  document.body.appendChild(sheetContainer);

  // 4b. Role-Based Navigation Filter (Sidebar Desktop, Mobile Bottom Bar, & Mobile Sheet)
  function applyRoleNavFilters() {
    try {
      const userData = (typeof window.getUserDataFromToken === "function")
        ? window.getUserDataFromToken()
        : null;
      if (!userData) return;

      const userRole = (userData.role || "kasir").toLowerCase().trim();
      const normalizedRole = userRole.replace(/[-_]/g, "");

      const permissionsMap = (typeof window.ROLE_PERMISSIONS === "object" && window.ROLE_PERMISSIONS)
        ? window.ROLE_PERMISSIONS
        : {
            "super-admin": [
              "dashboard.html", "riwayat.html", "product.html", "purchase.html",
              "expense.html", "retur.html", "akuntansi.html", "absensi.html",
              "report.html", "opname.html", "online-users.html",
            ],
            superadmin: [
              "dashboard.html", "riwayat.html", "product.html", "purchase.html",
              "expense.html", "retur.html", "akuntansi.html", "absensi.html",
              "report.html", "opname.html", "online-users.html",
            ],
            admin: [
              "riwayat.html", "product.html", "purchase.html",
              "expense.html", "retur.html", "akuntansi.html", "absensi.html",
              "report.html", "opname.html", "online-users.html",
            ],
            "super-kasir": [
              "dashboard.html", "riwayat.html", "product.html", "purchase.html",
              "expense.html", "retur.html", "opname.html",
            ],
            superkasir: [
              "dashboard.html", "riwayat.html", "product.html", "purchase.html",
              "expense.html", "retur.html", "opname.html",
            ],
            super_kasir: [
              "dashboard.html", "riwayat.html", "product.html", "purchase.html",
              "expense.html", "retur.html", "opname.html",
            ],
            supersubkasir: [
              "dashboard.html", "riwayat.html", "product.html",
              "retur.html", "opname.html",
            ],
            "super-subkasir": [
              "dashboard.html", "riwayat.html", "product.html",
              "retur.html", "opname.html",
            ],
            super_subkasir: [
              "dashboard.html", "riwayat.html", "product.html",
              "retur.html", "opname.html",
            ],
            "super-sub-kasir": [
              "dashboard.html", "riwayat.html", "product.html",
              "retur.html", "opname.html",
            ],
            super_sub_kasir: [
              "dashboard.html", "riwayat.html", "product.html",
              "retur.html", "opname.html",
            ],
            kasir: [
              "dashboard.html", "riwayat.html", "expense.html", "opname.html",
            ],
            akuntan: [
              "riwayat.html", "product.html", "purchase.html", "expense.html",
            ],
          };

      const allowedPages = permissionsMap[userRole] || permissionsMap[normalizedRole] || ["dashboard.html"];

      // 1. Filter Desktop Sidebar
      document.querySelectorAll("aside nav a").forEach((link) => {
        const rawHref = link.getAttribute("href") || "";
        const href = rawHref.split("?")[0].split("#")[0].split("/").pop();
        if (href && href !== "" && href !== "#" && href !== "index.html") {
          if (!allowedPages.includes(href)) {
            link.style.display = "none";
          } else {
            link.style.display = "";
          }
        }
      });

      // 2. Filter Mobile Bottom Bar
      document.querySelectorAll("#ios-bottom-bar a.ios-tab-btn").forEach((link) => {
        const rawHref = link.getAttribute("href") || "";
        const href = rawHref.split("?")[0].split("#")[0].split("/").pop();
        if (href && href !== "" && href !== "#" && href !== "index.html") {
          if (!allowedPages.includes(href)) {
            link.style.display = "none";
          } else {
            link.style.display = "";
          }
        }
      });

      // 3. Filter Mobile Drawer Sheet Modules
      document.querySelectorAll("#ios-menu-sheet .grid a").forEach((link) => {
        const rawHref = link.getAttribute("href") || "";
        const href = rawHref.split("?")[0].split("#")[0].split("/").pop();
        if (href && href !== "" && href !== "#" && href !== "index.html") {
          if (!allowedPages.includes(href)) {
            link.style.display = "none";
          } else {
            link.style.display = "";
          }
        }
      });
    } catch (e) {
      console.warn("applyRoleNavFilters error:", e);
    }
  }
  window.applyRoleNavFilters = applyRoleNavFilters;
  applyRoleNavFilters();

  // 5. Toggle Functionality untuk iOS Bottom Sheet (Auto-Hide Bottom Bar & Notice Banner agar Bebas Overlap)
  window.toggleIosMenuSheet = function (show) {
    const backdrop = document.getElementById("ios-menu-backdrop");
    const sheet = document.getElementById("ios-menu-sheet");
    const bottomBar = document.getElementById("ios-bottom-bar");
    const desktopNotice = document.getElementById("mobile-desktop-notice");
    if (!backdrop || !sheet) return;

    const isVisible = !backdrop.classList.contains("opacity-0");
    const nextState = typeof show === "boolean" ? show : !isVisible;

    if (nextState) {
      applyRoleNavFilters();
      backdrop.classList.remove("opacity-0", "pointer-events-none");
      backdrop.classList.add("opacity-100", "pointer-events-auto");
      sheet.classList.remove("translate-y-full");
      sheet.classList.add("translate-y-0");
      document.body.classList.add("overflow-hidden");
      if (desktopNotice) {
        desktopNotice.style.visibility = "hidden";
      }
      if (bottomBar) {
        bottomBar.style.transform = "translate3d(0, 200%, 0)";
        bottomBar.style.opacity = "0";
        bottomBar.style.pointerEvents = "none";
        bottomBar.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease";
      }
    } else {
      backdrop.classList.remove("opacity-100", "pointer-events-auto");
      backdrop.classList.add("opacity-0", "pointer-events-none");
      sheet.classList.remove("translate-y-0");
      sheet.classList.add("translate-y-full");
      document.body.classList.remove("overflow-hidden");
      if (desktopNotice) {
        desktopNotice.style.visibility = "";
      }
      if (bottomBar) {
        bottomBar.style.transform = "translate3d(0, 0, 0)";
        bottomBar.style.opacity = "1";
        bottomBar.style.pointerEvents = "auto";
        bottomBar.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease";
      }
    }
  };

  // Override toggleSidebar agar tombol hamburger di mobile top bar juga membuka iOS Bottom Sheet
  window.toggleSidebar = function () {
    if (window.innerWidth < 1024) {
      window.toggleIosMenuSheet();
    } else {
      const sidebar = document.getElementById("app-sidebar");
      if (sidebar) {
        sidebar.classList.remove("desktop-collapsed", "lg:hidden", "hidden", "-translate-x-full");
      }
    }
  };
  window.toggleMobileSidebar = window.toggleSidebar;

  // Jaminan Desktop: Pastikan sidebar selalu tampil utuh dan rapi di layar desktop (>= 1024px)
  function ensureDesktopSidebarVisible() {
    if (window.innerWidth >= 1024) {
      const sidebar = document.getElementById("app-sidebar");
      if (sidebar) {
        sidebar.classList.remove("desktop-collapsed", "lg:hidden", "hidden", "-translate-x-full");
      }
      const backdrop = document.getElementById("sidebar-backdrop");
      if (backdrop) {
        backdrop.classList.add("hidden");
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureDesktopSidebarVisible, { permanent: true });
  } else {
    ensureDesktopSidebarVisible();
  }
  window.addEventListener("resize", ensureDesktopSidebarVisible, { permanent: true });

  window.triggerMobileLogout = function () {
    if (typeof confirmLogout === "function") {
      confirmLogout();
    } else if (typeof logout === "function") {
      logout();
    } else {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "index.html";
    }
  };

  // ========================================================
  // Unified Mobile Row Action Popup (Single Action Button)
  // ========================================================
  window.showRowActionMenu = function (config) {
    if (!config) return;
    const title = config.title || "Pilih Aksi";
    const subtitle = config.subtitle
      ? `<p class="text-xs text-slate-400 mt-1">${config.subtitle}</p>`
      : "";
    const actions = config.actions || [];

    const actionsHTML = actions
      .map((act, i) => {
        let btnBg = "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200";
        let iconColor = "text-slate-600";
        if (act.color === "blue") {
          btnBg = "bg-blue-50/80 hover:bg-blue-100 text-blue-700 border-blue-200";
          iconColor = "text-blue-600";
        } else if (act.color === "rose" || act.color === "red") {
          btnBg = "bg-rose-50/80 hover:bg-rose-100 text-rose-700 border-rose-200";
          iconColor = "text-rose-600";
        } else if (act.color === "amber" || act.color === "orange") {
          btnBg = "bg-amber-50/80 hover:bg-amber-100 text-amber-700 border-amber-200";
          iconColor = "text-amber-600";
        } else if (act.color === "emerald" || act.color === "green") {
          btnBg = "bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border-emerald-200";
          iconColor = "text-emerald-600";
        } else if (act.color === "indigo") {
          btnBg = "bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border-indigo-200";
          iconColor = "text-indigo-600";
        }

        return `
          <button
            type="button"
            data-action-index="${i}"
            class="row-action-popup-item w-full px-3.5 py-2.5 rounded-xl ${btnBg} border font-bold text-xs sm:text-sm flex items-center gap-3 transition-all active:scale-98 text-left cursor-pointer shadow-2xs"
          >
            <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs ${iconColor}">
              <i class="${act.icon || "fas fa-arrow-right"} text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <span class="block font-bold leading-tight truncate">${act.label}</span>
              ${act.desc ? `<span class="block text-[10px] text-slate-400 font-normal leading-tight mt-0.5 truncate">${act.desc}</span>` : ""}
            </div>
            <i class="fas fa-chevron-right text-[10px] text-slate-300 ml-auto"></i>
          </button>
        `;
      })
      .join("");

    if (window.Swal) {
      Swal.fire({
        title: title,
        html: `
          ${subtitle}
          <div class="flex flex-col gap-2 pt-3 text-left">
            ${actionsHTML}
          </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: '<i class="fas fa-times mr-1"></i> Batal',
        cancelButtonColor: "#94a3b8",
        customClass: {
          popup: "rounded-2xl max-w-xs sm:max-w-sm",
          title: "text-base font-extrabold text-slate-800",
        },
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            popup.querySelectorAll(".row-action-popup-item").forEach((btn) => {
              btn.onclick = () => {
                const idx = parseInt(btn.getAttribute("data-action-index"), 10);
                Swal.close();
                if (actions[idx] && typeof actions[idx].onClick === "function") {
                  actions[idx].onClick();
                }
              };
            });
          }
        },
      });
    }
  };

  // 6. Sinkronisasi Tab Aktif & Animasi Seamless Bottom Bar saat Navigasi SPA
  function updateIosBottomBarActiveTab(url) {
    const bottomBar = document.getElementById("ios-bottom-bar");
    if (!bottomBar) return;
    const pageName = (url || window.location.pathname).split("/").pop() || "dashboard.html";

    const isKasir = pageName.includes("dashboard");
    const isRiwayat = pageName.includes("riwayat");
    const isProduct = pageName.includes("product");
    const isReport = pageName.includes("report");
    const isOtherModule = !isKasir && !isRiwayat && !isProduct && !isReport;

    const tabs = bottomBar.querySelectorAll(".ios-tab-btn");
    if (tabs.length < 5) return;

    const activeClasses = ["bg-gradient-to-tr", "from-blue-600", "to-blue-500", "text-white", "shadow-md", "shadow-blue-500/35", "scale-105"];
    const inactiveClasses = ["text-slate-600", "hover:text-blue-600"];

    const states = [isKasir, isRiwayat, isProduct, isReport, isOtherModule];
    tabs.forEach((tab, idx) => {
      const isActive = states[idx];
      const icon = tab.querySelector("i");
      if (isActive) {
        tab.classList.remove(...inactiveClasses);
        tab.classList.add(...activeClasses);
        if (icon) icon.classList.add("text-white");
      } else {
        tab.classList.remove(...activeClasses);
        tab.classList.add(...inactiveClasses);
        if (icon) icon.classList.remove("text-white");
      }
    });

    // Tutup drawer sheet menu mobile secara halus jika sedang terbuka
    if (typeof window.toggleIosMenuSheet === "function") {
      window.toggleIosMenuSheet(false);
    }
  }

  window.addEventListener("spa:navigated", (e) => {
    applyRoleNavFilters();
    updateIosBottomBarActiveTab(e.detail?.targetUrl);
  }, { permanent: true });

})();
