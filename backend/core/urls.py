from django.urls import path  # URLルーティング用
from .views import health, prompt  # healthビューとpromptビューをインポート

# このアプリのURLパターン定義
urlpatterns = [
	path("health", health),  # /health/ でhealthビューを呼び出す
    path("prompt", prompt),
]
