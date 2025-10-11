import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from core.models import TypingRecord


class IntegrationFlowTests(TestCase):
    """
    API結合テスト:
    - CSRF取得 -> サインアップ
    - /api/result で結果保存
    - /api/auth/me で履歴確認（時系列）
    - ログアウト/ログイン
    - 追加保存 -> 再確認
    - アカウント削除 -> ユーザーと関連レコードの消滅
    """

    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def _get_csrf(self):
        resp = self.client.get("/api/auth/csrf")
        self.assertEqual(resp.status_code, 200)
        return self.client.cookies.get("csrftoken").value

    def test_full_flow(self):
        # 1) サインアップ
        token = self._get_csrf()
        payload = {"email": "flow@example.com", "password": "pass-1234", "username": "flow"}
        resp = self.client.post(
            "/api/auth/signup",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 201)
        user_id = resp.json()["id"]

        # 2) 直後はログイン状態、結果保存(1件目)
        token = self._get_csrf()
        resp = self.client.post(
            "/api/result",
            data=json.dumps({"cps": 13, "accuracy": 92}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 201)

        # 3) /api/auth/me で履歴確認（1件, 値一致）
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 200)
        me = resp.json()
        self.assertEqual(me["id"], user_id)
        self.assertEqual(len(me["records"]), 1)
        r0 = me["records"][0]
        self.assertEqual(r0["cps"], 13)
        self.assertEqual(r0["accuracy"], 92)

        # 4) ログアウト -> ログイン（username 経由）
        token = self._get_csrf()
        resp = self.client.post(
            "/api/auth/logout",
            data=b"",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 200)

        token = self._get_csrf()
        resp = self.client.post(
            "/api/auth/login",
            data=json.dumps({"identifier": "flow", "password": "pass-1234"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 200)

        # 5) 結果保存(2件目)
        token = self._get_csrf()
        resp = self.client.post(
            "/api/result",
            data=json.dumps({"cps": 15, "accuracy": 100}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 201)

        # 6) /api/auth/me で2件が時系列(古->新)で返る
        resp = self.client.get("/api/auth/me")
        self.assertEqual(resp.status_code, 200)
        me = resp.json()
        self.assertEqual(len(me["records"]), 2)
        self.assertEqual(me["records"][0]["cps"], 13)
        self.assertEqual(me["records"][1]["cps"], 15)

        # 7) アカウント削除 -> ユーザーと関連レコードが消える
        token = self._get_csrf()
        resp = self.client.post(
            "/api/auth/delete",
            data=b"",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get("detail"), "account_deleted")

        User = get_user_model()
        self.assertFalse(User.objects.filter(id=user_id).exists())
        self.assertEqual(TypingRecord.objects.filter(user_id=user_id).count(), 0)
