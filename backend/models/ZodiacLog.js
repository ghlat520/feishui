const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ZodiacLogSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  zodiac: {
    type: String,
    required: true,
    enum: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
           'libra', 'scorpio', 'sagittarius', 'capricorn', 
           'aquarius', 'pisces']
  },
  
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  date: {
    type: String,
    required: true
  },
  
  scores: {
    love: { type: Number, min: 1, max: 5 },
    career: { type: Number, min: 1, max: 5 },
    money: { type: Number, min: 1, max: 5 },
    health: { type: Number, min: 1, max: 5 }
  },
  
  summary: { type: String, required: true },
  detail: {
    love: String,
    career: String,
    money: String
  },
  advice: [String],
  
  isPaid: { type: Boolean, default: false },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' }
}, {
  timestamps: { createdAt: 'createdAt' }
})

ZodiacLogSchema.index({ zodiac: 1, date: 1 })
ZodiacLogSchema.index({ userId: 1, zodiac: 1, date: 1 }, { sparse: true })

module.exports = mongoose.model('ZodiacLog', ZodiacLogSchema)
