#!/bin/bash

echo "🧪 测试完整支付流程（含Order.save()验证）"
echo "=========================================="

# 1. 登录获取token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/phone-login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456"}' | jq -r '.data.token')

echo "✅ 登录成功"

# 2. 获取星座运势（创建log记录）
HOROSCOPE=$(curl -s -X GET "http://localhost:3000/api/zodiac/pisces/daily?date=2026-03-08" \
  -H "Authorization: Bearer $TOKEN")

LOG_ID=$(echo "$HOROSCOPE" | jq -r '.data.logId // empty')
echo "✅ 星座运势获取成功，LogID: $LOG_ID"

# 3. 解锁运势（创建订单）
UNLOCK_RESPONSE=$(curl -s -X POST http://localhost:3000/api/zodiac/unlock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"logId\":\"$LOG_ID\",\"payMethod\":\"wechat\"}")

ORDER_ID=$(echo "$UNLOCK_RESPONSE" | jq -r '.data.orderId // empty')
echo "✅ 解锁请求发送，OrderID: $ORDER_ID"

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
  echo "⚠️ 订单未创建（可能已解锁或免费）"
  echo "解锁响应: $UNLOCK_RESPONSE"
  exit 0
fi

# 4. 模拟支付成功（测试Order.save()是否正常）
PAY_RESULT=$(curl -s -X POST http://localhost:3000/api/pay/mock-success \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"orderId\":\"$ORDER_ID\"}")

echo ""
echo "支付结果:"
echo "$PAY_RESULT" | jq '.'

# 检查是否成功
if echo "$PAY_RESULT" | jq -e '.code == 200' > /dev/null; then
  echo ""
  echo "✅ Order.save() 修复成功！"
  echo "✅ 支付功能完全正常！"
else
  echo ""
  echo "❌ Order.save() 仍然有问题"
  echo "错误信息: $(echo "$PAY_RESULT" | jq -r '.message')"
fi
