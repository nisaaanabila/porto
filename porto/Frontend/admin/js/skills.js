// skills.js - CRUD Skills Admin

let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!await requireAuth()) return;

    initSidebar();
    initTopbar('Skills', 'Kelola daftar keahlian & teknologi');
    initModal('skill-modal');

    await loadSkills();

    document.getElementById('btn-add').addEventListener('click', () => openAddModal());
    document.getElementById('skill-form').addEventListener('submit', handleSubmit);

    // Preview icon saat input berubah
    document.getElementById('icon_class').addEventListener('input', updateIconPreview);
});

async function loadSkills() {
    const tbody = document.getElementById('skills-tbody');
    tbody.innerHTML = `<tr><td colspan="4" class="loading"><div class="spinner"></div> Memuat data...</td></tr>`;

    try {
        const res = await apiFetch('/skills');
        if (!res || !res.ok) throw new Error();

        const result = await res.json();
        const data = result.data || [];

        if (!data.length) {
            tbody.innerHTML = `
                <tr><td colspan="4">
                    <div class="empty-state">
                        <i class="fas fa-code"></i>
                        <p>Belum ada skill. Klik "+ Tambah" untuk mulai.</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = data.map((item, i) => `
            <tr>
                <td><span style="color:#94a3b8;font-size:12px">${i + 1}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:12px">
                        <div class="skill-icon-preview">
                            <i class="${escapeHtml(item.icon_class || 'fas fa-code')}"></i>
                        </div>
                        <strong>${escapeHtml(item.nama_skill)}</strong>
                    </div>
                </td>
                <td><code style="font-size:12px;color:#64748b">${escapeHtml(item.icon_class || '-')}</code></td>
                <td>
                    <div class="action-col">
                        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${item.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSkill(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ef4444;padding:30px">Gagal memuat data.</td></tr>`;
    }
}

function openAddModal() {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Tambah Skill';
    document.getElementById('skill-form').reset();
    document.getElementById('icon-preview-box').innerHTML = '<i class="fas fa-code"></i>';
    openModal('skill-modal');
}

async function openEditModal(id) {
    editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Skill';

    try {
        const res = await apiFetch(`/skills/${id}`);
        const result = await res.json();
        const data = result.data;

        document.getElementById('nama_skill').value = data.nama_skill || '';
        document.getElementById('icon_class').value = data.icon_class || '';
        document.getElementById('icon-preview-box').innerHTML = `<i class="${escapeHtml(data.icon_class || 'fas fa-code')}"></i>`;

        openModal('skill-modal');
    } catch {
        showToast('Gagal memuat data.', 'error');
    }
}

function updateIconPreview() {
    const iconClass = document.getElementById('icon_class').value.trim();
    const preview = document.getElementById('icon-preview-box');
    if (preview) {
        preview.innerHTML = `<i class="${escapeHtml(iconClass || 'fas fa-code')}"></i>`;
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    const payload = {
        nama_skill: document.getElementById('nama_skill').value,
        icon_class: document.getElementById('icon_class').value,
    };

    try {
        const url = editingId ? `/skills/${editingId}` : '/skills';
        const method = editingId ? 'PUT' : 'POST';

        const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
        const result = await res.json();

        if (res.ok) {
            showToast(editingId ? 'Skill diperbarui!' : 'Skill berhasil ditambahkan!', 'success');
            closeModal('skill-modal');
            await loadSkills();
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

async function deleteSkill(id) {
    if (!confirmDelete('Hapus skill ini?')) return;

    try {
        const res = await apiFetch(`/skills/${id}`, { method: 'DELETE' });
        const result = await res.json();

        if (res.ok) {
            showToast('Skill berhasil dihapus.', 'success');
            await loadSkills();
        } else {
            showToast(result.error || 'Gagal menghapus.', 'error');
        }
    } catch {
        showToast('Terjadi kesalahan.', 'error');
    }
}
