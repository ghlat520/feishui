#!/bin/bash

# AI命运守护神 - 定时任务脚本
# 每5分钟自动检查所有功能

PROJECT_DIR="/home/wuying/clawd/projects/ai-fortune-h5"
LOG_DIR="/tmp/ai-fortune-test"
DATE=$(date '+%Y-%m-%d_%H:%M:%S')

# 创建日志目录
mkdir -p $LOG_DIR

# 日志函数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_DIR/cron.log
}

# 检查并重启服务
check_and_restart() {
  # 检查后端
  BACKEND_PID=$(ps aux | grep "node app.js" | grep -v grep | awk '{print $2}')
  if [ -z "$BACKEND_PID" ]; then
    log "⚠️ 后端未运行，正在重启..."
    cd $PROJECT_DIR/backend && nohup node app.js > /tmp/ai-fortune-backend.log 2>&1 &
    sleep 3
    log "✅ 后端已重启"
  fi
  
  # 检查前端
  FRONTEND_PID=$(ps aux | grep "vite" | grep -v grep | awk '{print $2}')
  if [ -z "$FRONTEND_PID" ]; then
    log "⚠️ 前端未运行，正在重启..."
    cd $PROJECT_DIR/frontend && nohup npm run dev > /tmp/ai-fortune-frontend.log 2>&1 &
    sleep 5
    log "✅ 前端已重启"
  fi
}

# 运行自动化测试
run_tests() {
  cd $PROJECT_DIR
  ./auto-test.sh >> $LOG_DIR/cron.log 2>&1
  
  if [ $? -eq 0 ]; then
    log "✅ 所有测试通过"
  else
    log "❌ 测试失败，请检查日志: $LOG_DIR/test-$DATE.log"
  fi
}

# 主流程
main() {
  log "========================================="
  log "🔄 开始定时检查（每5分钟）"
  log "========================================="
  
  check_and_restart
  run_tests
  
  log "========================================="
  log "✅ 定时检查完成"
  log "========================================="
}

main
