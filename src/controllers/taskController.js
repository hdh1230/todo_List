/**
 * 任务控制器
 * 处理待办事项的增删改查、分页筛选等业务逻辑
 */
const { Op } = require('sequelize');
const { Task } = require('../models');
const { success, fail, successWithPage } = require('../utils/response');

/**
 * 创建任务
 * POST /api/tasks
 * @body {string} title - 任务标题（必填）
 * @body {string} [description] - 任务描述
 * @body {string} [priority] - 优先级：low/medium/high
 * @body {string} [category] - 分类标签
 * @body {string} [dueDate] - 截止日期
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, category, dueDate } = req.body;

    // 创建任务，关联当前登录用户
    const task = await Task.create({
      title,
      description: description || null,
      priority: priority || 'medium',
      category: category || null,
      dueDate: dueDate || null,
      userId: req.user.id
    });

    return success(res, task, '任务创建成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 查询任务列表（分页 + 筛选 + 排序）
 * GET /api/tasks?page=1&pageSize=10&status=pending&priority=high&category=工作&sortBy=priority&sortOrder=asc
 *
 * 支持的排序字段（sortBy）：
 *   - created_at（默认）：创建时间
 *   - priority：优先级（按 low→medium→high 的字段值排序）
 *   - due_date：截止日期
 *   - updated_at：更新时间
 *
 * 排序方向（sortOrder）：asc（升序） / desc（降序，默认）
 */
exports.getTasks = async (req, res, next) => {
  try {
    // 分页参数
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // 构建查询条件（只查当前用户的任务）
    const where = { userId: req.user.id };

    // 状态筛选
    if (req.query.status) {
      where.status = req.query.status;
    }

    // 优先级筛选
    if (req.query.priority) {
      where.priority = req.query.priority;
    }

    // 分类筛选
    if (req.query.category) {
      where.category = req.query.category;
    }

    // 关键词搜索（标题模糊匹配）
    if (req.query.keyword) {
      where.title = { [Op.like]: `%${req.query.keyword}%` };
    }

    // 动态排序：允许前端指定排序字段和排序方向
    const allowedSortFields = ['created_at', 'priority', 'due_date', 'updated_at'];
    const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    // 分页查询
    const { count, rows } = await Task.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return successWithPage(res, rows, count, page, pageSize);
  } catch (error) {
    next(error);
  }
};

/**
 * 任务统计
 * GET /api/tasks/stats
 * 返回当前用户的任务数量统计（按状态、优先级分组）
 */
exports.getTaskStats = async (req, res, next) => {
  try {
    // 按状态分组统计
    const statusStats = await Task.findAll({
      where: { userId: req.user.id },
      attributes: ['status', [require('sequelize').fn('COUNT', '*'), 'count']],
      group: ['status'],
      raw: true
    });

    // 按优先级分组统计
    const priorityStats = await Task.findAll({
      where: { userId: req.user.id },
      attributes: ['priority', [require('sequelize').fn('COUNT', '*'), 'count']],
      group: ['priority'],
      raw: true
    });

    // 组装统计数据
    const statusMap = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
    const priorityMap = { low: 0, medium: 0, high: 0 };

    statusStats.forEach(item => {
      statusMap[item.status] = parseInt(item.count);
    });
    priorityStats.forEach(item => {
      priorityMap[item.priority] = parseInt(item.count);
    });

    const total = Object.values(statusMap).reduce((sum, n) => sum + n, 0);

    return success(res, {
      total,
      byStatus: statusMap,
      byPriority: priorityMap
    }, '统计成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 快速更新任务状态
 * PATCH /api/tasks/:id/status
 * @body {string} status - 新状态：pending/in_progress/completed/cancelled
 */
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findOne({
      where: { id, userId: req.user.id }
    });

    if (!task) {
      return fail(res, '任务不存在', 404);
    }

    // 仅更新状态字段
    await task.update({ status });

    return success(res, task, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 查询单个任务详情
 * GET /api/tasks/:id
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId: req.user.id }
    });

    if (!task) {
      return fail(res, '任务不存在', 404);
    }

    return success(res, task, '查询成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 更新任务
 * PUT /api/tasks/:id
 * @body 可更新字段：title, description, status, priority, category, dueDate
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, dueDate } = req.body;

    const task = await Task.findOne({
      where: { id, userId: req.user.id }
    });

    if (!task) {
      return fail(res, '任务不存在', 404);
    }

    // 更新允许修改的字段（仅更新传入的字段）
    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      priority: priority !== undefined ? priority : task.priority,
      category: category !== undefined ? category : task.category,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate
    });

    return success(res, task, '更新成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 删除任务
 * DELETE /api/tasks/:id
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId: req.user.id }
    });

    if (!task) {
      return fail(res, '任务不存在', 404);
    }

    await task.destroy();

    return success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};
