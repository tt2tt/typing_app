import json

from django.http import JsonResponse  # JSONレスポンスを返すため
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect  # CSRF対策用デコレータ
from django.views.decorators.http import require_http_methods  # HTTPメソッド制限用デコレータ
from django.contrib.auth import get_user_model, login, authenticate, logout  # 認証/ログイン/ログアウト
from django.contrib.auth.password_validation import validate_password  # パスワードバリデーション
from django.core.exceptions import ValidationError  # バリデーション例外
from core.models import TypingRecord  # 過去のタイピング結果


# CSRFトークンをクライアントにセットするエンドポイント
@ensure_csrf_cookie
@require_http_methods(["GET"])
def csrf(request):
    # レスポンス時にCSRFトークン付きCookieをセット
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
    login(request, user)  # 作成したユーザーで自動ログイン

    # 作成したユーザー情報を返却
    return JsonResponse({"id": user.id, "username": user.username, "email": user.email}, status=201)

# ログイン（セッション開始）
@csrf_protect
@require_http_methods(["POST"])
def login_view(request):
    try:
        # リクエストボディからJSONデータを取得
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    # 入力値の取得
    identifier = (data.get("identifier") or "").strip()
    password = data.get("password") or ""
    if not identifier or not password:
        return JsonResponse({"detail": "identifier と password は必須です"}, status=400)

    User = get_user_model()

    user = None
    # identifierがメールアドレス形式ならemailで検索、それ以外はusernameで認証
    if "@" in identifier:
        try:
            u = User.objects.get(email__iexact=identifier)
            user = authenticate(request, username=u.username, password=password)
        except User.DoesNotExist:
            user = None
    else:
        user = authenticate(request, username=identifier, password=password)

    if user is None:
        return JsonResponse({"detail": "認証に失敗しました"}, status=400)

    # 認証成功時はセッション開始
    login(request, user)
    return JsonResponse({"id": user.id, "username": user.username, "email": user.email}, status=200)



# ログアウト（セッション終了）
@require_http_methods(["POST"])
def logout_view(request):
    # セッションを終了
    logout(request)
    return JsonResponse({"detail": "logged_out"}, status=200)



# 現在ログイン中のユーザー情報を取得
@require_http_methods(["GET"])
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "未ログインです"}, status=401)
    
    user = request.user
    # 直近10件の結果を取得（新しい順→古い順に並べ替えて返す）
    records_qs = (
        TypingRecord.objects.filter(user=user)
        .order_by("-created_at")[:10]
    )

    # フォーマット
    records = [
        {"cps": r.cps, "accuracy": r.accuracy, "created_at": r.created_at.isoformat()}
        for r in reversed(list(records_qs))
    ]
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "records": records,
    }, status=200)


# アカウント削除（要ログイン, CSRF保護）
@csrf_protect
@require_http_methods(["POST"])
def delete_account(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "未ログインです"}, status=401)

    # 現在のユーザーを取得してからログアウトし、最後に削除
    user = request.user
    try:
        logout(request)  # セッション破棄
        user.delete()    # 関連レコード（TypingRecord）は on_delete=CASCADE で削除
    except Exception as e:
        return JsonResponse({"detail": "削除に失敗しました", "error": str(e)}, status=500)

    return JsonResponse({"detail": "account_deleted"}, status=200)
