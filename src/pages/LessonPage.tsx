import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import vocabData from '../data/vocab.json';
import { useProgressStore } from '../store/progressStore';
import FlashCard from '../components/FlashCard';
import ProgressBar from '../components/ProgressBar';
import type { VocabItem } from '../types';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id || '1');
  const navigate = useNavigate();

  const markCorrect = useProgressStore((s) => s.markCorrect);
  const markWrong = useProgressStore((s) => s.markWrong);
  const getLessonProgress = useProgressStore((s) => s.getLessonProgress);

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
  const progress = getLessonProgress(lessonId);

  useEffect(() => {
    setCurPos(0);
  }, [lessonId]);

  const originalIndex = shuffledIndices[curPos];

  const goNext = useCallback(() => {
    if (curPos < vocab.length - 1) {
      setCurPos((p) => p + 1);
    }
  }, [curPos, vocab.length]);

  const goPrev = useCallback(() => {
    if (curPos > 0) {
      setCurPos((p) => p - 1);
    }
  }, [curPos]);

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
        <Link to="/" className="text-indigo-500 text-sm mt-2 inline-block">返回首页</Link>
      </div>
    );
  }

  const word = vocab[originalIndex];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-gray-400 text-sm">← 返回</Link>
        <span className="text-base font-bold text-gray-800">第{lessonId}课</span>
        <Link
          to={`/lesson/${lessonId}/quiz`}
          className="text-indigo-500 text-sm font-medium"
        >
          自测 →
        </Link>
      </div>

      {/* Lesson Progress */}
      <div className="mb-4">
        <ProgressBar mastered={progress.mastered} total={progress.total} />
      </div>

      {/* Card Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          disabled={curPos === 0}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 hover:bg-gray-50 active:scale-95 transition-all"
        >
          ◀
        </button>
        <span className="text-xs text-gray-400 font-medium">
          {curPos + 1} / {vocab.length}
        </span>
        <button
          onClick={goNext}
          disabled={curPos === vocab.length - 1}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30 hover:bg-gray-50 active:scale-95 transition-all"
        >
          ▶
        </button>
      </div>

      {/* Flash Card */}
      <FlashCard word={word} onCorrect={handleCorrect} onWrong={handleWrong} />
    </div>
  );
}
