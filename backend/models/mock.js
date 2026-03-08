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
      if (query.phone && user.phone === query.phone) return { ...user, _id: id }
      if (query.openid && user.openid === query.openid) return { ...user, _id: id }
      if (query._id && id === query._id) return { ...user, _id: id }
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
      baziCount: 0
    }
    memoryDB.users.set(id, user)
    return { ...user, _id: id }
  },
  
  async findById(id) {
    const user = memoryDB.users.get(id)
    return user ? { ...user, _id: id } : null
  },
  
  async findByIdAndUpdate(id, update, options = {}) {
    const user = memoryDB.users.get(id)
    if (!user) return null
    
    const updated = { ...user, ...update }
    memoryDB.users.set(id, updated)
    return { ...updated, _id: id }
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
  },
  
  async find(query) {
    const results = []
    for (const [id, order] of memoryDB.orders) {
      let match = true
      if (query.userId && order.userId !== query.userId) match = false
      if (query.payStatus && order.payStatus !== query.payStatus) match = false
      if (match) results.push({ ...order, _id: id })
    }
    return results
  },
  
  async countDocuments(query) {
    const results = await this.find(query)
    return results.length
  }
}

// Mock模型 - TarotReading
const TarotReading = {
  async create(data) {
    const id = generateId()
    const reading = {
      ...data,
      createdAt: new Date(),
      isPaid: false
    }
    memoryDB.readings.set(id, reading)
    return { ...reading, _id: id }
  },
  
  async findById(id) {
    const reading = memoryDB.readings.get(id)
    return reading ? { ...reading, _id: id } : null
  },
  
  async find(query) {
    const results = []
    for (const [id, reading] of memoryDB.readings) {
      let match = true
      if (query.userId && reading.userId !== query.userId) match = false
      if (match) results.push({ ...reading, _id: id })
    }
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

// Mock模型 - ZodiacLog
const ZodiacLog = {
  async findOne(query) {
    for (const [id, log] of memoryDB.zodiacLogs) {
      if (query.zodiac && query.date && log.zodiac === query.zodiac && log.date === query.date) {
        return { ...log, _id: id }
      }
    }
    return null
  },
  
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

module.exports = {
  User,
  Order,
  TarotReading,
  ZodiacLog,
  BaziReading: TarotReading, // 复用
  memoryDB
}
