/**
 * 统一响应工具
 * 规范所有接口的返回格式：{ code, message, data }
 */

// 成功响应
function success(res, data = null, message = '操作成功', code = 200) {
  return res.json({
    code,
    message,
    data
  });
}

// 失败响应
function fail(res, message = '操作失败', code = 400, data = null) {
  return res.status(code).json({
    code,
    message,
    data
  });
}

// 分页响应
function successWithPage(res, list, total, page, pageSize) {
  return res.json({
    code: 200,
    message: '查询成功',
    data: {
      list,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    }
  });
}

module.exports = {
  success,
  fail,
  successWithPage
};
