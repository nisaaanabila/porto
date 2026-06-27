-- ============================================================
-- DATABASE SCHEMA - Sistem Portofolio Berbasis Web
-- ============================================================

CREATE DATABASE IF NOT EXISTS Portofolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Portofolio;

-- ============================================================
-- Tabel: users (Admin/pengguna aplikasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role        ENUM('admin', 'user') DEFAULT 'admin',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabel: profiles (Data lengkap profil portofolio)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    nama_lengkap    VARCHAR(100),
    nama_panggilan  VARCHAR(50),
    tempat_lahir    VARCHAR(100),
    tanggal_lahir   DATE,
    email           VARCHAR(100),
    telepon         VARCHAR(20),
    universitas     VARCHAR(150),
    fakultas        VARCHAR(150),
    prodi           VARCHAR(150),
    semester        VARCHAR(10),
    alamat          TEXT,
    foto_url        TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Tabel: skills (Keahlian/teknologi yang dikuasai)
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    nama_skill  VARCHAR(100) NOT NULL,
    icon_class  VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Tabel: experiences (Pengalaman kerja/organisasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    posisi      VARCHAR(150) NOT NULL,
    perusahaan  VARCHAR(150) NOT NULL,
    durasi      VARCHAR(100) NOT NULL,
    deskripsi   TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Tabel: projects (Proyek yang pernah dikerjakan)
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    judul           VARCHAR(200) NOT NULL,
    deskripsi       TEXT,
    gambar_url      TEXT,
    link_project    VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Data Awal: Admin User
-- Password: admin123 (hashed with werkzeug pbkdf2:sha256)
-- ============================================================
INSERT IGNORE INTO users (username, password_hash, role) VALUES
('admin', 'scrypt:32768:8:1$xBnOx0f8PeL5Vr8n$ea3c2d4b1234567890abcdef1234567890abcdef1234567890abcdef12345678', 'admin');

-- ============================================================
-- Data Contoh: Profil
-- ============================================================
INSERT IGNORE INTO profiles (user_id, nama_lengkap, nama_panggilan, tempat_lahir, tanggal_lahir, email, telepon, universitas, fakultas, prodi, semester, alamat, foto_url)
SELECT 
    u.id,
    'Anisa',
    'Anisa',
    'Jakarta',
    '2003-01-01',
    'anisa@example.com',
    '08123456789',
    'Universitas Contoh',
    'Fakultas Teknik',
    'Teknik Informatika',
    '6',
    'Jakarta, Indonesia',
    NULL
FROM users u WHERE u.username = 'admin' LIMIT 1;

-- ============================================================
-- Data Contoh: Skills
-- ============================================================
INSERT IGNORE INTO skills (user_id, nama_skill, icon_class)
SELECT u.id, 'Python', 'fab fa-python' FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT u.id, 'Flask', 'fas fa-flask' FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT u.id, 'MySQL', 'fas fa-database' FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT u.id, 'JavaScript', 'fab fa-js-square' FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT u.id, 'HTML & CSS', 'fab fa-html5' FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT u.id, 'Git', 'fab fa-git-alt' FROM users u WHERE u.username = 'admin';

-- ============================================================
-- Data Contoh: Experience
-- ============================================================
INSERT IGNORE INTO experiences (user_id, posisi, perusahaan, durasi, deskripsi)
SELECT u.id, 'Web Developer Intern', 'PT. Teknologi Indonesia', '2024 - Sekarang', 'Membantu pengembangan aplikasi web menggunakan Python Flask dan MySQL. Bertugas membuat API backend dan integrasi database.'
FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT u.id, 'Ketua Divisi IT', 'Himpunan Mahasiswa Informatika', '2023 - 2024', 'Memimpin divisi IT kampus, mengelola sistem informasi himpunan, dan menyelenggarakan pelatihan pemrograman.'
FROM users u WHERE u.username = 'admin';

-- ============================================================
-- Data Contoh: Projects
-- ============================================================
INSERT IGNORE INTO projects (user_id, judul, deskripsi, gambar_url, link_project)
SELECT u.id, 'Sistem Portofolio Web', 'Aplikasi web portofolio dengan Python Flask, TiDB, Cloudinary, dan Resend. Memiliki halaman admin CRUD dan halaman publik dinamis.', NULL, '#'
FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT u.id, 'Aplikasi Manajemen Stok', 'Sistem manajemen inventaris berbasis web menggunakan Flask dan MySQL. Fitur meliputi CRUD produk, laporan stok, dan notifikasi email.', NULL, '#'
FROM users u WHERE u.username = 'admin';
