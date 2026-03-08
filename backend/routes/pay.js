const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const User = require('../models/User')
const TarotReading = require('../models/TarotReading')
const ZodiacLog = require('../models/ZodiacLog')
const BaziReading = require('../models/BaziReading')
const authMiddleware = require('../middleware/auth')

/**
 * POST /api/pay/create
 * 创建支付订单（模拟）
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { orderId, payMethod = 'wechat' } = req.body
    const userId = req.userId
    
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ code: 3002, message: '订单不存在' })
    }
    
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ code: 2001, message: '无权访问' })
    }
    
    if (order.payStatus === 'paid') {
      return res.status(400).json({ code: 4001, message: '订单已支付' })
    }
    
    // 模拟支付链接
    const payUrl = payMethod === 'wechat' 
      ? 'weixin://wxpay/mock' 
      : 'alipay://platformapi/startapp?appId=20000067'
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: {
        orderId: order._id,
        orderNo: order.orderNo,
        amount: order.actualAmount,
        payUrl,
        qrcodeUrl: 'https://mock.pay.com/qrcode/' + order.orderNo,
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        
        // 模拟模式：直接返回支付成功
        mockMode: true,
        mockPaySuccess: true
      }
    })
  } catch (err) {
    console.error('创建支付失败:', err)
    res.status(500).json({ code: 1003, message: '创建支付失败，请稍后再试' })
  }
})

/**
 * POST /api/pay/mock-success
 * 模拟支付成功（仅测试环境）
 */
router.post('/mock-success', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body
    const userId = req.userId
    
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ code: 3002, message: '订单不存在' })
    }
    
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ code: 2001, message: '无权访问' })
    }
    
    // 更新订单状态
    order.payStatus = 'paid'
    order.payTime = new Date()
    order.transactionId = 'MOCK_' + Date.now()
    await order.save()
    
    // 解锁对应资源
    await unlockResource(order.type, order.resourceId, order.userId)
    
    res.json({
      code: 200,
      message: '支付成功',
      data: {
        orderId: order._id,
        orderNo: order.orderNo,
        payStatus: 'paid',
        payTime: order.payTime
      }
    })
  } catch (err) {
    console.error('模拟支付失败:', err)
    res.status(500).json({ code: 1003, message: '支付失败，请稍后再试' })
  }
})

/**
 * POST /api/pay/callback/wechat
 * 微信支付回调
 */
router.post('/callback/wechat', async (req, res) => {
  try {
    const { out_trade_no, transaction_id, total_fee } = req.body
    
    const order = await Order.findOne({ orderNo: out_trade_no })
    if (!order) {
      return res.send('<xml><return_code>FAIL</return_code></xml>')
    }
    
    // 验证金额
    if (order.actualAmount !== total_fee) {
      return res.send('<xml><return_code>FAIL</return_code></xml>')
    }
    
    // 防止重复处理
    if (order.payStatus === 'paid') {
      return res.send('<xml><return_code>SUCCESS</return_code></xml>')
    }
    
    // 更新订单
    order.payStatus = 'paid'
    order.payTime = new Date()
    order.transactionId = transaction_id
    await order.save()
    
    // 解锁资源
    await unlockResource(order.type, order.resourceId, order.userId)
    
    res.send('<xml><return_code>SUCCESS</return_code></xml>')
  } catch (err) {
    console.error('支付回调失败:', err)
    res.send('<xml><return_code>FAIL</return_code></xml>')
  }
})

/**
 * GET /api/pay/status/:orderId
 * 查询订单支付状态
 */
router.get('/status/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = req.userId
    
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ code: 3002, message: '订单不存在' })
    }
    
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ code: 2001, message: '无权访问' })
    }
    
    res.json({
      code: 200,
      data: {
        orderId: order._id,
        orderNo: order.orderNo,
        payStatus: order.payStatus,
        payTime: order.payTime,
        isPaid: order.payStatus === 'paid'
      }
    })
  } catch (err) {
    console.error('查询订单失败:', err)
    res.status(500).json({ code: 1003, message: '查询失败，请稍后再试' })
  }
})

// 辅助函数：解锁资源
async function unlockResource(type, resourceId, userId) {
  try {
    switch (type) {
      case 'tarot':
        await TarotReading.findByIdAndUpdate(resourceId, {
          isPaid: true
        })
        break
        
      case 'zodiac':
        await ZodiacLog.findByIdAndUpdate(resourceId, {
          isPaid: true
        })
        break
        
      case 'bazi':
        await BaziReading.findByIdAndUpdate(resourceId, {
          isPaid: true
        })
        break
        
      case 'member':
        // 更新用户会员状态
        const order = await Order.findById(resourceId)
        const days = order.extra?.memberDays || 30
        const expireAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        
        await User.findByIdAndUpdate(userId, {
          isMember: true,
          memberLevel: 1,
          memberExpireAt: expireAt
        })
        break
    }
    
    // 更新用户累计消费
    const order = await Order.findById(resourceId)
    if (order) {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalSpent: order.actualAmount }
      })
    }
  } catch (err) {
    console.error('解锁资源失败:', err)
  }
}

module.exports = router
