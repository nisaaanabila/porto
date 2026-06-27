// login.js - Logic untuk halaman login admin

document.addEventListener('DOMContentLoaded', () => {
    // Jika sudah login, langsung redirect ke dashboard
    const token = localStorage.getItem('admin_token');
    if (token) {
        window.location.href = '/admin/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const errorAlert = document.getElementById('error-alert');
    const errorMsg = document.getElementById('error-msg');
    const btnLogin = document.getElementById('btn-login');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const togglePwd = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    // Toggle show/hide password
    if (togglePwd) {
        togglePwd.addEventListener('click', () => {
            const isText = passwordInput.type === 'text';
            passwordInput.type = isText ? 'password' : 'text';
            togglePwd.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }

    // Handle form submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Username dan password wajib diisi.');
            return;
        }

        setLoading(true);
        hideError();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok && result.token) {
                // Simpan token dan data user ke localStorage
                localStorage.setItem('admin_token', result.token);
                localStorage.setItem('admin_user', JSON.stringify(result.user));

                // Redirect ke dashboard
                window.location.href = '/admin/dashboard.html';
            } else {
                showError(result.error || 'Login gagal. Periksa username dan password.');
            }
        } catch (err) {
            showError('Gagal terhubung ke server. Pastikan aplikasi berjalan.');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(loading) {
        btnLogin.disabled = loading;
        btnText.textContent = loading ? 'Masuk...' : 'Masuk ke Panel Admin';
        btnSpinner.style.display = loading ? 'block' : 'none';
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorAlert.classList.add('show');
    }

    function hideError() {
        errorAlert.classList.remove('show');
    }
});
