/**
 * 认证控制器
 * 处理用户注册、登录等认证相关业务逻辑
 */
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateToken } = require('../middlewares/auth');
const { success, fail } = require('../utils/response');

// bcrypt 加密轮数（越大越安全，但越慢）
const SALT_ROUNDS = 10;

/**
 * 用户注册
 * POST /api/auth/register
 * @body {string} username - 用户名
 * @body {string} password - 密码
 * @body {string} [nickname] - 昵称
 * @body {string} [email] - 邮箱
 */
exports.register = async (req, res, next) => {
  try {
    const { username, password, nickname, email } = req.body;

    // 检查用户名是否已存在
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return fail(res, '用户名已被注册', 409);
    }

    // 使用 bcrypt 对密码进行哈希加密
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      email: email || null
    });

    // 返回用户信息（不返回密码）
    return success(res, {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email
    }, '注册成功', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 * POST /api/auth/login
 * @body {string} username - 用户名
 * @body {string} password - 密码
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 根据用户名查询用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return fail(res, '用户名或密码错误', 401);
    }

    // 使用 bcrypt 校验密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return fail(res, '用户名或密码错误', 401);
    }

    // 生成 JWT Token，将用户 ID 和用户名编码到 Token 中
    const token = generateToken({
      id: user.id,
      username: user.username
    });

    return success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前登录用户信息
 * GET /api/auth/profile
 * 需要携带 Token（authRequired 中间件已处理鉴权）
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'nickname', 'email', 'created_at']
    });

    if (!user) {
      return fail(res, '用户不存在', 404);
    }

    return success(res, user, '查询成功');
  } catch (error) {
    next(error);
  }
};
