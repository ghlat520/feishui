const express = require('express')
const router = express.Router()
const BaziReading = require('../models/BaziReading')
const Order = require('../models/Order')
const lunarService = require('../services/lunarService')
const aiService = require('../services/aiService')
const authMiddleware = require('../middleware/auth')

/**
 * POST /api/bazi/calculate
 * 计算八字
 */
router.post('/calculate', authMiddleware, async (req, res) => {
  try {
    const { birthDate, birthTime, gender, birthPlace } = req.body
    const userId = req.userId
    
    // 参数验证（MVP期间放宽）
    if (!birthDate) {
      return res.status(400).json({ code: 1001, message: '请输入出生日期' })
    }
    
    // 默认值
    const time = birthTime || '12:00'
    
    // 计算八字
    const baziResult = lunarService.getBazi(birthDate, time)
    
    // 转换为AI服务期望的格式
    const baziForAI = {
      year: `${baziResult.bazi.year.gan}${baziResult.bazi.year.zhi}`,
      month: `${baziResult.bazi.month.gan}${baziResult.bazi.month.zhi}`,
      day: `${baziResult.bazi.day.gan}${baziResult.bazi.day.zhi}`,
      hour: `${baziResult.bazi.hour.gan}${baziResult.bazi.hour.zhi}`,
      wuxing: {
        金: baziResult.wuxing.metal || 0,
        木: baziResult.wuxing.wood || 0,
        水: baziResult.wuxing.water || 0,
        火: baziResult.wuxing.fire || 0,
        土: baziResult.wuxing.earth || 0
      }
    }
    
    // AI生成性格分析
    const character = await aiService.generateBaziCharacter(baziForAI)
    
    // 保存记录
    const reading = await BaziReading.create({
      userId,
      birthDate,
      birthTime,
      birthPlace,
      gender,
      bazi: baziResult.bazi,
      wuxing: baziResult.wuxing,
      shengxiao: baziResult.shengxiao,
      nayin: baziResult.nayin,
      xingzuo: baziResult.xingzuo,
      character: character.character,
      career: character.career,
      wealth: character.wealth,
      advice: character.advice,
      isPaid: false
    })
    
    res.json({
      code: 200,
      message: '计算成功',
      data: {
        readingId: reading._id,
        
        birthInfo: {
          birthDate,
          birthTime,
          solarTerm: '立春后'
        },
        
        bazi: baziResult.bazi,
        wuxing: baziResult.wuxing,
        wuxingLack: getWuxingLack(baziResult.wuxing),
        
        shengxiao: baziResult.shengxiao,
        nayin: baziResult.nayin,
        xingzuo: baziResult.xingzuo,
        
        free: {
          character: character.character
        },
        
        paid: {
          isUnlocked: false,
          preview: '详细解读包含事业、财运、婚姻、健康全方位分析...',
          price: 1990
        }
      }
    })
  } catch (err) {
    console.error('八字计算失败:', err)
    res.status(500).json({ code: 1003, message: '计算失败，请稍后再试' })
  }
})

/**
 * POST /api/bazi/unlock
 * 解锁详细分析
 */
router.post('/unlock', authMiddleware, async (req, res) => {
  try {
    const { readingId, payMethod = 'wechat' } = req.body
    const userId = req.userId
    
    const reading = await BaziReading.findById(readingId)
    if (!reading) {
      return res.status(404).json({ code: 3002, message: '记录不存在' })
    }
    
    if (reading.userId.toString() !== userId) {
      return res.status(403).json({ code: 2001, message: '无权访问' })
    }
    
    if (reading.isPaid) {
      return res.status(400).json({ code: 4001, message: '已解锁' })
    }
    
    // 创建订单
    const orderNo = Order.generateOrderNo()
    const order = await Order.create({
      orderNo,
      userId,
      type: 'bazi',
      amount: 1990,
      actualAmount: 1990,
      payMethod,
      resourceId: readingId
    })
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: {
        orderId: order._id,
        orderNo,
        amount: 1990,
        payUrl: 'weixin://wxpay/mock',
        qrcodeUrl: 'https://mock.pay.com/qrcode',
        mockPaySuccess: true
      }
    })
  } catch (err) {
    console.error('解锁失败:', err)
    res.status(500).json({ code: 1003, message: '解锁失败，请稍后再试' })
  }
})

// 辅助函数
function getWuxingLack(wuxing) {
  const lacks = []
  if (wuxing.metal === 0) lacks.push('金')
  if (wuxing.wood === 0) lacks.push('木')
  if (wuxing.water === 0) lacks.push('水')
  if (wuxing.fire === 0) lacks.push('火')
  if (wuxing.earth === 0) lacks.push('土')
  return lacks
}

module.exports = router
