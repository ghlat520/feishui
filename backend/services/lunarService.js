const { Solar, Lunar } = require('lunar-javascript')

class LunarService {
  /**
   * 根据出生日期计算八字
   * @param {Date|String} birthDate - 出生日期
   * @param {String} hour - 出生时辰（子/丑/寅/卯/辰/巳/午/未/申/酉/戌/亥）
   * @returns {Object} 八字信息
   */
  getBazi(birthDate, hour = '子') {
    try {
      const date = new Date(birthDate)
      const solar = Solar.fromDate(date)
      const lunar = solar.getLunar()
      const bazi = lunar.getEightChar()
      
      // 时辰地支映射
      const hourMap = {
        '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
        '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
      }
      
      // 设置时辰
      if (hourMap[hour] !== undefined) {
        const lunarHour = Lunar.fromDate(date)
        lunarHour.setHour(hourMap[hour])
      }
      
      return {
        year: bazi.getYear(),
        month: bazi.getMonth(),
        day: bazi.getDay(),
        hour: bazi.getTime(),
        wuxing: this.getWuxingDistribution(bazi),
        shengxiao: lunar.getYearShengXiao(),
        nayin: bazi.getYearNaYin(),
        xingzuo: this.getXingzuo(date)
      }
    } catch (err) {
      console.error('八字计算失败:', err)
      throw new Error('八字计算失败')
    }
  }
  
  /**
   * 获取五行分布
   */
  getWuxingDistribution(bazi) {
    const wuxing = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 }
    
    // 统计四柱五行
    const pillars = [
      bazi.getYearGanWuXing(),
      bazi.getYearZhiWuXing(),
      bazi.getMonthGanWuXing(),
      bazi.getMonthZhiWuXing(),
      bazi.getDayGanWuXing(),
      bazi.getDayZhiWuXing(),
      bazi.getTimeGanWuXing(),
      bazi.getTimeZhiWuXing()
    ]
    
    pillars.forEach(wx => {
      if (wx in wuxing) {
        wuxing[wx]++
      }
    })
    
    return wuxing
  }
  
  /**
   * 根据日期获取星座
   */
  getXingzuo(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const xingzuoMap = [
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
    
    for (let xz of xingzuoMap) {
      if (
        (month === xz.start[0] && day >= xz.start[1]) ||
        (month === xz.end[0] && day <= xz.end[1])
      ) {
        return xz.name
      }
    }
    
    return '摩羯座'
  }
  
  /**
   * 获取每日宜忌
   */
  getDailyYiJi(date = new Date()) {
    try {
      const solar = Solar.fromDate(new Date(date))
      const lunar = solar.getLunar()
      
      return {
        date: solar.toString(),
        lunarDate: lunar.toString(),
        yi: lunar.getDayYi() || [],
        ji: lunar.getDayJi() || [],
        chong: lunar.getDayChong(),
        sha: lunar.getDaySha()
      }
    } catch (err) {
      console.error('获取宜忌失败:', err)
      return { yi: [], ji: [] }
    }
  }
  
  /**
   * 获取吉神方位
   */
  getLuckyDirections(date = new Date()) {
    try {
      const solar = Solar.fromDate(new Date(date))
      const lunar = solar.getLunar()
      
      return {
        caishen: lunar.getDayCaishen(),      // 财神
        xishen: lunar.getDayXishen(),        // 喜神
        fushen: lunar.getDayFushen(),        // 福神
        yangguishen: lunar.getDayYangguishen(), // 阳贵神
        yinguishen: lunar.getDayYinguishen()   // 阴贵神
      }
    } catch (err) {
      console.error('获取吉神方位失败:', err)
      return {}
    }
  }
}

module.exports = new LunarService()
