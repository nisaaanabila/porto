import resend
import os
from flask import Blueprint, request, jsonify
from model import Database
from config import Config

contact_bp = Blueprint('contact', __name__)

# Inisialisasi Resend dengan API Key dari environment variable
resend.api_key = os.getenv('RESEND_API_KEY')

@contact_bp.route('/contact', methods=['POST'])
def send_contact_email():
    """Endpoint untuk menerima pesan kontak dan mengirim email via Resend"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Request body harus JSON'}), 400

        # Validasi field wajib
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()

        if not name or not email or not message:
            return jsonify({'error': 'Nama, email, dan pesan wajib diisi'}), 400

        # Ambil email admin dari database sebagai tujuan pengiriman
        db = Database()
        query = """
            SELECT p.email, p.nama_lengkap
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE u.role = 'admin'
            LIMIT 1
        """
        admin_result = db.execute_query(query, fetch=True)

        # Default email jika profil belum ada
        admin_email = admin_result[0]['email'] if admin_result and admin_result[0].get('email') else os.getenv('ADMIN_EMAIL', 'onboarding@resend.dev')
        admin_name = admin_result[0]['nama_lengkap'] if admin_result and admin_result[0].get('nama_lengkap') else 'Admin'

        # Kirim email menggunakan Resend
        params = {
            "from": "Portfolio Contact <onboarding@resend.dev>",
            "to": [admin_email],
            "subject": f"[Portfolio] Pesan baru dari {name}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 22px;">📩 Pesan Baru dari Portfolio</h1>
                </div>
                <div style="padding: 24px; background: #f8fafc;">
                    <p style="color: #64748b; margin-bottom: 20px;">Halo <strong>{admin_name}</strong>, ada pesan baru masuk melalui form kontak portfolio kamu.</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 10px; display: block; margin-bottom: 8px;">
                                <strong style="color: #2563eb;">👤 Nama:</strong><br>
                                <span style="color: #0f172a; font-size: 16px;">{name}</span>
                            </td>
                        </tr>
                    </table>
                    <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                        <strong style="color: #2563eb;">📧 Email Pengirim:</strong><br>
                        <a href="mailto:{email}" style="color: #0f172a; font-size: 16px;">{email}</a>
                    </div>
                    <div style="background: white; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                        <strong style="color: #2563eb;">💬 Pesan:</strong><br>
                        <p style="color: #0f172a; line-height: 1.6; margin-top: 8px; white-space: pre-wrap;">{message}</p>
                    </div>
                    <a href="mailto:{email}?subject=Re: Pesan dari Portfolio" 
                       style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Balas Email Ini
                    </a>
                </div>
                <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 12px;">
                    <p>Email ini dikirim otomatis dari form kontak portfolio website.</p>
                </div>
            </div>
            """,
        }

        email_response = resend.Emails.send(params)

        return jsonify({
            'success': True,
            'message': 'Pesan berhasil dikirim! Terima kasih telah menghubungi saya.',
            'email_id': email_response.get('id') if email_response else None
        }), 200

    except Exception as e:
        print(f"[CONTACT ERROR] {str(e)}")
        return jsonify({'error': f'Gagal mengirim pesan: {str(e)}'}), 500
