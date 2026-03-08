/**
 * 统一错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err)
  
  // 默认错误
  let error = {
    code: err.code || 1003,
    message: err.message || '服务器内部错误',
    timestamp: Date.now()
  }
  
  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    error.code = 2002
    error.message = 'Token无效'
  }
  
  // JWT过期
  if (err.name === 'TokenExpiredError') {
    error.code = 2003
    error.message = 'Token已过期'
  }
  
  // MongoDB验证错误
  if (err.name === 'ValidationError') {
    error.code = 1001
    error.message = Object.values(err.errors).map(e => e.message).join(', ')
  }
  
  // MongoDB重复键错误
  if (err.code === 11000) {
    error.code = 1001
    error.message = '数据已存在'
  }
  
  // 开发环境返回堆栈
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack
  }
  
  res.status(err.status || 500).json(error)
}

module.exports = errorHandler
