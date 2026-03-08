const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  openid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  unionid: String,
  phone: {
    type: String,
    sparse: true,
    unique: true
  },
  nickname: {
    type: String,
    default: '神秘用户'
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  gender: {
    type: Number,
    enum: [0, 1, 2],
    default: 0
  },
  zodiac: {
    type: String,
    enum: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
           'libra', 'scorpio', 'sagittarius', 'capricorn', 
           'aquarius', 'pisces']
  },
  birthDate: Date,
  birthTime: String,
  birthPlace: String,
  
  // 会员信息
  isMember: {
    type: Boolean,
    default: false
  },
  memberLevel: {
    type: Number,
    default: 0
  },
  memberExpireAt: Date,
  
  // 账户信息
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 统计信息
  tarotCount: {
    type: Number,
    default: 0
  },
  zodiacCount: {
    type: Number,
    default: 0
  },
  baziCount: {
    type: Number,
    default: 0
  },
  
  // 设备信息
  lastLoginAt: Date,
  lastLoginIp: String,
  deviceInfo: {
    platform: String,
    model: String,
    osVersion: String,
    appVersion: String
  },
  
  // 元数据
  status: {
    type: String,
    enum: ['active', 'banned', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

// 索引
UserSchema.index({ openid: 1 }, { unique: true })
UserSchema.index({ phone: 1 }, { sparse: true, unique: true })
UserSchema.index({ createdAt: -1 })
UserSchema.index({ lastLoginAt: -1 })

module.exports = mongoose.model('User', UserSchema)
