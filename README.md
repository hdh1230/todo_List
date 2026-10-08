# TodoAPI 📝

> 基于 **Node.js + Express + MySQL** 的待办事项（Todo）管理系统，提供完整的 RESTful API 与开箱即用的 Web 管理界面。

[![Node.js](https://img.shields.io/badge/Node.js-v22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize)](https://sequelize.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtoken)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ 功能特性

- 🔐 **用户认证**：注册 / 登录 / 获取个人信息，JWT 鉴权，bcrypt 密码加密存储
- 📋 **任务管理**：任务的创建、查询、更新、删除（CRUD）
- 🔍 **列表查询**：分页、按状态 / 优先级 / 分类筛选、标题关键词搜索、多字段排序
- 📊 **任务统计**：按状态与优先级分组统计任务数量
- ⚡ **快速状态流转**：`PATCH /api/tasks/:id/status` 一键切换任务状态
- 🗄️ **自动建库建表**：启动时自动创建数据库与数据表，免去手动初始化
- 🌐 **内置 Web 界面**：自带响应式待办管理页面（`public/`），开箱即用

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 运行环境 | Node.js v22 |
| Web 框架 | Express 4.x |
| 数据库 | MySQL 8.0 |
| ORM | Sequelize 6 |
| 鉴权 | JWT（jsonwebtoken） |
| 密码加密 | bcrypt |
| 参数校验 | express-validator |
| 跨域 | cors |
| 配置管理 | dotenv |
| 开发热重载 | nodemon |

## 📁 目录结构

```
node_Express/
├── src/                        # 服务端源码
│   ├── config/
│   │   └── database.js         # Sequelize 数据库连接配置（连接池）
│   ├── models/                 # 数据模型
│   │   ├── index.js            # 模型索引与关联关系（User 1:N Task）
│   │   ├── User.js             # 用户模型
│   │   └── Task.js             # 任务模型
│   ├── middlewares/            # 中间件
│   │   ├── auth.js             # JWT 鉴权中间件
│   │   ├── validator.js        # 参数校验处理
│   │   └── error.js            # 404 与全局错误处理
│   ├── routes/                 # 路由
│   │   ├── index.js            # 路由入口（/api）
│   │   ├── auth.js             # 认证路由（/api/auth）
│   │   └── tasks.js            # 任务路由（/api/tasks）
│   ├── controllers/            # 控制器（业务逻辑）
│   │   ├── authController.js   # 注册、登录、个人信息
│   │   └── taskController.js   # 任务增删改查、统计
│   ├── utils/
│   │   └── response.js         # 统一响应格式
│   ├── app.js                  # Express 应用入口（中间件/静态/路由）
│   └── server.js               # 服务器启动（自动建库建表）
├── public/                     # 前端 Web 界面
│   ├── index.html              # 待办管理页面
│   ├── css/style.css
│   └── js/app.js
├── docs/
│   └── API.md                  # 完整接口文档
├── test/
│   └── api-test.js             # 接口自动化测试脚本
├── .env.example                # 环境变量模板
├── .gitignore
└── package.json
```

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org) ≥ 18（推荐 v22）
- [MySQL](https://www.mysql.com) 8.0

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，按本机环境修改：

```bash
# Windows
copy .env.example .env
# macOS / Linux
cp .env.example .env
```

`.env` 关键配置项：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `3000` |
| `NODE_ENV` | 运行环境 | `development` |
| `DB_HOST` | 数据库地址 | `localhost` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | （必填，请修改） |
| `DB_NAME` | 数据库名称 | `todo_api` |
| `JWT_SECRET` | JWT 签名密钥 | （必填，请修改） |
| `JWT_EXPIRES_IN` | Token 有效期 | `7d` |

> ⚠️ 生产环境请务必修改 `JWT_SECRET` 为随机复杂字符串，并妥善保管。

### 3. 启动服务

```bash
# 开发模式（nodemon 热重载）
npm run dev

# 生产模式
npm start
```

启动成功后会 **自动创建数据库和数据表**，无需手动建库：

```
✅ 数据库 todo_api 已就绪
✅ 数据库连接成功
✅ 数据库表同步完成
🚀 服务已启动: http://localhost:3000
```

启动后可直接访问 Web 界面：**http://localhost:3000**

## 📡 API 接口

接口基础地址：`http://localhost:3000/api`
鉴权方式：JWT Bearer Token（受保护接口需携带 `Authorization: Bearer <token>`）
统一响应格式：`{ code, message, data }`

### 认证模块

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| GET  | `/api/auth/profile` | 获取当前用户信息 | ✅ |

### 任务模块

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET    | `/api/tasks` | 查询任务列表（分页 / 筛选 / 排序 / 搜索） | ✅ |
| GET    | `/api/tasks/stats` | 任务统计（按状态、优先级分组） | ✅ |
| GET    | `/api/tasks/:id` | 查询任务详情 | ✅ |
| POST   | `/api/tasks` | 创建任务 | ✅ |
| PUT    | `/api/tasks/:id` | 更新任务 | ✅ |
| PATCH  | `/api/tasks/:id/status` | 快速更新任务状态 | ✅ |
| DELETE | `/api/tasks/:id` | 删除任务 | ✅ |

### 请求示例

```bash
# 1. 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","nickname":"测试用户"}'

# 2. 登录（获取 Token）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 3. 创建任务（携带 Token）
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"title":"学习Node.js","priority":"high","category":"学习","dueDate":"2026-10-15"}'

# 4. 查询任务列表（分页 + 筛选 + 排序 + 搜索）
curl "http://localhost:3000/api/tasks?page=1&pageSize=10&status=pending&keyword=学习&sortBy=priority&sortOrder=asc" \
  -H "Authorization: Bearer <your_token>"

# 5. 任务统计
curl http://localhost:3000/api/tasks/stats \
  -H "Authorization: Bearer <your_token>"

# 6. 快速更新任务状态
curl -X PATCH http://localhost:3000/api/tasks/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"status":"completed"}'
```

> 📖 更详细的请求参数与响应示例见 [docs/API.md](docs/API.md)。

## 🗃️ 数据模型

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(255) | 密码哈希值（bcrypt） |
| nickname | VARCHAR(50) | 昵称 |
| email | VARCHAR(100) | 邮箱，唯一（可选） |

### Task（任务）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | VARCHAR(200) | 任务标题 |
| description | TEXT | 任务描述 |
| status | ENUM | `pending` / `in_progress` / `completed` / `cancelled` |
| priority | ENUM | `low` / `medium` / `high` |
| category | VARCHAR(50) | 分类标签 |
| dueDate | DATE | 截止日期 |
| userId | INTEGER | 所属用户 ID（外键） |

**关联关系**：`User 1:N Task`（一个用户拥有多个任务），删除用户时级联删除其任务。

## 🧪 测试

项目内置接口自动化测试脚本，覆盖全部 10 个接口：

```bash
# 确保服务已启动（npm run dev 或 npm start）
node test/api-test.js
```

## 📄 License

本项目基于 [MIT](LICENSE) 协议开源。

---

<div align="center">Made with ❤️ by Node.js + Express</div>
