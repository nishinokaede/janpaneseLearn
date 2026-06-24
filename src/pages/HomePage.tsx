import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import vocabData from '../data/vocab.json';
import { useProgressStore } from '../store/progressStore';
import LessonCard from '../components/LessonCard';
import ProgressBar from '../components/ProgressBar';

export default function HomePage() {
  const getLessonProgress = useProgressStore((s) => s.getLessonProgress);
  const getOverallProgress = useProgressStore((s) => s.getOverallProgress);

  const lessonKeys = useMemo(() => {
    return Object.keys(vocabData).sort((a, b) => {
      const na = parseInt(a.replace('lesson_', ''));
      const nb = parseInt(b.replace('lesson_', ''));
      return na - nb;
    });
  }, []);

  const overall = useMemo(() => getOverallProgress(), [getOverallProgress]);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-400">标准日本语单词学习</p>
      </div>

      {/* 总进度 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">总进度</span>
          <span className="text-sm text-indigo-500 font-medium">
            {overall.total > 0 ? Math.round((overall.mastered / overall.total) * 100) : 0}%
          </span>
        </div>
        <ProgressBar mastered={overall.mastered} total={overall.total} />
      </div>

      {/* 课程网格 */}
      <div className="grid grid-cols-2 gap-3">
        {lessonKeys.map((key) => {
          const lessonId = parseInt(key.replace('lesson_', ''));
          const progress = getLessonProgress(lessonId);
          return (
            <LessonCard
              key={key}
              lessonId={lessonId}
              total={progress.total}
              mastered={progress.mastered}
            />
          );
        })}
      </div>
    </div>
  );
}
