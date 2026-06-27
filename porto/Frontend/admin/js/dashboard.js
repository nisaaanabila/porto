// dashboard.js - Logic dashboard admin

document.addEventListener('DOMContentLoaded', async () => {
    if (!await requireAuth()) return;

    initSidebar();
    initTopbar('Dashboard', 'Selamat datang di panel admin portofolio');

    await loadStats();
    await loadRecentActivity();
});

async function loadStats() {
    try {
        const res = await apiFetch('/dashboard/stats');
        if (!res || !res.ok) return;

        const result = await res.json();
        const data = result.data || {};

        document.getElementById('stat-experiences').textContent = data.experiences_count ?? 0;
        document.getElementById('stat-projects').textContent = data.projects_count ?? 0;
        document.getElementById('stat-skills').textContent = data.skills_count ?? 0;

        // Update nama di welcome banner
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) welcomeName.textContent = data.admin_name || 'Admin';

    } catch (err) {
        console.error('Gagal load stats:', err);
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('activity-list');
    if (!container) return;

    try {
        const res = await apiFetch('/dashboard/recent');
        if (!res || !res.ok) {
            container.innerHTML = '<p class="empty-state" style="padding:20px;text-align:center;color:#64748b">Belum ada aktivitas.</p>';
            return;
        }

        const result = await res.json();
        const activities = result.data || [];

        if (!activities.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada aktivitas terbaru.</p>
                </div>`;
            return;
        }

        container.innerHTML = activities.map(item => {
            const isExp = item.type === 'experience';
            const title = isExp ? `${escapeHtml(item.posisi)} di ${escapeHtml(item.perusahaan)}` : escapeHtml(item.judul);
            const subtitle = isExp ? item.durasi : (item.deskripsi?.substring(0, 60) + '...');
            const iconClass = isExp ? 'fas fa-briefcase exp' : 'fas fa-folder project';

            return `
            <div class="activity-item">
                <div class="activity-icon ${isExp ? 'exp' : 'project'}">
                    <i class="fas ${isExp ? 'fa-briefcase' : 'fa-folder'}"></i>
                </div>
                <div class="activity-info">
                    <strong>${title}</strong>
                    <span>${escapeHtml(subtitle || '')}</span>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        container.innerHTML = '<p style="padding:20px;text-align:center;color:#64748b">Gagal memuat aktivitas.</p>';
    }
}
