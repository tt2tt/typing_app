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

// ログインAPI呼び出し関数
// 入力値: identifier, password
export async function login(input: { identifier: string; password: string }) {
  await ensureCsrf(); // 事前にCSRFトークンを取得
  let csrftoken = '';
  if (typeof document !== 'undefined') {
    const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    csrftoken = m ? decodeURIComponent(m[1]) : '';
  }

  const res = await fetch('/api/auth/login/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let msg = 'ログインに失敗しました';
    try { const body = await res.json(); msg = body.detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}


// ログアウトAPI呼び出し関数
export async function logout() {
  await ensureCsrf(); // 事前にCSRFトークンを取得
  let csrftoken = '';
  if (typeof document !== 'undefined') {
    // Cookieからcsrftokenを取得
    const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    csrftoken = m ? decodeURIComponent(m[1]) : '';
  }

  // ログアウトAPIへPOSTリクエスト
  const res = await fetch('/api/auth/logout/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRFToken': csrftoken },
  });
  // レスポンスがエラーの場合は例外を投げる
  if (!res.ok) throw new Error('ログアウトに失敗しました');
  // 成功時はレスポンスを返す
  return res.json();
}

// 現在のユーザー情報を取得するAPI呼び出し関数
export async function me() {
  const res = await fetch('/api/auth/me/', { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}
