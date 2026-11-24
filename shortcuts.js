/**
 * Langgeng SmartPOS - Universal Keyboard Shortcuts & Interactive Guide Engine
 * Meminimalkan penggunaan mouse/pointer, mempercepat operasional kasir & admin,
 * serta menyajikan badge info shortcut pada setiap tombol & kotak pencarian.
 */

(function () {
    // 1. Deteksi Halaman Aktif
    const pathParts = window.location.pathname.split("/");
    const currentPage = (pathParts[pathParts.length - 1] || "dashboard.html").toLowerCase();

    // Helper: Deteksi apakah berada di tampilan mobile (< 1024px)
    function isMobile() {
        return window.innerWidth < 1024;
    }

    // Pembersihan mutlak semua elemen shortcut jika berada di tampilan mobile
    function cleanupMobileShortcuts() {
        // Hapus seluruh badge shortcut yang sudah terpasang
        document.querySelectorAll(
            '.shortcut-btn-badge, .shortcut-tab-badge, .search-shortcut-badge, .bon-kbd-badge, .dp-kbd-badge, .kbd-pay-hint, .kbd-add-hint, .kbd-val-hint, #search-kbd-hint, #shortcut-helper-fab, #shortcut-feedback-toast'
        ).forEach(el => el.remove());

        // Reset status dataset agar bisa di-inject ulang jika kembali ke desktop
        document.querySelectorAll('[data-shortcut-badged]').forEach(el => {
            delete el.dataset.shortcutBadged;
        });

        // Sembunyikan tombol header shortcut
        document.querySelectorAll('.shortcut-header-btn, button[onclick*="ShortcutModal"], button[onclick*="toggleShortcutModal"]').forEach(el => {
            el.style.display = 'none';
        });

        // Sembunyikan modal panduan jika terbuka
        const modal = document.getElementById("shortcut-guide-modal");
        if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
            modal.style.display = "none";
        }
    }


    // 2. Definisi Modul & Navigasi Cepat (Alt + 1..9 / Alt + 0 / Alt + Huruf)
    const NAVIGATION_SHORTCUTS = [
        { key: "Alt + 1", dest: "dashboard.html", label: "Dashboard Kasir", icon: "fa-cash-register", color: "text-blue-600 bg-blue-50 border-blue-200" },
        { key: "Alt + 2", dest: "riwayat.html", label: "Riwayat Transaksi", icon: "fa-clock-rotate-left", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
        { key: "Alt + 3", dest: "product.html", label: "Master Produk", icon: "fa-boxes-stacked", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
        { key: "Alt + 4", dest: "purchase.html", label: "Riwayat Purchase", icon: "fa-cart-shopping", color: "text-amber-600 bg-amber-50 border-amber-200" },
        { key: "Alt + 5", dest: "expense.html", label: "Pengeluaran Toko", icon: "fa-wallet", color: "text-rose-600 bg-rose-50 border-rose-200" },
        { key: "Alt + 6", dest: "retur.html", label: "Manajemen Retur", icon: "fa-rotate-left", color: "text-purple-600 bg-purple-50 border-purple-200" },
        { key: "Alt + 7", dest: "akuntansi.html", label: "Jurnal & Keuangan", icon: "fa-book", color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
        { key: "Alt + 8", dest: "absensi.html", label: "Absensi Karyawan", icon: "fa-calendar-check", color: "text-teal-600 bg-teal-50 border-teal-200" },
        { key: "Alt + 9", dest: "report.html", label: "Laporan Analitik", icon: "fa-chart-pie", color: "text-sky-600 bg-sky-50 border-sky-200" },
        { key: "Alt + 0", dest: "opname.html", label: "Stock Opname", icon: "fa-clipboard-check", color: "text-orange-600 bg-orange-50 border-orange-200" },
        { key: "Alt + U", dest: "online-users.html", label: "Pengguna & Log", icon: "fa-users-gear", color: "text-violet-600 bg-violet-50 border-violet-200" }
    ];

    // 3. Definisi Shortcut Spesifik per Halaman untuk Panduan Modal
    function getPageSpecificShortcuts() {
        if (currentPage.includes("dashboard")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Kolom Pencarian / Scan Barcode", icon: "fa-search", action: focusSearchInput },
                { key: "Alt + A", label: "ADD TO LIST (Tambah Item ke Keranjang)", icon: "fa-cart-plus", action: triggerAddToCart },
                { key: "Alt + M", label: "Masuk List (Tambah Pembayaran Multi)", icon: "fa-plus-circle", action: triggerAddPaymentToList },
                { key: "Alt + C", label: "Fokus Kolom Nominal Pembayaran Kasir", icon: "fa-money-bill-wave", action: focusNominalInput },
                { key: "Alt + Enter", label: "PROSES TRANSAKSI (Bayar & Finalisasi)", icon: "fa-credit-card", action: triggerPayment },
                { key: "Alt + Shift + B", label: "Beralih Mode Bon / Utang (Bayar Rp 0)", icon: "fa-receipt", action: toggleBon },
                { key: "Alt + Q", label: "Reset / Bersihkan Keranjang Belanja", icon: "fa-trash-can", action: clearCartAction },
                { key: "Alt + P", label: "Cetak Rekap Setoran Shift", icon: "fa-print", action: triggerPrintShift },
                { key: "Alt + Shift + S", label: "Penyelesaian & Tutup Shift Kasir", icon: "fa-flag-checkered", action: triggerCloseShift }
            ];
        }
        if (currentPage.includes("product")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Pencarian Nama / Barcode Produk", icon: "fa-search", action: focusSearchInput },
                { key: "Alt + N", label: "Tambah Produk Baru (Buka Form)", icon: "fa-plus-circle", action: triggerAddProduct },
                { key: "Alt + K", label: "Cek Nilai Persediaan Stok Toko", icon: "fa-chart-line", action: triggerStockValuation },
                { key: "Alt + R", label: "Segarkan & Sinkronkan Data Produk", icon: "fa-rotate", action: triggerRefreshData },
                { key: "Alt + E", label: "Export Data Stok ke Excel (.xlsx)", icon: "fa-file-excel", action: triggerExportExcel },
                { key: "Ctrl + Enter", label: "Simpan Form Data Produk", icon: "fa-floppy-disk", action: triggerSubmitForm }
            ];
        }
        if (currentPage.includes("riwayat")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Pencarian No Invoice / Pelanggan", icon: "fa-search", action: focusSearchInput },
                { key: "Alt + R", label: "Segarkan Data Riwayat Transaksi", icon: "fa-rotate", action: triggerRefreshData },
                { key: "Alt + X", label: "Reset Semua Filter Pencarian", icon: "fa-undo", action: triggerResetFilters },
                { key: "Alt + E", label: "Export Rekap Transaksi ke Excel", icon: "fa-file-excel", action: triggerExportExcel },
                { key: "Alt + M", label: "Muat Lebih Banyak Riwayat Transaksi", icon: "fa-arrow-down", action: triggerLoadMore },
                { key: "1 s/d 6", label: "Filter Cepat: Semua / Hari Ini / Kemarin / 7 Hari / Bulan Ini / Lalu", icon: "fa-calendar", action: null }
            ];
        }
        if (currentPage.includes("expense")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Pencarian Pengeluaran Toko", icon: "fa-search", action: focusSearchInput },
                { key: "Alt + N", label: "Tambah Pengeluaran Baru", icon: "fa-plus-circle", action: triggerAddExpense },
                { key: "Ctrl + Enter", label: "Simpan Form Pengeluaran", icon: "fa-floppy-disk", action: triggerSubmitForm }
            ];
        }
        if (currentPage.includes("purchase")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Pencarian Nota Pembelian", icon: "fa-search", action: focusSearchInput },
                { key: "Alt + N", label: "Tambah Purchase (Input Nota Baru)", icon: "fa-plus-circle", action: triggerAddPurchase },
                { key: "Alt + R", label: "Segarkan Riwayat Purchase", icon: "fa-rotate", action: triggerRefreshData },
                { key: "Alt + A", label: "Tambah Item ke Keranjang Pembelian", icon: "fa-cart-plus", action: triggerAddToPurchaseCart },
                { key: "Ctrl + Enter", label: "Simpan Transaksi Purchase", icon: "fa-floppy-disk", action: triggerSubmitBatchPurchase }
            ];
        }
        if (currentPage.includes("akuntansi")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Pencarian Akun / Jurnal", icon: "fa-search", action: focusSearchInput },
                { key: "1 s/d 5", label: "Ganti Tab: 1.Buku Harian, 2.Rekap, 3.Buku Besar, 4.COA, 5.Piutang", icon: "fa-folder-tree", action: null },
                { key: "Alt + N", label: "Tambah Jurnal Harian Baru", icon: "fa-plus-circle", action: triggerAddJournal },
                { key: "Alt + A", label: "Tambah Akun Baru (COA)", icon: "fa-folder-plus", action: triggerAddAccount },
                { key: "Alt + P", label: "Tambah Piutang Dagang", icon: "fa-hand-holding-dollar", action: triggerAddPiutang },
                { key: "Alt + E", label: "Export Laporan Jurnal ke Excel", icon: "fa-file-excel", action: triggerExportExcel },
                { key: "Alt + R", label: "Segarkan Tampilan Jurnal", icon: "fa-rotate", action: triggerRefreshData },
                { key: "Ctrl + Enter", label: "Simpan Transaksi Jurnal / Form", icon: "fa-floppy-disk", action: triggerSubmitForm }
            ];
        }
        if (currentPage.includes("opname")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Pencarian / Scan Barcode Opname", icon: "fa-barcode", action: focusSearchInput },
                { key: "Alt + N", label: "Buat Sesi Dokumen Opname Baru", icon: "fa-plus-circle", action: triggerNewOpname },
                { key: "Alt + E", label: "Export Laporan Opname ke Excel", icon: "fa-file-excel", action: triggerExportExcel },
                { key: "Ctrl + Enter", label: "Simpan Sesi Opname", icon: "fa-floppy-disk", action: triggerSubmitForm }
            ];
        }
        if (currentPage.includes("retur")) {
            return [
                { key: "Alt + S atau /", label: "Fokus Pencarian Dokumen Retur", icon: "fa-search", action: focusSearchInput },
                { key: "Alt + N", label: "Form Input Retur Baru", icon: "fa-plus-circle", action: triggerAddRetur },
                { key: "Ctrl + Enter", label: "Simpan Data Retur", icon: "fa-floppy-disk", action: triggerSubmitForm }
            ];
        }
        if (currentPage.includes("absensi")) {
            return [
                { key: "Alt + S atau /", label: "Cari Rekap Absensi Karyawan", icon: "fa-search", action: focusSearchInput },
                { key: "Alt + N", label: "Catat Kehadiran (Clock In / Pulang)", icon: "fa-user-clock", action: triggerClockIn },
                { key: "Alt + R", label: "Filter Tanggal Absensi", icon: "fa-filter", action: triggerFilterFocus }
            ];
        }
        if (currentPage.includes("report")) {
            return [
                { key: "1 s/d 4", label: "Ganti Periode: 1.Hari Ini, 2.7 Hari, 3.Bulan Ini, 4.Tahun Ini", icon: "fa-calendar-days", action: null },
                { key: "Alt + P", label: "Cetak / Simpan PDF Laporan Analitik", icon: "fa-print", action: () => window.print() }
            ];
        }
        if (currentPage.includes("online-users")) {
            return [
                { key: "Alt + S atau /", label: "Cari Nama Staf / Username", icon: "fa-search", action: focusSearchInput },
                { key: "1 / 2", label: "Beralih Tab: 1.Pengguna Online, 2.Histori Sesi & Shift", icon: "fa-users-viewfinder", action: null },
                { key: "Alt + R", label: "Segarkan Status Kehadiran Online", icon: "fa-rotate", action: triggerRefreshOnline }
            ];
        }
        if (currentPage.includes("index")) {
            return [
                { key: "Alt + U", label: "Fokus Kolom Username", icon: "fa-user", action: () => document.getElementById("username")?.focus() },
                { key: "Alt + P", label: "Fokus Kolom Password", icon: "fa-key", action: () => document.getElementById("password")?.focus() },
                { key: "Enter", label: "Masuk ke Sistem (Submit Login)", icon: "fa-right-to-bracket", action: null }
            ];
        }
        return [];
    }

    // 4. Implementasi Aksi Universal & Halaman
    function findPrimarySearchInput() {
        return document.querySelector(
            "#search-prod, #searchInput, #filterSearch, #opnameSearchInput, #journalSearch, #piutangSearch, #logSearchInput, #retur-search, #search-box, input[type='search'], input[name='search'], input[placeholder*='Cari'], input[placeholder*='cari'], input[placeholder*='Ketik nama']"
        );
    }

    function focusSearchInput() {
        const inp = findPrimarySearchInput();
        if (inp) {
            inp.focus();
            if (typeof inp.select === "function") inp.select();
            showShortcutFeedback("⚡ Fokus Kolom Pencarian [ / ]");
            highlightElement(inp);
            return true;
        }
        return false;
    }

    function focusNominalInput() {
        const inp = document.querySelector("#pay-input-amount, #nominalBayar, #inputAmount");
        if (inp) {
            inp.focus();
            if (typeof inp.select === "function") inp.select();
            showShortcutFeedback("⚡ Fokus Nominal Bayar [Alt + C]");
            highlightElement(inp);
        }
    }

    function triggerPayment() {
        const btn = document.querySelector("button[onclick*='executePayment'], button[onclick*='processPayment'], #btnProcessPayment, #btnBayar");
        if (btn) {
            btn.click();
            showShortcutFeedback("💳 Memproses Transaksi [Alt + Enter]");
        }
    }

    function triggerAddToCart() {
        const btn = document.querySelector("button[onclick*='addToCart']");
        if (btn) {
            btn.click();
            showShortcutFeedback("🛒 ADD TO LIST [Alt + A]");
        }
    }

    function triggerAddPaymentToList() {
        const btn = document.querySelector("button[onclick*='addPaymentToList']");
        if (btn) {
            btn.click();
            showShortcutFeedback("➕ Masuk List Pembayaran [Alt + M]");
        }
    }

    function toggleBon() {
        const check = document.getElementById("inp-is-bon");
        if (check) {
            check.checked = !check.checked;
            if (typeof onToggleBon === "function") onToggleBon();
            showShortcutFeedback(check.checked ? "🏷️ Mode Bon / Utang AKTIF [Alt + Shift + B]" : "🏷️ Mode Penjualan Normal [Alt + Shift + B]");
        }
    }

    function clearCartAction() {
        if (typeof cart !== "undefined" && Array.isArray(cart) && cart.length > 0) {
            if (confirm("Apakah Anda yakin ingin mengosongkan keranjang transaksi kasir?")) {
                cart = [];
                if (typeof paymentList !== "undefined") paymentList = [];
                if (typeof renderCart === "function") renderCart();
                if (typeof renderPaymentList === "function") renderPaymentList();
                showShortcutFeedback("🗑️ Keranjang Kasir Dikosongkan [Alt + Q]");
            }
        } else if (typeof clearCart === "function") {
            clearCart();
            showShortcutFeedback("🗑️ Keranjang Dikosongkan [Alt + Q]");
        } else if (typeof resetForm === "function") {
            resetForm();
            showShortcutFeedback("🗑️ Form Direset [Alt + Q]");
        } else {
            showShortcutFeedback("ℹ️ Keranjang Sudah Kosong [Alt + Q]");
        }
    }

    function triggerPrintShift() {
        if (typeof generateShiftReceipt === "function") {
            generateShiftReceipt();
            showShortcutFeedback("🖨️ Cetak Setoran Shift [Alt + P]");
        } else if (typeof printReceipt === "function") {
            printReceipt();
            showShortcutFeedback("🖨️ Mencetak Struk [Alt + P]");
        } else {
            window.print();
        }
    }

    function triggerCloseShift() {
        if (typeof openCloseShiftModal === "function") {
            openCloseShiftModal();
            showShortcutFeedback("📋 Buka Tutup Shift [Alt + Shift + S]");
        }
    }

    function triggerAddProduct() {
        const btn = document.getElementById("addProductButton") || document.querySelector("button[onclick*='openModal']");
        if (btn) {
            btn.click();
            showShortcutFeedback("📦 Tambah Produk Baru [Alt + N]");
        }
    }

    function triggerStockValuation() {
        const btn = document.getElementById("btn-cek-nilai-stok") || document.querySelector("button[onclick*='openStockValuationModal']");
        if (btn) {
            btn.click();
            showShortcutFeedback("📊 Cek Nilai Stok [Alt + K]");
        }
    }

    function triggerRefreshData() {
        if (typeof fetchRiwayat === "function") fetchRiwayat();
        else if (typeof loadProducts === "function") loadProducts();
        else if (typeof fetchPurchases === "function") fetchPurchases(typeof currentPage !== "undefined" ? currentPage : 1);
        else if (typeof fetchJournals === "function") fetchJournals();
        else if (typeof fetchSales === "function") fetchSales();
        else window.location.reload();
        showShortcutFeedback("🔄 Memuat Ulang Data [Alt + R]");
    }

    function triggerRefreshOnline() {
        if (typeof loadOnlineUsers === "function") {
            loadOnlineUsers(true);
            showShortcutFeedback("🔄 Segarkan Status Online [Alt + R]");
        }
    }

    function triggerFilterFocus() {
        const filterEl = document.querySelector("#filterStatus, #filterStore, #filterLocation, #filterPayment, #filterDate");
        if (filterEl) {
            filterEl.focus();
            highlightElement(filterEl);
            showShortcutFeedback("🔍 Fokus Filter [Alt + R]");
        }
    }

    function triggerResetFilters() {
        if (typeof resetFilters === "function") {
            resetFilters();
            showShortcutFeedback("↩️ Reset Filter Transaksi [Alt + X]");
        }
    }

    function triggerLoadMore() {
        if (typeof loadMoreRiwayat === "function") {
            loadMoreRiwayat();
            showShortcutFeedback("⬇️ Muat Lebih Banyak [Alt + M]");
        }
    }

    function triggerExportExcel() {
        const btn = document.querySelector("button[onclick*='export'], #btnExport");
        if (btn) {
            btn.click();
            showShortcutFeedback("📥 Export Rekap Excel [Alt + E]");
        } else if (typeof exportStockExcel === "function") {
            exportStockExcel();
            showShortcutFeedback("📥 Export Excel [Alt + E]");
        } else if (typeof exportJournalsExcel === "function") {
            exportJournalsExcel();
            showShortcutFeedback("📥 Export Excel [Alt + E]");
        }
    }

    function triggerAddExpense() {
        const btn = document.querySelector("button[onclick*='openModal'], button[onclick*='createExpense']");
        if (btn) {
            btn.click();
            showShortcutFeedback("💸 Tambah Pengeluaran [Alt + N]");
        }
    }

    function triggerAddPurchase() {
        const btn = document.querySelector("button[onclick*='openModal'], #btnTambahPembelian");
        if (btn) {
            btn.click();
            showShortcutFeedback("🛍️ Tambah Pembelian [Alt + N]");
        }
    }

    function triggerAddToPurchaseCart() {
        if (typeof addToPurchaseCart === "function") {
            addToPurchaseCart();
            showShortcutFeedback("🛒 Tambah Item Purchase [Alt + A]");
        }
    }

    function triggerSubmitBatchPurchase() {
        if (typeof submitBatchPurchase === "function") {
            submitBatchPurchase();
            showShortcutFeedback("💾 Simpan Transaksi Purchase [Ctrl + Enter]");
        }
    }

    function triggerAddJournal() {
        const btn = document.querySelector("button[onclick*='openJournalModal'], button[onclick*='openModal'], #btnTambahJurnal");
        if (btn) {
            btn.click();
            showShortcutFeedback("📚 Tambah Jurnal Harian [Alt + N]");
        }
    }

    function triggerAddAccount() {
        if (typeof openAccountModal === "function") {
            openAccountModal();
            showShortcutFeedback("📁 Tambah Akun COA [Alt + A]");
        }
    }

    function triggerAddPiutang() {
        if (typeof openPiutangModal === "function") {
            openPiutangModal();
            showShortcutFeedback("💵 Tambah Piutang Dagang [Alt + P]");
        }
    }

    function triggerNewOpname() {
        const btn = document.querySelector("button[onclick*='openNewSessionModal'], #btnNewOpname");
        if (btn) {
            btn.click();
            showShortcutFeedback("📋 Sesi Opname Baru [Alt + N]");
        }
    }

    function triggerAddRetur() {
        const btn = document.querySelector("button[onclick*='openModal'], #btnTambahRetur");
        if (btn) {
            btn.click();
            showShortcutFeedback("🔄 Input Retur Baru [Alt + N]");
        }
    }

    function triggerClockIn() {
        const btn = document.querySelector("button[onclick*='clockIn'], button[onclick*='recordAttendance'], #btnAbsen");
        if (btn) {
            btn.click();
            showShortcutFeedback("⏰ Catat Absensi [Alt + N]");
        }
    }

    function triggerSubmitForm() {
        // Cari modal aktif atau form aktif
        const activeModal = document.querySelector("div[id*='modal']:not(.hidden), div[id*='Modal']:not(.hidden)");
        const submitBtn = activeModal
            ? activeModal.querySelector("button[type='submit'], #submitProductButton, #btnSubmitJournal, button[onclick*='submit'], button[onclick*='save']")
            : document.querySelector("button[type='submit'], #submitProductButton, #btnSubmitJournal, button[onclick*='submit']");

        if (submitBtn) {
            submitBtn.click();
            showShortcutFeedback("💾 Simpan Data Form [Ctrl + Enter]");
        }
    }

    function highlightElement(el) {
        if (!el) return;
        el.classList.add("ring-4", "ring-blue-400/50", "transition-all", "duration-200");
        setTimeout(() => el.classList.remove("ring-4", "ring-blue-400/50"), 800);
    }

    // 5. Visual Toast Feedback saat Shortcut Ditekan
    let feedbackToast = null;
    let feedbackTimer = null;
    function showShortcutFeedback(msg) {
        if (isMobile()) return;
        if (!feedbackToast) {
            feedbackToast = document.createElement("div");
            feedbackToast.id = "shortcut-feedback-toast";
            feedbackToast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none transition-all duration-300 transform opacity-0 translate-y-3";
            feedbackToast.innerHTML = `
                <div class="bg-slate-900/95 text-white backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold tracking-wide">
                    <span id="shortcut-feedback-text"></span>
                </div>
            `;
            document.body.appendChild(feedbackToast);
        }

        const textEl = document.getElementById("shortcut-feedback-text");
        if (textEl) textEl.innerText = msg;
        feedbackToast.classList.remove("opacity-0", "translate-y-3");
        feedbackToast.classList.add("opacity-100", "translate-y-0");

        if (feedbackTimer) clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(() => {
            feedbackToast.classList.remove("opacity-100", "translate-y-0");
            feedbackToast.classList.add("opacity-0", "translate-y-3");
        }, 1600);
    }

    // 6. Eksekusi Aksi dari Modal dan Otomatis Tutup Modal
    window.executeAndCloseShortcut = function (shortcutKey) {
        window.toggleShortcutModal(false);
        const pageShortcuts = getPageSpecificShortcuts();
        const found = pageShortcuts.find(s => s.key === shortcutKey);
        if (found && typeof found.action === "function") {
            setTimeout(() => found.action(), 100);
        }
    };

    // 7. Filter Real-Time di Dalam Modal Guide
    window.filterShortcutGuide = function (query) {
        const q = (query || "").toLowerCase().trim();
        const items = document.querySelectorAll(".shortcut-guide-item");
        items.forEach(el => {
            const text = (el.innerText || "").toLowerCase();
            if (!q || text.includes(q)) {
                el.style.display = "";
            } else {
                el.style.display = "none";
            }
        });
    };

    // 8. CSS Stylesheet Global untuk Shortcut & Responsif
    function injectShortcutStyles() {
        if (document.getElementById("shortcut-custom-styles")) return;
        const style = document.createElement("style");
        style.id = "shortcut-custom-styles";
        style.innerHTML = `
            .shortcut-hover-card {
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .shortcut-hover-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.12);
            }
            .keycap-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
                border: 1px solid #cbd5e1;
                border-bottom: 2px solid #94a3b8;
                border-radius: 6px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 10px;
                font-weight: 800;
                line-height: 1;
                padding: 2.5px 6.5px;
                color: #1e293b;
                transition: all 0.15s ease;
            }
            /* Table Row Interactive Polish */
            table tbody tr {
                transition: background-color 0.15s ease, transform 0.15s ease;
            }
            table tbody tr:hover {
                background-color: rgba(239, 246, 255, 0.6) !important;
            }
                        .tab-btn.bg-blue-600 .shortcut-tab-badge,
            button.bg-blue-600 .shortcut-tab-badge {
                background-color: rgba(255, 255, 255, 0.25) !important;
                color: #ffffff !important;
                border-color: rgba(255, 255, 255, 0.35) !important;
            }
            /* Visual badge inside Search Input */
            .search-shortcut-badge {
                position: absolute;
                right: 14px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10;
                pointer-events: none;
            }

            /* Cross-Document Native View Transitions (Edge, Chrome, Brave, Safari PWA) */
            @view-transition {
                navigation: auto;
            }
            #app-sidebar, #ios-bottom-bar, #ios-menu-wrapper {
                view-transition-name: app-nav-fixed;
            }
            ::view-transition-group(app-nav-fixed) {
                animation-duration: 0s !important;
            }

            /* =========================================================================
               THEMA LIQUID GLASS & SPECULAR GLASS REFLECTION (SEMUA MODAL & SWEETALERT2)
               ========================================================================= */

            /* 1. Backdrop Glass Dimmer dengan Liquid Blur */
            div.fixed.inset-0[id*="modal"],
            div.fixed.inset-0[id*="Modal"],
            #shortcut-guide-modal,
            .swal2-container.swal2-backdrop-show,
            .swal2-container.swal2-noanimation {
                background: rgba(15, 23, 42, 0.40) !important;
                backdrop-filter: blur(14px) saturate(160%) !important;
                -webkit-backdrop-filter: blur(14px) saturate(160%) !important;
            }

            /* 2. Modal Card & SweetAlert2 Container - Liquid Glass Reflection */
            div.fixed.inset-0[id*="modal"] > div:first-child,
            div.fixed.inset-0[id*="Modal"] > div:first-child,
            #shortcut-guide-modal > div,
            .modal-content,
            .swal2-popup {
                display: flex !important;
                flex-direction: column !important;
                max-height: 90vh !important;
                max-height: 90dvh !important;
                overflow: hidden !important;
                backdrop-filter: blur(32px) saturate(200%) !important;
                -webkit-backdrop-filter: blur(32px) saturate(200%) !important;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.74) 100%) !important;
                border: 1px solid rgba(255, 255, 255, 0.85) !important;
                box-shadow: 0 24px 60px -12px rgba(15, 23, 42, 0.22), 0 8px 24px -4px rgba(15, 23, 42, 0.10), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.35) !important;
                border-radius: 2rem !important;
            }

            /* Header modal tidak boleh menyusut */
            div.fixed.inset-0[id*="modal"] > div:first-child > div:first-child,
            div.fixed.inset-0[id*="Modal"] > div:first-child > div:first-child {
                flex-shrink: 0 !important;
            }

            /* Body/Form di dalam modal wajib scroll mandiri & padding aman */
            div.fixed.inset-0[id*="modal"] > div:first-child form,
            div.fixed.inset-0[id*="Modal"] > div:first-child form {
                flex: 1 1 auto !important;
                min-height: 0 !important;
                max-height: none !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
                padding-bottom: 2rem !important;
            }

            /* 3. Header & Footer Modal Transparan agar Efek Kaca Mengalir Mulus */
            div.fixed.inset-0[id*="modal"] > div:first-child > div:first-child,
            div.fixed.inset-0[id*="Modal"] > div:first-child > div:first-child,
            div.fixed.inset-0[id*="modal"] > div:first-child > .border-b,
            div.fixed.inset-0[id*="Modal"] > div:first-child > .border-b,
            #shortcut-guide-modal > div > div:first-child {
                background: transparent !important;
                border-bottom: 1px solid rgba(226, 232, 240, 0.65) !important;
            }

            div.fixed.inset-0[id*="modal"] > div:first-child form,
            div.fixed.inset-0[id*="Modal"] > div:first-child form {
                background: transparent !important;
            }

            div.fixed.inset-0[id*="modal"] > div:first-child > .border-t,
            div.fixed.inset-0[id*="Modal"] > div:first-child > .border-t,
            #shortcut-guide-modal > div > div:last-child {
                background: transparent !important;
                border-top: 1px solid rgba(226, 232, 240, 0.65) !important;
            }

            /* 4. Glass Close Button pada Header Modal */
            div.fixed.inset-0[id*="modal"] button[onclick*="close"],
            div.fixed.inset-0[id*="Modal"] button[onclick*="close"],
            div.fixed.inset-0[id*="modal"] button[onclick*="Close"],
            div.fixed.inset-0[id*="Modal"] button[onclick*="Close"],
            #shortcut-guide-modal button[onclick*="toggleShortcutModal"],
            .swal2-close {
                border-radius: 9999px !important;
                background: rgba(255, 255, 255, 0.70) !important;
                border: 1px solid rgba(255, 255, 255, 0.85) !important;
                box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            div.fixed.inset-0[id*="modal"] button[onclick*="close"]:hover,
            div.fixed.inset-0[id*="Modal"] button[onclick*="close"]:hover,
            div.fixed.inset-0[id*="modal"] button[onclick*="Close"]:hover,
            div.fixed.inset-0[id*="Modal"] button[onclick*="Close"]:hover,
            #shortcut-guide-modal button[onclick*="toggleShortcutModal"]:hover,
            .swal2-close:hover {
                background: rgba(255, 255, 255, 0.95) !important;
                transform: scale(1.06) !important;
                color: #0f172a !important;
            }

            /* 5. Typography & Elemen SweetAlert2 */
            .swal2-title {
                color: #0f172a !important;
                font-weight: 800 !important;
                letter-spacing: -0.02em !important;
            }
            .swal2-html-container {
                color: #334155 !important;
                font-size: 0.95rem !important;
                line-height: 1.55 !important;
            }
            .swal2-icon {
                box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 4px 16px rgba(15, 23, 42, 0.06) !important;
                border-width: 3px !important;
            }

            /* 6. Form Controls & Inputs di dalam Modal & SweetAlert2 */
            div.fixed.inset-0[id*="modal"] input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]),
            div.fixed.inset-0[id*="Modal"] input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]),
            div.fixed.inset-0[id*="modal"] select,
            div.fixed.inset-0[id*="Modal"] select,
            div.fixed.inset-0[id*="modal"] textarea,
            div.fixed.inset-0[id*="Modal"] textarea,
            .swal2-input,
            .swal2-file,
            .swal2-textarea,
            .swal2-select,
            .swal2-popup input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]),
            .swal2-popup select,
            .swal2-popup textarea {
                background: rgba(255, 255, 255, 0.72) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(226, 232, 240, 0.85) !important;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(255, 255, 255, 0.8) !important;
                border-radius: 0.85rem !important;
                color: #0f172a !important;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            div.fixed.inset-0[id*="modal"] input:focus,
            div.fixed.inset-0[id*="Modal"] input:focus,
            div.fixed.inset-0[id*="modal"] select:focus,
            div.fixed.inset-0[id*="Modal"] select:focus,
            div.fixed.inset-0[id*="modal"] textarea:focus,
            div.fixed.inset-0[id*="Modal"] textarea:focus,
            .swal2-input:focus,
            .swal2-textarea:focus,
            .swal2-select:focus,
            .swal2-popup input:focus,
            .swal2-popup select:focus,
            .swal2-popup textarea:focus {
                background: rgba(255, 255, 255, 0.95) !important;
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22), inset 0 1px 2px rgba(0, 0, 0, 0.03) !important;
            }

            /* 7. Action Buttons di SweetAlert2 */
            .swal2-actions {
                gap: 0.75rem !important;
                margin-top: 1.5rem !important;
            }
            .swal2-styled {
                border-radius: 1.15rem !important;
                font-weight: 800 !important;
                font-size: 0.92rem !important;
                padding: 0.75rem 1.75rem !important;
                box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4) !important;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            .swal2-styled:active {
                transform: scale(0.97) !important;
            }
            .swal2-styled.swal2-confirm {
                box-shadow: 0 6px 18px -2px rgba(37, 99, 235, 0.35), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4) !important;
            }
            .swal2-styled.swal2-cancel {
                background: rgba(241, 245, 249, 0.85) !important;
                color: #475569 !important;
                border: 1px solid rgba(203, 213, 225, 0.8) !important;
                box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.9) !important;
            }

            /* 8. Row Action Popup Items (Mobile Unified Menu) */
            .row-action-popup-item {
                backdrop-filter: blur(16px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
                border: 1px solid rgba(255, 255, 255, 0.85) !important;
                box-shadow: 0 3px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95) !important;
            }

            /* =========================================================================
               RESPONSIF MOBILE & INTERAKTIF LAYAR SENTUH (MAX-WIDTH: 768px)
               - Seluruh shortcut dihilangkan pada tampilan mobile agar bersih & rapi
               - Menghindari tombol/elemen saling tumpang tindih
               - Menyempurnakan interaktivitas sentuhan agar nyaman digunakan di HP
               ========================================================================= */
            /* Keamanan Sidebar: Pastikan drawer sidebar selalu berada di atas floating widget apa pun */
            #app-sidebar {
                z-index: 50 !important;
            }
            #shortcut-helper-fab {
                z-index: 40 !important;
            }

            /* Sembunyikan SEMUA tombol shortcut secara mutlak pada mobile & tablet (< 1024px) */
            @media (max-width: 1023px) {
                /* 1. Hilangkan seluruh badge shortcut & tombol shortcut pada mobile */
                .shortcut-btn-badge,
                .shortcut-tab-badge,
                .search-shortcut-badge,
                .bon-kbd-badge,
                .dp-kbd-badge,
                .kbd-pay-hint,
                .kbd-add-hint,
                .kbd-val-hint,
                #search-kbd-hint,
                .shortcut-header-btn,
                button[onclick*="toggleShortcutModal"],
                button[onclick*="ShortcutModal"],
                [class*="shortcut-header-btn"] {
                    display: none !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }

                /* 2. Sembunyikan floating button shortcut agar tidak menutupi aksi kasir / checkout */
                #shortcut-helper-fab {
                    display: none !important;
                }

                /* 3. Cegah iOS Auto-Zoom pada kolom input/select/textarea saat disentuh */
                input, select, textarea {
                    font-size: 16px !important;
                }

                /* 4. Touch Targets: Tinggi tombol aksi utama minimal 42px (kecuali icon button tabel) */
                button:not(.btn-icon-tiny):not(table button):not(td button):not(.w-8) {
                    min-height: 42px;
                }

                /* 5. Smooth 60fps Inertial Momentum Scrolling pada tabel & container */
                .overflow-x-auto, .overflow-y-auto, .custom-scroll {
                    -webkit-overflow-scrolling: touch !important;
                    overscroll-behavior-x: contain;
                }

                /* 6. Hilangkan tumpang tindih pada header dan container flex */
                header, .header-section, .action-buttons-container {
                    flex-wrap: wrap !important;
                    gap: 0.5rem !important;
                }
                header .flex.items-center.gap-3,
                header .flex.items-center.gap-4,
                .flex.items-center.gap-3 {
                    flex-wrap: wrap;
                }

                /* 7. Modal Full-width & Terpusat Nyaman di Mobile */
                #shortcut-guide-modal > div,
                .swal2-popup,
                div[id*="modal"]:not(.hidden) > div:first-child,
                div[id*="Modal"]:not(.hidden) > div:first-child {
                    width: 95% !important;
                    max-width: 95% !important;
                    max-height: 88vh !important;
                    max-height: 88dvh !important;
                    margin: auto !important;
                    border-radius: 1.5rem !important;
                    display: flex !important;
                    flex-direction: column !important;
                    overflow: hidden !important;
                }

                div[id*="modal"]:not(.hidden) > div:first-child > div:first-child,
                div[id*="Modal"]:not(.hidden) > div:first-child > div:first-child {
                    flex-shrink: 0 !important;
                }

                div[id*="modal"]:not(.hidden) > div:first-child form,
                div[id*="Modal"]:not(.hidden) > div:first-child form {
                    flex: 1 1 auto !important;
                    min-height: 0 !important;
                    max-height: none !important;
                    overflow-y: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    padding-bottom: 2.5rem !important;
                }

                /* 8. Toast Feedback Lebih Ramping di Layar HP */
                #shortcut-feedback-toast {
                    bottom: 4.5rem !important;
                    width: calc(100% - 2rem) !important;
                    max-width: 320px !important;
                }

                /* 9. Padding Bawah Aman untuk Smartphone Modern (Home Bar Inset) */
                body {
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                }
            }

            /* 10. Mikro-Interaksi Khusus Touchscreen (Layar Sentuh) */
            @media (hover: none) and (pointer: coarse) {
                button:active, a:active, input[type='button']:active, input[type='submit']:active {
                    transform: scale(0.97) !important;
                    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                /* Hindari efek hover yang membeku/stuck saat scrolling di HP */
                .shortcut-hover-card:hover {
                    transform: none !important;
                    box-shadow: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 9. Inject UI Panduan (Floating Action Button + Guide Modal)
    function injectShortcutHelperUI() {
        injectShortcutStyles();
        if (isMobile()) {
            cleanupMobileShortcuts();
            return;
        }

        // B. Inject Floating Action Button (FAB) Konsisten di Pojok Kanan Bawah
        let fab = document.getElementById("shortcut-helper-fab");
        if (!fab) {
            fab = document.createElement("div");
            fab.id = "shortcut-helper-fab";
            fab.className = "hidden lg:flex fixed bottom-5 right-5 z-40 items-center gap-2 select-none";
            fab.innerHTML = `
                <button
                    type="button"
                    id="btn-open-shortcut-modal"
                    onclick="window.toggleShortcutModal()"
                    class="group flex items-center gap-2.5 bg-white/95 hover:bg-blue-600 text-slate-700 hover:text-white px-3.5 py-2.5 rounded-2xl border border-slate-200/90 hover:border-blue-500 shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md shortcut-hover-card"
                    title="Panduan Pintasan Keyboard (Tekan ? atau Alt + H)"
                >
                    <div class="w-6 h-6 rounded-lg bg-blue-50 group-hover:bg-white/20 flex items-center justify-center text-blue-600 group-hover:text-white transition-colors">
                        <i class="fas fa-keyboard text-xs"></i>
                    </div>
                    <div class="text-left hidden sm:block">
                        <span class="text-[11px] font-black uppercase tracking-wider block leading-none">Shortcut</span>
                        <span class="text-[9px] text-slate-400 group-hover:text-blue-100 font-mono font-bold">Tekan ? / Alt + H</span>
                    </div>
                </button>
            `;
            document.body.appendChild(fab);
        } else {
            fab.className = "hidden lg:flex fixed bottom-5 right-5 z-40 items-center gap-2 select-none";
            fab.style.display = "";
        }

        // D. Inject Shortcut Guide Modal
        const modalContainer = document.createElement("div");
        modalContainer.id = "shortcut-guide-modal";
        modalContainer.className = "fixed inset-0 z-[99999] hidden items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200";
        modalContainer.onclick = function (e) {
            if (e.target === modalContainer) window.toggleShortcutModal(false);
        };

        const pageShortcuts = getPageSpecificShortcuts();

        modalContainer.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <!-- Modal Header -->
                <div class="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-sm">
                    <div class="flex items-center gap-3.5">
                        <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-xl shadow-inner">
                            <i class="fas fa-keyboard"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-black tracking-tight leading-tight flex items-center gap-2">
                                <span>Pintasan Keyboard</span>
                                <span class="text-[10px] bg-emerald-400/90 text-slate-900 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-2xs">Super Cepat</span>
                            </h3>
                            <p class="text-xs text-blue-100 font-medium">Bekerja lebih cepat tanpa perlu bergantung pada mouse atau touchpad</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onclick="window.toggleShortcutModal(false)"
                        class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Tutup (Esc)"
                    >
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>

                <!-- Search Filter Bar Inside Modal -->
                <div class="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-100">
                    <div class="relative">
                        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input
                            type="text"
                            id="shortcut-search-filter"
                            placeholder="Cari pintasan keyboard (misal: bayar, cari, bon, produk, shift, tambah, export)..."
                            class="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            oninput="window.filterShortcutGuide(this.value)"
                        />
                    </div>
                </div>

                <!-- Modal Content (Scrollable) -->
                <div class="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scroll flex-1">
                    <!-- Section 1: Aksi Cepat Halaman Ini -->
                    ${pageShortcuts.length > 0 ? `
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <h4 class="text-xs font-black uppercase tracking-wider text-slate-800">Aksi Modul Ini</h4>
                            <span class="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">Konteks Aktif</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            ${pageShortcuts.map(s => `
                                <div
                                    class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all duration-150 cursor-pointer group shadow-2xs hover:shadow-sm"
                                    ${s.action ? `onclick="window.executeAndCloseShortcut('${s.key}')" title="Klik untuk langsung jalankan aksi"` : ""}
                                >
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <i class="fas ${s.icon || "fa-bolt"}"></i>
                                        </div>
                                        <span class="text-xs font-bold text-slate-700 group-hover:text-blue-900">${s.label}</span>
                                    </div>
                                    <kbd class="keycap-badge shrink-0 ml-2 group-hover:border-blue-400">${s.key}</kbd>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                    ` : ""}

                    <!-- Section 2: Navigasi Cepat Antar Modul -->
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                            <h4 class="text-xs font-black uppercase tracking-wider text-slate-800">Navigasi Antar Halaman</h4>
                            <span class="text-[10px] text-blue-700 bg-blue-50 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">Lompat Seketika</span>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            ${NAVIGATION_SHORTCUTS.map(n => `
                                <a
                                    href="${n.dest}"
                                    class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-150 group shadow-2xs hover:shadow-sm"
                                >
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-7 h-7 rounded-lg ${n.color} flex items-center justify-center text-xs">
                                            <i class="fas ${n.icon}"></i>
                                        </div>
                                        <span class="text-xs font-bold text-slate-700 group-hover:text-blue-900">${n.label}</span>
                                    </div>
                                    <kbd class="keycap-badge shrink-0 group-hover:text-blue-700">${n.key}</kbd>
                                </a>
                            `).join("")}
                        </div>
                    </div>

                    <!-- Section 3: Pintasan Universal & Global -->
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                            <h4 class="text-xs font-black uppercase tracking-wider text-slate-800">Pintasan Universal</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                                <span class="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <i class="fas fa-magnifying-glass text-blue-500 text-xs"></i> Fokus Kolom Pencarian
                                </span>
                                <kbd class="keycap-badge">/</kbd>
                            </div>
                            <div class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                                <span class="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <i class="fas fa-circle-question text-blue-500 text-xs"></i> Buka / Tutup Panduan Shortcut
                                </span>
                                <kbd class="keycap-badge">? / Alt + H</kbd>
                            </div>
                            <div class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                                <span class="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <i class="fas fa-floppy-disk text-emerald-500 text-xs"></i> Simpan Form / Modal
                                </span>
                                <kbd class="keycap-badge">Ctrl + Enter</kbd>
                            </div>
                            <div class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                                <span class="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <i class="fas fa-arrows-left-right text-indigo-500 text-xs"></i> Halaman Prev / Next
                                </span>
                                <kbd class="keycap-badge">Alt + [ / ]</kbd>
                            </div>
                            <div class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                                <span class="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <i class="fas fa-xmark text-slate-500 text-xs"></i> Tutup Modal / Batal / Blur
                                </span>
                                <kbd class="keycap-badge">Esc</kbd>
                            </div>
                            <div class="shortcut-guide-item flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                                <span class="text-xs font-bold text-slate-700 flex items-center gap-2">
                                    <i class="fas fa-sign-out-alt text-rose-500 text-xs"></i> Keluar Aman dari Sistem (Logout)
                                </span>
                                <kbd class="keycap-badge text-rose-600 border-rose-300">Alt + L</kbd>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs text-slate-500 font-medium">
                    <span class="flex items-center gap-2 text-slate-600">
                        <i class="fas fa-lightbulb text-amber-500 text-sm"></i>
                        <span>Tip: Tekan <b>Esc</b> kapan saja untuk menutup jendela panduan ini.</span>
                    </span>
                    <button
                        type="button"
                        onclick="window.toggleShortcutModal(false)"
                        class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        Tutup Panduan (Esc)
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);
    }

    // 10. Hapus Tombol Shortcut di Header agar Konsisten Floating di Pojok Kanan Bawah
    function removeHeaderShortcutButtons() {
        document.querySelectorAll('.shortcut-header-btn').forEach(el => el.remove());
    }

    // 10. Global Modal Toggle
    window.toggleShortcutModal = function (forceState) {
        if (isMobile()) return;
        const modal = document.getElementById("shortcut-guide-modal");
        if (!modal) return;
        const isHidden = modal.classList.contains("hidden");
        const nextState = typeof forceState === "boolean" ? forceState : isHidden;

        if (nextState) {
            modal.classList.remove("hidden");
            modal.classList.add("flex");
            setTimeout(() => {
                const searchInp = document.getElementById("shortcut-search-filter");
                if (searchInp) {
                    searchInp.value = "";
                    searchInp.focus();
                    window.filterShortcutGuide("");
                }
            }, 80);
        } else {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
        }
    };

    // 11. Keydown Listener Utama (Event Dispatcher Lengkap)
    window.addEventListener("keydown", function (e) { /* permanent shortcut dispatcher */
        // MUTLAK: Nonaktifkan semua shortcut pada tampilan mobile (< 1024px)
        if (isMobile()) return;
        const targetTag = (e.target.tagName || "").toUpperCase();
        const isInputFocused = targetTag === "INPUT" || targetTag === "TEXTAREA" || targetTag === "SELECT";

        // A. Toggle Modal: Tekan '?' (Shift + /) atau Alt + H
        if ((e.key === "?" && !isInputFocused) || (e.altKey && e.key.toLowerCase() === "h")) {
            e.preventDefault();
            window.toggleShortcutModal();
            return;
        }

        // B. Escape: Tutup modal shortcut / modal aktif
        if (e.key === "Escape") {
            const modal = document.getElementById("shortcut-guide-modal");
            if (modal && !modal.classList.contains("hidden")) {
                e.preventDefault();
                window.toggleShortcutModal(false);
                return;
            }
            // Tutup modal umum jika ada
            const closeBtn = document.querySelector("button[onclick*='closeModal'], button[onclick*='close'], .modal button[onclick*='close']");
            if (closeBtn) {
                closeBtn.click();
                return;
            }
            if (isInputFocused && typeof e.target.blur === "function") {
                e.target.blur();
                return;
            }
        }

        // C. Tombol '/' untuk fokus kolom pencarian utama (jika tidak sedang mengetik di input)
        if (e.key === "/" && !isInputFocused) {
            e.preventDefault();
            focusSearchInput();
            return;
        }

        // D. Tombol Alt + S: Selalu fokus pencarian (meskipun sedang di input lain)
        if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "s" && !currentPage.includes("opname")) {
            e.preventDefault();
            focusSearchInput();
            return;
        }

        // E. Ctrl + Enter / Ctrl + S: Submit / Simpan Form
        if ((e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.key.toLowerCase() === "s")) {
            e.preventDefault();
            triggerSubmitForm();
            return;
        }

        // F. Alt + Pagination: Alt + [ (Prev) dan Alt + ] (Next)
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
            if (e.key === "[" || e.key === "ArrowLeft") {
                const prevBtn = document.querySelector("button[onclick*='- 1'], button[onclick*='prev'], button[onclick*='changePage']:first-of-type");
                if (prevBtn && !prevBtn.disabled) {
                    e.preventDefault();
                    prevBtn.click();
                    showShortcutFeedback("◀ Halaman Sebelumnya [Alt + []");
                    return;
                }
            }
            if (e.key === "]" || e.key === "ArrowRight") {
                const nextBtn = document.querySelector("button[onclick*='+ 1'], button[onclick*='next']");
                if (nextBtn && !nextBtn.disabled) {
                    e.preventDefault();
                    nextBtn.click();
                    showShortcutFeedback("▶ Halaman Berikutnya [Alt + ]]");
                    return;
                }
            }
        }

        // G. Navigasi Cepat Modul dengan Alt + 1..9 / Alt + 0 / Alt + Huruf
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
            const keyChar = e.key.toLowerCase();

            // Alt + Number / Letter
            if (keyChar === "1") { e.preventDefault(); window.location.href = "dashboard.html"; return; }
            if (keyChar === "2") { e.preventDefault(); window.location.href = "riwayat.html"; return; }
            if (keyChar === "r" && !e.shiftKey) {
                e.preventDefault();
                triggerRefreshData();
                return;
            }
            if (keyChar === "3" || keyChar === "m") {
                if (currentPage.includes("dashboard")) {
                    e.preventDefault();
                    triggerAddPaymentToList();
                    return;
                }
                if (currentPage.includes("riwayat")) {
                    e.preventDefault();
                    triggerLoadMore();
                    return;
                }
                e.preventDefault();
                window.location.href = "product.html";
                return;
            }
            if (keyChar === "4" || keyChar === "b") { e.preventDefault(); window.location.href = "purchase.html"; return; }
            if (keyChar === "5" || keyChar === "o") { e.preventDefault(); window.location.href = "expense.html"; return; }
            if (keyChar === "6" || keyChar === "t") { e.preventDefault(); window.location.href = "retur.html"; return; }
            if (keyChar === "7" || keyChar === "j") { e.preventDefault(); window.location.href = "akuntansi.html"; return; }
            if (keyChar === "8" || keyChar === "a") {
                if (currentPage.includes("dashboard")) {
                    e.preventDefault();
                    triggerAddToCart();
                    return;
                }
                if (currentPage.includes("purchase")) {
                    e.preventDefault();
                    triggerAddToPurchaseCart();
                    return;
                }
                if (currentPage.includes("akuntansi")) {
                    e.preventDefault();
                    triggerAddAccount();
                    return;
                }
                e.preventDefault();
                window.location.href = "absensi.html";
                return;
            }
            if (keyChar === "9" || keyChar === "k") {
                if (currentPage.includes("product")) {
                    e.preventDefault();
                    triggerStockValuation();
                    return;
                }
                e.preventDefault();
                window.location.href = "report.html";
                return;
            }
            if (keyChar === "0") { e.preventDefault(); window.location.href = "opname.html"; return; }
            if (keyChar === "u") { e.preventDefault(); window.location.href = "online-users.html"; return; }

            // Alt + L: Logout
            if (keyChar === "l") {
                e.preventDefault();
                if (typeof window.confirmLogout === "function") {
                    window.confirmLogout();
                } else if (confirm("Apakah Anda yakin ingin keluar dari sistem kasir?")) {
                    localStorage.removeItem("token");
                    window.location.href = "index.html";
                }
                return;
            }

            // Alt + N: Tambah Baru
            if (keyChar === "n") {
                e.preventDefault();
                if (currentPage.includes("product")) triggerAddProduct();
                else if (currentPage.includes("expense")) triggerAddExpense();
                else if (currentPage.includes("purchase")) triggerAddPurchase();
                else if (currentPage.includes("akuntansi")) triggerAddJournal();
                else if (currentPage.includes("opname")) triggerNewOpname();
                else if (currentPage.includes("retur")) triggerAddRetur();
                else if (currentPage.includes("absensi")) triggerClockIn();
                return;
            }

            // Alt + C: Fokus Nominal Bayar (di dashboard)
            if (keyChar === "c" && currentPage.includes("dashboard")) {
                e.preventDefault();
                focusNominalInput();
                return;
            }

            // Alt + P: Cetak (di dashboard atau report) atau Tambah Piutang
            if (keyChar === "p") {
                e.preventDefault();
                if (currentPage.includes("dashboard")) triggerPrintShift();
                else if (currentPage.includes("akuntansi")) triggerAddPiutang();
                else window.print();
                return;
            }

            // Alt + R: Segarkan Data (Refresh Bebas Konflik Edge & Chrome)
            if (keyChar === "r" && !e.shiftKey) {
                e.preventDefault();
                triggerRefreshData();
                return;
            }

            // Alt + X: Reset Filter
            if (keyChar === "x" && currentPage.includes("riwayat")) {
                e.preventDefault();
                triggerResetFilters();
                return;
            }

            // Alt + E: Export
            if (keyChar === "e") {
                e.preventDefault();
                triggerExportExcel();
                return;
            }
        }

        // H. Kasir F-Keys (F4: Bayar, F8: Bon, F9: Reset)
        if (currentPage.includes("dashboard")) {
            if (e.key === "Alt + Enter") {
                e.preventDefault();
                triggerPayment();
                return;
            }
            if (e.key === "Alt + Shift + B") {
                e.preventDefault();
                toggleBon();
                return;
            }
            if (e.key === "Alt + Q") {
                e.preventDefault();
                clearCartAction();
                return;
            }
        }

        // I. Number keys 1..6 untuk ganti tab / preset jika tidak sedang di input
        if (!isInputFocused && !e.altKey && !e.ctrlKey && !e.metaKey) {
            const num = parseInt(e.key, 10);
            if (num >= 1 && num <= 6) {
                if (currentPage.includes("online-users")) {
                    e.preventDefault();
                    if (num === 1 && typeof switchMainTab === "function") switchMainTab("online");
                    if (num === 2 && typeof switchMainTab === "function") switchMainTab("logs");
                } else if (currentPage.includes("akuntansi")) {
                    const tabButtons = document.querySelectorAll("#btn-tab-jurnal, #btn-tab-rekap, #btn-tab-ledger, #btn-tab-coa, #btn-tab-piutang");
                    if (tabButtons && tabButtons[num - 1]) {
                        e.preventDefault();
                        tabButtons[num - 1].click();
                        showShortcutFeedback(`📚 Beralih Tab ${num}`);
                    }
                } else if (currentPage.includes("riwayat")) {
                    const presetBtns = document.querySelectorAll("button[onclick*='setPresetDate']");
                    if (presetBtns && presetBtns[num - 1]) {
                        e.preventDefault();
                        presetBtns[num - 1].click();
                        showShortcutFeedback(`📅 Filter Rentang: ${presetBtns[num - 1].innerText.trim()}`);
                    }
                } else if (currentPage.includes("report")) {
                    const periodBtns = document.querySelectorAll("button[onclick*='setPeriod'], button[onclick*='loadReport']");
                    if (periodBtns && periodBtns[num - 1]) {
                        e.preventDefault();
                        periodBtns[num - 1].click();
                        showShortcutFeedback(`📊 Ganti Periode Laporan`);
                    }
                }
            }
        }
    });

    // 12. Pasang Badge Visual Info Shortcut pada SEMUA Search Box & Tombol di Halaman
    function injectAllShortcutBadges() {
        if (isMobile()) {
            cleanupMobileShortcuts();
            return;
        }
        // A. Pasang Badge pada Setiap Search Box
        const searchSelectors = [
            "#search-prod",
            "#searchInput",
            "#filterSearch",
            "#opnameSearchInput",
            "#journalSearch",
            "#piutangSearch",
            "#logSearchInput",
            "#retur-search",
            "#search-box",
            "input[type='search']",
            "input[placeholder*='Cari']",
            "input[placeholder*='cari']",
            "input[placeholder*='Ketik nama']"
        ];

        document.querySelectorAll(searchSelectors.join(",")).forEach(inp => {
            if (!inp || inp.dataset.shortcutBadged) return;
            inp.dataset.shortcutBadged = "true";

            const parent = inp.parentElement;
            if (parent) {
                const computedStyle = window.getComputedStyle(parent);
                if (computedStyle.position === "static") {
                    parent.style.position = "relative";
                }
                if (!parent.querySelector(".search-shortcut-badge")) {
                    const badge = document.createElement("span");
                    badge.className = "search-shortcut-badge pointer-events-none hidden sm:inline-flex items-center gap-1";
                    badge.innerHTML = `<kbd class="keycap-badge font-bold text-[9px] text-blue-700 bg-white border border-slate-300 shadow-2xs px-1.5 py-0.5 rounded">/ atau Alt + S</kbd>`;
                    parent.appendChild(badge);
                }
            }
        });

        // B. Pasang Badge pada Setiap Tombol Aksi di Halaman
        document.querySelectorAll("button").forEach(btn => {
            if (!btn || btn.dataset.shortcutBadged || btn.querySelector(".shortcut-btn-badge") || btn.querySelector(".shortcut-tab-badge") || btn.classList.contains("shortcut-header-btn") || btn.id === "btn-open-shortcut-modal") return;

            // EXCLUDE: Jangan pernah inject shortcut badge ke elemen dalam tabel/baris/aksi baris
            if (btn.closest("table") || btn.closest("tbody") || btn.closest("td") || btn.closest("tr") || btn.closest(".pagination") || btn.closest(".table-actions") || btn.closest(".data-row")) return;

            // EXCLUDE: Jangan inject shortcut badge generic ke tab navigasi (ditangani khusus di bagian F)
            if (btn.closest("nav") || btn.closest(".tabs-container") || btn.getAttribute("role") === "tab" || btn.id.startsWith("btn-tab-") || btn.id.startsWith("tabBtn") || btn.classList.contains("tab-btn") || btn.classList.contains("tab-button")) return;

            const text = (btn.innerText || "").trim().toLowerCase();
            const onclick = (btn.getAttribute("onclick") || "").toLowerCase();
            const id = (btn.id || "").toLowerCase();

            let badgeKey = "";

            if (id === "addproductbutton" || onclick.includes("openmodal") || onclick.includes("openjournalmodal") || onclick.includes("opennewsessionmodal") || onclick.includes("clockin") || (text.includes("tambah") && !text.includes("baris") && !text.includes("list"))) {
                badgeKey = "Alt + N";
            } else if (id === "btn-cek-nilai-stok" || onclick.includes("openstockvaluationmodal") || text.includes("cek nilai stok")) {
                badgeKey = "Alt + K";
            } else if (onclick.includes("executepayment") || text.includes("proses transaksi") || text.includes("bayar")) {
                badgeKey = "Alt + Enter";
            } else if (onclick.includes("generateshiftreceipt") || text.includes("cetak setoran shift")) {
                badgeKey = "Alt + P";
            } else if (onclick.includes("opencloseshiftmodal") || text.includes("tutup shift")) {
                badgeKey = "Alt + Shift + S";
            } else if (onclick.includes("addtocart") || text.includes("add to list")) {
                badgeKey = "Alt + A";
            } else if (onclick.includes("addpaymenttolist") || text.includes("masuk list")) {
                badgeKey = "Alt + M";
            } else if (onclick.includes("export") || text.includes("export excel")) {
                badgeKey = "Alt + E";
            } else if (onclick.includes("fetch") || onclick.includes("refresh") || text.includes("refresh data") || text.includes("refresh") || text.includes("segarkan")) {
                badgeKey = "Alt + R";
            } else if (onclick.includes("resetfilters") || text === "reset") {
                badgeKey = "Alt + X";
            } else if (onclick.includes("loadmoreriwayat") || text.includes("muat lebih banyak")) {
                badgeKey = "Alt + M";
            } else if (onclick.includes("openaccountmodal")) {
                badgeKey = "Alt + A";
            } else if (onclick.includes("openpiutangmodal")) {
                badgeKey = "Alt + P";
            } else {
                // Ctrl + Enter HANYA untuk tombol submit form atau tombol simpan modal yang sesungguhnya!
                const isFormOrModal = btn.closest("form") || btn.closest("div[id*='modal']") || btn.closest("div[id*='Modal']");
                const isSaveAction = (text.includes("simpan") || text.includes("submit")) && !text.includes("baris") && !text.includes("item");
                const isExplicitSubmitId = id === "submitproductbutton" || id === "btnsubmitjournal" || onclick.includes("submitbatchpurchase");

                if (isExplicitSubmitId || (isFormOrModal && isSaveAction)) {
                    badgeKey = "Ctrl + Enter";
                }
            }

            if (badgeKey) {
                btn.dataset.shortcutBadged = "true";
                const kbd = document.createElement("kbd");
                const btnClass = btn.className || "";

                if (btnClass.includes("bg-blue-600") || btnClass.includes("bg-blue-700") || btnClass.includes("bg-emerald-") || btnClass.includes("bg-amber-") || btnClass.includes("bg-slate-800") || btnClass.includes("bg-black")) {
                    kbd.className = "shortcut-btn-badge ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-white/20 text-white border border-white/30 shadow-2xs pointer-events-none inline-flex items-center shrink-0";
                } else {
                    kbd.className = "shortcut-btn-badge ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-black bg-white text-blue-700 border border-blue-200 shadow-2xs pointer-events-none inline-flex items-center shrink-0";
                }

                kbd.innerText = badgeKey;
                btn.appendChild(kbd);
            }
        });

        // C. Pasang Badge pada Switch Bon / Utang & DP (Dashboard)
        if (currentPage.includes("dashboard")) {
            const bonLabel = document.querySelector("label[for='inp-is-bon']");
            if (bonLabel && !bonLabel.parentElement.querySelector(".bon-kbd-badge")) {
                const kbd = document.createElement("kbd");
                kbd.className = "bon-kbd-badge mr-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs pointer-events-none inline-flex items-center";
                kbd.innerText = "Alt + Shift + B";
                bonLabel.parentElement.insertBefore(kbd, bonLabel);
            }
            const dpLabel = document.querySelector("label[for='inp-is-dp']");
            if (dpLabel && !dpLabel.parentElement.querySelector(".dp-kbd-badge")) {
                const kbd = document.createElement("kbd");
                kbd.className = "dp-kbd-badge mr-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs pointer-events-none inline-flex items-center";
                kbd.innerText = "Alt + Shift + D";
                dpLabel.parentElement.insertBefore(kbd, dpLabel);
            }
        }

        // D. Pasang Badge pada Filter Presets Riwayat (1..6)
        if (currentPage.includes("riwayat")) {
            const presetBtns = document.querySelectorAll("button[onclick*='setPresetDate']");
            presetBtns.forEach((btn, idx) => {
                if (!btn.querySelector(".shortcut-tab-badge") && idx < 6) {
                    const kbd = document.createElement("kbd");
                    kbd.className = "shortcut-tab-badge ml-1 px-1 py-0.5 rounded text-[8px] font-mono font-black bg-slate-200/80 text-slate-700 border border-slate-300 pointer-events-none";
                    kbd.innerText = `${idx + 1}`;
                    btn.appendChild(kbd);
                }
            });
        }

        // E. Pasang Badge pada Filter Periode Laporan (1..4)
        if (currentPage.includes("report")) {
            const periodBtns = document.querySelectorAll("button[onclick*='setPeriod'], button[onclick*='loadReport']");
            periodBtns.forEach((btn, idx) => {
                if (!btn.querySelector(".shortcut-tab-badge") && idx < 4) {
                    const kbd = document.createElement("kbd");
                    kbd.className = "shortcut-tab-badge ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-blue-100 text-blue-800 border border-blue-200 pointer-events-none";
                    kbd.innerText = `${idx + 1}`;
                    btn.appendChild(kbd);
                }
            });
        }

        // F. Pasang Badge pada Tombol Tabs
        if (currentPage.includes("akuntansi")) {
            const tabIds = ["btn-tab-jurnal", "btn-tab-rekap", "btn-tab-ledger", "btn-tab-coa", "btn-tab-piutang"];
            tabIds.forEach((tid, idx) => {
                const btn = document.getElementById(tid);
                if (btn && !btn.querySelector(".shortcut-tab-badge")) {
                    const kbd = document.createElement("kbd");
                    kbd.className = "shortcut-tab-badge ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-blue-100 text-blue-800 border border-blue-200";
                    kbd.innerText = `${idx + 1}`;
                    btn.appendChild(kbd);
                }
            });
        }
        if (currentPage.includes("online-users")) {
            const t1 = document.getElementById("tabBtnOnline");
            const t2 = document.getElementById("tabBtnLogs");
            if (t1 && !t1.querySelector(".shortcut-tab-badge")) {
                const kbd = document.createElement("kbd");
                kbd.className = "shortcut-tab-badge ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-blue-100 text-blue-800 border border-blue-200";
                kbd.innerText = "1";
                t1.appendChild(kbd);
            }
            if (t2 && !t2.querySelector(".shortcut-tab-badge")) {
                const kbd = document.createElement("kbd");
                kbd.className = "shortcut-tab-badge ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-slate-200 text-slate-700 border border-slate-300";
                kbd.innerText = "2";
                t2.appendChild(kbd);
            }
        }
    }

    // Listener resize window: jika masuk ke mode mobile, langsung bersihkan shortcut; jika desktop, restore
    let resizeTimer = null;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isMobile()) {
                cleanupMobileShortcuts();
            } else {
                removeHeaderShortcutButtons();
                injectShortcutStyles();
                injectShortcutHelperUI();
                removeHeaderShortcutButtons();
                injectAllShortcutBadges();
            }
        }, 150);
    }, { permanent: true });

    function init() {
        injectShortcutStyles();
        if (isMobile()) {
            cleanupMobileShortcuts();
            return;
        }
        injectShortcutHelperUI();
        removeHeaderShortcutButtons();
        injectAllShortcutBadges();
        // Retry injections in case of dynamic DOM loads
        setTimeout(() => {
            if (!isMobile()) {
                removeHeaderShortcutButtons();
                injectAllShortcutBadges();
            }
        }, 350);
        setTimeout(() => {
            if (!isMobile()) {
                removeHeaderShortcutButtons();
                injectAllShortcutBadges();
            }
        }, 1200);
    }

    // Inisialisasi setelah DOM siap
    if (document.readyState === "complete" || document.readyState === "interactive") {
        init();
    } else {
        window.addEventListener("DOMContentLoaded", init, { permanent: true });
    }
})();
