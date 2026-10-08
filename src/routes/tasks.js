/**
 * 任务路由
 * 前缀: /api/tasks
 * 所有路由都需登录（authRequired 中间件鉴权）
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validator');
const { authRequired } = require('../middlewares/auth');
const taskController = require('../controllers/taskController');

// 所有任务路由都需要登录
router.use(authRequired);

// POST /api/tasks - 创建任务
router.post('/', [
  body('title')
    .notEmpty().withMessage('任务标题不能为空')
    .isLength({ max: 200 }).withMessage('任务标题不能超过200个字符'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('优先级可选值：low/medium/high'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('状态值不合法'),
  validate
], taskController.createTask);

// GET /api/tasks - 查询任务列表（分页 + 筛选 + 排序）
router.get('/', taskController.getTasks);

// GET /api/tasks/stats - 任务统计（必须在 /:id 之前注册，否则 stats 会被当作 id）
router.get('/stats', taskController.getTaskStats);

// GET /api/tasks/:id - 查询单个任务详情
router.get('/:id', taskController.getTaskById);

// PATCH /api/tasks/:id/status - 快速更新任务状态
router.patch('/:id/status', [
  body('status')
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('状态值不合法，可选值：pending/in_progress/completed/cancelled'),
  validate
], taskController.updateTaskStatus);

// PUT /api/tasks/:id - 更新任务
router.put('/:id', [
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('优先级可选值：low/medium/high'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('状态值不合法'),
  validate
], taskController.updateTask);

// DELETE /api/tasks/:id - 删除任务
router.delete('/:id', taskController.deleteTask);

module.exports = router;
