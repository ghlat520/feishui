import request from '@/utils/request'

export const tarotApi = {
  // 抽取塔罗牌
  draw(data) {
    return request.post('/tarot/draw', data)
  },
  
  // 获取解读详情
  getReading(id) {
    return request.get(`/tarot/${id}`)
  },
  
  // 解锁详细解读
  unlock(readingId, payMethod = 'wechat') {
    return request.post('/tarot/unlock', { readingId, payMethod })
  },
  
  // AI对话
  chat(readingId, message) {
    return request.post('/tarot/chat', { readingId, message })
  }
}
