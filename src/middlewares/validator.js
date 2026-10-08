/**
 * 参数校验中间件
 * 基于 express-validator，对请求参数进行校验
 */
const { validationResult } = require('express-validator');
const { fail } = require('../utils/response');

/**
 * 校验结果处理中间件
 * 需放在具体校验规则之后使用
 * 有错误则返回 422；无错误则放行
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 提取第一条错误信息返回
    const firstError = errors.array()[0];
    return fail(res, firstError.msg, 422);
  }

  next();
}

module.exports = { validate };
