#!/bin/bash

# AI命运守护神 - GitHub推送脚本
# 使用方法：bash push.sh

echo "🦞 AI命运守护神 - 推送到GitHub"
echo "================================"
echo ""

# 进入项目目录
cd /home/wuying/clawd/projects/ai-fortune-h5

# 显示当前状态
echo "📋 当前Git状态："
git status
echo ""

# 显示远程仓库
echo "🌐 远程仓库："
git remote -v
echo ""

# 显示最近提交
echo "📝 最近提交："
git log --oneline -1
echo ""

# 询问用户
echo "⚠️  即将推送代码到GitHub仓库："
echo "   https://github.com/ghlat520/feishui.git"
echo ""
read -p "是否继续？(y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "❌ 已取消推送"
    exit 0
fi

# 推送代码
echo ""
echo "🚀 正在推送..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📊 推送统计："
    echo "   - 文件数：20个"
    echo "   - 代码行：5091行"
    echo "   - 提交ID：c6f5c80"
    echo ""
    echo "🌐 访问仓库："
    echo "   https://github.com/ghlat520/feishui"
    echo ""
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "💡 可能的原因："
    echo "   1. 没有GitHub账号权限"
    echo "   2. 需要配置Personal Access Token"
    echo "   3. 需要配置SSH Key"
    echo ""
    echo "📖 请查看 PUSH_GUIDE.md 获取详细帮助"
    echo ""
fi
