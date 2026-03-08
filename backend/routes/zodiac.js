const express = require('express')
const router = express.Router()
const ZodiacLog = require('../models/ZodiacLog')
const Order = require('../models/Order')
const aiService = require('../services/aiService')
const authMiddleware = require('../middleware/auth').optionalAuth

/**
 * GET /api/zodiac/:name/daily
 * 获取每日星座运势
 */
router.get('/:name/daily', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params
    const { date } = req.query
    
    const zodiacName = getZodiacEnglishName(name)
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    // 查询是否已生成
    let log = await ZodiacLog.findOne({
      zodiac: zodiacName,
      date: targetDate
    })
    
    if (!log) {
      // AI生成运势
      const fortune = await aiService.generateZodiacFortune(zodiacName, targetDate)
      
      log = await ZodiacLog.create({
        userId: req.userId,
        zodiac: zodiacName,
        type: 'daily',
        date: targetDate,
        scores: {
          love: fortune.love,
          career: fortune.career,
          money: fortune.money
        },
        summary: fortune.summary,
        detail: fortune.detail,
        advice: fortune.advice
      })
    }
    
    res.json({
      code: 200,
      data: {
        zodiac: zodiacName,
        zodiacName: getZodiacChineseName(zodiacName),
        date: targetDate,
        element: getZodiacElement(zodiacName),
        ruler: getZodiacRuler(zodiacName),
        
        scores: log.scores,
        summary: log.summary,
        
        luckyItems: {
          color: '红色',
          number: 9,
          direction: '东南'
        },
        
        free: {
          advice: log.advice?.slice(0, 1) || ['保持积极心态']
        },
        
        paid: {
          isUnlocked: false,
          preview: '详细解读包含爱情、事业、财运三个维度的深度分析...',
          price: 990
        }
      }
    })
  } catch (err) {
    console.error('获取运势失败:', err)
    res.status(500).json({ code: 1003, message: '获取运势失败，请稍后再试' })
  }
})

/**
 * POST /api/zodiac/unlock
 * 解锁详细运势
 */
router.post('/unlock', authMiddleware, async (req, res) => {
  try {
    const { zodiac, date, payMethod = 'wechat' } = req.body
    const userId = req.userId
    
    if (!req.userId) {
      return res.status(401).json({ code: 2001, message: '请先登录' })
    }
    
    // 查询运势记录
    const log = await ZodiacLog.findOne({ zodiac, date })
    if (!log) {
      return res.status(404).json({ code: 3002, message: '运势记录不存在' })
    }
    
    // 创建订单
    const orderNo = Order.generateOrderNo()
    const order = await Order.create({
      orderNo,
      userId,
      type: 'zodiac',
      subType: 'daily',
      amount: 990,
      actualAmount: 990,
      payMethod,
      resourceId: log._id
    })
    
    // 模拟支付（实际需要调用支付API）
    res.json({
      code: 200,
      message: '订单创建成功',
      data: {
        orderId: order._id,
        orderNo,
        amount: 990,
        payUrl: 'weixin://wxpay/mock',
        qrcodeUrl: 'https://mock.pay.com/qrcode',
        // 模拟模式：直接返回支付成功
        mockPaySuccess: true
      }
    })
  } catch (err) {
    console.error('解锁失败:', err)
    res.status(500).json({ code: 1003, message: '解锁失败，请稍后再试' })
  }
})

// 辅助函数
function getZodiacEnglishName(name) {
  const map = {
    'aries': 'aries', '白羊座': 'aries',
    'taurus': 'taurus', '金牛座': 'taurus',
    'gemini': 'gemini', '双子座': 'gemini',
    'cancer': 'cancer', '巨蟹座': 'cancer',
    'leo': 'leo', '狮子座': 'leo',
    'virgo': 'virgo', '处女座': 'virgo',
    'libra': 'libra', '天秤座': 'libra',
    'scorpio': 'scorpio', '天蝎座': 'scorpio',
    'sagittarius': 'sagittarius', '射手座': 'sagittarius',
    'capricorn': 'capricorn', '摩羯座': 'capricorn',
    'aquarius': 'aquarius', '水瓶座': 'aquarius',
    'pisces': 'pisces', '双鱼座': 'pisces'
  }
  return map[name.toLowerCase()] || name
}

function getZodiacChineseName(name) {
  const map = {
    'aries': '白羊座', 'taurus': '金牛座', 'gemini': '双子座',
    'cancer': '巨蟹座', 'leo': '狮子座', 'virgo': '处女座',
    'libra': '天秤座', 'scorpio': '天蝎座', 'sagittarius': '射手座',
    'capricorn': '摩羯座', 'aquarius': '水瓶座', 'pisces': '双鱼座'
  }
  return map[name] || name
}

function getZodiacElement(name) {
  const map = {
    'aries': '火象星座', 'leo': '火象星座', 'sagittarius': '火象星座',
    'taurus': '土象星座', 'virgo': '土象星座', 'capricorn': '土象星座',
    'gemini': '风象星座', 'libra': '风象星座', 'aquarius': '风象星座',
    'cancer': '水象星座', 'scorpio': '水象星座', 'pisces': '水象星座'
  }
  return map[name] || '未知'
}

function getZodiacRuler(name) {
  const map = {
    'aries': '火星', 'taurus': '金星', 'gemini': '水星',
    'cancer': '月亮', 'leo': '太阳', 'virgo': '水星',
    'libra': '金星', 'scorpio': '冥王星', 'sagittarius': '木星',
    'capricorn': '土星', 'aquarius': '天王星', 'pisces': '海王星'
  }
  return map[name] || '未知'
}

module.exports = router
