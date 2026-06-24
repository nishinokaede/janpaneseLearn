# 标日单词学习 App - 设计文档

## 一、项目概述

基于标准日本语教材的单词学习应用，支持按课学习、发音朗读、自测练习。
数据本地存储，纯前端实现，无需后端服务。

### 核心功能

| 功能 | 描述 |
|---|---|
| 按课浏览单词 | 24课单词卡片式浏览，左右切换 |
| 日语朗读 | 调用浏览器 Web Speech API 朗读单词 |
| 自测模式A | 看日语写中文释义 |
| 自测模式B | 看中文写日语假名 |
| 自判对错 | 用户自己对比答案判断对错 |
| 学习统计 | 总进度、各课进度、错词复习列表 |
| PWA 离线 | 可安装到手机桌面，离线使用 |

### 数据概览

- 数据源：`japanese_vocab_structured.json`
- 课程数：24 课
- 每课约 30-50 个单词
- 每个单词包含：`jp`（假名）、`kanji`（汉字）、`type`（词性）、`zh`（中文释义）

---

## 二、技术选型

| 层 | 选择 | 说明 |
|---|---|---|
| 框架 | React 18 + TypeScript | 组件化开发，类型安全 |
| 构建工具 | Vite | 快速开发与构建 |
| 路由 | React Router v6 | SPA 多页面导航 |
| 状态管理 | Zustand | 轻量，支持 persist 持久化 |
| 样式 | Tailwind CSS | 原子化 CSS，移动端友好 |
| TTS | Web Speech API | 浏览器内置日语语音合成，零依赖 |
| 单词数据 | JSON import | 构建时静态载入 |
| 学习记录 | localStorage | Zustand persist 中间件自动同步 |
| PWA | vite-plugin-pwa | 可安装到桌面，离线可用 |

---

## 三、页面结构与路由

```
/                  → 首页（课程列表）
/lesson/:id        → 单词浏览模式（卡片翻页）
/lesson/:id/quiz   → 自测模式（写中文 / 写日语）
/stats             → 学习统计
```

---

## 四、UI 设计

### 4.1 首页 - 课程选择

```
┌─────────────────────────────────┐
│        📖 标日单词学习           │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ 第1课│ │ 第2课│ │ 第3课│ ...  │
│  │ ████░│ │ ██░░░│ │░░░░░│      │
│  │45词  │ │38词  │ │42词  │      │
│  └─────┘ └─────┘ └─────┘      │
│                                 │
│  ┌─────┐ ┌─────┐               │
│  │ 第4课│ │ 第5课│ ...          │
│  └─────┘ └─────┘               │
│                                 │
│  [📊 学习统计]                   │
└─────────────────────────────────┘
```

- 课程网格展示（2-3 列自适应）
- 每张卡片：课程序号、进度条、已掌握数/总词数
- 底部导航：首页 / 统计

### 4.2 单词浏览模式（Flashcard）

```
┌─────────────────────────────────┐
│  ← 返回    第3课    45词     ⋮  │
│                                 │
│         ◀ 12 / 45 ▶            │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     デパート             │   │  ← 汉字（大字）
│  │     デパート             │   │  ← 假名（小字，灰色）
│  │       [名]               │   │  ← 词性标签
│  │                         │   │
│  │   🔈 朗读                │   │  ← 点击发音
│  │                         │   │
│  │   [点击显示中文释义]      │   │  ← 点击展开
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│   [✓ 我认识]    [✗ 不认识]     │
└─────────────────────────────────┘
```

**交互说明：**

| 操作 | 行为 |
|---|---|
| 点击 🔈 | 朗读日语单词（Web Speech API） |
| 点击释义区域 | 展开 / 折叠中文释义 |
| 点击 ✓ | 标记"掌握"，自动跳到下一个 |
| 点击 ✗ | 标记"未掌握"，自动跳到下一个 |
| 左右滑动 / 点箭头 | 切换上一个/下一个单词 |

### 4.3 自测模式

```
┌─────────────────────────────────┐
│  ← 返回     自测模式      ⚙    │
│                                 │
│  [👀 看日语写中文] [👂 听发音写日语]│
│                                 │
│  ── 模式A：看日语写中文 ──       │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     会社員              │   │  ← 日语汉字
│  │     かいしゃいん         │   │  ← 假名读音
│  │                         │   │
│  │  ┌─────────────────┐   │   │
│  │  │ 输入中文意思      │   │   │  ← 输入框
│  │  └─────────────────┘   │   │
│  │                         │   │
│  │  [提交]                 │   │
│  │                         │   │
│  │  正确答案: 公司职员 ✓    │   │  ← 提交后显示对比
│  │  你的答案: 公司职员      │   │
│  │                         │   │
│  │  [✓ 对了]  [✗ 错了]    │   │  ← 自判
│  └─────────────────────────┘   │
│                                 │
│  ── 模式B：写日语 ──            │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     公司职员             │   │  ← 中文释义
│  │     🔈 听发音            │   │  ← 可选听发音
│  │                         │   │
│  │  ┌─────────────────┐   │   │
│  │  │ 输入假名             │   │  ← 假名输入框
│  │  └─────────────────┘   │   │
│  │  ┌─────────────────┐   │   │
│  │  │ 输入汉字（可选）      │   │  ← 汉字输入框（可选）
│  │  └─────────────────┘   │   │
│  │                         │   │
│  │  [提交]                 │   │
│  │                         │   │
│  │  正确答案:               │   │
│  │  かいしゃいん / 会社員   │   │
│  │                         │   │
│  │  [✓ 对了]  [✗ 错了]    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**模式说明：**

| 模式 | 展示内容 | 用户输入 | 自判标准 |
|---|---|---|---|
| A：看日语写中文 | 日语汉字 + 假名 | 中文释义 | 语义匹配即可 |
| B：听看写日语 | 中文释义 + 可选发音 | 日语假名 + 可选汉字 | 宽松匹配 |

### 4.4 学习统计页

```
┌─────────────────────────────────┐
│  ← 返回       学习统计           │
│                                 │
│  ┌─────────────────────────┐   │
│  │   总进度                 │   │
│  │   ████████░░░░  65%     │   │
│  │   520 / 800 已掌握       │   │
│  └─────────────────────────┘   │
│                                 │
│  各课掌握情况（条形图）            │
│  第1课  ████████████████  95%    │
│  第2课  ██████████░░░░░░  72%    │
│  第3课  ████░░░░░░░░░░░░  30%    │
│  ...                            │
│                                 │
│  需要复习的单词列表               │
│  ┌────┬──────────┬──────┬────┐ │
│  │课时│ 单词     │ 释义  │错次│ │
│  ├────┼──────────┼──────┼────┤ │
│  │ 3  │デパート  │百货  │ 3  │ │
│  │ 5  │しゅくだい│作业  │ 2  │ │
│  └────┴──────────┴──────┴────┘ │
└─────────────────────────────────┘
```

---

## 五、代码架构

### 5.1 目录结构

```
src/
├── main.tsx                 # 入口
├── App.tsx                  # 路由配置
├── index.css                # Tailwind 基础样式
│
├── data/
│   └── vocab.json           # 单词数据（复制自 japanese_vocab_structured.json）
│
├── types/
│   └── index.ts             # 类型定义
│
├── store/
│   └── progressStore.ts     # Zustand 状态：学习进度、正确/错误记录
│
├── hooks/
│   └── useTTS.ts            # Web Speech API 封装（日语朗读）
│
├── components/
│   ├── Layout.tsx           # 通用布局（顶部导航栏）
│   ├── LessonCard.tsx       # 课程卡片
│   ├── FlashCard.tsx        # 单词卡片（浏览模式）
│   ├── QuizCard.tsx         # 自测卡片
│   └── ProgressBar.tsx      # 进度条
│
└── pages/
    ├── HomePage.tsx         # 首页 - 课程列表
    ├── LessonPage.tsx       # 单词浏览页
    ├── QuizPage.tsx         # 自测页
    └── StatsPage.tsx        # 统计页
```

### 5.2 组件树

```
App
├── HomePage
│   └── LessonCard[]         ← 课程网格
│
├── LessonPage
│   ├── FlashCard            ← 单词卡片（按索引切换）
│   └── ProgressBar          ← 课程内进度
│
├── QuizPage
│   ├── QuizCard             ← 模式A/B 切换
│   └── ProgressBar          ← 测验进度
│
└── StatsPage
    ├── ProgressBar          ← 总进度
    ├── (各课进度条形图)
    └── (错词列表)
```

---

## 六、数据流设计

```
┌─────────────────────┐
│  vocab.json         │  构建时 import
│  (单词原始数据)       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  React 组件          │  展示单词卡片
│  - FlashCard        │
│  - QuizCard         │
└────────┬────────────┘
         │ 用户点击 ✓/✗
         ▼
┌─────────────────────┐
│  Zustand Store       │  更新学习状态
│  progressStore.ts    │
└────────┬────────────┘
         │ Zustand persist 中间件
         ▼
┌─────────────────────┐
│  localStorage        │  自动持久化
└─────────────────────┘
```

### 核心类型定义

```typescript
// types/index.ts

/** 单词条目（来自 JSON 数据） */
interface VocabItem {
  jp: string;       // 假名读音，如 "かいしゃいん"
  kanji: string;    // 汉字写法，如 "会社員"
  type: string;     // 词性，如 "名" "动" "形" "副" "专"
  zh: string;       // 中文释义，如 "公司职员"
}

/** 课程数据 */
interface Lesson {
  vocabulary: VocabItem[];
}

/** 所有课程数据 */
type VocabData = Record<string, Lesson>;  // key: "lesson_1" ~ "lesson_24"

/** 用户对单个单词的学习状态 */
interface WordProgress {
  status: 'new' | 'learning' | 'mastered';
  wrongCount: number;      // 累计错误次数
  lastReviewAt: number;    // 最后复习时间戳 (ms)
}

/** Zustand Store */
interface ProgressStore {
  words: Record<string, WordProgress>;  // key: "lessonId-wordIndex"

  markCorrect(lessonId: number, wordIndex: number): void;
  markWrong(lessonId: number, wordIndex: number): void;
  resetLesson(lessonId: number): void;

  getLessonProgress(lessonId: number): { total: number; mastered: number };
  getOverallProgress(): { total: number; mastered: number };
  getWrongWords(): Array<{ lessonId: number; wordIndex: number; word: VocabItem; wrongCount: number }>;
}
```

---

## 七、核心逻辑设计

### 7.1 Web Speech API TTS

```typescript
// hooks/useTTS.ts 设计思路

function useTTS() {
  const speak = (text: string) => {
    // 1. 取消当前正在播放的语音
    window.speechSynthesis.cancel();

    // 2. 创建 SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';    // 日语
    utterance.rate = 0.8;        // 稍慢语速

    // 3. 优先选择日语语音（如果浏览器支持）
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.startsWith('ja'));
    if (jaVoice) utterance.voice = jaVoice;

    // 4. 朗读
    window.speechSynthesis.speak(utterance);
  };

  return { speak };
}
```

### 7.2 自判逻辑

| 模式 | 用户操作 | 对比逻辑 |
|---|---|---|
| 浏览模式 | 看到日语→心理默想释义→点开看答案 | 用户自行对比，点击 ✓/✗ |
| 写中文 | 看到日语→输入中文→提交显示答案 | 用户自行对比输入与答案，点击 ✓/✗ |
| 写日语 | 看到中文→输入假名→提交显示答案 | 用户自行对比，宽松匹配（忽略促音大小写差异） |

### 7.3 进度持久化

```typescript
// store/progressStore.ts 设计思路

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      words: {},

      markCorrect: (lessonId, wordIndex) => {
        const key = `${lessonId}-${wordIndex}`;
        set(state => ({
          words: {
            ...state.words,
            [key]: {
              ...state.words[key],
              status: 'mastered',
              lastReviewAt: Date.now(),
            },
          },
        }));
      },

      markWrong: (lessonId, wordIndex) => {
        const key = `${lessonId}-${wordIndex}`;
        set(state => ({
          words: {
            ...state.words,
            [key]: {
              status: 'learning',
              wrongCount: (state.words[key]?.wrongCount ?? 0) + 1,
              lastReviewAt: Date.now(),
            },
          },
        }));
      },

      // ... getLessonProgress, getOverallProgress, getWrongWords
    }),
    { name: 'japanese-vocab-progress' }  // localStorage key
  )
);
```

---

## 八、构建与部署

### 开发命令

```bash
npm install
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本（输出到 dist/）
npm run preview    # 预览生产构建
```

### PWA 配置

- `vite-plugin-pwa` 配置 service worker
- 离线缓存所有静态资源 + JSON 单词数据
- 添加到主屏幕后可像原生 App 一样使用

---

## 九、启动清单

1. 初始化 Vite + React + TypeScript 项目
2. 安装依赖：`react-router-dom` `zustand` `tailwindcss` `vite-plugin-pwa`
3. 配置 Tailwind CSS
4. 复制 `japanese_vocab_structured.json` 到 `src/data/vocab.json`
5. 实现类型定义 `types/index.ts`
6. 实现 Zustand Store `store/progressStore.ts`
7. 实现 TTS Hook `hooks/useTTS.ts`
8. 实现通用组件：`Layout` `ProgressBar` `LessonCard` `FlashCard` `QuizCard`
9. 实现页面：`HomePage` `LessonPage` `QuizPage` `StatsPage`
10. 配置路由 `App.tsx`
11. 配置 PWA 插件
12. 测试与调试
