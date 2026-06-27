// experience.js - CRUD Pengalaman Admin

let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!await requireAuth()) return;

    initSidebar();
    initTopbar('Pengalaman', 'Kelola data pengalaman kerja & organisasi');
    initModal('experience-modal');

    await loadExperiences();

    document.getElementById('btn-add').addEventListener('click', () => openAddModal());
    document.getElementById('experience-form').addEventListener('submit', handleSubmit);
});

async function loadExperiences() {
    const tbody = document.getElementById('experience-tbody');
    tbody.innerHTML = `<tr><td colspan="5" class="loading"><div class="spinner"></div> Memuat data...</td></tr>`;

    try {
        const res = await apiFetch('/experiences');
        if (!res || !res.ok) throw new Error('Gagal fetch');

        const result = await res.json();
        const data = result.data || [];

        if (!data.length) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="empty-state">
                        <i class="fas fa-briefcase"></i>
                        <p>Belum ada data pengalaman. Klik "+ Tambah" untuk mulai.</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = data.map((item, i) => `
            <tr>
                <td><span style="color:#94a3b8;font-size:12px">${i + 1}</span></td>
                <td>
                    <strong>${escapeHtml(item.posisi)}</strong>
                </td>
                <td>${escapeHtml(item.perusahaan)}</td>
                <td><span class="badge badge-blue">${escapeHtml(item.durasi)}</span></td>
                <td>
                    <div class="action-col">
                        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${item.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteExperience(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:30px">Gagal memuat data.</td></tr>`;
    }
}

function openAddModal() {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Tambah Pengalaman';
    document.getElementById('experience-form').reset();
    openModal('experience-modal');
}

async function openEditModal(id) {
    editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Pengalaman';

    try {
        const res = await apiFetch(`/experiences/${id}`);
        const result = await res.json();
        const data = result.data;

        document.getElementById('posisi').value = data.posisi || '';
        document.getElementById('perusahaan').value = data.perusahaan || '';
        document.getElementById('durasi').value = data.durasi || '';
        document.getElementById('deskripsi').value = data.deskripsi || '';

        openModal('experience-modal');
    } catch {
        showToast('Gagal memuat data.', 'error');
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    const payload = {
        posisi: document.getElementById('posisi').value,
        perusahaan: document.getElementById('perusahaan').value,
        durasi: document.getElementById('durasi').value,
        deskripsi: document.getElementById('deskripsi').value,
    };

    try {
        const url = editingId ? `/experiences/${editingId}` : '/experiences';
        const method = editingId ? 'PUT' : 'POST';

        const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
        const result = await res.json();

        if (res.ok) {
            showToast(editingId ? 'Pengalaman berhasil diperbarui!' : 'Pengalaman berhasil ditambahkan!', 'success');
            closeModal('experience-modal');
            await loadExperiences();
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

async function deleteExperience(id) {
    if (!confirmDelete('Hapus pengalaman ini?')) return;

    try {
        const res = await apiFetch(`/experiences/${id}`, { method: 'DELETE' });
        const result = await res.json();

        if (res.ok) {
            showToast('Pengalaman berhasil dihapus.', 'success');
            await loadExperiences();
        } else {
            showToast(result.error || 'Gagal menghapus.', 'error');
        }
    } catch {
        showToast('Terjadi kesalahan.', 'error');
    }
}
