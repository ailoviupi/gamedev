@echo off
REM 手动触发数据更新的脚本 (Windows)

echo 🚀 正在触发 GitHub Actions 工作流...

REM 检查是否安装了 GitHub CLI
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到 GitHub CLI，请先安装
    echo 安装命令: npm install -g gh
    echo 登录命令: gh auth login
    pause
    exit /b 1
)

REM 触发 repository_dispatch 事件
gh workflow run update-data.yml -f force=false

if %errorlevel% equ 0 (
    echo ✅ 工作流已触发！
    echo 请查看 Actions 页面：
    echo https://github.com/ailoviupi/gamedev/actions
) else (
    echo ❌ 触发失败
)

pause