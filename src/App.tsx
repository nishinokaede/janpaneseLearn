import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import StatsPage from './pages/StatsPage';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './store/authStore';
import { useProgressStore } from './store/progressStore';

export default function App() {
  const token = useAuthStore((s) => s.token);
  const pullFromServer = useProgressStore((s) => s.pullFromServer);
  const pushToServer = useProgressStore((s) => s.pushToServer);

  // 登录后：先推送本地 → 再拉取云端 → 双向合并
  useEffect(() => {
    if (token) {
      pushToServer().then(() => pullFromServer());
    }
  }, [token, pullFromServer, pushToServer]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/lesson/:id/quiz" element={<QuizPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
