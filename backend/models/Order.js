const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
  orderNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 订单类型
  type: {
    type: String,
    enum: ['tarot', 'zodiac', 'bazi', 'member', 'recharge'],
    required: true
  },
  subType: String,
  
  // 金额信息
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  actualAmount: {
    type: Number,
    required: true
  },
  
  // 支付信息
  payMethod: {
    type: String,
    enum: ['wechat', 'alipay', 'balance'],
    required: true
  },
  payStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payTime: Date,
  transactionId: String,
  
  // 退款信息
  refundStatus: {
    type: String,
    enum: ['none', 'processing', 'refunded', 'failed'],
    default: 'none'
  },
  refundAmount: Number,
  refundTime: Date,
  refundReason: String,
  
  // 关联数据
  resourceId: Schema.Types.ObjectId,
  extra: {
    question: String,
    zodiac: String,
    memberDays: Number
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

// 索引
OrderSchema.index({ orderNo: 1 }, { unique: true })
OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ payStatus: 1, createdAt: -1 })
OrderSchema.index({ transactionId: 1 }, { sparse: true })

// 生成订单号
OrderSchema.statics.generateOrderNo = function() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
  return `ORD${year}${month}${day}${random}`
}

module.exports = mongoose.model('Order', OrderSchema)
