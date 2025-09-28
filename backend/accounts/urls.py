from django.urls import path
from . import views

urlpatterns = [
    # CSRFトークンをCookieに設定するエンドポイント
    path("csrf", views.csrf, name="csrf"),
    # サインアップ（ユーザー作成）エンドポイント
    path("signup", views.signup, name="signup"),
    # ログイン（セッション開始）
    path("login", views.login_view, name="login"),
    # ログアウト（セッション終了）
    path("logout", views.logout_view, name="logout"),
    # 現在のユーザー情報
    path("me", views.me, name="me"),
]
