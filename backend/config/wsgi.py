import os
from django.core.wsgi import get_wsgi_application  # WSGIアプリ取得用

# Django設定ファイルのパスを環境変数にセット
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# WSGIアプリケーションオブジェクト（Webサーバーから呼び出される）
application = get_wsgi_application()
