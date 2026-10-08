/**
 * 用户数据模型
 * 对应数据库 users 表，存储用户账号信息
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  // 主键 ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 用户名（唯一）
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  // 密码（存储 bcrypt 哈希值）
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码哈希值'
  },
  // 昵称
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '昵称'
  },
  // 邮箱（唯一，可选）
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '邮箱'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;
