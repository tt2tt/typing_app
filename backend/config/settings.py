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
    "accounts", # 認証API
    "core", # タイピング機能（モデルを含む）
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

# プライマリーキーの設定
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

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

# CSRFとセッションの設定
# 環境変数のカンマ区切り文字列を配列に変換するヘルパ
def _env_list(name: str):
    raw = os.getenv(name, "")
    return [item.strip() for item in raw.split(",") if item.strip()]

# 優先: DJANGO_CSRF_TRUSTED_ORIGINS -> 次点: DJANGO_CORS_ALLOWED_ORIGINS -> 開発用デフォルト
CSRF_TRUSTED_ORIGINS = _env_list("DJANGO_CSRF_TRUSTED_ORIGINS") or _env_list("DJANGO_CORS_ALLOWED_ORIGINS")
if not CSRF_TRUSTED_ORIGINS and DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# リダイレクトを避けるため末尾スラッシュの自動付与を無効化
APPEND_SLASH = False