const express = require('express')
const router = express.Router()
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

/**
 * POST /api/share/reward
 * 分享奖励（增加免费额度）
 */
router.post('/reward', authMiddleware, async (req, res) => {
  try {
    const { platform = 'wechat' } = req.body
    const userId = req.userId
    
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ code: 1002, message: '用户不存在' })
    }
    
    // 检查今天是否已经分享过
    const today = new Date().toDateString()
    const lastShare = user.lastShareDate ? new Date(user.lastShareDate).toDateString() : null
    
    if (lastShare === today) {
      return res.status(400).json({ 
        code: 4001, 
        message: '今天已经分享过了，明天再来吧！' 
      })
    }
    
    // 增加免费额度
    user.addFreeQuota(1)
    user.lastShareDate = new Date()
    await user.save()
    
    res.json({
      code: 200,
      message: '分享成功，获得1次免费占卜机会！',
      data: {
        dailyFreeCount: user.dailyFreeCount
      }
    })
  } catch (err) {
    console.error('分享奖励失败:', err)
    res.status(500).json({ code: 1003, message: '分享奖励失败' })
  }
})

/**
 * GET /api/share/check
 * 检查今天是否已分享
 */
router.get('/check', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).json({ code: 1002, message: '用户不存在' })
    }
    
    const today = new Date().toDateString()
    const lastShare = user.lastShareDate ? new Date(user.lastShareDate).toDateString() : null
    const hasShared = lastShare === today
    
    res.json({
      code: 200,
      data: {
        hasShared,
        lastShareDate: user.lastShareDate
      }
    })
  } catch (err) {
    console.error('检查分享状态失败:', err)
    res.status(500).json({ code: 1003, message: '检查分享状态失败' })
  }
})

module.exports = router
