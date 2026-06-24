import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

interface LessonCardProps {
  lessonId: number;
  total: number;
  mastered: number;
}

export default function LessonCard({ lessonId, total, mastered }: LessonCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/lesson/${lessonId}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-bold text-gray-800">第{lessonId}课</span>
        <span className="text-xs text-gray-400">{total}词</span>
      </div>
      <ProgressBar mastered={mastered} total={total} showText={false} />
      <div className="text-xs text-gray-400 mt-1">
        {total > 0 ? Math.round((mastered / total) * 100) : 0}% 已掌握
      </div>
    </button>
  );
}
