import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    clearError();

    try {
      if (mode === 'login') {
        await login(username.trim(), password);
        navigate('/', { replace: true });
      } else {
        await register(username.trim(), password, email.trim() || undefined);
        await login(username.trim(), password);
        navigate('/', { replace: true });
      }
    } catch {
      // error is set in store and displayed in UI
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">📖</div>
          <h1 className="text-xl font-bold text-gray-800">标日单词学习</h1>
          <p className="text-sm text-gray-400 mt-1">同步学习进度到云端</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex mb-5 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { clearError(); setMode('login'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { clearError(); setMode('register'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              注册
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              autoComplete="username"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none"
            />
            {mode === 'register' && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱（选填）"
                autoComplete="email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:border-indigo-400 focus:outline-none"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full mt-5 py-3 rounded-xl bg-indigo-500 text-white font-medium text-base hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            {loading ? '请稍候...' : mode === 'login' ? '登录' : '注册'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-4">
            {mode === 'login' ? (
              <>
                还没有账号？
                <button type="button" onClick={switchMode} className="text-indigo-500 ml-1">
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？
                <button type="button" onClick={switchMode} className="text-indigo-500 ml-1">
                  去登录
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
