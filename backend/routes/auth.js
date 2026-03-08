const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * POST /api/auth/phone-login
 * 手机号登录（模拟）
 */
router.post('/phone-login', async (req, res) => {
  try {
    const { phone, code } = req.body
    
    // 参数验证
    if (!phone || !code) {
      return res.status(400).json({ code: 1001, message: '请输入手机号和验证码' })
    }
    
    // 模拟验证码验证（实际需要短信服务）
    if (code !== '123456') {
      return res.status(400).json({ code: 1001, message: '验证码错误' })
    }
    
    // 查找或创建用户
    let user = await User.findOne({ phone })
    
    if (!user) {
      user = await User.create({
        phone,
        nickname: `用户${phone.slice(-4)}`,
        lastLoginAt: new Date()
      })
    } else {
      user.lastLoginAt = new Date()
      await user.save()
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        expiresIn: 7 * 24 * 3600,
        user: {
          id: user._id,
          phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
          nickname: user.nickname,
          avatar: user.avatar,
          zodiac: user.zodiac,
          isMember: user.isMember,
          balance: user.balance
        }
      }
    })
  } catch (err) {
    console.error('登录失败:', err)
    res.status(500).json({ code: 1003, message: '登录失败，请稍后再试' })
  }
})

/**
 * POST /api/auth/wechat-login
 * 微信登录（模拟）
 */
router.post('/wechat-login', async (req, res) => {
  try {
    const { code, userInfo } = req.body
    
    // 模拟微信登录（实际需要调用微信API）
    const mockOpenid = `mock_openid_${Date.now()}`
    
    // 查找或创建用户
    let user = await User.findOne({ openid: mockOpenid })
    
    if (!user) {
      user = await User.create({
        openid: mockOpenid,
        nickname: userInfo?.nickName || '神秘用户',
        avatar: userInfo?.avatarUrl || '/images/default-avatar.png',
        gender: userInfo?.gender || 0,
        lastLoginAt: new Date()
      })
    } else {
      user.lastLoginAt = new Date()
      if (userInfo) {
        user.nickname = userInfo.nickName
        user.avatar = userInfo.avatarUrl
        user.gender = userInfo.gender
      }
      await user.save()
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        expiresIn: 7 * 24 * 3600,
        user: {
          id: user._id,
          openid: user.openid,
          nickname: user.nickname,
          avatar: user.avatar,
          zodiac: user.zodiac,
          isMember: user.isMember,
          balance: user.balance
        }
      }
    })
  } catch (err) {
    console.error('登录失败:', err)
    res.status(500).json({ code: 1003, message: '登录失败，请稍后再试' })
  }
})

/**
 * POST /api/auth/send-code
 * 发送验证码（模拟）
 */
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 1001, message: '请输入正确的手机号' })
    }
    
    // 模拟发送验证码（实际需要短信服务）
    console.log(`📱 发送验证码到 ${phone}: 123456`)
    
    res.json({
      code: 200,
      message: '验证码已发送',
      data: {
        // 测试环境返回验证码，生产环境删除
        code: '123456'
      }
    })
  } catch (err) {
    console.error('发送验证码失败:', err)
    res.status(500).json({ code: 1003, message: '发送失败，请稍后再试' })
  }
})

/**
 * GET /api/auth/verify
 * 验证token是否有效
 */
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 2001, message: '未登录' })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ code: 2001, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      message: 'Token有效',
      data: {
        userId: user._id,
        nickname: user.nickname,
        isMember: user.isMember
      }
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 2003, message: 'Token已过期' })
    }
    res.status(401).json({ code: 2002, message: 'Token无效' })
  }
})

module.exports = router
