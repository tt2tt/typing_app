from django.urls import path  # URLルーティング用
from .views import health # healthビューをインポート

# このアプリのURLパターン定義
urlpatterns = [
	path("health/", health),  # /health/ でhealthビューを呼び出す
]
