/**
 * 路由入口
 * 统一管理和挂载所有子路由
 */
const express = require('express');
const router = express.Router();

// GET /api - 接口根路径，返回接口列表说明
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'TodoAPI 接口服务运行正常',
    data: {
      name: 'TodoAPI',
      version: '1.0.0',
      description: '基于 Node.js + Express 的待办事项管理接口服务',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register - 用户注册',
          login: 'POST /api/auth/login - 用户登录',
          profile: 'GET /api/auth/profile - 获取当前用户信息（需登录）'
        },
        tasks: {
          list: 'GET /api/tasks - 任务列表（分页/筛选/排序，需登录）',
          stats: 'GET /api/tasks/stats - 任务统计（需登录）',
          detail: 'GET /api/tasks/:id - 任务详情（需登录）',
          create: 'POST /api/tasks - 创建任务（需登录）',
          update: 'PUT /api/tasks/:id - 更新任务（需登录）',
          patchStatus: 'PATCH /api/tasks/:id/status - 快速更新状态（需登录）',
          delete: 'DELETE /api/tasks/:id - 删除任务（需登录）'
        }
      }
    }
  });
});

// 挂载认证路由
router.use('/auth', require('./auth'));
// 挂载任务路由
router.use('/tasks', require('./tasks'));

module.exports = router;
