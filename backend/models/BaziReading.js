const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BaziReadingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  birthDate: { type: Date, required: true },
  birthTime: { type: String, required: true },
  birthPlace: String,
  gender: { type: Number, enum: [1, 2] },
  
  bazi: {
    year: String,
    month: String,
    day: String,
    hour: String
  },
  
  wuxing: {
    金: Number,
    木: Number,
    水: Number,
    火: Number,
    土: Number
  },
  
  shengxiao: String,
  nayin: String,
  xingzuo: String,
  
  character: { type: String, required: true },
  career: String,
  wealth: String,
  marriage: String,
  health: String,
  
  advice: {
    colors: [String],
    numbers: [Number],
    directions: [String],
    stones: [String],
    career: [String]
  },
  
  isPaid: { type: Boolean, default: false },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' }
}, {
  timestamps: { createdAt: 'createdAt' }
})

BaziReadingSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('BaziReading', BaziReadingSchema)
