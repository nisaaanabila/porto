from flask import Blueprint, jsonify
from model import Database

utama_bp = Blueprint('utama', __name__)

@utama_bp.route('/main-profile', methods=['GET'])
def get_main_profile():
    """Endpoint publik untuk halaman utama - mengambil semua data portfolio"""
    try:
        db = Database()

        # 1. Ambil profil admin
        query_profile = """
            SELECT p.*
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE u.role = 'admin'
            LIMIT 1
        """
        profile_result = db.execute_query(query_profile, fetch=True)

        if not profile_result:
            return jsonify({'success': False, 'message': 'Profil belum dikonfigurasi'}), 404

        profile = profile_result[0]

        # 2. Ambil skills admin
        query_skills = """
            SELECT s.id, s.nama_skill, s.icon_class
            FROM skills s
            JOIN users u ON s.user_id = u.id
            WHERE u.role = 'admin'
            ORDER BY s.id ASC
        """
        skills = db.execute_query(query_skills, fetch=True)

        # 3. Ambil experiences admin
        query_exp = """
            SELECT e.id, e.posisi, e.perusahaan, e.durasi, e.deskripsi
            FROM experiences e
            JOIN users u ON e.user_id = u.id
            WHERE u.role = 'admin'
            ORDER BY e.created_at DESC
        """
        experiences = db.execute_query(query_exp, fetch=True)

        # 4. Ambil projects admin
        query_proj = """
            SELECT p.id, p.judul, p.deskripsi, p.gambar_url, p.link_project
            FROM projects p
            JOIN users u ON p.user_id = u.id
            WHERE u.role = 'admin'
            ORDER BY p.created_at DESC
        """
        projects = db.execute_query(query_proj, fetch=True)

        # Gabungkan semua data dalam satu response
        data = dict(profile)
        data['skills'] = skills if skills else []
        data['experiences'] = experiences if experiences else []
        data['projects'] = projects if projects else []

        return jsonify({
            'success': True,
            'data': data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
