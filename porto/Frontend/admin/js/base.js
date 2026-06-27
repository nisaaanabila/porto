// base.js - Fungsi bersama untuk semua halaman admin (sidebar, topbar, toast)

/**
 * Inisialisasi topbar dengan nama admin
 */
function initTopbar(pageTitle, pageSubtitle) {
    const user = getCurrentUser();
    const adminName = user?.username || 'Admin';

    // Set judul halaman
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    const avatarEl = document.getElementById('admin-avatar');
    const nameEl = document.getElementById('admin-name');

    if (titleEl) titleEl.textContent = pageTitle || 'Dashboard';
    if (subtitleEl) subtitleEl.textContent = pageSubtitle || '';
    if (avatarEl) avatarEl.textContent = adminName.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = adminName;
}

/**
 * Set active link di sidebar berdasarkan URL saat ini
 */
function initSidebar() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').split('/').pop())) {
            link.classList.add('active');
        }
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await apiFetch('/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'login.html';
}

/**
 * Tampilkan toast notification
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Format tanggal ke string lokal
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Escape HTML untuk mencegah XSS
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Inisialisasi modal
 */
function initModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;

    // Tutup modal jika klik di luar
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(modalId);
    });

    // Tombol close di dalam modal
    overlay.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal(modalId));
    });
}

function openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) overlay.classList.add('active');
}

function closeModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
        overlay.classList.remove('active');
        // Reset form di dalam modal
        const form = overlay.querySelector('form');
        if (form) form.reset();
    }
}

/**
 * Konfirmasi delete dengan dialog sederhana
 */
function confirmDelete(message) {
    return confirm(message || 'Apakah Anda yakin ingin menghapus data ini?');
}
