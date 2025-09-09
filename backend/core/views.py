from django.http import JsonResponse # JSONレスポンス用
import logging # ログ出力用
import os
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from openai import OpenAI

# ヘルスチェック用のビュー
def health(request):
    logging.info("health endpoint accessed")  # テスト用ログ出力
    return JsonResponse({"ok": True})

# OpenAIクライアント初期化（環境変数からAPIキーを取得）
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@require_GET
def prompt(request):
    """
    GET /api/prompt?category=animal
    ChatGPT APIを使って短文を生成して返す
    """
    category = request.GET.get("category", "animal")
    user_prompt = f"{category} に関する短い日本語の文章を1つだけ生成してください。"

    resp = client.chat.completions.create(
        model="gpt-4o-mini",  # コストを抑えたいなら mini モデル推奨
        messages=[{"role": "user", "content": user_prompt}],
        max_tokens=80,
        temperature=0.9,
    )

    text = resp.choices[0].message.content.strip()
    return JsonResponse({"text": text})