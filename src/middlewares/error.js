/**
 * 错误处理中间件
 * 包含 404 路由未找到处理和全局错误处理
 */
const { fail } = require('../utils/response');

/**
 * 404 处理中间件
 * 当没有路由匹配时触发
 */
function notFoundHandler(req, res) {
  return fail(res, `接口不存在: ${req.method} ${req.originalUrl}`, 404);
}

/**
 * 全局错误处理中间件
 * 捕获应用中未处理的异常
 * 必须有 4 个参数，Express 会自动识别为错误处理中间件
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('❌ 服务器错误:', err.message);

  // Sequelize 唯一约束冲突错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, '数据已存在，请勿重复提交', 409);
  }

  // Sequelize 数据校验错误
  if (err.name === 'SequelizeValidationError') {
    return fail(res, err.errors[0].message, 422);
  }

  // 其他未预期错误
  return fail(res, '服务器内部错误', 500);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
