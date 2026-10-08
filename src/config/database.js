/**
 * 数据库连接配置
 * 使用 Sequelize ORM 连接 MySQL 数据库
 */
const { Sequelize } = require('sequelize');

// 从环境变量读取数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME,       // 数据库名
  process.env.DB_USER,       // 用户名
  process.env.DB_PASSWORD,   // 密码
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',       // 数据库类型
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // 开发环境打印 SQL
    timezone: '+08:00',     // 东八区
    pool: {
      max: 10,              // 连接池最大连接数
      min: 0,               // 最小连接数
      acquire: 30000,       // 获取连接超时时间（ms）
      idle: 10000           // 空闲连接超时时间（ms）
    }
  }
);

module.exports = sequelize;
