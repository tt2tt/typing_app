from django.contrib import admin  # 管理サイト用
from django.urls import path, include  # URLルーティング用

# ルートURLパターンの定義
urlpatterns = [
    path("admin/", admin.site.urls),  # 管理サイト
    path("api/", include("core.urls")),  # coreアプリのAPIルート
    path("api/auth/", include("accounts.urls")),  # 認証系エンドポイント
]
