const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Order = require('../models/Order')
const authMiddleware = require('../middleware/auth')

/**
 * POST /api/points/buy
 * 购买积分
 */
router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const { package: pkg = 'basic' } = req.body
    const userId = req.userId
    
    // 积分包定义
    const packages = {
      basic: { points: 100, price: 9.9 },
      standard: { points: 300, price: 19.9 },
      premium: { points: 1000, price: 49.9 }
    }
    
    const selectedPackage = packages[pkg] || packages.basic
    
    // 创建订单
    const order = new Order({
      userId,
      orderNo: 'POINTS' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
      productType: 'points',
      productName: `积分充值包-${selectedPackage.points}积分`,
      points: selectedPackage.points,
      originalAmount: selectedPackage.price,
      actualAmount: selectedPackage.price,
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
        points: selectedPackage.points,
        amount: selectedPackage.price,
        mockPaySuccess: true
      }
    })
  } catch (err) {
    console.error('购买积分失败:', err)
    res.status(500).json({ code: 1003, message: '购买积分失败' })
  }
})

/**
 * GET /api/points/packages
 * 获取积分包列表
 */
router.get('/packages', (req, res) => {
  const packages = [
    {
      id: 'basic',
      name: '基础包',
      points: 100,
      price: 9.9,
      description: '可使用10次占卜'
    },
    {
      id: 'standard',
      name: '标准包',
      points: 300,
      price: 19.9,
      originalPrice: 29.7,
      discount: '省9.8元',
      description: '可使用30次占卜'
    },
    {
      id: 'premium',
      name: '超值包',
      points: 1000,
      price: 49.9,
      originalPrice: 99,
      discount: '省49.1元',
      description: '可使用100次占卜',
      recommend: true
    }
  ]
  
  res.json({
    code: 200,
    data: packages
  })
})

module.exports = router
