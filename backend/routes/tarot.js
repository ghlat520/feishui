const express = require('express')
const router = express.Router()
const TarotReading = require('../models/TarotReading')
const Order = require('../models/Order')
const User = require('../models/User')
const tarotService = require('../services/tarotService')
const aiService = require('../services/aiService')
const authMiddleware = require('../middleware/auth')

/**
 * POST /api/tarot/draw
 * 抽取塔罗牌（使用积分或免费额度）
 */
router.post('/draw', authMiddleware, async (req, res) => {
  try {
    const { spreadType = 'single', question, shuffleMethod = 'random' } = req.body
    const userId = req.userId
    
    // 参数验证
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ code: 1001, message: '请输入你的问题' })
    }
    
    if (question.length > 200) {
      return res.status(400).json({ code: 1001, message: '问题不能超过200字' })
    }
    
    // 获取用户信息
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ code: 1002, message: '用户不存在' })
    }
    
    // 检查是否有免费额度或积分
    if (!user.hasFreeQuota()) {
      return res.status(403).json({ 
        code: 2001, 
        message: '免费额度已用完，请充值积分或购买会员',
        data: {
          needPay: true,
          points: user.points,
          dailyFreeCount: user.dailyFreeCount
        }
      })
    }
    
    // 消耗额度
    const quotaResult = user.useQuota()
    await user.save()
    
    // 抽牌
    const cards = tarotService.drawCards(spreadType)
    
    // AI解读
    let interpretation = ''
    let freeInterpretation = ''
    
    if (spreadType === 'single') {
      // 单张牌免费完整解读
      const aiResult = await aiService.interpretTarot(cards, question)
      interpretation = aiResult.interpretation
      freeInterpretation = aiResult.summary
    } else {
      // 多张牌需要付费解锁详细解读
      freeInterpretation = '牌面显示，你正处在一个重要的转折点。详细解读将为你分析每张牌的具体含义...'
    }
    
    // 更新统计
    user.stats.tarotCount += 1
    await user.save()
    
    // 保存记录
    const reading = await TarotReading.create({
      userId,
      spreadType,
      question,
      cards,
      interpretation: interpretation || '付费后可见',
      freeInterpretation,
      isPaid: spreadType === 'single', // 单张牌默认已付费
      usedQuota: quotaResult.used
    })
    
    res.json({
      code: 200,
      message: '抽牌成功',
      data: {
        readingId: reading._id,
        spreadType,
        question,
        cards,
        freeInterpretation,
        usedQuota: quotaResult.used,
        remaining: quotaResult.remaining,
        paid: {
          isUnlocked: spreadType === 'single',
          preview: '详细解读包含每张牌的深度分析...',
          price: 9.9
        }
      }
    })
  } catch (err) {
    console.error('抽牌失败:', err)
    res.status(500).json({ code: 1003, message: '抽牌失败，请稍后再试' })
  }
})

/**
 * POST /api/tarot/unlock
 * 解锁详细解读（支付）
 */
router.post('/unlock', authMiddleware, async (req, res) => {
  try {
    const { readingId, payMethod = 'wechat' } = req.body
    const userId = req.userId
    
    // 查询reading
    const reading = await TarotReading.findById(readingId)
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
    const order = new Order({
      userId,
      orderNo: 'TAROT' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase(),
      productType: 'tarot',
      productId: readingId,
      productName: '塔罗详细解读',
      originalAmount: 9.9,
      actualAmount: 9.9,
      payMethod,
      payStatus: 'pending'
    })
    
    await order.save()
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: {
        orderId: order._id,
        orderNo: order.orderNo,
        amount: 9.9,
        mockPaySuccess: true // 模拟支付
      }
    })
  } catch (err) {
    console.error('解锁失败:', err)
    res.status(500).json({ code: 1003, message: '解锁失败，请稍后再试' })
  }
})

/**
 * POST /api/tarot/chat
 * AI对话
 */
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { readingId, message } = req.body
    const userId = req.userId
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ code: 1001, message: '请输入消息' })
    }
    
    const reading = await TarotReading.findById(readingId)
    if (!reading) {
      return res.status(404).json({ code: 3002, message: '记录不存在' })
    }
    
    if (reading.userId.toString() !== userId) {
      return res.status(403).json({ code: 2001, message: '无权访问' })
    }
    
    if (!reading.isPaid) {
      return res.status(403).json({ code: 3003, message: '请先解锁详细解读' })
    }
    
    // 构建对话历史
    const messages = [
      {
        role: 'system',
        content: '你是一位专业的塔罗师，正在为用户解读塔罗牌。请保持温暖、专业、有启发性。'
      }
    ]
    
    // 添加历史对话
    if (reading.chatMessages && reading.chatMessages.length > 0) {
      reading.chatMessages.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }
    
    // 添加新消息
    messages.push({
      role: 'user',
      content: message
    })
    
    // 调用AI
    const reply = await aiService.chat(messages)
    
    // 保存对话记录
    reading.chatMessages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    )
    await reading.save()
    
    res.json({
      code: 200,
      message: '回复成功',
      data: {
        reply,
        chatHistory: reading.chatMessages.slice(-10) // 返回最近10条
      }
    })
  } catch (err) {
    console.error('对话失败:', err)
    res.status(500).json({ code: 1003, message: '对话失败，请稍后再试' })
  }
})

/**
 * GET /api/tarot/:id
 * 获取塔罗解读详情
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId
    
    const reading = await TarotReading.findById(id)
    if (!reading) {
      return res.status(404).json({ code: 3002, message: '记录不存在' })
    }
    
    if (reading.userId.toString() !== userId) {
      return res.status(403).json({ code: 2001, message: '无权访问' })
    }
    
    res.json({
      code: 200,
      data: reading
    })
  } catch (err) {
    console.error('获取解读失败:', err)
    res.status(500).json({ code: 1003, message: '获取解读失败' })
  }
})

module.exports = router
