// profiles.js - CRUD Profil Admin

document.addEventListener('DOMContentLoaded', async () => {
    if (!await requireAuth()) return;

    initSidebar();
    initTopbar('Profil', 'Kelola data profil portofolio Anda');

    await loadProfile();
    setupProfileForm();
    setupPhotoUpload();
});

async function loadProfile() {
    try {
        const res = await apiFetch('/profiles');
        if (!res || !res.ok) return;

        const result = await res.json();
        const data = result.data || {};

        // Isi form dengan data yang ada
        const fields = [
            'nama_lengkap', 'nama_panggilan', 'tempat_lahir', 'tanggal_lahir',
            'email', 'telepon', 'universitas', 'fakultas', 'prodi', 'semester', 'alamat'
        ];

        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el && data[field]) el.value = data[field];
        });

        // Tampilkan foto jika ada
        if (data.foto_url) {
            const imgEl = document.getElementById('avatar-img');
            const placeholderEl = document.getElementById('avatar-placeholder');
            if (imgEl) {
                imgEl.src = data.foto_url;
                imgEl.style.display = 'block';
            }
            if (placeholderEl) placeholderEl.style.display = 'none';

            // Update info card
            updateAvatarCard(data);
        }

    } catch (err) {
        showToast('Gagal memuat data profil.', 'error');
    }
}

function updateAvatarCard(data) {
    const nameEl = document.getElementById('card-name');
    const prodiEl = document.getElementById('card-prodi');
    const emailEl = document.getElementById('card-email');
    const uniEl = document.getElementById('card-uni');

    if (nameEl) nameEl.textContent = data.nama_lengkap || '-';
    if (prodiEl) prodiEl.textContent = data.prodi || '-';
    if (emailEl) emailEl.textContent = data.email || '-';
    if (uniEl) uniEl.textContent = data.universitas || '-';
}

function setupProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btn-save');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

        const formData = {};
        const fields = [
            'nama_lengkap', 'nama_panggilan', 'tempat_lahir', 'tanggal_lahir',
            'email', 'telepon', 'universitas', 'fakultas', 'prodi', 'semester', 'alamat'
        ];

        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el) formData[field] = el.value;
        });

        // Ambil foto_url dari hidden input jika ada
        const fotoUrl = document.getElementById('foto_url');
        if (fotoUrl && fotoUrl.value) formData['foto_url'] = fotoUrl.value;

        try {
            const res = await apiFetch('/profiles', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok) {
                showToast('Profil berhasil disimpan!', 'success');
                updateAvatarCard(formData);
            } else {
                showToast(result.error || 'Gagal menyimpan profil.', 'error');
            }
        } catch (err) {
            showToast('Terjadi kesalahan jaringan.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan Profil';
        }
    });
}

function setupPhotoUpload() {
    const uploadBtn = document.getElementById('avatar-upload-btn');
    const fileInput = document.getElementById('photo-file');
    const progressEl = document.getElementById('upload-progress');
    const fotoUrlInput = document.getElementById('foto_url');

    if (!uploadBtn || !fileInput) return;

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // Validasi file
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar!', 'error');
            return;
        }

        progressEl.classList.add('active');

        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await apiFetch('/upload/image', {
                method: 'POST',
                body: fd
            });

            const result = await res.json();

            if (res.ok && result.url) {
                // Update avatar preview
                const imgEl = document.getElementById('avatar-img');
                const placeholderEl = document.getElementById('avatar-placeholder');

                imgEl.src = result.url;
                imgEl.style.display = 'block';
                if (placeholderEl) placeholderEl.style.display = 'none';

                // Simpan URL ke hidden input
                if (fotoUrlInput) fotoUrlInput.value = result.url;

                showToast('Foto berhasil diupload ke Cloudinary!', 'success');
            } else {
                showToast(result.error || 'Upload gagal.', 'error');
            }
        } catch (err) {
            showToast('Gagal mengupload foto.', 'error');
        } finally {
            progressEl.classList.remove('active');
            fileInput.value = '';
        }
    });
}
