import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import vocabData from '../data/vocab.json';
import { useProgressStore } from '../store/progressStore';
import QuizCard from '../components/QuizCard';
import ProgressBar from '../components/ProgressBar';
import type { VocabItem } from '../types';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || '1');
  const navigate = useNavigate();

  const markCorrect = useProgressStore((s) => s.markCorrect);
  const markWrong = useProgressStore((s) => s.markWrong);
  const getLessonProgress = useProgressStore((s) => s.getLessonProgress);

  const [mode, setMode] = useState<'a' | 'b'>('a');

  const vocab = useMemo(() => {
    const lesson = (vocabData as Record<string, { vocabulary: VocabItem[] }>)[`lesson_${lessonId}`];
    return lesson?.vocabulary ?? [];
  }, [lessonId]);

  const shuffledIndices = useMemo(() => {
    const arr = vocab.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [vocab]);

  const [curPos, setCurPos] = useState(0);

  const originalIndex = shuffledIndices[curPos];

  const progress = getLessonProgress(lessonId);

  const goNext = useCallback(() => {
    if (curPos < vocab.length - 1) {
      setCurPos((p) => p + 1);
    }
  }, [curPos, vocab.length]);

  const handleCorrect = useCallback(() => {
    markCorrect(lessonId, originalIndex);
    setTimeout(goNext, 200);
  }, [lessonId, originalIndex, markCorrect, goNext]);

  const handleWrong = useCallback(() => {
    markWrong(lessonId, originalIndex);
    setTimeout(goNext, 200);
  }, [lessonId, originalIndex, markWrong, goNext]);

  if (vocab.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">暂无单词数据</p>
        <Link to={`/lesson/${lessonId}`} className="text-indigo-500 text-sm mt-2 inline-block">返回浏览</Link>
      </div>
    );
  }

  const word = vocab[originalIndex];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to={`/lesson/${lessonId}`} className="text-gray-400 text-sm">← 返回</Link>
        <span className="text-base font-bold text-gray-800">自测模式</span>
        <span className="text-xs text-gray-400">
          {curPos + 1}/{vocab.length}
        </span>
      </div>

      {/* Mode Switch */}
      <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMode('a')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'a'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          👀 看日语写中文
        </button>
        <button
          onClick={() => setMode('b')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'b'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          👂 看中文写日语
        </button>
      </div>

      {/* Quiz Progress */}
      <div className="mb-4">
        <ProgressBar mastered={curPos + 1} total={vocab.length} />
      </div>

      {/* Quiz Card */}
      <QuizCard
        word={word}
        mode={mode}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
      />
    </div>
  );
}
