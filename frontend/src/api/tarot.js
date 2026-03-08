import request from '@/utils/request'

export const tarotApi = {
  // 抽取塔罗牌
  draw(data) {
    return request.post('/tarot/draw', data)
  },
  
  // 解锁详细解读
  unlock(readingId) {
    return request.post('/tarot/unlock', { readingId })
  },
  
  // AI对话
  chat(readingId, message) {
    return request.post('/tarot/chat', { readingId, message })
  },
  
  // 获取解读详情
  getReading(id) {
    return request.get(`/tarot/${id}`)
  }
}
