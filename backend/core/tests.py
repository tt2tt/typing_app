import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from core.models import TypingRecord

class CoreApiTests(TestCase):
    # テストクライアントのセットアップ
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def _get_csrf(self):
        # CSRFトークン取得用ヘルパー
        resp = self.client.get("/api/auth/csrf")
        self.assertEqual(resp.status_code, 200)
        return self.client.cookies.get("csrftoken").value

    def test_health(self):
        # /api/health の正常性確認
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get("ok"))

    def test_prompt(self):
        # /api/prompt の疎通確認（OpenAI呼び出しは失敗する場合あり）
        resp = self.client.get("/api/prompt?category=test")
        self.assertIn(resp.status_code, (200, 502))

    def test_save_result_requires_auth_and_csrf(self):
        # /api/result 保存時の認証・CSRFチェック
        # 未ログイン時は 401 を返す
        token = self._get_csrf()
        resp = self.client.post(
            "/api/result",
            data=json.dumps({"cps": 15, "accuracy": 88}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 401)

        # ログイン後は保存可能
        User = get_user_model()
        u = User.objects.create_user(username="u4", email="u4@example.com", password="pass-1234")
        self.client.force_login(u)
        token = self._get_csrf()
        # 上限値を超える値で保存リクエスト（accuracy: 101 → 100にクリップされる）
        resp = self.client.post(
            "/api/result",
            data=json.dumps({"cps": 21, "accuracy": 101}),  # 上限超えはクリップ
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        # accuracy のクリップ確認
        self.assertEqual(body["accuracy"], 100)
        self.assertEqual(body["cps"], 21)  # cps は 1000 上限だが 21 はそのまま

        # DBへの反映確認
        rec = TypingRecord.objects.get(user=u)
        self.assertEqual(rec.cps, 21)
        self.assertEqual(rec.accuracy, 100)
