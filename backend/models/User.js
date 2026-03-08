const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^1[3-9]\d{9}$/
  },
  nickname: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  gender: {
    type: Number,
    enum: [1, 2], // 1-男，2-女
    default: 1
  },
  zodiac: {
    type: String,
    default: ''
  },
  birthDate: {
    type: String,
    default: ''
  },
  birthTime: {
    type: String,
    default: ''
  },
  
  // 每日免费额度（MVP期间设置为999，实际无限制）
  dailyFreeCount: {
    type: Number,
    default: 999 // MVP期间：无限制
  },
  lastFreeResetDate: {
    type: Date,
    default: () => new Date() // 上次重置日期
  },
  
  // 会员信息
  isMember: {
    type: Boolean,
    default: false
  },
  memberExpireTime: {
    type: Date,
    default: null
  },
  
  // 统计数据
  stats: {
    tarotCount: { type: Number, default: 0 },
    zodiacCount: { type: Number, default: 0 },
    baziCount: { type: Number, default: 0 }
  },
  
  // 分享记录
  lastShareDate: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: () => new Date()
  },
  updatedAt: {
    type: Date,
    default: () => new Date()
  }
})

// 重置每日免费额度
userSchema.methods.resetDailyFreeCount = function() {
  const today = new Date()
  const lastReset = new Date(this.lastFreeResetDate)
  
  // 如果不是同一天，重置免费额度
  if (today.toDateString() !== lastReset.toDateString()) {
    this.dailyFreeCount = 3
    this.lastFreeResetDate = today
    return true
  }
  
  return false
}

// 检查是否有免费额度（MVP期间：始终返回true）
userSchema.methods.hasFreeQuota = function() {
  return true // MVP期间：无限制
}

// 消耗免费额度
userSchema.methods.useQuota = function() {
  this.resetDailyFreeCount()
  
  if (this.dailyFreeCount > 0) {
    this.dailyFreeCount -= 1
    return { success: true, remaining: this.dailyFreeCount }
  }
  
  return { success: false, remaining: 0 }
}

// 增加免费额度（分享奖励）
userSchema.methods.addFreeQuota = function(count = 1) {
  this.dailyFreeCount += count
  return this.dailyFreeCount
}

// 设置会员
userSchema.methods.setMember = function(days) {
  const now = new Date()
  
  // 如果已经是会员，延长有效期
  if (this.isMember && this.memberExpireTime > now) {
    this.memberExpireTime = new Date(this.memberExpireTime.getTime() + days * 24 * 60 * 60 * 1000)
  } else {
    // 新会员
    this.isMember = true
    this.memberExpireTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  }
  
  return this.memberExpireTime
}

module.exports = mongoose.model('User', userSchema)
