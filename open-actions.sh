#!/bin/bash
# 直接在浏览器中打开 GitHub Actions 页面触发手动运行

echo "🌐 正在打开 GitHub Actions 页面..."
echo "请点击 'Run workflow' 按钮手动触发更新"

# macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://github.com/ailoviupi/gamedev/actions/workflows/update-data.yml"
# Linux
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "https://github.com/ailoviupi/gamedev/actions/workflows/update-data.yml"
# Windows (Git Bash)
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    start "https://github.com/ailoviupi/gamedev/actions/workflows/update-data.yml"
else
    echo "请手动访问以下链接："
    echo "https://github.com/ailoviupi/gamedev/actions/workflows/update-data.yml"
fi

echo ""
echo "📋 触发步骤："
echo "1. 点击 'Run workflow' 下拉菜单"
echo "2. 点击 'Run workflow' 绿色按钮"
echo "3. 在 'Actions' 标签页查看运行状态"