from django.http import JsonResponse # JSONレスポンス用
import logging # ログ出力用

# ヘルスチェック用のビュー
def health(request):
    logging.info("health endpoint accessed")  # テスト用ログ出力
    return JsonResponse({"ok": True})
