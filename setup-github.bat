@echo off
:: Quick GitHub Setup - Batch File Version

echo.
echo ========================================================
echo      SQL Job Monitor - GitHub Setup
echo ========================================================
echo.

cd /d "d:\Vibe Coding Sample"

:: Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    echo.
    pause
    exit /b
)

echo [OK] Git is installed
echo.

:: Initialize Git if not already done
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    echo [OK] Git initialized!
) else (
    echo [INFO] Git repository already exists
)

echo.

:: Get GitHub username
set /p GITHUB_USER="Enter your GitHub username: "

if "%GITHUB_USER%"=="" (
    echo [ERROR] Username cannot be empty!
    pause
    exit /b
)

:: Get repository name
set /p REPO_NAME="Enter repository name (default: sql-job-monitor): "

if "%REPO_NAME%"=="" (
    set REPO_NAME=sql-job-monitor
)

echo.
echo [INFO] Repository: %GITHUB_USER%/%REPO_NAME%
echo.

:: Add files
echo [INFO] Adding files to Git...
git add .
echo [OK] Files added!
echo.

:: Create commit
echo [INFO] Creating commit...
git commit -m "Initial commit - SQL Job Monitor PWA with API"
echo [OK] Commit created!
echo.

:: Set branch
echo [INFO] Setting main branch...
git branch -M main
echo [OK] Branch set!
echo.

:: Add remote
echo [INFO] Adding remote...
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git 2>nul
if %errorlevel% neq 0 (
    git remote set-url origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
)
echo [OK] Remote configured!
echo.

echo ========================================================
echo      Ready to Push!
echo ========================================================
echo.
echo IMPORTANT: Before continuing, you need to:
echo.
echo 1. Create repository on GitHub:
echo    - Go to: https://github.com/new
echo    - Name: %REPO_NAME%
echo    - Click "Create repository"
echo.
echo 2. Get Personal Access Token:
echo    - Go to: https://github.com/settings/tokens
echo    - Generate new token (classic)
echo    - Select "repo" scope
echo    - Copy the token
echo.

set /p CONTINUE="Have you created the repository? (y/n): "

if /i "%CONTINUE%"=="y" (
    echo.
    echo [INFO] Pushing to GitHub...
    echo.
    echo When prompted:
    echo   Username: %GITHUB_USER%
    echo   Password: Your Personal Access Token
    echo.
    git push -u origin main
    
    echo.
    echo ========================================================
    echo      Push Complete!
    echo ========================================================
    echo.
    echo Your repository: https://github.com/%GITHUB_USER%/%REPO_NAME%
    echo.
    echo Next Steps:
    echo   1. Enable GitHub Pages in Settings
    echo   2. Deploy API to Render/Railway
    echo   3. Update frontend config with API URL
    echo.
) else (
    echo.
    echo [INFO] Setup completed locally
    echo Run this script again after creating the repository
    echo.
    echo Manual push: git push -u origin main
    echo.
)

echo See GITHUB-SETUP.md for detailed instructions
echo.
pause
