#!/bin/bash

# AI命运守护神 - Cron自动化测试脚本
# 用途：定时检查服务健康状态
# 频率：每5分钟执行一次

PROJECT_DIR="/home/wuying/clawd/projects/ai-fortune-h5/backend"
LOG_FILE="/home/wuying/clawd/projects/ai-fortune-h5/logs/auto-test.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$TIMESTAMP] 🔍 开始自动化健康检查..." >> "$LOG_FILE"

# 1. 检查后端服务
echo "[$TIMESTAMP] 1️⃣ 检查后端服务..." >> "$LOG_FILE"
HEALTH_CHECK=$(curl -s http://localhost:3000/health 2>&1)

if echo "$HEALTH_CHECK" | grep -q '"status":"ok"'; then
  echo "[$TIMESTAMP] ✅ 后端服务正常" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ❌ 后端服务异常：$HEALTH_CHECK" >> "$LOG_FILE"
  # 尝试重启服务
  cd "$PROJECT_DIR" && nohup node app.js > /dev/null 2>&1 &
  echo "[$TIMESTAMP] 🔄 已尝试重启服务" >> "$LOG_FILE"
fi

# 2. 检查前端服务
echo "[$TIMESTAMP] 2️⃣ 检查前端服务..." >> "$LOG_FILE"
FRONTEND_CHECK=$(ps aux | grep -E "vite.*ai-fortune" | grep -v grep)

if [ -n "$FRONTEND_CHECK" ]; then
  echo "[$TIMESTAMP] ✅ 前端服务正常" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ⚠️  前端服务未运行" >> "$LOG_FILE"
fi

# 3. 快速API测试（仅测试关键接口）
echo "[$TIMESTAMP] 3️⃣ 快速API测试..." >> "$LOG_FILE"

# 测试星座运势API
ZODIAC_TEST=$(curl -s http://localhost:3000/api/zodiac/aries/daily 2>&1)
if echo "$ZODIAC_TEST" | grep -q '"code":200'; then
  echo "[$TIMESTAMP] ✅ 星座运势API正常" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ❌ 星座运势API异常" >> "$LOG_FILE"
fi

echo "[$TIMESTAMP] 🎯 健康检查完成" >> "$LOG_FILE"
echo "----------------------------------------" >> "$LOG_FILE"

# 如果发现异常，发送飞书通知（可选）
# 需要配置飞书webhook
