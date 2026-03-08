const express = require('express')
const router = express.Router()
const User = require('../models/User')
const TarotReading = require('../models/TarotReading')
const ZodiacLog = require('../models/ZodiacLog')
const BaziReading = require('../models/BaziReading')
const Order = require('../models/Order')
const authMiddleware = require('../middleware/auth')

/**
 * GET /api/user/profile
 * 获取用户信息
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ code: 1002, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      data: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        zodiac: user.zodiac,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        points: user.points,
        dailyFreeCount: user.dailyFreeCount,
        isMember: user.isMember,
        memberExpireTime: user.memberExpireTime,
        stats: user.stats,
        createdAt: user.createdAt
      }
    })
  } catch (err) {
    console.error('获取用户信息失败:', err)
    res.status(500).json({ code: 1003, message: '获取用户信息失败' })
  }
})

/**
 * PUT /api/user/profile
 * 更新用户信息
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { nickname, avatar, zodiac, birthDate, birthTime, gender } = req.body
    
    const updateData = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (avatar !== undefined) updateData.avatar = avatar
    if (zodiac !== undefined) updateData.zodiac = zodiac
    if (birthDate !== undefined) updateData.birthDate = birthDate
    if (birthTime !== undefined) updateData.birthTime = birthTime
    if (gender !== undefined) updateData.gender = gender
    
    updateData.updatedAt = new Date()
    
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
    if (!user) {
      return res.status(404).json({ code: 1002, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        zodiac: user.zodiac,
        points: user.points,
        dailyFreeCount: user.dailyFreeCount
      }
    })
  } catch (err) {
    console.error('更新用户信息失败:', err)
    res.status(500).json({ code: 1003, message: '更新用户信息失败' })
  }
})

/**
 * GET /api/user/orders
 * 获取订单列表
 */
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { page = 1, limit = 20, status } = req.query
    
    const query = { userId }
    if (status) query.payStatus = status
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
    
    const total = await Order.countDocuments(query)
    
    res.json({
      code: 200,
      data: {
        list: orders,
        total,
        page: Number(page),
        limit: Number(limit)
      }
    })
  } catch (err) {
    console.error('获取订单列表失败:', err)
    res.status(500).json({ code: 1003, message: '获取订单列表失败' })
  }
})

/**
 * GET /api/user/readings
 * 获取占卜记录
 */
router.get('/readings', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { type = 'tarot', page = 1, limit = 20 } = req.query
    
    let readings
    let total
    
    if (type === 'tarot') {
      readings = await TarotReading.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
      total = await TarotReading.countDocuments({ userId })
    } else if (type === 'zodiac') {
      readings = await ZodiacLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
      total = await ZodiacLog.countDocuments({ userId })
    } else if (type === 'bazi') {
      readings = await BaziReading.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
      total = await BaziReading.countDocuments({ userId })
    }
    
    res.json({
      code: 200,
      data: {
        list: readings,
        total,
        page: Number(page),
        limit: Number(limit)
      }
    })
  } catch (err) {
    console.error('获取占卜记录失败:', err)
    res.status(500).json({ code: 1003, message: '获取占卜记录失败' })
  }
})

/**
 * POST /api/user/member/buy
 * 购买会员
 */
router.post('/member/buy', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { days = 30 } = req.body
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ code: 1002, message: '用户不存在' })
    }
    
    // 计算价格
    const price = days === 30 ? 19.9 : (days === 365 ? 199 : 19.9)
    
    // 创建订单
    const order = new Order({
      userId,
      orderNo: 'MEM' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
      productType: 'member',
      productName: days === 30 ? '月度会员' : '年度会员',
      originalAmount: price,
      actualAmount: price,
      payMethod: 'wechat',
      payStatus: 'pending'
    })
    
    await order.save()
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: {
        orderId: order._id,
        orderNo: order.orderNo,
        amount: price,
        
        // 模拟支付
        mockMode: true,
        mockPaySuccess: true
      }
    })
  } catch (err) {
    console.error('购买会员失败:', err)
    res.status(500).json({ code: 1003, message: '购买会员失败' })
  }
})

module.exports = router
