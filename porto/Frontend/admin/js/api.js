// api.js - Konfigurasi base URL dan helper fetch untuk semua halaman admin
const API_BASE = '/api';

/**
 * Helper fetch dengan otomatis menyertakan Authorization token
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    };

    // Jika body adalah FormData, hapus Content-Type agar browser set boundary sendiri
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Jika 401, redirect ke login
    if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login.html';
        return;
    }

    return response;
}

/**
 * Cek apakah user sudah login. Jika belum, redirect ke login.
 */
async function requireAuth() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

/**
 * Get data user yang sedang login dari localStorage
 */
function getCurrentUser() {
    try {
        const raw = localStorage.getItem('admin_user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}
