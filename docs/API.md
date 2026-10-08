# TodoAPI 接口文档

> 基础地址：`http://localhost:3000/api`
> 认证方式：JWT Bearer Token（受保护接口需在请求头携带 `Authorization: Bearer <token>`）
> 统一响应格式：`{ code, message, data }`

---

## 目录

- [认证模块](#认证模块)
  - [1. 用户注册](#1-用户注册)
  - [2. 用户登录](#2-用户登录)
  - [3. 获取当前用户信息](#3-获取当前用户信息)
- [任务模块](#任务模块)
  - [4. 创建任务](#4-创建任务)
  - [5. 查询任务列表](#5-查询任务列表)
  - [6. 查询任务详情](#6-查询任务详情)
  - [7. 更新任务](#7-更新任务)
  - [8. 删除任务](#8-删除任务)
  - [9. 快速更新任务状态](#9-快速更新任务状态)
  - [10. 任务统计](#10-任务统计)
- [数据模型](#数据模型)
- [错误码说明](#错误码说明)

---

## 认证模块

### 1. 用户注册

**请求**

```
POST /api/auth/register
```

**请求参数（Body - JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，长度 3-50 字符，唯一 |
| password | string | 是 | 密码，长度 6-50 字符 |
| nickname | string | 否 | 昵称，默认使用用户名 |
| email | string | 否 | 邮箱，需符合邮箱格式，唯一 |

**请求示例**

```json
{
  "username": "testuser",
  "password": "123456",
  "nickname": "测试用户",
  "email": "test@example.com"
}
```

**成功响应（201）**

```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "email": "test@example.com"
  }
}
```

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 409 | 用户名已被注册 |
| 422 | 参数校验失败（用户名/密码长度不符、邮箱格式错误） |

---

### 2. 用户登录

**请求**

```
POST /api/auth/login
```

**请求参数（Body - JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**

```json
{
  "username": "testuser",
  "password": "123456"
}
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户"
    }
  }
}
```

> 登录成功后，后续请求需在 Header 中携带 `Authorization: Bearer <token>`

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 401 | 用户名或密码错误 |
| 422 | 参数校验失败 |

---

### 3. 获取当前用户信息

**请求**

```
GET /api/auth/profile
```

**请求头**

| Header | 必填 | 说明 |
|--------|------|------|
| Authorization | 是 | `Bearer <token>` |

**成功响应（200）**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "email": "test@example.com",
    "created_at": "2026-10-08T03:30:50.000Z"
  }
}
```

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 401 | Token 无效或已过期 |
| 404 | 用户不存在 |

---

## 任务模块

> 以下所有接口均需登录鉴权，请求头需携带 `Authorization: Bearer <token>`

### 4. 创建任务

**请求**

```
POST /api/tasks
```

**请求参数（Body - JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 任务标题，最长 200 字符 |
| description | string | 否 | 任务描述 |
| priority | string | 否 | 优先级：`low`(低) / `medium`(中,默认) / `high`(高) |
| category | string | 否 | 分类标签 |
| dueDate | string | 否 | 截止日期，格式 `YYYY-MM-DD` |

**请求示例**

```json
{
  "title": "学习Node.js",
  "description": "完成Express项目搭建",
  "priority": "high",
  "category": "学习",
  "dueDate": "2026-10-15"
}
```

**成功响应（201）**

```json
{
  "code": 201,
  "message": "任务创建成功",
  "data": {
    "id": 1,
    "title": "学习Node.js",
    "description": "完成Express项目搭建",
    "status": "pending",
    "priority": "high",
    "category": "学习",
    "dueDate": "2026-10-15",
    "userId": 1,
    "createdAt": "2026-10-08T03:30:51.000Z",
    "updatedAt": "2026-10-08T03:30:51.000Z"
  }
}
```

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 401 | 未登录 |
| 422 | 标题为空 / 优先级值不合法 |

---

### 5. 查询任务列表

**请求**

```
GET /api/tasks
```

**查询参数（Query）**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页条数 |
| status | string | 否 | - | 状态筛选：`pending`/`in_progress`/`completed`/`cancelled` |
| priority | string | 否 | - | 优先级筛选：`low`/`medium`/`high` |
| category | string | 否 | - | 分类筛选 |
| keyword | string | 否 | - | 标题关键词搜索（模糊匹配） |
| sortBy | string | 否 | created_at | 排序字段：`created_at`/`priority`/`due_date`/`updated_at` |
| sortOrder | string | 否 | desc | 排序方向：`asc`(升序)/`desc`(降序) |

**请求示例**

```
GET /api/tasks?page=1&pageSize=10&status=pending&priority=high&keyword=学习
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "学习Node.js",
        "description": "完成Express项目搭建",
        "status": "pending",
        "priority": "high",
        "category": "学习",
        "dueDate": "2026-10-15",
        "userId": 1,
        "createdAt": "2026-10-08T03:30:51.000Z",
        "updatedAt": "2026-10-08T03:30:51.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
}
```

---

### 6. 查询任务详情

**请求**

```
GET /api/tasks/:id
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**请求示例**

```
GET /api/tasks/1
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "title": "学习Node.js",
    "description": "完成Express项目搭建",
    "status": "pending",
    "priority": "high",
    "category": "学习",
    "dueDate": "2026-10-15",
    "userId": 1,
    "createdAt": "2026-10-08T03:30:51.000Z",
    "updatedAt": "2026-10-08T03:30:51.000Z"
  }
}
```

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |

---

### 7. 更新任务

**请求**

```
PUT /api/tasks/:id
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**请求参数（Body - JSON，所有字段均可选，仅传需修改的字段）**

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 任务标题 |
| description | string | 任务描述 |
| status | string | 任务状态：`pending`/`in_progress`/`completed`/`cancelled` |
| priority | string | 优先级：`low`/`medium`/`high` |
| category | string | 分类标签 |
| dueDate | string | 截止日期 |

**请求示例**

```json
{
  "status": "in_progress",
  "priority": "high"
}
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "title": "学习Node.js",
    "description": "完成Express项目搭建",
    "status": "in_progress",
    "priority": "high",
    "category": "学习",
    "dueDate": "2026-10-15",
    "userId": 1,
    "createdAt": "2026-10-08T03:30:51.000Z",
    "updatedAt": "2026-10-08T03:35:00.000Z"
  }
}
```

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 422 | 状态值/优先级值不合法 |

---

### 8. 删除任务

**请求**

```
DELETE /api/tasks/:id
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**请求示例**

```
DELETE /api/tasks/1
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |

---

### 9. 快速更新任务状态

> 仅更新状态字段，适用于任务状态流转场景（如标记为已完成）

**请求**

```
PATCH /api/tasks/:id/status
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**请求参数（Body - JSON）**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 新状态：`pending`/`in_progress`/`completed`/`cancelled` |

**请求示例**

```json
{
  "status": "completed"
}
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "id": 1,
    "title": "学习Node.js",
    "description": "完成Express项目搭建",
    "status": "completed",
    "priority": "high",
    "category": "学习",
    "dueDate": "2026-10-15",
    "userId": 1,
    "createdAt": "2026-10-08T03:30:51.000Z",
    "updatedAt": "2026-10-08T03:40:00.000Z"
  }
}
```

**失败响应**

| 状态码 | 说明 |
|--------|------|
| 404 | 任务不存在 |
| 422 | 状态值不合法 |

---

### 10. 任务统计

> 返回当前用户的任务数量统计，按状态和优先级分组

**请求**

```
GET /api/tasks/stats
```

**成功响应（200）**

```json
{
  "code": 200,
  "message": "统计成功",
  "data": {
    "total": 3,
    "byStatus": {
      "pending": 2,
      "in_progress": 0,
      "completed": 1,
      "cancelled": 0
    },
    "byPriority": {
      "low": 0,
      "medium": 2,
      "high": 1
    }
  }
}
```

---

## 数据模型

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(255) | 密码哈希值（bcrypt） |
| nickname | VARCHAR(50) | 昵称 |
| email | VARCHAR(100) | 邮箱，唯一 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### Task（任务）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | VARCHAR(200) | 任务标题 |
| description | TEXT | 任务描述 |
| status | ENUM | 状态：`pending`/`in_progress`/`completed`/`cancelled` |
| priority | ENUM | 优先级：`low`/`medium`/`high` |
| category | VARCHAR(50) | 分类标签 |
| due_date | DATE | 截止日期 |
| user_id | INTEGER | 所属用户ID（外键） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 关联关系

- User 1 : N Task（一个用户拥有多个任务）
- 外键 `user_id`，删除用户时级联删除其任务（ON DELETE CASCADE）

---

## 错误码说明

| code | HTTP状态码 | 说明 |
|------|-----------|------|
| 200 | 200 | 操作成功 |
| 201 | 201 | 创建成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证 / Token无效或过期 |
| 404 | 404 | 资源不存在 / 接口不存在 |
| 409 | 409 | 资源冲突（如用户名已存在） |
| 422 | 422 | 参数校验失败 |
| 500 | 500 | 服务器内部错误 |

---

## cURL 测试示例

```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","nickname":"测试用户"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 获取用户信息（替换 <token>）
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <token>"

# 创建任务
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"学习Node.js","priority":"high","category":"学习"}'

# 查询任务列表（分页 + 筛选 + 排序）
curl "http://localhost:3000/api/tasks?page=1&pageSize=10&status=pending&sortBy=priority&sortOrder=asc" \
  -H "Authorization: Bearer <token>"

# 查询任务详情
curl http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>"

# 更新任务
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"in_progress"}'

# 快速更新任务状态
curl -X PATCH http://localhost:3000/api/tasks/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"status":"completed"}'

# 任务统计
curl http://localhost:3000/api/tasks/stats \
  -H "Authorization: Bearer <token>"

# 删除任务
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer <token>"
```
