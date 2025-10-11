import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from core.models import TypingRecord


class AccountsApiTests(TestCase):
    # テストクライアントのセットアップ（CSRFチェック有効）
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def _get_csrf(self):
        # CSRFトークン取得用ヘルパー
        resp = self.client.get("/api/auth/csrf")
        self.assertEqual(resp.status_code, 200)
        # csrftoken が Cookie に設定されている必要がある
        return self.client.cookies.get("csrftoken").value

    def test_signup_and_me_flow(self):
        # サインアップからユーザー情報取得までの一連の流れをテスト
        token = self._get_csrf()
        payload = {"email": "u1@example.com", "password": "test-pass-123", "username": "u1"}
        resp = self.client.post(
            "/api/auth/signup",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        self.assertIn("id", body)
        self.assertEqual(body["email"], "u1@example.com")

        # サインアップ直後はログイン状態なので /api/auth/me でユーザー情報が取得できる
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 200)
        me = resp.json()
        self.assertEqual(me["email"], "u1@example.com")
        self.assertEqual(me["records"], [])

    def test_login_logout_flow(self):
        # ログイン・ログアウトの一連の動作をテスト
        User = get_user_model()
        u = User.objects.create_user(username="u2", email="u2@example.com", password="pass-1234")

        token = self._get_csrf()
        # email でログイン
        resp = self.client.post(
            "/api/auth/login",
            data=json.dumps({"identifier": "u2@example.com", "password": "pass-1234"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 200)

        # ログアウト処理
        token = self._get_csrf()
        resp = self.client.post(
            "/api/auth/logout",
            data=b"",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 200)

        # 未ログイン状態で /api/auth/me は 401（認証エラー）
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 401)

        # username でもログイン可能
        token = self._get_csrf()
        resp = self.client.post(
            "/api/auth/login",
            data=json.dumps({"identifier": "u2", "password": "pass-1234"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 200)

    def test_me_requires_auth(self):
        # 未ログイン状態で /api/auth/me にアクセスすると 401
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 401)

    def test_delete_account_cascades(self):
        # アカウント削除時に関連レコードも削除されることをテスト
        User = get_user_model()
        u = User.objects.create_user(username="u3", email="u3@example.com", password="pass-1234")

        # ユーザーに紐づくタイピング記録を2件作成
        TypingRecord.objects.create(user=u, cps=10, accuracy=90)
        TypingRecord.objects.create(user=u, cps=12, accuracy=95)

        # 強制ログインでユーザー認証状態に
        self.client.force_login(u)

        # CSRFトークン取得
        token = self._get_csrf()

        # アカウント削除API呼び出し
        resp = self.client.post(
            "/api/auth/delete",
            data=b"",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get("detail"), "account_deleted")

        # ユーザーと関連するタイピング記録が全て削除されていることを確認
        self.assertFalse(get_user_model().objects.filter(id=u.id).exists())
        self.assertEqual(TypingRecord.objects.filter(user_id=u.id).count(), 0)
