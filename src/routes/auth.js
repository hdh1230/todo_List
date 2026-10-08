/**
 * 认证路由
 * 前缀: /api/auth
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validator');
const { authRequired } = require('../middlewares/auth');
const authController = require('../controllers/authController');

// POST /api/auth/register - 用户注册
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 50 }).withMessage('用户名长度需在3-50个字符之间')
    .notEmpty().withMessage('用户名不能为空'),
  body('password')
    .isLength({ min: 6, max: 50 }).withMessage('密码长度需在6-50个字符之间')
    .notEmpty().withMessage('密码不能为空'),
  body('email')
    .optional()
    .isEmail().withMessage('邮箱格式不正确'),
  validate
], authController.register);

// POST /api/auth/login - 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
  validate
], authController.login);

// GET /api/auth/profile - 获取当前用户信息（需登录）
router.get('/profile', authRequired, authController.getProfile);

module.exports = router;
