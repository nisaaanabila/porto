import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # TiDB Cloud Database Configuration
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = int(os.getenv('DB_PORT', 4000))
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')

    MYSQL_CONFIG = {
        'host': DB_HOST,
        'port': DB_PORT,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'database': DB_NAME,
        'ssl_ca': os.getenv('DB_CA_PATH', None)
    }

    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-ganti-di-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

    # Resend API Configuration
    RESEND_API_KEY = os.getenv('RESEND_API_KEY')

    # Admin Email (tujuan email notifikasi kontak)
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')