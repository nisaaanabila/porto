document.addEventListener('DOMContentLoaded', async () => {
    // Current Year in Footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Scroll Navbar Effect
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Active Section Highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Load Data Utama
    await loadPublicData();

    // Handle Form Kontak
    setupContactForm();

    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Toggle hamburger icon between bars and times
            const icon = hamburger.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });

        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }
});

async function loadPublicData() {
    try {
        const response = await fetch('/api/main-profile');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        
        const res = await response.json();
        
        if (!res.success || !res.data) {
            showError('Data profil belum tersedia.');
            return;
        }

        const { skills, experiences, projects } = res.data;
        const profile = res.data;

        if (!profile.nama_lengkap) {
            showError('Nama profil kosong.');
            return;
        }

        renderHero(profile, skills, projects);
        renderAbout(profile, skills, projects);
        renderSkills(skills || []);
        renderExperiences(experiences || []);
        renderProjects(projects || []);
        renderContact(profile);

    } catch (error) {
        console.error('Fetch Error:', error);
        showError('Gagal terhubung ke server.');
    }
}

function showError(msg) {
    const heroDesc = document.getElementById('hero-desc');
    if (heroDesc) {
        heroDesc.innerHTML = `<span style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> ${msg}</span>`;
    }
}

function renderHero(p, skills, projects) {
    const nameEl = document.getElementById('hero-name');
    const titleEl = document.getElementById('hero-title');
    const descEl = document.getElementById('hero-desc');
    const badgeEl = document.getElementById('hero-badge');

    if (nameEl) nameEl.textContent = p.nama_panggilan || p.nama_lengkap.split(' ')[0];
    if (titleEl && p.nama_lengkap) {
        const firstName = p.nama_lengkap.split(' ')[0].toUpperCase();
        titleEl.innerHTML = `HAY! I'M <span>${escapeHtml(firstName)}</span>`;
    }
    
    if (badgeEl && p.nama_lengkap) {
        badgeEl.textContent = p.nama_lengkap;
    }

    if (descEl) {
        descEl.textContent = `Saya mahasiswa ${p.prodi || 'Sistem Informasi'} di ${p.universitas || 'Universitas'}, ${p.fakultas || 'Fakultas Teknik'}. Berdomisili di ${p.alamat || 'Indonesia'}. Memiliki ketertarikan besar dalam pengembangan backend, manajemen database, dan arsitektur aplikasi web.`;
    }

    // Typewriter Subtitle
    const typingEl = document.getElementById('hero-typing');
    if (typingEl) {
        const words = [];
        if (p.prodi) words.push(p.prodi.toUpperCase());
        words.push('WEB DEVELOPER', 'BACKEND ENGINEER', 'DATABASE ADMIN');
        startTypingEffect(typingEl, words);
    }
}

function startTypingEffect(element, words) {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentWord = words[wordIndex];
        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }
        
        element.textContent = currentWord.substring(0, charIndex);
        
        let typeSpeed = 100;
        if (isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 1800; // Pause on full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 300; // Pause before typing next
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

function renderAbout(p, skills, projects) {
    // Foto
    const img = document.getElementById('profile-photo');
    const placeholder = document.getElementById('photo-placeholder');
    
    if (img && placeholder) {
        if (p.foto_url) {
            img.src = p.foto_url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    }

    // Title & Text
    const aboutTitle = document.getElementById('about-title');
    if (aboutTitle) {
        const prodiText = p.prodi ? p.prodi.toUpperCase() : 'DEVELOPMENT';
        aboutTitle.innerHTML = `I AM AVAILABLE FOR <br><span>${escapeHtml(prodiText)}</span> PROJECTS`;
    }

    const aboutText = document.getElementById('about-text');
    if (aboutText) {
        aboutText.innerHTML = `
            <p>Mahasiswa di <strong>${escapeHtml(p.universitas)}</strong>, ${escapeHtml(p.fakultas)}. 
               Saat ini berada di semester ${escapeHtml(p.semester)}.</p>
            <p>Berdomisili di ${escapeHtml(p.alamat)}. Memiliki ketertarikan besar dalam pengembangan backend, 
               manajemen database, dan arsitektur aplikasi web. Aktif mengembangkan berbagai proyek sistem manajemen, 
               mulai dari platform penilaian kinerja hingga sistem lelang, dengan fokus pada struktur data yang 
               solid serta integrasi layanan modern.
            </p>
        `;
    }

    // Stats
    const pNum = document.getElementById('stat-projects');
    const sNum = document.getElementById('stat-skills');
    const semNum = document.getElementById('stat-semester');

    if (pNum) pNum.textContent = projects.length ? `${projects.length}+` : '0';
    if (sNum) sNum.textContent = skills.length ? `${skills.length}+` : '0';
    if (semNum) semNum.textContent = p.semester ? `SMT ${p.semester}` : 'Active';
}

function renderSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    if (!skills.length) {
        container.innerHTML = '<p class="empty-state">Belum ada data skill.</p>';
        return;
    }
    
    container.innerHTML = skills.map(s => `
        <div class="skill-card">
            <i class="${escapeHtml(s.icon_class || 'fas fa-code')}"></i>
            <h4>${escapeHtml(s.nama_skill)}</h4>
        </div>
    `).join('');
}

function renderExperiences(exps) {
    const container = document.getElementById('experience-container');
    if (!container) return;

    if (!exps.length) {
        container.innerHTML = '<p class="empty-state">Belum ada pengalaman.</p>';
        return;
    }

    container.innerHTML = exps.map(e => `
        <div class="timeline-item">
            <div class="timeline-dot"><i class="fas fa-briefcase" style="font-size:0.75rem;color:var(--accent);"></i></div>
            <div class="glass-panel timeline-content">
                <span class="timeline-date">${escapeHtml(e.durasi)}</span>
                <h3>${escapeHtml(e.posisi)}</h3>
                <h4>${escapeHtml(e.perusahaan)}</h4>
                <p>${escapeHtml(e.deskripsi)}</p>
            </div>
        </div>
    `).join('');
}

function renderProjects(projs) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (!projs.length) {
        container.innerHTML = '<p class="empty-state">Belum ada proyek.</p>';
        return;
    }

    // Render projects exactly like the mockup cards
    container.innerHTML = projs.map(p => `
        <div class="project-card">
            <div class="project-img-wrapper">
                ${p.gambar_url 
                    ? `<img src="${escapeHtml(p.gambar_url)}" alt="${escapeHtml(p.judul)}" class="project-img" loading="lazy">` 
                    : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#0b1938;color:#cbd5e1;font-size:3rem;"><i class="fas fa-box-open"></i></div>'}
            </div>
            
            <div class="project-info-block">
                <div class="project-meta">
                    <h3 class="project-card-title">${escapeHtml(p.judul)}</h3>
                    <span class="project-card-category">${escapeHtml(p.deskripsi ? p.deskripsi.substring(0, 50) + (p.deskripsi.length > 50 ? '...' : '') : 'Project')}</span>
                </div>
                <a href="${escapeHtml(p.link_project || '#')}" target="_blank" class="project-circle-btn">
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');

    // Setup dynamic pagination dots based on card count
    const dotsContainer = document.getElementById('project-dots');
    if (dotsContainer) {
        const dotCount = Math.max(1, Math.ceil(projs.length / 3));
        dotsContainer.innerHTML = Array.from({ length: dotCount }, (_, i) => `
            <div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');

        // Basic sliding pagination behavior
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                dots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                // Scroll to index
                const idx = parseInt(dot.getAttribute('data-index'));
                const cards = container.querySelectorAll('.project-card');
                if (cards.length > 0 && cards[idx * 3]) {
                    cards[idx * 3].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                }
            });
        });
    }
}

function renderContact(p) {
    const emailDisplay = document.getElementById('contact-email-display');
    if (emailDisplay && p.email) {
        emailDisplay.textContent = p.email;
    }
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = document.getElementById('sendBtn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = 'Mengirim... <i class="fas fa-spinner fa-spin"></i>';
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    message: document.getElementById('contactMessage').value
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('✅ ' + result.message);
                contactForm.reset();
            } else {
                alert('❌ ' + (result.error || 'Gagal mengirim'));
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan jaringan.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}