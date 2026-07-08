# 熙熙小窝 — 数据库 Schema & 后端 API 接口文档

> 后端技术栈：Node.js + Express + TypeScript + MySQL (mysql2/promise)
> 认证方式：JWT（Bearer Token）
> 文件存储：后端本地磁盘，URL 前缀 `/uploads/`
> 适用：本地开发 MySQL / 宝塔 MySQL（兼容 MySQL 5.7+ / 8.0+）

---

## 目录

1. [数据库 Design](#1-数据库-design)
2. [MySQL 建表语句](#2-mysql-建表语句)
3. [初始数据](#3-初始数据)
4. [API 通用约定](#4-api-通用约定)
5. [认证模块 /api/auth](#5-认证模块-apiauth)
6. [纪念日模块 /api/anniversaries](#6-纪念日模块-apianniversaries)
7. [帖子模块 /api/posts](#7-帖子模块-apiposts)
8. [相册模块 /api/photos](#8-相册模块-apiphotos)
9. [首页聚合 /api/home](#9-首页聚合-apihome)
10. [目录结构与文件上传](#10-目录结构与文件上传)

---

## 1. 数据库 Design

### ER 关系图

```
┌──────────┐       ┌──────────────────┐
│  users   │1─────*│  anniversaries   │
└──────────┘       └──────────────────┘
     │
     │1──────*┌──────────────┐
     │        │    posts     │
     │        └──────────────┘
     │              │1──────*┌────────────────┐
     │              │       │  post_images   │
     │              │       └────────────────┘
     │              │1──────*┌────────────────┐
     │              │       │   comments     │
     │              │       └────────────────┘
     │              │1──────*┌────────────────┐
     │              │       │    likes       │
     │              │       └────────────────┘
     │
     │1──────*┌──────────────┐
     │        │   photos     │
     │        └──────────────┘
```

### 表一览

| 表名 | 说明 | 核心字段 |
|---|---|---|
| `users` | 用户表（熙熙 & 小窝） | id, username, password, nickname, avatar |
| `anniversaries` | 纪念日 | id, title, date, is_recurring, created_by |
| `posts` | 帖子 | id, title, content, author_id, is_pinned, like_count |
| `post_images` | 帖子图片（1:N） | id, post_id, image_url, sort_order |
| `comments` | 帖子评论 | id, post_id, author_id, content |
| `likes` | 帖子点赞（1用户1帖=1条） | id, post_id, user_id |
| `photos` | 相册照片 | id, user_id, image_url, caption |

---

## 2. MySQL 建表语句

```sql
-- ============================================================
-- 熙熙小窝 — 完整建表语句
-- 字符集: utf8mb4 / utf8mb4_unicode_ci（支持 emoji）
-- 引擎: InnoDB（支持事务、外键、行锁）
-- 兼容: MySQL 5.7+, MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `xixi_home`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `xixi_home`;

-- ------------------------------------------------------------
-- 1. 用户表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`       INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50)  NOT NULL                COMMENT '登录账号',
  `password` VARCHAR(255) NOT NULL                COMMENT '密码(bcrypt hash)',
  `nickname` VARCHAR(50)  NOT NULL                COMMENT '昵称',
  `avatar`   VARCHAR(255) NULL DEFAULT NULL        COMMENT '头像URL(相对路径)',
  `role`     TINYINT      NOT NULL DEFAULT 10     COMMENT '10=普通用户 99=管理员',
  `created_at` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ------------------------------------------------------------
-- 2. 纪念日表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `anniversaries`;
CREATE TABLE `anniversaries` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`      VARCHAR(100)  NOT NULL                COMMENT '纪念日标题',
  `date`       DATE          NOT NULL                COMMENT '纪念日期',
  `is_recurring` TINYINT(1)  NOT NULL DEFAULT 1      COMMENT '是否每年重复 0/1',
  `icon`       VARCHAR(50)   NULL DEFAULT NULL        COMMENT '图标emoji(可选)',
  `created_by` INT UNSIGNED  NOT NULL                COMMENT '创建者用户ID',
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_anniversary_date` (`date`),
  KEY `idx_anniversary_creator` (`created_by`),
  CONSTRAINT `fk_anniversary_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='纪念日';

-- ------------------------------------------------------------
-- 3. 帖子表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `title`      VARCHAR(200)  NOT NULL                COMMENT '帖子标题',
  `content`    TEXT          NULL                    COMMENT '帖子内容(无字数限制)',
  `author_id`  INT UNSIGNED  NOT NULL                COMMENT '发布者',
  `is_pinned`  TINYINT(1)    NOT NULL DEFAULT 0      COMMENT '是否置顶 0/1',
  `like_count` INT UNSIGNED  NOT NULL DEFAULT 0      COMMENT '点赞总数(冗余计数)',
  `created_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_post_pinned_created` (`is_pinned` DESC, `created_at` DESC),
  KEY `idx_post_author` (`author_id`),
  CONSTRAINT `fk_post_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子';

-- ------------------------------------------------------------
-- 4. 帖子图片表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `post_images`;
CREATE TABLE `post_images` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `post_id`    INT UNSIGNED  NOT NULL,
  `image_url`  VARCHAR(255)  NOT NULL                COMMENT '图片URL(相对路径)',
  `sort_order` TINYINT       NOT NULL DEFAULT 0      COMMENT '排序序号 0-8',
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_image_post` (`post_id`),
  CONSTRAINT `fk_image_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子图片';

-- ------------------------------------------------------------
-- 5. 评论表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `post_id`    INT UNSIGNED  NOT NULL,
  `author_id`  INT UNSIGNED  NOT NULL,
  `content`    VARCHAR(1000) NOT NULL COMMENT '评论内容',
  `created_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_comment_post` (`post_id`, `created_at`),
  KEY `idx_comment_author` (`author_id`),
  CONSTRAINT `fk_comment_post`   FOREIGN KEY (`post_id`)   REFERENCES `posts` (`id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_comment_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子评论';

-- ------------------------------------------------------------
-- 6. 点赞表（1 个用户对 1 个帖子只能点 1 次）
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `post_id`    INT UNSIGNED  NOT NULL,
  `user_id`    INT UNSIGNED  NOT NULL,
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_like_post_user` (`post_id`, `user_id`),
  KEY `idx_like_user` (`user_id`),
  CONSTRAINT `fk_like_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子点赞';

-- ------------------------------------------------------------
-- 7. 相册照片表
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `photos`;
CREATE TABLE `photos` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED  NOT NULL                COMMENT '上传者',
  `image_url`  VARCHAR(255)  NOT NULL                COMMENT '图片URL(相对路径)',
  `caption`    VARCHAR(200)  NULL DEFAULT NULL       COMMENT '图片描述(可选)',
  `taken_at`   DATE          NULL DEFAULT NULL       COMMENT '拍摄日期(可选)',
  `created_at` DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_photo_created` (`created_at` DESC),
  KEY `idx_photo_user` (`user_id`),
  CONSTRAINT `fk_photo_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册照片';
```

---

## 3. 初始数据

```sql
-- ============================================================
-- 初始数据：两个用户 + 默认纪念日
-- 密码使用 bcrypt 加密，以下为 '123456' 的示例 hash
-- 部署时请替换为实际 hash（bcrypt cost=10）
-- ============================================================

-- 用户（熙熙 & 小窝）
INSERT INTO `users` (`id`, `username`, `password`, `nickname`, `role`) VALUES
  (1, 'xixi',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '熙熙', 99),
  (2, 'xiaowo', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '小窝', 10);

-- 默认纪念日（确定关系日）
INSERT INTO `anniversaries` (`title`, `date`, `is_recurring`, `created_by`) VALUES
  ('确定关系日', '2026-05-23', 1, 1);
```

> ⚠️ **注意**：上面的 `password` 值为占位 hash，部署前请用 bcrypt 对真实密码加密后替换。示例 Node.js 代码：
> ```ts
> import bcrypt from 'bcrypt';
> const hash = bcrypt.hashSync('你的密码', 10);
> ```

---

## 4. API 通用约定

### Base URL

| 环境 | URL |
|---|---|
| 本地开发 | `http://localhost:3000/api` |
| 宝塔部署 | `https://你的域名/api` |

### 请求头

```
Content-Type: application/json          -- JSON 接口
Authorization: Bearer <jwt_token>       -- 需登录的接口
Content-Type: multipart/form-data       -- 文件上传接口
```

### 统一响应格式

```json
// 成功
{ "code": 0, "message": "ok", "data": {} }

// 失败
{ "code": 40001, "message": "参数错误", "data": null }
```

### 错误码

| code | 说明 |
|---|---|
| 0 | 成功 |
| 40000 | 参数校验失败（详情在 `message` 中） |
| 40100 | 未登录 / Token 无效 |
| 40101 | Token 已过期 |
| 40300 | 无权限 |
| 40400 | 资源不存在 |
| 50000 | 服务器内部错误 |

### 分页约定（`list` 类接口）

Query: `?page=1&pageSize=20`

响应：
```json
{
  "code": 0,
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

### 时间格式

所有时间字段返回 ISO 8601 字符串：`2026-05-23T10:30:00.000Z`
前端展示时按本地时区格式化。

---

## 5. 认证模块 `/api/auth`

```ts
// middleware/auth.ts — 伪代码，供参考
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ code: 40100, message: '未登录' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload; // { userId, username }
    next();
  } catch {
    res.status(401).json({ code: 40101, message: 'Token 已过期' });
  }
}
```

### POST `/api/auth/login`

用户登录获取 JWT。

**请求体 (JSON):**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| username | string | ✅ | 用户名 |
| password | string | ✅ | 明文密码 |

```json
{ "username": "xixi", "password": "123456" }
```

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800,
    "user": { "id": 1, "username": "xixi", "nickname": "熙熙", "avatar": null }
  }
}
```

> JWT 有效期建议 **7 天**（`expiresIn: '7d'`），前端在 40101 时重新登录。

**错误响应:**

- `40000` — 用户名或密码为空
- `40100` — 用户名或密码错误

---

### GET `/api/auth/me`

获取当前登录用户信息。

**请求头:** `Authorization: Bearer <token>`

**响应 (200):**

```json
{
  "code": 0,
  "data": { "id": 1, "username": "xixi", "nickname": "熙熙", "avatar": null, "role": 99 }
}
```

---

### PUT `/api/auth/password`

修改自己的密码。

**请求头:** `Authorization: Bearer <token>`
**请求体 (JSON):**

| 字段 | 类型 | 必填 |
|---|---|---|
| oldPassword | string | ✅ |
| newPassword | string | ✅ (≥6位) |

```json
{ "oldPassword": "123456", "newPassword": "abcdef" }
```

**响应:** `{ "code": 0, "message": "ok" }`

**错误响应:** `40000` — 原密码错误

---

## 6. 纪念日模块 `/api/anniversaries`

> 所有接口都需要登录。权限：登录用户可查看所有纪念日；仅创建者或管理员可编辑/删除。

### GET `/api/anniversaries`

获取全部纪念日列表（按日期升序）。

**请求头:** `Authorization: Bearer <token>`

**响应 (200):**

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "title": "确定关系日",
      "date": "2026-05-23",
      "isRecurring": true,
      "icon": "❤️",
      "createdBy": 1,
      "creatorName": "熙熙",
      "daysUntil": 350
    }
  ]
}
```

> `daysUntil` 表示距离下次纪念日的天数。若已过去则为负数（`-15` 表示已过 15 天）。
> 每年重复的日期自动按当前/下一年计算。

---

### POST `/api/anniversaries`

新增纪念日。

**请求头:** `Authorization: Bearer <token>`
**请求体 (JSON):**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | string | ✅ | 标题 ≤100字 |
| date | string (YYYY-MM-DD) | ✅ | 日期 |
| isRecurring | boolean | ❌ | 默认 true |
| icon | string | ❌ | emoji 图标 |

```json
{ "title": "第一次旅行", "date": "2026-08-15", "isRecurring": true, "icon": "✈️" }
```

**响应 (200):**

```json
{ "code": 0, "data": { "id": 2 } }
```

---

### PUT `/api/anniversaries/:id`

编辑纪念日（仅创建者或管理员）。

**请求头:** `Authorization: Bearer <token>`
**请求体 (JSON):** 同上，所有字段可选。

**响应:** `{ "code": 0, "message": "ok" }`
**错误:** `40300` — 不是你的纪念日

---

### DELETE `/api/anniversaries/:id`

删除纪念日（仅创建者或管理员）。

**响应:** `{ "code": 0, "message": "ok" }`

---

### GET `/api/anniversaries/home`

首页纪念日聚合（在一起天数 + 最近未来纪念日 + 近期纪念日列表）。

**请求头:** `Authorization: Bearer <token>`

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "daysTogether": 46,
    "nextAnniversary": {
      "id": 1,
      "title": "确定关系日",
      "date": "2026-05-23",
      "daysUntil": 350
    },
    "upcoming": [
      { "id": 3, "title": "熙熙生日", "date": "2026-07-12", "daysUntil": 4 }
    ]
  }
}
```

> `daysTogether` 由后端根据最早纪念日与今天之差计算。

---

## 7. 帖子模块 `/api/posts`

> 所有帖子接口都需要登录（仅双方使用，不做公开浏览）。

### GET `/api/posts`

帖子列表（置顶优先 + 时间倒序）。

**Query 参数:**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | int | ❌ | 默认 1 |
| pageSize | int | ❌ | 默认 10，最大 50 |

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 10,
        "title": "今天的晚霞好美",
        "content": "下班路上拍的...",
        "authorId": 1,
        "authorName": "熙熙",
        "authorAvatar": null,
        "isPinned": true,
        "likeCount": 2,
        "commentCount": 3,
        "images": [
          { "id": 1, "imageUrl": "/uploads/posts/2026-07-08/abc.jpg", "sortOrder": 0 }
        ],
        "createdAt": "2026-07-08T18:30:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "hasMore": true
  }
}
```

> `images` 默认只返回前 9 张（九宫格展示）。

---

### POST `/api/posts`

发布帖子（支持多图上传）。

**请求头:** `Authorization: Bearer <token>`
**请求体 (multipart/form-data):**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | string | ✅ | 帖子标题 |
| content | string | ❌ | 正文内容 |
| images | file[] | ❌ | 图片文件，最多 9 张 |

> 使用 `multipart/form-data`。图片与表单字段同在一个 body。

**响应 (200):**

```json
{ "code": 0, "data": { "id": 11 } }
```

**错误:**
- `40000` — 标题不能为空 / 图片超过 9 张 / 单张超过 10MB

---

### GET `/api/posts/:id`

帖子详情（含完整图片、评论列表）。

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "id": 10,
    "title": "今天的晚霞好美",
    "content": "下班路上拍的...",
    "authorId": 1,
    "authorName": "熙熙",
    "authorAvatar": null,
    "isPinned": false,
    "likeCount": 2,
    "isLiked": 1,
    "images": [
      { "id": 1, "imageUrl": "/uploads/posts/2026-07-08/abc.jpg", "sortOrder": 0 },
      { "id": 2, "imageUrl": "/uploads/posts/2026-07-08/def.jpg", "sortOrder": 1 }
    ],
    "comments": [
      {
        "id": 1,
        "authorId": 2,
        "authorName": "小窝",
        "authorAvatar": null,
        "content": "好看！",
        "createdAt": "2026-07-08T19:00:00.000Z"
      }
    ],
    "createdAt": "2026-07-08T18:30:00.000Z",
    "updatedAt": "2026-07-08T18:30:00.000Z"
  }
}
```

---

### PUT `/api/posts/:id`

编辑帖子（仅作者本人）。

**请求体 (JSON):**

| 字段 | 类型 | 必填 |
|---|---|---|
| title | string | ❌ |
| content | string | ❌ |
| deleteImageIds | int[] | ❌ | 需要删除的图片ID列表 |

**响应:** `{ "code": 0, "message": "ok" }`
**错误:** `40300` — 不是你的帖子

---

### DELETE `/api/posts/:id`

删除帖子（仅作者本人，级联删除图片/评论/点赞）。

**响应:** `{ "code": 0, "message": "ok" }`

---

### POST `/api/posts/:id/pin`

置顶/取消置顶（仅作者本人）。

**请求体 (JSON):** `{ "isPinned": true }`

**响应:** `{ "code": 0, "message": "ok" }`

---

### POST `/api/posts/:id/like`

点赞 / 取消点赞（toggle）。

**响应 (200):**

```json
{ "code": 0, "data": { "isLiked": true, "likeCount": 3 } }
```

---

### GET `/api/posts/:id/comments`

帖子评论列表（按时间正序）。

**Query:** `?page=1&pageSize=50`

**响应:**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "authorId": 2,
        "authorName": "小窝",
        "authorAvatar": null,
        "content": "好看！",
        "createdAt": "2026-07-08T19:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 50,
    "hasMore": false
  }
}
```

---

### POST `/api/posts/:id/comments`

发表评论（仅双方用户）。

**请求体 (JSON):** `{ "content": "好好看！" }`（≤1000字）

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "id": 2,
    "authorId": 1,
    "authorName": "熙熙",
    "authorAvatar": null,
    "content": "好好看！",
    "createdAt": "2026-07-08T19:05:00.000Z"
  }
}
```

---

### DELETE `/api/posts/:id/comments/:commentId`

删除评论（仅评论作者本人）。

**响应:** `{ "code": 0, "message": "ok" }`

---

## 8. 相册模块 `/api/photos`

> 所有接口都需要登录。权限：登录用户可查看/上传；仅上传者可删除自己照片。

### GET `/api/photos`

相册列表（按上传时间倒序）。

**Query:** `?page=1&pageSize=20`

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 1,
        "userName": "熙熙",
        "imageUrl": "/uploads/photos/2026-07-08/abc.jpg",
        "caption": "今天的奶茶",
        "createdAt": "2026-07-08T15:30:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

> 前端可使用 photo-swiper 组件实现左右滑动预览。

---

### POST `/api/photos`

上传照片（支持多张）。

**请求头:** `Authorization: Bearer <token>`
**请求体 (multipart/form-data):**

| 字段 | 类型 | 必填 |
|---|---|---|
| images | file[] | ✅ (1~20张) |
| caption | string | ❌ |

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "uploaded": [
      { "id": 2, "imageUrl": "/uploads/photos/2026-07-08/def.jpg" }
    ]
  }
}
```

---

### PUT `/api/photos/:id`

编辑照片描述（可选功能）。

**请求体 (JSON):** `{ "caption": "修改后的描述" }`

**响应:** `{ "code": 0, "message": "ok" }`

---

### DELETE `/api/photos/:id`

删除照片（仅上传者本人，同时删除磁盘文件）。

**响应:** `{ "code": 0, "message": "ok" }`

---

## 9. 首页聚合 `/api/home`

### GET `/api/home`

首页一次性返回所有核心数据（减少前端请求次数）。

**请求头:** `Authorization: Bearer <token>`

**响应 (200):**

```json
{
  "code": 0,
  "data": {
    "daysTogether": 46,
    "nextAnniversary": {
      "id": 1,
      "title": "确定关系日",
      "date": "2026-05-23",
      "daysUntil": 350
    },
    "upcomingAnniversaries": [
      { "id": 3, "title": "熙熙生日", "date": "2026-07-12", "daysUntil": 4 }
    ],
    "latestPosts": [
      { "id": 10, "title": "今天的晚霞好美", "coverImage": "/uploads/posts/2026-07-08/abc.jpg", "createdAt": "2026-07-08T18:30:00.000Z" }
    ],
    "recentPhotos": [
      { "id": 1, "imageUrl": "/uploads/photos/2026-07-08/abc.jpg" }
    ]
  }
}
```

> 后端建议对 `/api/home` 加简单内存缓存（60s），避免每次刷新都查库。

---

## 10. 目录结构与文件上传

### 后端项目目录（建议）

```
xixi-home-backend/
├── src/
│   ├── config/           # 配置 (db, jwt, upload)
│   ├── controllers/      # 控制器 (auth, anniversary, post, photo, home)
│   ├── middleware/       # 鉴权, 错误处理, 上传 multer 配置
│   ├── routes/           # 路由定义
│   ├── services/         # 业务逻辑
│   ├── models/           # 数据模型 / SQL
│   ├── utils/            # 工具 (bcrypt, jwt helper, response)
│   ├── types/            # TypeScript 类型定义
│   └── app.ts            # Express 入口
├── uploads/              # 上传文件存储
│   ├── posts/            #   └── YYYY-MM-DD/
│   └── photos/           #   └── YYYY-MM-DD/
├── .env                  # 环境变量
├── tsconfig.json
├── package.json
└── db/
    └── schema.sql        ← 上面给出的建表语句
```

### 文件上传配置（Multer 示例）

```ts
// middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const type = req.baseUrl.includes('photos') ? 'photos' : 'posts';
    const dir = path.join(__dirname, '../../uploads', type, new Date().toISOString().slice(0, 10));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuid() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB/张
  fileFilter(req, file, cb) {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持 jpg/png/gif/webp'));
  },
});

export default upload;
```

### 静态资源托管

```ts
// app.ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### 环境变量 (.env)

```dotenv
# 服务
PORT=3000

# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=xixi_home

# JWT
JWT_SECRET=replace_me_with_random_32+_chars
JWT_EXPIRES_IN=7d

# 上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

---

## 附录：关键技术点备忘

| 事项 | 推荐方案 |
|---|---|
| 密码安全 | bcrypt (cost=10)，永不存明文 |
| JWT 刷新 | 7 天过期 + 前端重新登录，现阶段不需要 refresh token |
| 文件命名 | UUID + 日期目录，避免中文文件名冲突 |
| 图片压缩 | 后期可加 sharp 库自动压缩/生成缩略图 |
| like_count 一致性 | 用事务：INSERT like + UPDATE post.like_count +1（DELETE 反向），或定时校准 |
| 点赞去重 | UNIQUE KEY (post_id, user_id) 兜底 |
| 帖子置顶排序 | INDEX (is_pinned DESC, created_at DESC) 覆盖排序 |
| 宝塔部署 | 宝塔面板 → Node 项目 → 启动；MySQL 用宝塔内置的；上传目录给 755 权限 |
| 微信绑定（后期） | users 表加 `wechat_openid` VARCHAR(64) NULL，新增 `/api/auth/wechat` 接口 |

---

*文档版本: v1.0 | 2026-07-08*
