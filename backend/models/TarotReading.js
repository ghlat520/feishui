const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TarotReadingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 占卜信息
  spreadType: {
    type: String,
    enum: ['single', 'three', 'celtic'],
    required: true
  },
  question: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  // 牌面信息
  cards: [{
    name: {
      type: String,
      required: true
    },
    nameZh: String,
    arcana: {
      type: String,
      enum: ['major', 'minor']
    },
    suit: String,
    number: Number,
    isReversed: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      required: true
    },
    imageUrl: String,
    keyword: String
  }],
  
  // 解读内容
  interpretation: {
    type: String,
    required: true
  },
  freeInterpretation: {
    type: String,
    required: true
  },
  summary: String,
  
  // 付费信息
  isPaid: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // 对话记录
  chatMessages: [{
    role: {
      type: String,
      enum: ['user', 'assistant']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 元数据
  isPublic: {
    type: Boolean,
    default: false
  },
  shareCode: String,
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'createdAt' }
})

// 索引
TarotReadingSchema.index({ userId: 1, createdAt: -1 })
TarotReadingSchema.index({ shareCode: 1 }, { sparse: true, unique: true })
TarotReadingSchema.index({ isPublic: 1, createdAt: -1 })

module.exports = mongoose.model('TarotReading', TarotReadingSchema)
