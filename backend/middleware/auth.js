const jwt = require('jsonwebtoken')

/**
 * JWT认证中间件（必须登录）
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 2001, message: '未登录' })
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 2003, message: 'Token已过期' })
    }
    return res.status(401).json({ code: 2002, message: 'Token无效' })
  }
}

/**
 * 可选认证（不强制登录）
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.userId = null
    req.user = null
    return next()
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.user = decoded
    next()
  } catch (err) {
    req.userId = null
    req.user = null
    next()
  }
}

module.exports = authMiddleware
module.exports.optionalAuth = optionalAuth
