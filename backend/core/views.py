import logging
import os
import json
import re

from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_http_methods
from django.views.decorators.csrf import csrf_protect
from .models import TypingRecord
from openai import OpenAI
from pykakasi import kakasi as _kakasi

# ヘルスチェック用のビュー
def health(request):
    logging.info("health endpoint accessed")
    return JsonResponse({"ok": True})

# OpenAIクライアント初期化（環境変数からAPIキーを取得）
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# pykakasiの設定
_kk = _kakasi()
_kk.setMode("H", "a")  # ひらがな -> ローマ字
_kk.setMode("K", "a")  # カタカナ -> ローマ字（保険）
_kk.setMode("J", "a")  # 漢字 -> ローマ字（読み推定、使わないが保険）
_kk.setMode("r", "Hepburn")  # ヘボン式
_conv = _kk.getConverter()

@require_GET
def prompt(request):
    """
    GET /api/prompt?category=animal
    ChatGPT APIを使って短文を生成して返す
    """
    # URLからカテゴリーを受け取る
    category = request.GET.get("category", "animal")

    # AIへの依頼文
    user_prompt = (
        f"""{category}に関連するタイピング練習用のデータとして、
        短い日本語の文章と、その漢字表記をペアにして、合計300～350文字程度作成してください。
        JSON形式の配列（各要素が'hiragana'と'kanji'キーを持つオブジェクト）で出力してください。
        JSON部分のみを出力してください。    
        {{
        "hiragana": "こいぬはまどべでひなたぼっこをしながら、ときどきしっぽをふってねむそうにあくびをする。",
        "kanji": "子犬は窓辺で日向ぼっこをしながら、ときどき尻尾を振って眠そうにあくびをする。"
        }}
        """
    )

    # 利用するモデル
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    try:
        # レスポンスの受け取り
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": user_prompt}],
            # 一部モデルでは max_tokens ではなく max_completion_tokens が必要
            max_completion_tokens=700,
        )

        
        # モデル出力（コードフェンスや余計な文言を除去）
        raw = resp.choices[0].message.content.strip() if resp.choices else ""
        json_text = raw.strip()
        # ```json ... ``` もしくは ``` ... ``` を剥がす
        if json_text.startswith("```"):
            json_text = re.sub(r"^```(?:json)?\n?", "", json_text)
            json_text = re.sub(r"\n?```$", "", json_text)

        # JSONをパース（配列前提。単一オブジェクトの場合も許容）
        try:
            payload = json.loads(json_text)
        except Exception:
            # 万一JSONでない場合はそのまま返す（後方互換）
            return JsonResponse({"text": raw})
        
        # 辞書型に変換
        if isinstance(payload, dict):
            items = payload.get("data") or payload.get("items") or [payload]
        else:
            items = payload

        if not isinstance(items, list):
            items = [items]

        enriched = []
        for it in items:
            if not isinstance(it, dict):
                continue
            # ひらがな、漢字・生成
            hira = it.get("hiragana") or it.get("yomi") or it.get("kana")
            kanji = it.get("kanji") or it.get("jp") or it.get("text") or it.get("sentence")
            
            # ローマ字変換
            romaji = _conv.do(hira) if isinstance(hira, str) else ""
            if isinstance(romaji, str):
                romaji = romaji.replace("、", ",").replace("。", ".")
                # nの後ろがa,i,u,e,o以外の場合nnに変換
                romaji = re.sub(r"n(?![aiueo])", "nn", romaji)

            # 元JSONへ romaji を付与
            it["romaji"] = romaji
            enriched.append(it)

        # 既存フロントは { text: "<JSON文字列>" } を期待しているため維持
        return JsonResponse({"text": json.dumps(enriched, ensure_ascii=False)})
    except Exception as e:
        logging.exception("OpenAI API error on /api/prompt/")
        return JsonResponse({"error": "upstream_error", "detail": str(e)}, status=502)


@csrf_protect
@require_http_methods(["POST"])
# このビューはPOSTリクエストのみを許可します。
def save_result(request):
    # ユーザーが認証済みか確認
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "未ログインです"}, status=401)

    # リクエストボディからJSONデータを取得
    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    # cps、accuracyの取得とバリデーション
    # categoryは無視します
    cps = int(data.get("cps", 0))
    accuracy = int(data.get("accuracy", 0))

    # 値の範囲を制限
    cps = max(0, min(cps, 1000))
    accuracy = max(0, min(accuracy, 100))

    # タイピング記録を保存
    rec = TypingRecord.objects.create(user=request.user, cps=cps, accuracy=accuracy)

    # 保存した内容をレスポンスとして返す
    return JsonResponse({
        "cps": rec.cps,
        "accuracy": rec.accuracy,
        "created_at": rec.created_at.isoformat(),
    }, status=201)