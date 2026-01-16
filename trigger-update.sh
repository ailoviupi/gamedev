#!/bin/bash
# 手动触发数据更新的脚本

echo "🚀 正在触发 GitHub Actions 工作流..."

# 使用 GitHub CLI 触发 repository_dispatch 事件
gh workflow run update-data.yml -f force=false

if [ $? -eq 0 ]; then
    echo "✅ 工作流已触发！请查看 Actions 页面："
    echo "https://github.com/ailoviupi/gamedev/actions"
else
    echo "❌ 触发失败，请检查 GitHub CLI 是否已安装和登录"
    echo "安装命令: npm install -g gh"
    echo "登录命令: gh auth login"
fi