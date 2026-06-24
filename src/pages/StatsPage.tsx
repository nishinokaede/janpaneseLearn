import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import vocabData from '../data/vocab.json';
import { useProgressStore } from '../store/progressStore';
import ProgressBar from '../components/ProgressBar';

export default function StatsPage() {
  const getLessonProgress = useProgressStore((s) => s.getLessonProgress);
  const getOverallProgress = useProgressStore((s) => s.getOverallProgress);
  const getWrongWords = useProgressStore((s) => s.getWrongWords);
  const navigate = useNavigate();

  const overall = useMemo(() => getOverallProgress(), [getOverallProgress]);
  const wrongWords = useMemo(() => getWrongWords(), [getWrongWords]);

  const lessonKeys = useMemo(() => {
    return Object.keys(vocabData).sort((a, b) => {
      const na = parseInt(a.replace('lesson_', ''));
      const nb = parseInt(b.replace('lesson_', ''));
      return na - nb;
    });
  }, []);

  return (
    <div>
      {/* 总进度 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">总进度</h2>
        <ProgressBar mastered={overall.mastered} total={overall.total} />
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-indigo-500">
            {overall.total > 0 ? Math.round((overall.mastered / overall.total) * 100) : 0}%
          </span>
          <span className="text-sm text-gray-400 ml-2">
            {overall.mastered} / {overall.total} 已掌握
          </span>
        </div>
      </div>

      {/* 各课进度 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">各课掌握情况</h2>
        <div className="space-y-2">
          {lessonKeys.map((key) => {
            const lessonId = parseInt(key.replace('lesson_', ''));
            const progress = getLessonProgress(lessonId);
            return (
              <button
                key={key}
                onClick={() => navigate(`/lesson/${lessonId}`)}
                className="w-full flex items-center gap-3 text-left py-1 hover:bg-gray-50 rounded px-1 transition-colors"
              >
                <span className="text-xs text-gray-500 w-12 shrink-0">第{lessonId}课</span>
                <ProgressBar
                  mastered={progress.mastered}
                  total={progress.total}
                  showText={false}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8 text-right">
                  {progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 错词复习 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          需要复习的单词 ({wrongWords.length})
        </h2>
        {wrongWords.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">暂无错词，继续加油！</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {wrongWords.map((item, idx) => (
              <button
                key={`${item.lessonId}-${item.wordIndex}-${idx}`}
                onClick={() => navigate(`/lesson/${item.lessonId}`)}
                className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-400 w-8 shrink-0">第{item.lessonId}课</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {item.word.kanji || item.word.jp}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{item.word.zh}</div>
                </div>
                <span className="text-xs text-red-400 shrink-0 ml-1">
                  错{item.wrongCount}次
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
