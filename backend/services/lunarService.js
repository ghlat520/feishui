/**
 * 八字服务（简化版 - MVP）
 */
class LunarService {
  /**
   * 获取八字信息
   */
  getBazi(birthDate, birthTime) {
    try {
      const date = new Date(birthDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = parseInt(birthTime.split(':')[0]) || 12
      
      // 简化版：天干地支
      const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
      const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
      
      const yearGan = tianGan[(year - 4) % 10]
      const yearZhi = diZhi[(year - 4) % 12]
      const monthGan = tianGan[(year * 12 + month + 13) % 10]
      const monthZhi = diZhi[(month + 1) % 12]
      const dayGan = tianGan[(year * 365 + month * 30 + day + 6) % 10]
      const dayZhi = diZhi[(year * 365 + month * 30 + day + 2) % 12]
      const hourGan = tianGan[(day * 12 + hour + 1) % 10]
      const hourZhi = diZhi[Math.floor(hour / 2) % 12]
      
      // 五行
      const wuXing = {
        wood: ['甲', '乙', '寅', '卯'].filter(c => 
          [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi].includes(c)
        ).length,
        fire: ['丙', '丁', '巳', '午'].filter(c => 
          [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi].includes(c)
        ).length,
        earth: ['戊', '己', '辰', '戌', '丑', '未'].filter(c => 
          [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi].includes(c)
        ).length,
        metal: ['庚', '辛', '申', '酉'].filter(c => 
          [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi].includes(c)
        ).length,
        water: ['壬', '癸', '亥', '子'].filter(c => 
          [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi].includes(c)
        ).length
      }
      
      // 生肖
      const shengXiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'][(year - 4) % 12]
      
      // 星座
      const xingZuo = this.getZodiacSign(month, day)
      
      return {
        bazi: {
          year: { gan: yearGan, zhi: yearZhi },
          month: { gan: monthGan, zhi: monthZhi },
          day: { gan: dayGan, zhi: dayZhi },
          hour: { gan: hourGan, zhi: hourZhi }
        },
        wuxing: wuXing,
        shengxiao: shengXiao,
        xingzuo: xingZuo,
        nayin: '海中金' // 简化
      }
    } catch (err) {
      console.error('八字计算失败:', err)
      throw new Error('八字计算失败')
    }
  }
  
  /**
   * 获取星座
   */
  getZodiacSign(month, day) {
    const signs = [
      { name: '摩羯座', start: [1, 1], end: [1, 19] },
      { name: '水瓶座', start: [1, 20], end: [2, 18] },
      { name: '双鱼座', start: [2, 19], end: [3, 20] },
      { name: '白羊座', start: [3, 21], end: [4, 19] },
      { name: '金牛座', start: [4, 20], end: [5, 20] },
      { name: '双子座', start: [5, 21], end: [6, 21] },
      { name: '巨蟹座', start: [6, 22], end: [7, 22] },
      { name: '狮子座', start: [7, 23], end: [8, 22] },
      { name: '处女座', start: [8, 23], end: [9, 22] },
      { name: '天秤座', start: [9, 23], end: [10, 23] },
      { name: '天蝎座', start: [10, 24], end: [11, 22] },
      { name: '射手座', start: [11, 23], end: [12, 21] },
      { name: '摩羯座', start: [12, 22], end: [12, 31] }
    ]
    
    for (const sign of signs) {
      if (
        (month === sign.start[0] && day >= sign.start[1]) ||
        (month === sign.end[0] && day <= sign.end[1])
      ) {
        return sign.name
      }
    }
    
    return '摩羯座'
  }
}

module.exports = new LunarService()
