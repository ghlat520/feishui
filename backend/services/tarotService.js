/**
 * 塔罗牌服务
 */
class TarotService {
  constructor() {
    // 78张塔罗牌定义
    this.majorArcana = [
      { name: 'The Fool', nameZh: '愚者', number: 0, keyword: '新开始、冒险、纯真' },
      { name: 'The Magician', nameZh: '魔术师', number: 1, keyword: '创造力、技能、意志力' },
      { name: 'The High Priestess', nameZh: '女祭司', number: 2, keyword: '直觉、神秘、潜意识' },
      { name: 'The Empress', nameZh: '女皇', number: 3, keyword: '丰饶、母性、创造' },
      { name: 'The Emperor', nameZh: '皇帝', number: 4, keyword: '权威、结构、控制' },
      { name: 'The Hierophant', nameZh: '教皇', number: 5, keyword: '传统、信仰、教育' },
      { name: 'The Lovers', nameZh: '恋人', number: 6, keyword: '选择、诱惑、价值观' },
      { name: 'The Chariot', nameZh: '战车', number: 7, keyword: '意志、胜利、决心' },
      { name: 'Strength', nameZh: '力量', number: 8, keyword: '勇气、耐心、控制' },
      { name: 'The Hermit', nameZh: '隐士', number: 9, keyword: '内省、寻求、指引' },
      { name: 'Wheel of Fortune', nameZh: '命运之轮', number: 10, keyword: '变化、循环、命运' },
      { name: 'Justice', nameZh: '正义', number: 11, keyword: '公正、真理、因果' },
      { name: 'The Hanged Man', nameZh: '倒吊人', number: 12, keyword: '牺牲、等待、新视角' },
      { name: 'Death', nameZh: '死神', number: 13, keyword: '结束、转变、重生' },
      { name: 'Temperance', nameZh: '节制', number: 14, keyword: '平衡、耐心、调和' },
      { name: 'The Devil', nameZh: '恶魔', number: 15, keyword: '束缚、诱惑、物质' },
      { name: 'The Tower', nameZh: '塔', number: 16, keyword: '突变、灾难、觉醒' },
      { name: 'The Star', nameZh: '星星', number: 17, keyword: '希望、灵感、平静' },
      { name: 'The Moon', nameZh: '月亮', number: 18, keyword: '幻觉、恐惧、潜意识' },
      { name: 'The Sun', nameZh: '太阳', number: 19, keyword: '成功、快乐、活力' },
      { name: 'Judgement', nameZh: '审判', number: 20, keyword: '觉醒、重生、召唤' },
      { name: 'The World', nameZh: '世界', number: 21, keyword: '完成、整合、成就' }
    ]
    
    this.minorArcana = this.generateMinorArcana()
  }
  
  /**
   * 生成小阿卡纳牌（56张）
   */
  generateMinorArcana() {
    const suits = [
      { name: 'Wands', nameZh: '权杖', element: '火' },
      { name: 'Cups', nameZh: '圣杯', element: '水' },
      { name: 'Swords', nameZh: '宝剑', element: '风' },
      { name: 'Pentacles', nameZh: '钱币', element: '土' }
    ]
    
    const cards = []
    const ranks = [
      { number: 1, name: 'Ace' },
      { number: 2, name: 'Two' },
      { number: 3, name: 'Three' },
      { number: 4, name: 'Four' },
      { number: 5, name: 'Five' },
      { number: 6, name: 'Six' },
      { number: 7, name: 'Seven' },
      { number: 8, name: 'Eight' },
      { number: 9, name: 'Nine' },
      { number: 10, name: 'Ten' },
      { number: 11, name: 'Page' },
      { number: 12, name: 'Knight' },
      { number: 13, name: 'Queen' },
      { number: 14, name: 'King' }
    ]
    
    suits.forEach(suit => {
      ranks.forEach(rank => {
        cards.push({
          name: `${rank.name} of ${suit.name}`,
          nameZh: `${suit.nameZh}${rank.number <= 10 ? rank.number : rank.name}`,
          arcana: 'minor',
          suit: suit.name,
          number: rank.number,
          keyword: this.getMinorKeyword(suit.element, rank.number)
        })
      })
    })
    
    return cards
  }
  
  /**
   * 获取小阿卡纳关键词
   */
  getMinorKeyword(element, number) {
    const keywords = {
      '火': ['激情', '行动', '创造', '挑战', '冲突', '胜利', '进展', '速度', '力量', '负担', '信使', '行动', '领导', '掌控'],
      '水': ['情感', '平衡', '喜悦', '稳定', '失落', '回忆', '选择', '离开', '满足', '幸福', '学习', '行动', '直觉', '掌控'],
      '风': ['理智', '平衡', '悲伤', '稳定', '失败', '科学', '欺骗', '束缚', '绝望', '痛苦', '思考', '行动', '公正', '掌控'],
      '土': ['机会', '平衡', '合作', '稳定', '损失', '慷慨', '犹豫', '学习', '独立', '财富', '学习', '行动', '务实', '掌控']
    }
    
    return keywords[element][number - 1] || '未知'
  }
  
  /**
   * 随机抽取塔罗牌
   * @param {String} spreadType - 牌阵类型：single/three/celtic
   */
  drawCards(spreadType = 'single') {
    const allCards = [...this.majorArcana, ...this.minorArcana]
    const drawCount = {
      'single': 1,
      'three': 3,
      'celtic': 10
    }
    
    const count = drawCount[spreadType] || 1
    const positions = this.getPositions(spreadType)
    
    // 随机抽取（不重复）
    const shuffled = allCards.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)
    
    // 添加位置和逆位信息
    return selected.map((card, index) => ({
      ...card,
      isReversed: Math.random() < 0.3, // 30%概率逆位
      position: positions[index] || `位置${index + 1}`
    }))
  }
  
  /**
   * 获取位置名称
   */
  getPositions(spreadType) {
    const positions = {
      'single': ['当前'],
      'three': ['past', 'present', 'future'],
      'celtic': [
        'present', 'challenge', 'past', 'future', 'above', 
        'below', 'advice', 'environment', 'hopes', 'outcome'
      ]
    }
    
    return positions[spreadType] || ['当前']
  }
  
  /**
   * 获取牌的信息
   * @param {String} cardName - 牌名
   */
  getCardInfo(cardName) {
    const allCards = [...this.majorArcana, ...this.minorArcana]
    return allCards.find(c => c.name === cardName)
  }
  
  /**
   * 计算价格
   */
  getPrice(spreadType) {
    const prices = {
      'single': 0,       // 免费
      'three': 990,      // 9.9元
      'celtic': 4990     // 49.9元
    }
    
    return prices[spreadType] || 0
  }
}

module.exports = new TarotService()
