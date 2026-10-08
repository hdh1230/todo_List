/**
 * Express 应用入口
 * 负责中间件注册、静态文件托管、路由挂载、错误处理
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // 加载 .env 环境变量

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error');

// 创建 Express 应用实例
const app = express();

// ===== 注册全局中间件 =====
// 跨域处理：允许前端跨域访问
app.use(cors());
// 解析 JSON 格式请求体
app.use(express.json());
// 解析 URL-encoded 格式请求体
app.use(express.urlencoded({ extended: true }));

// ===== 静态文件托管 =====
// 将 public 目录下的文件作为静态资源对外提供
// 访问根路径 / 时自动返回 index.html
app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== 挂载路由 =====
// 所有 API 路由统一挂载到 /api 前缀下
app.use('/api', routes);

// ===== 错误处理中间件 =====
// 404 处理（放在路由之后）
// 注意：静态文件和 API 路由匹配失败都会走到这里
app.use(notFoundHandler);
// 全局错误处理（放在最后）
app.use(errorHandler);

module.exports = app;
