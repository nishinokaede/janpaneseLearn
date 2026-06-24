import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-10 bg-indigo-500 text-white shadow-md">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-wide">
            📖 标日单词学习
          </Link>
          {token ? (
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-80">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
            >
              登录
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-lg mx-auto flex">
          <Link
            to="/"
            className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 hover:text-indigo-500"
          >
            <span className="text-xl">🏠</span>
            <span>首页</span>
          </Link>
          <Link
            to="/stats"
            className="flex-1 flex flex-col items-center py-2 text-xs text-gray-500 hover:text-indigo-500"
          >
            <span className="text-xl">📊</span>
            <span>统计</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
