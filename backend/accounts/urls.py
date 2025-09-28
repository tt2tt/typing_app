from django.urls import path
from . import views

urlpatterns = [
    # CSRFトークンをCookieに設定するエンドポイント
    path("csrf", views.csrf, name="csrf"),
    # サインアップ（ユーザー作成）エンドポイント
    path("signup", views.signup, name="signup"),
]
