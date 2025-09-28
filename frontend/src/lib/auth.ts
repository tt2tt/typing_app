// CSRFトークンを取得しCookieにセットするAPI呼び出し
export async function ensureCsrf() {
  await fetch('/api/auth/csrf/', { credentials: 'include' });
}


// サインアップAPI呼び出し関数
// 入力値: email, password, username（任意）
export async function signup(input: { email: string; password: string; username?: string }) {
  await ensureCsrf(); // 事前にCSRFトークンを取得
  let csrftoken = '';
  if (typeof document !== 'undefined') {
    // Cookieからcsrftokenを取得
    const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    csrftoken = m ? decodeURIComponent(m[1]) : '';
  }

  // サインアップAPIへPOSTリクエスト
  const res = await fetch('/api/auth/signup/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken, // CSRFトークンをヘッダーに付与
    },
    body: JSON.stringify(input),
  });

  // レスポンスがエラーの場合は例外を投げる
  if (!res.ok) {
    let msg = 'サインアップに失敗しました';
    try {
      const body = await res.json();
      msg = body.detail || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  // 成功時はユーザー情報を返す
  return res.json();
}
