# 学习进度同步 — 后端开发文档

## 一、概述

前端在用户标记"认识/不认识"后，自动将单词学习进度同步到后端。
采用**增量推送 + 全量拉取**模式，前端本地为主，服务器为辅。

---

## 二、数据库设计

### 2.1 建表 SQL（PostgreSQL）

```sql
CREATE TABLE vocab_progress (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL,
    lesson_id       INTEGER NOT NULL,
    word_index      INTEGER NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'new',
    wrong_count     INTEGER NOT NULL DEFAULT 0,
    last_review_at  BIGINT,                       -- Unix 毫秒时间戳
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 每个用户每课每个单词只有一条记录
    CONSTRAINT uq_user_lesson_word UNIQUE (user_id, lesson_id, word_index)
);

CREATE INDEX idx_vocab_progress_user ON vocab_progress (user_id);
```

### 2.2 Tortoise ORM Model（可选，如果项目用 Tortoise）

```python
from tortoise import fields, models
from tortoise.indexes import Index

class VocabProgress(models.Model):
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField("models.User", related_name="vocab_progress")
    lesson_id = fields.IntField()
    word_index = fields.IntField()
    status = fields.CharField(max_length=20, default="new")
    wrong_count = fields.IntField(default=0)
    last_review_at = fields.BigIntField(null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "vocab_progress"
        unique_together = (("user_id", "lesson_id", "word_index"),)
```

---

## 三、API 接口

> 所有接口需要 Bearer Token 认证。响应格式遵循项目现有规范：
```json
{ "code": 200, "message": "ok", "data": <T> }
```

### 3.1 拉取全量进度

```
GET /progress
```

**请求头:** `Authorization: Bearer <access_token>`

**响应 data 字段：**

```json
[
  {
    "lesson_id": 1,
    "word_index": 0,
    "status": "mastered",
    "wrong_count": 0,
    "last_review_at": 1719234567890
  },
  {
    "lesson_id": 3,
    "word_index": 5,
    "status": "learning",
    "wrong_count": 3,
    "last_review_at": 1719234560000
  }
]
```

**说明：** 只返回有学习记录的条目（status 为 learning 或 mastered 的），未学过的单词不需要返回。

---

### 3.2 增量同步进度

```
POST /progress/sync
```

**请求头:** `Authorization: Bearer <access_token>`，`Content-Type: application/json`

**请求体：**

```json
{
  "changes": [
    {
      "lesson_id": 1,
      "word_index": 0,
      "status": "mastered",
      "wrong_count": 1,
      "last_review_at": 1719234567890
    },
    {
      "lesson_id": 3,
      "word_index": 5,
      "status": "learning",
      "wrong_count": 2,
      "last_review_at": 1719234560000
    }
  ]
}
```

**后端处理逻辑（UPSERT）：**

```python
INSERT INTO vocab_progress (user_id, lesson_id, word_index, status, wrong_count, last_review_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
ON CONFLICT (user_id, lesson_id, word_index) DO UPDATE SET
    status        = EXCLUDED.status,
    wrong_count   = EXCLUDED.wrong_count,
    last_review_at = EXCLUDED.last_review_at,
    updated_at    = NOW();
```

**说明：** 建议用批量 upsert（`ON CONFLICT ... DO UPDATE`），一次事务处理。每次前端可能推送 1\~20 条不等。

**响应：**
```json
{
  "code": 200,
  "message": "同步成功",
  "data": null
}
```

---

## 四、FastAPI 路由参考代码

```python
# router.py

from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel
from src.core.auth import get_current_user  # 你的鉴权依赖


router = APIRouter(prefix="/progress", tags=["学习进度"])


# ─── Schemas ───

class ProgressItem(BaseModel):
    lesson_id: int
    word_index: int
    status: str          # "new" | "learning" | "mastered"
    wrong_count: int
    last_review_at: int  # Unix 毫秒时间戳

    class Config:
        from_attributes = True

class SyncRequest(BaseModel):
    changes: List[ProgressItem]


# ─── GET /progress ───

@router.get("")
async def get_progress(user=Depends(get_current_user)):
    """拉取当前用户所有学习进度"""
    rows = await VocabProgress.filter(user_id=user.id).all()
    return {
        "code": 200,
        "message": "ok",
        "data": [
            {
                "lesson_id": r.lesson_id,
                "word_index": r.word_index,
                "status": r.status,
                "wrong_count": r.wrong_count,
                "last_review_at": r.last_review_at,
            }
            for r in rows
        ],
    }


# ─── POST /progress/sync ───

@router.post("/sync")
async def sync_progress(body: SyncRequest, user=Depends(get_current_user)):
    """增量上传学习进度"""
    for item in body.changes:
        await VocabProgress.update_or_create(
            user_id=user.id,
            lesson_id=item.lesson_id,
            word_index=item.word_index,
            defaults={
                "status": item.status,
                "wrong_count": item.wrong_count,
                "last_review_at": item.last_review_at,
            },
        )
    return {"code": 200, "message": "同步成功", "data": None}
```

如果你的项目用的是原生 SQL / asyncpg：

```python
@router.post("/sync")
async def sync_progress(body: SyncRequest, user=Depends(get_current_user)):
    sql = """
    INSERT INTO vocab_progress (user_id, lesson_id, word_index, status, wrong_count, last_review_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (user_id, lesson_id, word_index) DO UPDATE SET
        status = EXCLUDED.status,
        wrong_count = EXCLUDED.wrong_count,
        last_review_at = EXCLUDED.last_review_at,
        updated_at = NOW()
    """
    async with db.transaction():
        for item in body.changes:
            await db.execute(sql, [
                user.id, item.lesson_id, item.word_index,
                item.status, item.wrong_count, item.last_review_at,
            ])
    return {"code": 200, "message": "同步成功", "data": None}
```

---

## 五、前端同步机制

| 时机 | 行为 |
|---|---|
| 页面加载（已登录） | `GET /progress` 拉取全量，双向合并 |
| 用户标记 ✓ / ✗ | 本地立即更新，2 秒防抖后 `POST /progress/sync` 批量推送 |
| 未登录 | 不触发任何网络请求，进度仅存 localStorage |

### 合并策略

以 `last_review_at`（毫秒时间戳）为判断依据：谁的更新则用谁的数据。

```typescript
function mergeProgress(serverItems) {
  for (const item of serverItems) {
    const key = `${item.lesson_id}-${item.word_index}`;
    const local = newWords[key];
    // 服务器数据 > 本地数据，才覆盖
    if (!local || item.last_review_at > local.lastReviewAt) {
      newWords[key] = {
        status: item.status,
        wrongCount: item.wrong_count,
        lastReviewAt: item.last_review_at,
      };
    }
  }
}
```

### 前端关键文件

| 文件 | 作用 |
|---|---|
| [src/services/api.ts](file:///e:/Code/JapaneseLearn/src/services/api.ts) | `fetchProgress()` / `pushProgress()` |
| [src/store/progressStore.ts](file:///e:/Code/JapaneseLearn/src/store/progressStore.ts) | 核心 Store，含 sync 方法，`markCorrect`/`markWrong` 自动排入推送队列 |
| [src/App.tsx](file:///e:/Code/JapaneseLearn/src/App.tsx) | 登录后自动调用 `pullFromServer()` |

---

## 六、接口注册

在 `load_routers` 或手动注册时加入：

```python
from src.modules.vocab_progress.router import router as progress_router

app.include_router(progress_router)
```
