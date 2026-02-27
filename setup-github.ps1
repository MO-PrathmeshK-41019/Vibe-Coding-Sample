# Quick GitHub Setup Script
# This script automates the GitHub setup process

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SQL Job Monitor - GitHub Setup                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "🔍 Checking if Git is installed..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "📥 Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""

# Navigate to project directory
$projectPath = "d:\Vibe Coding Sample"
Write-Host "📂 Navigating to project directory..." -ForegroundColor Yellow
Set-Location $projectPath
Write-Host "✅ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check if already a Git repository
if (Test-Path ".git") {
    Write-Host "⚠️  This is already a Git repository!" -ForegroundColor Yellow
    $reinit = Read-Host "Do you want to continue? (y/n)"
    if ($reinit -ne "y") {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
} else {
    # Initialize Git repository
    Write-Host "🚀 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized!" -ForegroundColor Green
}

Write-Host ""

# Get GitHub username
Write-Host "👤 Please enter your GitHub username:" -ForegroundColor Cyan
$githubUsername = Read-Host "Username"

if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    Write-Host "❌ Username cannot be empty!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

# Get repository name
Write-Host ""
Write-Host "📦 Please enter repository name (default: sql-job-monitor):" -ForegroundColor Cyan
$repoName = Read-Host "Repository name"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "sql-job-monitor"
}

Write-Host ""
Write-Host "✅ Using repository: $githubUsername/$repoName" -ForegroundColor Green
Write-Host ""

# Add all files
Write-Host "📝 Adding all files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files added!" -ForegroundColor Green
Write-Host ""

# Check status
Write-Host "📊 Git status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Create commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit - SQL Job Monitor PWA with API"
Write-Host "✅ Commit created!" -ForegroundColor Green
Write-Host ""

# Set main branch
Write-Host "🌿 Setting main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch set to main!" -ForegroundColor Green
Write-Host ""

# Add remote
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"
Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
Write-Host "   URL: $remoteUrl" -ForegroundColor Gray

try {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote added!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Remote might already exist, updating..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
    Write-Host "✅ Remote updated!" -ForegroundColor Green
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Ready to Push to GitHub!                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANT: Before pushing, you need to:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create repository on GitHub:" -ForegroundColor White
Write-Host "   🌐 Go to: https://github.com/new" -ForegroundColor Cyan
Write-Host "   📝 Repository name: $repoName" -ForegroundColor Gray
Write-Host "   ✅ Click 'Create repository'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get Personal Access Token (if you don't have one):" -ForegroundColor White
Write-Host "   🔑 Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "   ➕ Generate new token (classic)" -ForegroundColor Gray
Write-Host "   ✅ Select 'repo' scope" -ForegroundColor Gray
Write-Host "   💾 Copy the token (you'll use it as password)" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Have you created the repository on GitHub? (y/n)"

if ($continue -eq "y") {
    Write-Host ""
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  When prompted:" -ForegroundColor Yellow
    Write-Host "   Username: Your GitHub username" -ForegroundColor Gray
    Write-Host "   Password: Your Personal Access Token (NOT your password!)" -ForegroundColor Gray
    Write-Host ""
    
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║     ✅ SUCCESS! Pushed to GitHub!                      ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Your repository: https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
        Write-Host "   1. Enable GitHub Pages in repository Settings → Pages" -ForegroundColor White
        Write-Host "   2. Your site will be at: https://$githubUsername.github.io/$repoName/" -ForegroundColor Cyan
        Write-Host "   3. Deploy API to Render/Railway (see GITHUB-SETUP.md)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Push failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "   • Repository doesn't exist on GitHub" -ForegroundColor White
        Write-Host "   • Wrong credentials" -ForegroundColor White
        Write-Host "   • Using password instead of Personal Access Token" -ForegroundColor White
        Write-Host ""
        Write-Host "📖 See GITHUB-SETUP.md for detailed troubleshooting" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "📝 Setup completed locally. Run this script again after creating the repository." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual push command:" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 For detailed instructions, see: GITHUB-SETUP.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
