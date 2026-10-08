/**
 * 服务器启动文件
 * 负责启动 HTTP 服务、连接数据库
 */
const app = require('./app');
const sequelize = require('./config/database');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;

/**
 * 确保数据库存在
 * 启动时如果 todo_api 数据库不存在则自动创建，免去手动建库的步骤
 */
async function ensureDatabase() {
  // 先不指定数据库名连接到 MySQL 服务器
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  // 创建数据库（IF NOT EXISTS 避免重复创建报错）
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
  await conn.end();
  console.log(`✅ 数据库 ${process.env.DB_NAME} 已就绪`);
}

/**
 * 启动服务
 * 先确保数据库存在 → 连接数据库 → 同步表 → 启动 HTTP 服务
 */
async function startServer() {
  try {
    // 1. 确保数据库存在（自动创建）
    await ensureDatabase();

    // 2. 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步模型到数据库（创建表）
    // force: false 表示表已存在则不覆盖，开发阶段可用 force: true 重建表
    const { syncDatabase } = require('./models');
    await syncDatabase();

    // 启动 HTTP 服务
    app.listen(PORT, () => {
      console.log(`🚀 服务已启动: http://localhost:${PORT}`);
      console.log(`📚 接口地址: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
}

startServer();
