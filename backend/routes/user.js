const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Order = require('../models/Order')
const TarotReading = require('../models/TarotReading')
const BaziReading = require('../models/BaziReading')
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
      return res.status(404).json({ code: 3001, message: '用户不存在' })
    }
    
    // 获取最近占卜记录
    const recentReadings = await TarotReading.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('question spreadType createdAt')
    
    res.json({
      code: 200,
      data: {
        id: user._id,
        phone: user.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        zodiac: user.zodiac,
        birthDate: user.birthDate,
        
        isMember: user.isMember,
        memberLevel: user.memberLevel,
        memberExpireAt: user.memberExpireAt,
        
        balance: user.balance,
        totalSpent: user.totalSpent,
        
        stats: {
          tarotCount: user.tarotCount,
          zodiacCount: user.zodiacCount,
          baziCount: user.baziCount
        },
        
        recentReadings: recentReadings.map(r => ({
          type: 'tarot',
          question: r.question,
          spreadType: r.spreadType,
          createdAt: r.createdAt
        }))
      }
    })
  } catch (err) {
    console.error('获取用户信息失败:', err)
    res.status(500).json({ code: 1003, message: '获取失败，请稍后再试' })
  }
})

/**
 * PUT /api/user/profile
 * 更新用户信息
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { nickname, avatar, zodiac, birthDate, birthTime } = req.body
    
    const updateData = {}
    if (nickname) updateData.nickname = nickname
    if (avatar) updateData.avatar = avatar
    if (zodiac) updateData.zodiac = zodiac
    if (birthDate) updateData.birthDate = birthDate
    if (birthTime) updateData.birthTime = birthTime
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    )
    
    if (!user) {
      return res.status(404).json({ code: 3001, message: '用户不存在' })
    }
    
    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        zodiac: user.zodiac,
        birthDate: user.birthDate
      }
    })
  } catch (err) {
    console.error('更新用户信息失败:', err)
    res.status(500).json({ code: 1003, message: '更新失败，请稍后再试' })
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
      .limit(parseInt(limit))
      .select('orderNo type amount payStatus payTime createdAt')
    
    const total = await Order.countDocuments(query)
    
    res.json({
      code: 200,
      data: {
        orders: orders.map(o => ({
          id: o._id,
          orderNo: o.orderNo,
          type: o.type,
          amount: o.amount,
          payStatus: o.payStatus,
          payTime: o.payTime,
          createdAt: o.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (err) {
    console.error('获取订单失败:', err)
    res.status(500).json({ code: 1003, message: '获取失败，请稍后再试' })
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
    if (type === 'tarot') {
      readings = await TarotReading.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('question spreadType isPaid createdAt')
    } else if (type === 'bazi') {
      readings = await BaziReading.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('birthDate bazi isPaid createdAt')
    }
    
    res.json({
      code: 200,
      data: {
        readings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    })
  } catch (err) {
    console.error('获取记录失败:', err)
    res.status(500).json({ code: 1003, message: '获取失败，请稍后再试' })
  }
})

/**
 * POST /api/user/member/buy
 * 购买会员
 */
router.post('/member/buy', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const { days = 30, payMethod = 'wechat' } = req.body
    
    // 计算价格
    let amount
    if (days === 30) amount = 1990       // 19.9元/月
    else if (days === 90) amount = 4990  // 49.9元/季
    else if (days === 365) amount = 19990 // 199元/年
    else amount = Math.ceil(days / 30) * 1990
    
    // 创建订单
    const orderNo = Order.generateOrderNo()
    const order = await Order.create({
      orderNo,
      userId,
      type: 'member',
      amount,
      actualAmount: amount,
      payMethod,
      extra: { memberDays: days }
    })
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: {
        orderId: order._id,
        orderNo,
        amount,
        days,
        payUrl: 'weixin://wxpay/mock',
        qrcodeUrl: 'https://mock.pay.com/qrcode',
        mockPaySuccess: true
      }
    })
  } catch (err) {
    console.error('购买会员失败:', err)
    res.status(500).json({ code: 1003, message: '购买失败，请稍后再试' })
  }
})

module.exports = router
