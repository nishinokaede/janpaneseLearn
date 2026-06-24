import { useState, useMemo } from 'react';
import type { VocabItem } from '../types';
import { useTTS } from '../hooks/useTTS';

type QuizMode = 'a' | 'b';

interface QuizCardProps {
  word: VocabItem;
  mode: QuizMode;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function QuizCard({ word, mode, onCorrect, onWrong }: QuizCardProps) {
  const [submitted, setSubmitted] = useState(false);
  const [inputZh, setInputZh] = useState('');
  const [inputKana, setInputKana] = useState('');
  const [inputKanji, setInputKanji] = useState('');
  const { speak, speaking, hasJapaneseVoice } = useTTS();

  const displayWord = useMemo(() => word.kanji || word.jp, [word]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = (correct: boolean) => {
    setSubmitted(false);
    setInputZh('');
    setInputKana('');
    setInputKanji('');
    if (correct) {
      onCorrect();
    } else {
      onWrong();
    }
  };

  const handleSpeak = () => {
    speak(displayWord);
  };

  const isKanjiOptional = !word.kanji;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mx-2">
      {/* Mode A: 看日语写中文 */}
      {mode === 'a' && (
        <div>
          <div className="text-center mb-1">
            <span className="text-3xl font-bold text-gray-800">{displayWord}</span>
          </div>
          <div className="text-center mb-2">
            <span className="text-base text-gray-400">{word.jp}</span>
          </div>
          {word.type && (
            <div className="text-center mb-4">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded">
                [{word.type}]
              </span>
            </div>
          )}

          <div className="mb-3">
            <input
              type="text"
              value={inputZh}
              onChange={(e) => setInputZh(e.target.value)}
              disabled={submitted}
              placeholder="输入中文意思"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-base focus:border-indigo-400 focus:outline-none disabled:bg-gray-50"
            />
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 active:scale-95 transition-all"
            >
              提交
            </button>
          ) : (
            <div>
              <div className="p-3 bg-green-50 rounded-xl mb-3">
                <div className="text-sm text-green-600 font-medium">正确答案:</div>
                <div className="text-base text-green-700">{word.zh}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl mb-3">
                <div className="text-sm text-gray-500 font-medium">你的答案:</div>
                <div className="text-base text-gray-700">{inputZh || '(未填写)'}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleNext(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-red-300 text-red-500 font-medium text-sm hover:bg-red-50 active:scale-95 transition-all"
                >
                  ✗ 错了
                </button>
                <button
                  onClick={() => handleNext(true)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 active:scale-95 transition-all"
                >
                  ✓ 对了
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: 看中文写日语 */}
      {mode === 'b' && (
        <div>
          <div className="text-center mb-1">
            <span className="text-3xl font-bold text-gray-800">{word.zh}</span>
          </div>
          <div className="text-center mb-4">
            <button
              onClick={handleSpeak}
              disabled={speaking}
              className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                speaking
                  ? 'bg-indigo-100 text-indigo-400'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95'
              }`}
            >
              {speaking ? '🔊 朗读中...' : '🔈 听发音'}
            </button>
            {!hasJapaneseVoice && (
              <p className="text-xs text-amber-500 mt-1.5">
                未检测到日语语音包，发音可能不准确。手机端通常自动支持。
              </p>
            )}
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={inputKana}
              onChange={(e) => setInputKana(e.target.value)}
              disabled={submitted}
              placeholder="输入假名"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-base focus:border-indigo-400 focus:outline-none mb-2 disabled:bg-gray-50"
            />
            <input
              type="text"
              value={inputKanji}
              onChange={(e) => setInputKanji(e.target.value)}
              disabled={submitted}
              placeholder={`输入汉字${isKanjiOptional ? '（可选）' : ''}`}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-base focus:border-indigo-400 focus:outline-none disabled:bg-gray-50"
            />
          </div>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 active:scale-95 transition-all"
            >
              提交
            </button>
          ) : (
            <div>
              <div className="p-3 bg-green-50 rounded-xl mb-3">
                <div className="text-sm text-green-600 font-medium">正确答案:</div>
                <div className="text-base text-green-700">
                  {word.jp}
                  {word.kanji && ` / ${word.kanji}`}
                </div>
                {word.type && (
                  <div className="text-xs text-green-500 mt-0.5">[{word.type}]</div>
                )}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl mb-3">
                <div className="text-sm text-gray-500 font-medium">你的答案:</div>
                <div className="text-base text-gray-700">
                  {inputKana || '(未填写假名)'}
                  {inputKanji && ` / ${inputKanji}`}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleNext(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-red-300 text-red-500 font-medium text-sm hover:bg-red-50 active:scale-95 transition-all"
                >
                  ✗ 错了
                </button>
                <button
                  onClick={() => handleNext(true)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 active:scale-95 transition-all"
                >
                  ✓ 对了
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
