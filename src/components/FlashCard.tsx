import { useState } from 'react';
import type { VocabItem } from '../types';
import { useTTS } from '../hooks/useTTS';

interface FlashCardProps {
  word: VocabItem;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function FlashCard({ word, onCorrect, onWrong }: FlashCardProps) {
  const [showZh, setShowZh] = useState(false);
  const { speak, speaking, hasJapaneseVoice } = useTTS();

  const handleSpeak = () => {
    const text = word.kanji || word.jp;
    speak(text);
  };

  const handleShowZh = () => {
    setShowZh(!showZh);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mx-2">
      {/* 汉字 */}
      <div className="text-center mb-1">
        <span className="text-4xl font-bold text-gray-800 leading-relaxed">
          {word.kanji || word.jp}
        </span>
      </div>

      {/* 假名 */}
      <div className="text-center mb-2">
        <span className="text-lg text-gray-400">{word.jp}</span>
      </div>

      {/* 词性标签 */}
      {word.type && (
        <div className="text-center mb-4">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded">
            [{word.type}]
          </span>
        </div>
      )}

      {/* 朗读按钮 */}
      <div className="text-center mb-4">
        <button
          onClick={handleSpeak}
          disabled={speaking}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            speaking
              ? 'bg-indigo-100 text-indigo-400'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95'
          }`}
        >
          {speaking ? '🔊 朗读中...' : '🔈 朗读'}
        </button>
        {!hasJapaneseVoice && (
          <p className="text-xs text-amber-500 mt-1.5">
            未检测到日语语音包，发音可能不准确。手机端通常自动支持。
          </p>
        )}
      </div>

      {/* 中文释义 */}
      <div
        onClick={handleShowZh}
        className="text-center py-3 border-t border-gray-100 cursor-pointer select-none"
      >
        {showZh ? (
          <span className="text-lg text-gray-700">{word.zh}</span>
        ) : (
          <span className="text-sm text-gray-400">点击显示中文释义</span>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onWrong}
          className="flex-1 py-2.5 rounded-xl border-2 border-red-300 text-red-500 font-medium text-sm hover:bg-red-50 active:scale-95 transition-all"
        >
          ✗ 不认识
        </button>
        <button
          onClick={onCorrect}
          className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 active:scale-95 transition-all"
        >
          ✓ 我认识
        </button>
      </div>
    </div>
  );
}
