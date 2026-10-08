/**
 * JWT 鉴权中间件
 * 校验请求头中的 Bearer Token，验证通过后将用户信息挂载到 req.user
 */
const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

// 从环境变量读取 JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * 生成 JWT Token
 * @param {object} payload - 需要编码到 Token 中的数据（通常是用户信息）
 * @returns {string} 签名后的 Token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 鉴权中间件
 * 从 Authorization 头提取 Bearer Token 并验证
 * 验证通过：req.user = { id, username }
 * 验证失败：返回 401 未授权
 */
function authRequired(req, res, next) {
  // 从请求头获取 Authorization 字段
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, '未提供认证Token，请先登录', 401);
  }

  // 提取 Token（去掉 "Bearer " 前缀）
  const token = authHeader.split(' ')[1];

  try {
    // 验证 Token 并解码
    const decoded = jwt.verify(token, JWT_SECRET);
    // 将用户信息挂载到 req 对象，后续中间件和控制器可直接使用
    req.user = decoded;
    next();
  } catch (error) {
    return fail(res, 'Token无效或已过期，请重新登录', 401);
  }
}

module.exports = {
  generateToken,
  authRequired
};
