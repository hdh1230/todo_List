/**
 * 任务数据模型
 * 对应数据库 tasks 表，存储待办事项信息
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  // 主键 ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 任务标题
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '任务标题'
  },
  // 任务描述
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '任务描述'
  },
  // 任务状态：pending(待开始) / in_progress(进行中) / completed(已完成) / cancelled(已取消)
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '任务状态'
  },
  // 优先级：low(低) / medium(中) / high(高)
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium',
    comment: '优先级'
  },
  // 分类标签
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '分类标签'
  },
  // 截止日期
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '截止日期'
  },
  // 关联用户 ID（外键）
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所属用户ID'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true
});

module.exports = Task;
