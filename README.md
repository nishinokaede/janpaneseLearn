# 标日单词学习

基于《标准日本语》教材的日语单词学习应用，支持浏览、自测、云端进度同步。

## 技术栈

React 18 + TypeScript + Vite + Tailwind CSS + Zustand + PWA

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173/`

## 功能

- **单词浏览** — 假名/汉字/释义卡片，TTS 朗读
- **自测模式** — 看日语写中文 / 看中文写日语
- **云端同步** — 登录后自动同步学习进度
- **统计页面** — 总进度、各课掌握情况、错词复习
- **PWA** — 支持离线使用，可安装到桌面

## 构建

```bash
npm run build   # 输出到 dist/
npm run preview # 预览构建结果
```
