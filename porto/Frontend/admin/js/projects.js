// projects.js - CRUD Proyek Admin

let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!await requireAuth()) return;

    initSidebar();
    initTopbar('Proyek', 'Kelola daftar proyek portofolio');
    initModal('project-modal');

    await loadProjects();

    document.getElementById('btn-add').addEventListener('click', () => openAddModal());
    document.getElementById('project-form').addEventListener('submit', handleSubmit);
    setupImageUpload();
});

async function loadProjects() {
    const tbody = document.getElementById('projects-tbody');
    tbody.innerHTML = `<tr><td colspan="5" class="loading"><div class="spinner"></div> Memuat data...</td></tr>`;

    try {
        const res = await apiFetch('/projects');
        if (!res || !res.ok) throw new Error();

        const result = await res.json();
        const data = result.data || [];

        if (!data.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <p>Belum ada proyek. Klik "+ Tambah" untuk mulai.</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = data.map((item, i) => `
            <tr>
                <td><span style="color:#94a3b8;font-size:12px">${i + 1}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:12px">
                        ${item.gambar_url
                            ? `<img src="${escapeHtml(item.gambar_url)}" class="project-thumb" alt="thumb">`
                            : `<div class="project-thumb-placeholder"><i class="fas fa-image"></i></div>`
                        }
                        <strong>${escapeHtml(item.judul)}</strong>
                    </div>
                </td>
                <td><span class="desc-truncate">${escapeHtml(item.deskripsi || '-')}</span></td>
                <td>
                    ${item.link_project
                        ? `<a href="${escapeHtml(item.link_project)}" target="_blank" class="btn btn-secondary btn-sm">
                                <i class="fas fa-external-link-alt"></i> Buka
                           </a>`
                        : '<span style="color:#94a3b8;font-size:12px">-</span>'
                    }
                </td>
                <td>
                    <div class="action-col">
                        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${item.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProject(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:30px">Gagal memuat data.</td></tr>`;
    }
}

function openAddModal() {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Tambah Proyek';
    document.getElementById('project-form').reset();
    document.getElementById('gambar_url').value = '';
    document.getElementById('img-preview').style.display = 'none';
    document.getElementById('upload-status').className = 'upload-status';
    openModal('project-modal');
}

async function openEditModal(id) {
    editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Proyek';

    try {
        const res = await apiFetch(`/projects/${id}`);
        const result = await res.json();
        const data = result.data;

        document.getElementById('judul').value = data.judul || '';
        document.getElementById('deskripsi').value = data.deskripsi || '';
        document.getElementById('link_project').value = data.link_project || '';
        document.getElementById('gambar_url').value = data.gambar_url || '';

        const imgPreview = document.getElementById('img-preview');
        if (data.gambar_url) {
            imgPreview.src = data.gambar_url;
            imgPreview.style.display = 'block';
        } else {
            imgPreview.style.display = 'none';
        }

        openModal('project-modal');
    } catch {
        showToast('Gagal memuat data.', 'error');
    }
}

function setupImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('img-file');
    const statusEl = document.getElementById('upload-status');
    const imgPreview = document.getElementById('img-preview');
    const gambarUrlInput = document.getElementById('gambar_url');

    if (!uploadArea || !fileInput) return;

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar!', 'error');
            return;
        }

        statusEl.className = 'upload-status uploading';
        statusEl.innerHTML = '<div class="spinner"></div> Mengupload ke Cloudinary...';

        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await apiFetch('/upload/image', { method: 'POST', body: fd });
            const result = await res.json();

            if (res.ok && result.url) {
                gambarUrlInput.value = result.url;
                imgPreview.src = result.url;
                imgPreview.style.display = 'block';

                statusEl.className = 'upload-status done';
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Upload berhasil!';

                showToast('Gambar berhasil diupload ke Cloudinary!', 'success');
            } else {
                statusEl.className = 'upload-status error';
                statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Upload gagal';
                showToast(result.error || 'Upload gagal.', 'error');
            }
        } catch {
            statusEl.className = 'upload-status error';
            statusEl.innerHTML = '<i class="fas fa-times-circle"></i> Gagal menghubungi server';
            showToast('Gagal mengupload gambar.', 'error');
        } finally {
            fileInput.value = '';
        }
    });
}

async function handleSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    const payload = {
        judul: document.getElementById('judul').value,
        deskripsi: document.getElementById('deskripsi').value,
        link_project: document.getElementById('link_project').value,
        gambar_url: document.getElementById('gambar_url').value,
    };

    try {
        const url = editingId ? `/projects/${editingId}` : '/projects';
        const method = editingId ? 'PUT' : 'POST';

        const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
        const result = await res.json();

        if (res.ok) {
            showToast(editingId ? 'Proyek diperbarui!' : 'Proyek berhasil ditambahkan!', 'success');
            closeModal('project-modal');
            await loadProjects();
        } else {
            showToast(result.error || 'Gagal menyimpan.', 'error');
        }
    } catch {
        showToast('Terjadi kesalahan.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
    }
}

async function deleteProject(id) {
    if (!confirmDelete('Hapus proyek ini?')) return;

    try {
        const res = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
        const result = await res.json();

        if (res.ok) {
            showToast('Proyek berhasil dihapus.', 'success');
            await loadProjects();
        } else {
            showToast(result.error || 'Gagal menghapus.', 'error');
        }
    } catch {
        showToast('Terjadi kesalahan.', 'error');
    }
}
