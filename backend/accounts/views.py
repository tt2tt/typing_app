import json  

from django.http import JsonResponse  # JSONレスポンスを返すため
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect  # CSRF対策用デコレータ
from django.views.decorators.http import require_http_methods  # HTTPメソッド制限用デコレータ
from django.contrib.auth import get_user_model, login  # ユーザーモデル取得・ログイン用
from django.contrib.auth.password_validation import validate_password  # パスワードバリデーション
from django.core.exceptions import ValidationError  # バリデーション例外



# CSRFトークンをクライアントにセットするエンドポイント
@ensure_csrf_cookie
@require_http_methods(["GET"])
def csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"}, status=200)


# ユーザー登録とログインセッション開始用エンドポイント
@csrf_protect
@require_http_methods(["POST"])
def signup(request):
    try:
        # リクエストボディからJSONデータを取得
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    # 入力値の取得と前処理
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    username = (data.get("username") or "").strip()

    # emailとpasswordは必須
    if not email or not password:
        return JsonResponse({"detail": "email と password は必須です"}, status=400)

    User = get_user_model()  # カスタムユーザーモデル対応

    # username未指定時はemailの@前を利用
    if not username:
        username = email.split("@")[0]

    # username重複時は連番を付与
    base = username
    i = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{i}"
        i += 1

    # email重複チェック
    if User.objects.filter(email=email).exists():
        return JsonResponse({"detail": "このメールアドレスは既に登録されています"}, status=400)

    # パスワードバリデーション
    try:
        validate_password(password)
    except ValidationError as e:
        return JsonResponse({"detail": "パスワードポリシーに違反しています", "errors": e.messages}, status=400)

    # ユーザー作成と自動ログイン
    user = User.objects.create_user(username=username, email=email, password=password)
    login(request, user)

    # 作成したユーザー情報を返却
    return JsonResponse({"id": user.id, "username": user.username, "email": user.email}, status=201)
