/**
 * 模型索引文件
 * 统一导出所有模型，并建立模型间的关联关系
 */
const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');

// ===== 建立模型关联关系 =====
// 一个用户拥有多个任务（一对多）
User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks'
});
// 一个任务属于一个用户（反向关联）
Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

/**
 * 同步模型到数据库
 * 将 Sequelize 模型同步创建为数据库表
 * @param {boolean} force - 是否强制重建表（会清空数据）
 */
async function syncDatabase(force = false) {
  await sequelize.sync({ force });
  console.log('✅ 数据库表同步完成');
}

module.exports = {
  sequelize,
  User,
  Task,
  syncDatabase
};
