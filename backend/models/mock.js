// 内存数据库（测试用）
const memoryDB = {
  users: new Map(),
  orders: new Map(),
  readings: new Map(),
  zodiacLogs: new Map()
}

// 生成ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Mock模型 - User
const User = {
  async findOne(query) {
    for (const [id, user] of memoryDB.users) {
      if (query.phone && user.phone === query.phone) {
        const result = { ...user, _id: id }
        result.save = async () => result
        result.hasFreeQuota = () => true
        result.useQuota = () => ({ success: true, remaining: 999 })
        result.stats = result.stats || { tarotCount: 0, zodiacCount: 0, baziCount: 0 }
        return result
      }
      if (query._id && id === query._id) {
        const result = { ...user, _id: id }
        result.save = async () => result
        result.hasFreeQuota = () => true
        result.useQuota = () => ({ success: true, remaining: 999 })
        result.stats = result.stats || { tarotCount: 0, zodiacCount: 0, baziCount: 0 }
        return result
      }
    }
    return null
  },
  
  async create(data) {
    const id = generateId()
    const user = {
      ...data,
      createdAt: new Date(),
      isMember: false,
      balance: 0,
      totalSpent: 0,
      tarotCount: 0,
      zodiacCount: 0,
      baziCount: 0,
      dailyFreeCount: 999, // MVP期间：无限制
      lastFreeResetDate: new Date(),
      stats: {
        tarotCount: 0,
        zodiacCount: 0,
        baziCount: 0
      }
    }
    
    memoryDB.users.set(id, user)
    
    const result = { ...user, _id: id }
    result.save = async () => result
    result.hasFreeQuota = () => true
    result.useQuota = () => ({ success: true, remaining: 999 })
    
    return result
  },
  
  async findById(id) {
    const user = memoryDB.users.get(id)
    if (!user) return null
    
    const result = { ...user, _id: id }
    result.save = async () => result
    result.hasFreeQuota = () => true
    result.useQuota = () => ({ success: true, remaining: 999 })
    
    return result
  },
  
  async findByIdAndUpdate(id, update, options = {}) {
    const user = memoryDB.users.get(id)
    if (!user) return null
    
    const updated = { ...user, ...update }
    memoryDB.users.set(id, updated)
    
    const result = { ...updated, _id: id }
    result.save = async () => result
    result.hasFreeQuota = () => true
    result.useQuota = () => ({ success: true, remaining: 999 })
    
    return result
  }
}

// Mock模型 - Order
const Order = {
  generateOrderNo() {
    return 'ORD' + Date.now() + Math.random().toString(36).substring(2, 8)
  },
  
  async create(data) {
    const id = generateId()
    const order = {
      ...data,
      createdAt: new Date(),
      payStatus: 'pending'
    }
    memoryDB.orders.set(id, order)
    return { ...order, _id: id }
  },
  
  async findById(id) {
    const order = memoryDB.orders.get(id)
    return order ? { ...order, _id: id } : null
  },
  
  async findByIdAndUpdate(id, update, options = {}) {
    const order = memoryDB.orders.get(id)
    if (!order) return null
    
    const updated = { ...order, ...update }
    memoryDB.orders.set(id, updated)
    return { ...updated, _id: id }
  }
}

// Mock模型 - TarotReading
const TarotReading = {
  async create(data) {
    const id = generateId()
    const reading = {
      ...data,
      createdAt: new Date(),
      chatMessages: []
    }
    memoryDB.readings.set(id, reading)
    return { ...reading, _id: id }
  },
  
  async findById(id) {
    const reading = memoryDB.readings.get(id)
    if (!reading) return null
    
    const result = { ...reading, _id: id }
    result.save = async () => result
    
    return result
  },
  
  async findByIdAndUpdate(id, update, options = {}) {
    const reading = memoryDB.readings.get(id)
    if (!reading) return null
    
    const updated = { ...reading, ...update }
    memoryDB.readings.set(id, updated)
    return { ...updated, _id: id }
  }
}

// Mock模型 - ZodiacLog
const ZodiacLog = {
  async create(data) {
    const id = generateId()
    const log = {
      ...data,
      createdAt: new Date()
    }
    memoryDB.zodiacLogs.set(id, log)
    return { ...log, _id: id }
  }
}

// Mock模型 - BaziReading
const BaziReading = {
  async create(data) {
    const id = generateId()
    const reading = {
      ...data,
      createdAt: new Date()
    }
    memoryDB.readings.set(id, reading)
    return { ...reading, _id: id }
  },
  
  async findById(id) {
    const reading = memoryDB.readings.get(id)
    return reading ? { ...reading, _id: id } : null
  }
}

module.exports = {
  User,
  Order,
  TarotReading,
  ZodiacLog,
  BaziReading
}
