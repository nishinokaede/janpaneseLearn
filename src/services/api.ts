const BASE_URL = 'https://api.densu.cc';

interface ApiError {
  detail?: string;
  message?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = localStorage.getItem('auth-token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errBody: ApiError = await res.json();
      errMsg = errBody.detail || errBody.message || errMsg;
    } catch {
      try {
        const text = await res.text();
        if (text) errMsg = text;
      } catch { /* keep HTTP status */ }
    }
    throw new Error(errMsg);
  }

  const body: ApiResponse<T> = await res.json();
  if (body.code !== 200) {
    throw new Error(body.message || `请求失败 (${body.code})`);
  }
  return body.data;
}

/** 注册 */
export async function register(params: {
  username: string;
  password: string;
  email?: string;
}) {
  return request('/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_info: {
    username: string;
    nickname?: string;
    email?: string | null;
    avatar?: string | null;
  };
}

/** 登录 */
export async function login(params: {
  username: string;
  password: string;
}): Promise<LoginResult> {
  const formBody = new URLSearchParams(params).toString();
  return request('/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
  });
}

/** 获取当前用户信息 */
export async function getUserInfo(): Promise<{
  username: string;
  email?: string | null;
  [key: string]: unknown;
}> {
  return request('/user/userInfo');
}

// ─── 学习进度同步 ───

export interface SyncProgressItem {
  lesson_id: number;
  word_index: number;
  status: 'new' | 'learning' | 'mastered';
  wrong_count: number;
  last_review_at: number;
}

/** 从服务器拉取当前用户全部进度 */
export async function fetchProgress(): Promise<SyncProgressItem[]> {
  return request('/progress');
}

/** 推送本地进度到服务器 */
export async function pushProgress(items: SyncProgressItem[]) {
  return request('/progress/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ changes: items }),
  });
}
