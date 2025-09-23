from pathlib import Path
import os


# プロジェクトのベースディレクトリ
BASE_DIR = Path(__file__).resolve().parent.parent

# セキュリティキー（環境変数から取得、なければdev-key）
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-key")

 # デバッグモード（.envから取得、なければTrue）
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"

# 許可するホスト（.envからカンマ区切りで取得）
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")
# CORS許可オリジン（.envからカンマ区切りで取得）
CORS_ALLOWED_ORIGINS = os.getenv("DJANGO_CORS_ALLOWED_ORIGINS", "").split(",") if os.getenv("DJANGO_CORS_ALLOWED_ORIGINS") else []
CORS_ALLOW_ALL_ORIGINS = not CORS_ALLOWED_ORIGINS

# インストールするアプリケーション
INSTALLED_APPS = [
    "django.contrib.admin", # 管理サイト
    "django.contrib.auth", # 認証システム
    "django.contrib.contenttypes", # コンテンツタイプ
    "django.contrib.sessions", # セッション管理
    "django.contrib.messages", # メッセージフレームワーク
    "django.contrib.staticfiles", # 静的ファイル管理
    "rest_framework", # Django REST framework
    "corsheaders", # CORS対応
]

# ミドルウェアの設定
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", # CORS対応
    "django.middleware.security.SecurityMiddleware", # セキュリティ
    "django.contrib.sessions.middleware.SessionMiddleware", # セッション管理
    "django.middleware.common.CommonMiddleware", # 共通処理
    "django.middleware.csrf.CsrfViewMiddleware", # CSRF対策
    "django.contrib.auth.middleware.AuthenticationMiddleware", # 認証
    "django.contrib.messages.middleware.MessageMiddleware", # メッセージ
    "django.middleware.clickjacking.XFrameOptionsMiddleware", # XFrameOptions
]

# ルートURL設定
ROOT_URLCONF = "config.urls"

# テンプレートエンジンの設定
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates", # Django標準
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {
        "context_processors": [
            "django.template.context_processors.debug", # デバッグ情報
            "django.template.context_processors.request", # リクエスト情報
            "django.contrib.auth.context_processors.auth", # 認証情報
            "django.contrib.messages.context_processors.messages", # メッセージ情報
        ],
    },
}]

# WSGIエントリポイント
WSGI_APPLICATION = "config.wsgi.application"

# データベース設定（MySQL、環境変数から値を取得）
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME", "typing"),
        "USER": os.getenv("DB_USER", "app"),
        "PASSWORD": os.getenv("DB_PASS", "appsecret"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {"charset": "utf8mb4"},
    }
}

# 言語の設定
LANGUAGE_CODE = "ja"

# タイムゾーンの設定
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True


# 静的ファイルのURL
STATIC_URL = "static/"

# ログ設定（django.logに出力）
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.WatchedFileHandler',
            'filename': os.path.join(BASE_DIR, 'log', 'django.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
