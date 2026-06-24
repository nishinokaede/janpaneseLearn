import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WordProgress } from '../types';
import vocabData from '../data/vocab.json';
import * as progressApi from '../services/api';

export interface ProgressStoreSync {
  pullFromServer(): Promise<void>;
  pushToServer(): Promise<void>;
  mergeProgress(items: progressApi.SyncProgressItem[]): void;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let pending: Array<{ lessonId: number; wordIndex: number; p: WordProgress }> = [];

function schedulePush() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    const token = localStorage.getItem('auth-token');
    if (!token || pending.length === 0) return;
    const batch = pending.splice(0);
    try {
      await progressApi.pushProgress(
        batch.map((c) => ({
          lesson_id: c.lessonId,
          word_index: c.wordIndex,
          status: c.p.status,
          wrong_count: c.p.wrongCount,
          last_review_at: c.p.lastReviewAt,
        }))
      );
    } catch {
      // 静默失败，下次重试
    }
  }, 2000);
}

export const useProgressStore = create<
  import('../types').ProgressStore & ProgressStoreSync
>()(
  persist(
    (set, get) => ({
      words: {},

      markCorrect: (lessonId, wordIndex) => {
        const key = `${lessonId}-${wordIndex}`;
        const p: WordProgress = {
          status: 'mastered' as const,
          wrongCount: get().words[key]?.wrongCount ?? 0,
          lastReviewAt: Date.now(),
        };
        set((s) => ({ words: { ...s.words, [key]: p } }));
        if (localStorage.getItem('auth-token')) {
          pending.push({ lessonId, wordIndex, p });
          schedulePush();
        }
      },

      markWrong: (lessonId, wordIndex) => {
        const key = `${lessonId}-${wordIndex}`;
        const p: WordProgress = {
          status: 'learning' as const,
          wrongCount: (get().words[key]?.wrongCount ?? 0) + 1,
          lastReviewAt: Date.now(),
        };
        set((s) => ({ words: { ...s.words, [key]: p } }));
        if (localStorage.getItem('auth-token')) {
          pending.push({ lessonId, wordIndex, p });
          schedulePush();
        }
      },

      resetLesson: (lessonId) => {
        const prefix = `${lessonId}-`;
        set((s) => {
          const newWords: Record<string, WordProgress> = {};
          for (const k of Object.keys(s.words)) {
            if (!k.startsWith(prefix)) newWords[k] = s.words[k];
          }
          return { words: newWords };
        });
      },

      getLessonProgress: (lessonId) => {
        const lesson = (vocabData as Record<string, { vocabulary: unknown[] }>)[`lesson_${lessonId}`];
        if (!lesson) return { total: 0, mastered: 0 };
        const total = lesson.vocabulary.length;
        let mastered = 0;
        for (let i = 0; i < total; i++) {
          if (get().words[`${lessonId}-${i}`]?.status === 'mastered') mastered++;
        }
        return { total, mastered };
      },

      getOverallProgress: () => {
        let total = 0;
        let mastered = 0;
        const data = vocabData as Record<string, { vocabulary: unknown[] }>;
        for (const key of Object.keys(data)) {
          const lessonId = parseInt(key.replace('lesson_', ''));
          const vocab = data[key].vocabulary;
          total += vocab.length;
          for (let i = 0; i < vocab.length; i++) {
            if (get().words[`${lessonId}-${i}`]?.status === 'mastered') mastered++;
          }
        }
        return { total, mastered };
      },

      getWrongWords: () => {
        const data = vocabData as Record<string, { vocabulary: Array<{ jp: string; kanji: string; type: string; zh: string }> }>;
        const list: Array<{ lessonId: number; wordIndex: number; word: { jp: string; kanji: string; type: string; zh: string }; wrongCount: number }> = [];
        for (const key of Object.keys(get().words)) {
          const wp = get().words[key];
          if (!wp || wp.wrongCount === 0) continue;
          const [l, i] = key.split('-');
          const lessonId = parseInt(l);
          const wordIndex = parseInt(i);
          const word = data[`lesson_${lessonId}`]?.vocabulary[wordIndex];
          if (word) list.push({ lessonId, wordIndex, word, wrongCount: wp.wrongCount });
        }
        list.sort((a, b) => b.wrongCount - a.wrongCount);
        return list;
      },

      // ─── 同步方法 ───

      pullFromServer: async () => {
        try {
          const items = await progressApi.fetchProgress();
          get().mergeProgress(items);
        } catch {
          // 离线或未登录，静默忽略
        }
      },

      pushToServer: async () => {
        const { words } = get();
        const changes: progressApi.SyncProgressItem[] = [];
        for (const key of Object.keys(words)) {
          const p = words[key];
          if (!p) continue;
          const [l, i] = key.split('-');
          changes.push({
            lesson_id: parseInt(l),
            word_index: parseInt(i),
            status: p.status,
            wrong_count: p.wrongCount,
            last_review_at: p.lastReviewAt,
          });
        }
        if (changes.length === 0) return;
        pending.length = 0;
        await progressApi.pushProgress(changes);
      },

      mergeProgress: (items) => {
        const newWords: Record<string, WordProgress> = { ...get().words };
        for (const item of items) {
          const key = `${item.lesson_id}-${item.word_index}`;
          const local = newWords[key];
          if (!local || item.last_review_at > local.lastReviewAt) {
            newWords[key] = {
              status: item.status,
              wrongCount: item.wrong_count,
              lastReviewAt: item.last_review_at,
            };
          }
        }
        set({ words: newWords });
      },
    }),
    { name: 'japanese-vocab-progress' }
  )
);
