/**
 * API 接口测试脚本
 * 测试全部 10 个接口
 */
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(options, res => {
      let chunk = '';
      res.on('data', c => (chunk += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(chunk) }); }
        catch { resolve({ status: res.statusCode, body: chunk }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  let token;

  console.log('=== 1. 注册用户 ===');
  const reg = await request('POST', '/auth/register', {
    username: 'devuser', password: '123456', nickname: '开发者'
  });
  console.log('状态:', reg.status, '/ 响应:', JSON.stringify(reg.body, null, 2));

  console.log('\n=== 2. 用户登录 ===');
  const login = await request('POST', '/auth/login', {
    username: 'devuser', password: '123456'
  });
  console.log('状态:', login.status, '/ 响应:', JSON.stringify(login.body, null, 2));
  token = login.body.data.token;

  console.log('\n=== 3. 获取用户信息 ===');
  const profile = await request('GET', '/auth/profile', null, token);
  console.log('状态:', profile.status, '/ 响应:', JSON.stringify(profile.body, null, 2));

  console.log('\n=== 4. 创建任务1 ===');
  const task1 = await request('POST', '/tasks', {
    title: '学习Express', priority: 'high', category: '学习'
  }, token);
  console.log('状态:', task1.status, '/ 响应:', JSON.stringify(task1.body, null, 2));
  const taskId1 = task1.body.data.id;

  console.log('\n=== 5. 创建任务2 ===');
  const task2 = await request('POST', '/tasks', {
    title: '写接口文档', priority: 'medium', category: '工作'
  }, token);
  console.log('状态:', task2.status, '/ 响应:', JSON.stringify(task2.body, null, 2));
  const taskId2 = task2.body.data.id;

  console.log('\n=== 6. 查询任务列表（按优先级排序）===');
  const list = await request('GET', '/tasks?sortBy=priority&sortOrder=asc', null, token);
  console.log('状态:', list.status, '/ 响应:', JSON.stringify(list.body, null, 2));

  console.log('\n=== 7. 查询任务详情 ===');
  const detail = await request('GET', '/tasks/' + taskId1, null, token);
  console.log('状态:', detail.status, '/ 响应:', JSON.stringify(detail.body, null, 2));

  console.log('\n=== 8. 更新任务（PUT）===');
  const update = await request('PUT', '/tasks/' + taskId1, {
    title: '深入学习Express', status: 'in_progress'
  }, token);
  console.log('状态:', update.status, '/ 响应:', JSON.stringify(update.body, null, 2));

  console.log('\n=== 9. 快速更新状态（PATCH）===');
  const patchStatus = await request('PATCH', '/tasks/' + taskId1 + '/status', {
    status: 'completed'
  }, token);
  console.log('状态:', patchStatus.status, '/ 响应:', JSON.stringify(patchStatus.body, null, 2));

  console.log('\n=== 10. 任务统计 ===');
  const stats = await request('GET', '/tasks/stats', null, token);
  console.log('状态:', stats.status, '/ 响应:', JSON.stringify(stats.body, null, 2));

  console.log('\n=== 11. 删除任务 ===');
  const del = await request('DELETE', '/tasks/' + taskId2, null, token);
  console.log('状态:', del.status, '/ 响应:', JSON.stringify(del.body, null, 2));

  console.log('\n✅ 全部 10 个接口测试完成');
}

main().catch(console.error);
