# 🚀 Push to GitHub - Step-by-Step Guide

## Prerequisites
- ✅ GitHub account ([Sign up here](https://github.com/join) if needed)
- ✅ Git installed on your computer ([Download here](https://git-scm.com/downloads))

---

## 📋 Quick Steps (Copy & Paste)

### Step 1: Open PowerShell in Your Project Folder

```powershell
cd "d:\Vibe Coding Sample"
```

### Step 2: Initialize Git Repository

```powershell
git init
```

### Step 3: Add All Files

```powershell
git add .
```

### Step 4: Create Initial Commit

```powershell
git commit -m "Initial commit - SQL Job Monitor PWA with API"
```

### Step 5: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `sql-job-monitor`
3. Description: `Progressive Web App for monitoring SQL Server Agent Jobs`
4. Choose **Public** or **Private**
5. **DO NOT** check "Add a README file" (we already have one)
6. Click **"Create repository"**

### Step 6: Connect to GitHub

**Replace `YOUR-USERNAME` with your actual GitHub username:**

```powershell
git remote add origin https://github.com/YOUR-USERNAME/sql-job-monitor.git
```

### Step 7: Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

### Step 8: Enter Credentials

When prompted:
- Enter your GitHub username
- Enter your GitHub Personal Access Token (not password!)

**Don't have a token?** Follow instructions below to create one.

---

## 🔑 Create GitHub Personal Access Token

Since GitHub no longer accepts passwords for Git operations, you need a Personal Access Token:

### Quick Steps:

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `SQL Job Monitor`
4. Select scopes:
   - ✅ **repo** (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing to Git

**Save the token somewhere safe!**

---

## 📦 What Will Be Pushed

Your repository will contain:

```
sql-job-monitor/
├── Frontend (PWA)
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── css/styles.css
│   ├── js/ (4 JavaScript files)
│   └── assets/icons/
│
├── Backend (API)
│   └── api-server/
│       ├── server.js
│       ├── package.json
│       ├── test-connection.js
│       ├── sql-setup.sql
│       └── .env.example (safe to commit)
│
└── Documentation
    ├── README.md
    ├── DEPLOYMENT.md
    ├── QUICK-START.md
    ├── API-BACKEND-GUIDE.md
    └── and more...
```

**Note:** Your `.env` file with credentials will **NOT** be pushed (it's in `.gitignore`)

---

## 🔒 Security Check

Before pushing, verify these files are **NOT** included:

- ❌ `.env` (contains passwords)
- ❌ `node_modules/` (large dependencies)
- ❌ Any files with credentials

These are automatically excluded by `.gitignore` files I created.

---

## 🌐 Enable GitHub Pages (Deploy Frontend)

After pushing your code:

### Step 1: Go to Repository Settings

1. Go to your repository: `https://github.com/YOUR-USERNAME/sql-job-monitor`
2. Click **"Settings"** tab
3. Scroll down and click **"Pages"** in left sidebar

### Step 2: Configure Source

1. Under **"Source"**, select:
   - Branch: **main**
   - Folder: **/ (root)**
2. Click **"Save"**

### Step 3: Wait for Deployment

- GitHub Pages will build your site (1-2 minutes)
- Your site will be available at:
  ```
  https://YOUR-USERNAME.github.io/sql-job-monitor/
  ```

### Step 4: Update Frontend Config

Since GitHub Pages serves from a subdirectory, update your config:

Edit `js/config.js`:
```javascript
// If using mock data, no changes needed

// If using real API, update:
api: {
    baseUrl: 'https://your-api-url.com',  // Your deployed API
    // ...
}
```

---

## 🔄 Making Updates Later

After making changes to your code:

```powershell
# 1. Check what changed
git status

# 2. Add changes
git add .

# 3. Commit with message
git commit -m "Description of changes"

# 4. Push to GitHub
git push

# GitHub Pages will automatically update in 1-2 minutes
```

---

## 🚀 Deploy API Server (Optional)

Your frontend will be on GitHub Pages, but you need to deploy the API separately:

### Option 1: Render (Free, Recommended)

1. **Push API code** (already done above)
2. Go to https://render.com
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - Name: `sql-job-monitor-api`
   - Environment: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `api-server`
6. Add environment variables:
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_SERVER`
   - `DB_ENCRYPT`
   - `DB_TRUST_CERT`
   - `FRONTEND_URL` (your GitHub Pages URL)
7. Click **"Create Web Service"**

Your API will be at: `https://sql-job-monitor-api.onrender.com`

### Option 2: Railway (Free)

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variables (same as above)
6. Deploy!

---

## 📝 Update README with Your Links

After deployment, update your README.md:

```markdown
## 🌐 Live Demo

- **Frontend:** https://YOUR-USERNAME.github.io/sql-job-monitor/
- **API:** https://your-api.onrender.com

## 🚀 Quick Start

Visit the live demo above to see it in action!
```

Commit and push:
```powershell
git add README.md
git commit -m "Update README with live demo links"
git push
```

---

## 🐛 Troubleshooting

### "git: command not found"
**Solution:** Install Git from https://git-scm.com/downloads

### "Permission denied"
**Solution:** Use Personal Access Token (not password). See instructions above.

### "Repository not found"
**Solution:** 
- Verify the repository URL is correct
- Check you have access to the repository
- Use HTTPS URL (not SSH)

### "Failed to push"
**Solution:**
```powershell
# Pull any changes first
git pull origin main --rebase

# Then push again
git push
```

### GitHub Pages Not Working
**Solution:**
- Wait 2-3 minutes after enabling
- Check Settings → Pages for error messages
- Ensure branch is "main" and folder is "/ (root)"
- Hard refresh browser (Ctrl+Shift+R)

---

## ✅ Verification Checklist

After pushing to GitHub:

- [ ] Repository created successfully
- [ ] All files visible on GitHub
- [ ] `.env` file NOT visible (security check)
- [ ] README displays correctly
- [ ] GitHub Pages enabled
- [ ] Frontend accessible via GitHub Pages URL
- [ ] (Optional) API deployed to cloud
- [ ] (Optional) Frontend connected to deployed API

---

## 🎯 Full Command Summary

```powershell
# Navigate to project
cd "d:\Vibe Coding Sample"

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SQL Job Monitor PWA with API"

# Connect to GitHub (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/sql-job-monitor.git

# Push to GitHub
git branch -M main
git push -u origin main

# Future updates
git add .
git commit -m "Your change description"
git push
```

---

## 🌟 What's Next?

After pushing to GitHub, you can:

1. ✅ Share the repository with your team
2. ✅ Enable GitHub Pages for free hosting
3. ✅ Deploy API to Render/Railway
4. ✅ Add GitHub Actions for CI/CD
5. ✅ Create releases/tags
6. ✅ Accept contributions via Pull Requests
7. ✅ Track issues and bugs
8. ✅ Add wiki documentation

---

## 📞 Need Help?

- **Git Basics:** https://git-scm.com/book/en/v2
- **GitHub Docs:** https://docs.github.com/en
- **GitHub Pages:** https://docs.github.com/en/pages
- **Personal Access Tokens:** https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

## 🎉 Congratulations!

Once pushed, your project will be:
- ✅ Backed up on GitHub
- ✅ Version controlled
- ✅ Shareable with others
- ✅ Ready for collaboration
- ✅ Deployable to GitHub Pages

**Your repository URL:** `https://github.com/YOUR-USERNAME/sql-job-monitor`

---

**Ready? Run the commands above to push to GitHub!** 🚀
