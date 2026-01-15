@echo off
chcp 65001 >nul
echo ========================================
echo    三角洲改枪码网页 - 部署脚本
echo ========================================
echo.

REM 检查是否安装了 git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git，请先安装 Git
    echo 下载地址: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/6] 正在初始化 Git 仓库...
if not exist ".git" (
    git init
    echo 完成！
) else (
    仓库已存在
)

echo.
echo [2/6] 配置用户信息（如果尚未配置）
git config user.name "ailoviupi" 2>nul || echo 用户名已配置
git config user.email "ailoviupi@github.com" 2>nul || echo 邮箱已配置

echo.
echo [3/6] 添加所有文件到暂存区...
git add -A

echo.
echo [4/6] 提交更改...
set /p commit_msg="请输入提交信息（直接回车使用默认信息）: "
if "%commit_msg%"=="" set commit_msg=feat: 更新三角洲改枪码网页 - %date:~0,10%
git commit -m "%commit_msg%"

echo.
echo [5/6] 添加远程仓库...
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    git remote add origin https://github.com/ailoviupi/gamedev.git
    echo 完成！
) else (
    远程仓库已配置
)

echo.
echo [6/6] 推送到 GitHub...
echo 注意: 如果是首次推送，可能需要输入 GitHub 凭据
git push -u origin main

echo.
echo ========================================
echo    部署完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 访问 https://github.com/ailoviupi/gamedev
echo 2. 进入 Settings -> Pages
echo 3. 在 Source 中选择 "main" branch
echo 4. 点击 Save
echo 5. 等待 1-2 分钟，网页将自动部署
echo.
echo 部署后的访问地址：
echo https://ailoviupi.github.io/gamedev/
echo.
pause
