from django.urls import path  # URLルーティング用
from .views import health, prompt, save_result  # 追加: 結果保存API

# このアプリのURLパターン定義
urlpatterns = [
	path("health", health),  # /health/ でhealthビューを呼び出す
    path("prompt", prompt),
	path("result", save_result),  # タイピング結果保存
]
