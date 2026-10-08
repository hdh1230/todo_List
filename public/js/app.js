/**
 * TodoAPI 前端主逻辑
 * 负责页面交互、API 调用、数据渲染
 */

// ============================
// 全局状态
// ============================
const state = {
  token: localStorage.getItem('token') || '', // 从 localStorage 读取 Token
  user: JSON.parse(localStorage.getItem('user') || 'null'), // 当前用户信息
  currentPage: 1,    // 当前页码
  pageSize: 10,      // 每页条数
  total: 0,          // 总条数
  filterStatus: '',  // 状态筛选
  filterPriority: '',// 优先级筛选
  sortBy: 'created_at',  // 排序字段
  sortOrder: 'desc',     // 排序方向
  keyword: '',       // 搜索关键词
  tasks: []          // 当前页任务列表
};

// 状态文本映射
const statusText = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

// 优先级文本映射
const priorityText = {
  low: '低',
  medium: '中',
  high: '高'
};

// ============================
// API 请求封装
// ============================

/**
 * 统一 API 请求方法
 * @param {string} url - 接口路径（不带 /api 前缀）
 * @param {string} method - 请求方法
 * @param {object} data - 请求体数据
 * @returns {Promise<object>} 响应数据
 */
async function apiRequest(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // 有 Token 则携带到请求头
  if (state.token) {
    options.headers['Authorization'] = 'Bearer ' + state.token;
  }

  // POST/PUT/PATCH 请求携带请求体
  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch('/api' + url, options);
  const result = await res.json();
  return result;
}

// ============================
// Toast 提示
// ============================

/**
 * 显示 Toast 提示
 * @param {string} message - 提示内容
 * @param {string} type - 类型：success/error/info
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type;
  toast.classList.remove('hidden');

  // 2.5 秒后自动消失
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

// ============================
// 视图切换
// ============================

/**
 * 显示登录注册页面
 */
function showAuthView() {
  document.getElementById('authView').classList.remove('hidden');
  document.getElementById('mainView').classList.add('hidden');
}

/**
 * 显示主页面（任务管理）
 */
function showMainView() {
  document.getElementById('authView').classList.add('hidden');
  document.getElementById('mainView').classList.remove('hidden');

  // 更新用户昵称显示
  if (state.user) {
    document.getElementById('userNickname').textContent = state.user.nickname || state.user.username;
  }
}

// ============================
// 登录注册逻辑
// ============================

/**
 * 切换登录/注册标签
 */
function switchTab(tabName) {
  // 更新按钮激活状态
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // 显示对应表单
  document.getElementById('loginForm').classList.toggle('active', tabName === 'login');
  document.getElementById('registerForm').classList.toggle('active', tabName === 'register');

  // 清空消息
  document.getElementById('loginMsg').textContent = '';
  document.getElementById('registerMsg').textContent = '';
}

/**
 * 用户登录
 */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msgEl = document.getElementById('loginMsg');

  if (!username || !password) {
    msgEl.className = 'form-msg error';
    msgEl.textContent = '请输入用户名和密码';
    return;
  }

  try {
    const result = await apiRequest('/auth/login', 'POST', { username, password });

    if (result.code === 200) {
      // 保存 Token 和用户信息
      state.token = result.data.token;
      state.user = result.data.user;
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));

      msgEl.className = 'form-msg success';
      msgEl.textContent = '登录成功，正在跳转...';

      // 跳转到主页面
      setTimeout(() => {
        showMainView();
        loadTasks();
        loadStats();
      }, 500);
    } else {
      msgEl.className = 'form-msg error';
      msgEl.textContent = result.message;
    }
  } catch (err) {
    msgEl.className = 'form-msg error';
    msgEl.textContent = '网络错误，请稍后重试';
  }
}

/**
 * 用户注册
 */
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const nickname = document.getElementById('regNickname').value.trim();
  const password = document.getElementById('regPassword').value;
  const msgEl = document.getElementById('registerMsg');

  if (!username || !password) {
    msgEl.className = 'form-msg error';
    msgEl.textContent = '请填写必填项';
    return;
  }

  try {
    const result = await apiRequest('/auth/register', 'POST', {
      username,
      password,
      nickname: nickname || undefined
    });

    if (result.code === 201) {
      msgEl.className = 'form-msg success';
      msgEl.textContent = '注册成功，即将跳转到登录';
      // 注册成功后自动切到登录标签
      setTimeout(() => {
        switchTab('login');
        document.getElementById('loginUsername').value = username;
        document.getElementById('loginPassword').focus();
      }, 1000);
    } else {
      msgEl.className = 'form-msg error';
      msgEl.textContent = result.message;
    }
  } catch (err) {
    msgEl.className = 'form-msg error';
    msgEl.textContent = '网络错误，请稍后重试';
  }
}

/**
 * 退出登录
 */
function handleLogout() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('已退出登录', 'success');
  showAuthView();
}

// ============================
// 任务列表渲染
// ============================

/**
 * 加载任务列表
 */
async function loadTasks() {
  // 构建查询参数
  const params = new URLSearchParams({
    page: state.currentPage,
    pageSize: state.pageSize
  });
  if (state.filterStatus) params.append('status', state.filterStatus);
  if (state.filterPriority) params.append('priority', state.filterPriority);
  if (state.sortBy) params.append('sortBy', state.sortBy);
  if (state.sortOrder) params.append('sortOrder', state.sortOrder);
  if (state.keyword) params.append('keyword', state.keyword);

  try {
    const result = await apiRequest('/tasks?' + params.toString());

    if (result.code === 200) {
      state.tasks = result.data.list;
      state.total = result.data.pagination.total;
      renderTaskList();
      renderPagination();
    } else {
      showToast(result.message, 'error');
    }
  } catch (err) {
    showToast('加载任务失败，请检查网络', 'error');
  }
}

/**
 * 渲染任务列表
 */
function renderTaskList() {
  const listEl = document.getElementById('taskList');

  if (state.tasks.length === 0) {
    listEl.innerHTML = '<div class="empty-state">暂无任务，点击右上角「新建任务」开始吧~</div>';
    return;
  }

  listEl.innerHTML = state.tasks.map(task => {
    const isCompleted = task.status === 'completed';
    return `
      <div class="task-item ${isCompleted ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="task-check" 
          ${isCompleted ? 'checked' : ''} 
          onchange="toggleTaskStatus(${task.id}, this.checked)">
        <div class="task-content">
          <div class="task-title">${escapeHtml(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
          <div class="task-meta">
            <span class="tag tag-status-${task.status}">${statusText[task.status]}</span>
            <span class="tag tag-priority-${task.priority}">优先级：${priorityText[task.priority]}</span>
            ${task.category ? `<span class="tag tag-category">${escapeHtml(task.category)}</span>` : ''}
            ${task.dueDate ? `<span class="task-date">📅 ${task.dueDate}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-default btn-sm" onclick="openEditModal(${task.id})">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">删除</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 渲染分页
 */
function renderPagination() {
  const totalPages = Math.ceil(state.total / state.pageSize) || 1;
  const pageEl = document.getElementById('pagination');
  let html = '';

  // 上一页
  html += `<button class="page-btn" ${state.currentPage <= 1 ? 'disabled' : ''} 
    onclick="goToPage(${state.currentPage - 1})">上一页</button>`;

  // 页码按钮（最多显示 7 页）
  let start = Math.max(1, state.currentPage - 3);
  let end = Math.min(totalPages, start + 6);
  if (end - start < 6) {
    start = Math.max(1, end - 6);
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" 
      onclick="goToPage(${i})">${i}</button>`;
  }

  // 下一页
  html += `<button class="page-btn" ${state.currentPage >= totalPages ? 'disabled' : ''} 
    onclick="goToPage(${state.currentPage + 1})">下一页</button>`;

  pageEl.innerHTML = html;
}

/**
 * 跳转到指定页
 */
function goToPage(page) {
  const totalPages = Math.ceil(state.total / state.pageSize) || 1;
  if (page < 1 || page > totalPages) return;
  state.currentPage = page;
  loadTasks();
}

// ============================
// 任务操作
// ============================

/**
 * 切换任务状态（勾选复选框）
 */
async function toggleTaskStatus(id, isChecked) {
  const newStatus = isChecked ? 'completed' : 'pending';
  try {
    const result = await apiRequest('/tasks/' + id + '/status', 'PATCH', { status: newStatus });
    if (result.code === 200) {
      showToast('状态已更新', 'success');
      loadTasks();
      loadStats();
    } else {
      showToast(result.message, 'error');
      // 恢复复选框状态
      loadTasks();
    }
  } catch (err) {
    showToast('更新失败', 'error');
    loadTasks();
  }
}

/**
 * 删除任务
 */
async function deleteTask(id) {
  if (!confirm('确定要删除这个任务吗？')) return;

  try {
    const result = await apiRequest('/tasks/' + id, 'DELETE');
    if (result.code === 200) {
      showToast('删除成功', 'success');
      // 如果删除后当前页没有数据了，自动回到上一页
      if (state.tasks.length === 1 && state.currentPage > 1) {
        state.currentPage--;
      }
      loadTasks();
      loadStats();
    } else {
      showToast(result.message, 'error');
    }
  } catch (err) {
    showToast('删除失败', 'error');
  }
}

// ============================
// 新建/编辑任务弹窗
// ============================

/**
 * 打开新建任务弹窗
 */
function openAddModal() {
  document.getElementById('modalTitle').textContent = '新建任务';
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskPriority').value = 'medium';
  document.getElementById('taskStatus').value = 'pending';
  document.getElementById('taskModal').classList.remove('hidden');
}

/**
 * 打开编辑任务弹窗
 */
async function openEditModal(id) {
  try {
    const result = await apiRequest('/tasks/' + id);
    if (result.code === 200) {
      const task = result.data;
      document.getElementById('modalTitle').textContent = '编辑任务';
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDesc').value = task.description || '';
      document.getElementById('taskPriority').value = task.priority;
      document.getElementById('taskStatus').value = task.status;
      document.getElementById('taskCategory').value = task.category || '';
      document.getElementById('taskDueDate').value = task.dueDate || '';
      document.getElementById('taskModal').classList.remove('hidden');
    } else {
      showToast(result.message, 'error');
    }
  } catch (err) {
    showToast('加载任务详情失败', 'error');
  }
}

/**
 * 关闭弹窗
 */
function closeModal() {
  document.getElementById('taskModal').classList.add('hidden');
}

/**
 * 提交任务表单（新建或编辑）
 */
async function handleTaskSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('taskId').value;
  const data = {
    title: document.getElementById('taskTitle').value.trim(),
    description: document.getElementById('taskDesc').value.trim(),
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    category: document.getElementById('taskCategory').value.trim(),
    dueDate: document.getElementById('taskDueDate').value || null
  };

  if (!data.title) {
    showToast('请输入任务标题', 'error');
    return;
  }

  try {
    let result;
    if (id) {
      // 编辑
      result = await apiRequest('/tasks/' + id, 'PUT', data);
    } else {
      // 新建
      result = await apiRequest('/tasks', 'POST', data);
    }

    if (result.code === 200 || result.code === 201) {
      showToast(id ? '更新成功' : '创建成功', 'success');
      closeModal();
      state.currentPage = 1;
      loadTasks();
      loadStats();
    } else {
      showToast(result.message, 'error');
    }
  } catch (err) {
    showToast('操作失败', 'error');
  }
}

// ============================
// 统计数据
// ============================

/**
 * 加载任务统计数据
 */
async function loadStats() {
  try {
    const result = await apiRequest('/tasks/stats');
    if (result.code === 200) {
      document.getElementById('statTotal').textContent = result.data.total;
      document.getElementById('statPending').textContent = result.data.byStatus.pending;
      document.getElementById('statProgress').textContent = result.data.byStatus.in_progress;
      document.getElementById('statDone').textContent = result.data.byStatus.completed;
    }
  } catch (err) {
    // 静默失败，不影响主流程
  }
}

// ============================
// 工具函数
// ============================

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================
// 事件绑定
// ============================

function bindEvents() {
  // 登录注册标签切换
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // 登录表单提交
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // 注册表单提交
  document.getElementById('registerForm').addEventListener('submit', handleRegister);

  // 退出登录
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // 新建任务按钮
  document.getElementById('addTaskBtn').addEventListener('click', openAddModal);

  // 弹窗关闭
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.querySelector('.modal-mask').addEventListener('click', closeModal);

  // 任务表单提交
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);

  // 筛选条件变化
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    state.filterStatus = e.target.value;
    state.currentPage = 1;
    loadTasks();
  });

  document.getElementById('filterPriority').addEventListener('change', (e) => {
    state.filterPriority = e.target.value;
    state.currentPage = 1;
    loadTasks();
  });

  document.getElementById('sortBy').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    loadTasks();
  });

  document.getElementById('sortOrder').addEventListener('change', (e) => {
    state.sortOrder = e.target.value;
    loadTasks();
  });

  // 搜索输入（防抖）
  let searchTimer = null;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.keyword = e.target.value.trim();
      state.currentPage = 1;
      loadTasks();
    }, 300);
  });
}

// ============================
// 初始化
// ============================

function init() {
  bindEvents();

  // 如果已有 Token，直接进入主页面
  if (state.token && state.user) {
    showMainView();
    loadTasks();
    loadStats();
  } else {
    showAuthView();
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
