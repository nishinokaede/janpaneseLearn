/** 单词条目（来自 JSON 数据） */
export interface VocabItem {
  jp: string;       // 假名读音
  kanji: string;    // 汉字写法
  type: string;     // 词性
  zh: string;       // 中文释义
}

/** 课程数据 */
export interface Lesson {
  vocabulary: VocabItem[];
}

/** 所有课程数据 */
export type VocabData = Record<string, Lesson>;

/** 用户对单个单词的学习状态 */
export interface WordProgress {
  status: 'new' | 'learning' | 'mastered';
  wrongCount: number;
  lastReviewAt: number;
}

/** Zustand Store */
export interface ProgressStore {
  words: Record<string, WordProgress>;

  markCorrect(lessonId: number, wordIndex: number): void;
  markWrong(lessonId: number, wordIndex: number): void;
  resetLesson(lessonId: number): void;

  getLessonProgress(lessonId: number): { total: number; mastered: number };
  getOverallProgress(): { total: number; mastered: number };
  getWrongWords(): Array<{ lessonId: number; wordIndex: number; word: VocabItem; wrongCount: number }>;
}
