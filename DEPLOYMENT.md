# Deployment Guide - SQL Job Monitor PWA

This guide will walk you through deploying your SQL Job Monitor PWA to GitHub Pages step-by-step.

## Prerequisites

- GitHub account ([Sign up here](https://github.com/join) if you don't have one)
- Git installed on your computer ([Download here](https://git-scm.com/downloads))
- Your SQL Job Monitor files ready

## 📋 Step-by-Step Deployment to GitHub Pages

### Step 1: Create a GitHub Repository

1. **Log in to GitHub** at https://github.com
2. **Click the "+" icon** in the top-right corner
3. **Select "New repository"**
4. **Fill in repository details:**
   - Repository name: `sql-job-monitor` (or any name you prefer)
   - Description: "PWA for monitoring SQL Server Agent Jobs"
   - Choose **Public** (required for free GitHub Pages)
   - ✅ Check "Add a README file" (optional, we already have one)
   - Click **"Create repository"**

### Step 2: Prepare Your Local Files

1. **Open Command Prompt or PowerShell** in your project folder:
   ```powershell
   cd "d:\Vibe Coding Sample"
   ```

2. **Initialize Git** (if not already done):
   ```powershell
   git init
   ```

3. **Add all files to Git:**
   ```powershell
   git add .
   ```

4. **Commit the files:**
   ```powershell
   git commit -m "Initial commit - SQL Job Monitor PWA"
   ```

### Step 3: Connect to GitHub and Push

1. **Add your GitHub repository as remote:**
   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/sql-job-monitor.git
   ```
   
   ⚠️ Replace `YOUR-USERNAME` with your actual GitHub username!

2. **Push your code to GitHub:**
   ```powershell
   git branch -M main
   git push -u origin main
   ```

3. **Enter your GitHub credentials** when prompted

### Step 4: Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Click on "Settings"** (top menu)
3. **Scroll down** and click on **"Pages"** in the left sidebar
4. **Under "Source":**
   - Select branch: **main**
   - Select folder: **/ (root)**
   - Click **"Save"**

5. **Wait 1-2 minutes** for GitHub to build your site

6. **Your site URL will appear:**
   ```
   https://YOUR-USERNAME.github.io/sql-job-monitor/
   ```

### Step 5: Configure Your Application

Before using your deployed app, you need to configure the API endpoint:

1. **Open your deployed site** in a browser
2. **Click the "Settings" button** (⚙️ icon)
3. **Enter your API Base URL:**
   - Example: `https://your-api-server.com`
4. **Configure notification triggers** as needed
5. **Click "Save Settings"**

### Step 6: Create PWA Icons (Important!)

Your PWA needs icons to be installable. Create a simple icon:

1. **Create icons folder:**
   ```powershell
   mkdir "d:\Vibe Coding Sample\assets\icons"
   ```

2. **Option A - Use Online Tools:**
   - Go to https://www.pwabuilder.com/imageGenerator
   - Upload a logo/icon image (512x512 recommended)
   - Download the generated icon pack
   - Extract to `assets/icons/` folder

3. **Option B - Use Existing Images:**
   - Create PNG images in these sizes:
     - icon-72x72.png
     - icon-96x96.png
     - icon-128x128.png
     - icon-144x144.png
     - icon-152x152.png
     - icon-192x192.png
     - icon-384x384.png
     - icon-512x512.png
   - Place them in `assets/icons/` folder

4. **Commit and push icons:**
   ```powershell
   git add assets/icons/
   git commit -m "Add PWA icons"
   git push
   ```

## 🔧 Configuration for Production

### Update Service Worker Cache

If deploying to a subdirectory, update `service-worker.js`:

```javascript
const urlsToCache = [
    '/sql-job-monitor/',  // Add your repo name
    '/sql-job-monitor/index.html',
    '/sql-job-monitor/css/styles.css',
    // ... etc
];
```

### Enable Mock Data for Testing

If you don't have an API yet, enable mock data in `js/config.js`:

```javascript
// Set to true to use mock data
useMockData: true,
```

### Configure API Endpoint

In `js/config.js`, update your API URL:

```javascript
api: {
    baseUrl: 'https://your-actual-api.com',
    // ... rest of config
}
```

## 🔐 API Backend Setup (Required for Production)

Your PWA needs a backend API to fetch SQL job data. Here are your options:

### Option 1: Azure Functions (Recommended)

1. Create an Azure Function App
2. Create HTTP-triggered functions for:
   - `GET /api/jobs` - Return all SQL jobs
   - `GET /api/job-history?jobId={id}` - Return job history
3. Connect to your SQL Server using connection strings
4. Enable CORS for your GitHub Pages URL

### Option 2: Node.js Backend

Create a simple Express.js API:

```javascript
// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());

const config = {
    user: 'your-username',
    password: 'your-password',
    server: 'your-server',
    database: 'msdb'
};

app.get('/api/jobs', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                job_id as id,
                name,
                enabled,
                date_created as lastRun
            FROM sysjobs
        `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000);
```

Deploy to: Heroku, Render, Railway, or any cloud provider

### Option 3: SQL Server Reporting Services (SSRS)

Configure SSRS with REST API access and use it as your backend.

## 🔒 Security Best Practices

### 1. Never Commit Secrets

Create a `.gitignore` file:

```
# Ignore sensitive files
.env
config.local.js
*.key
*.pem
```

### 2. Use Environment-Specific Configs

Create `js/config.local.js` (gitignored):

```javascript
// Override production config locally
CONFIG.api.baseUrl = 'http://localhost:3000';
```

### 3. Enable HTTPS

GitHub Pages automatically provides HTTPS. Ensure your API also uses HTTPS.

### 4. API Authentication

Add authentication to your API:

```javascript
// In js/config.js
api: {
    auth: {
        enabled: true,
        type: 'bearer',
        token: 'your-token-here'  // Better: store in settings
    }
}
```

## 🚀 Updating Your Deployed App

After making changes:

```powershell
# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# GitHub Pages will automatically update in 1-2 minutes
```

## 📱 Installing the PWA

Once deployed, users can install your app:

### On Desktop (Chrome/Edge):
1. Visit your GitHub Pages URL
2. Click the install icon (⊕) in the address bar
3. Click "Install"

### On Mobile (Android):
1. Open the site in Chrome
2. Tap the menu (⋮)
3. Tap "Add to Home Screen"
4. Tap "Add"

### On iOS (Safari):
1. Open the site in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

## 🐛 Troubleshooting

### Site Not Loading
- Wait 2-3 minutes after enabling GitHub Pages
- Check Settings → Pages for any errors
- Ensure branch is set to "main" and folder to "root"

### PWA Not Installing
- Ensure you have icons in `assets/icons/`
- Check browser console for errors (F12)
- Verify `manifest.json` is accessible

### API Errors
- Check browser console (F12) for detailed errors
- Verify API URL in Settings
- Ensure CORS is enabled on your API
- Test API with tools like Postman first

### Notifications Not Working
- Ensure HTTPS (GitHub Pages provides this)
- Click "Enable Notifications" button
- Check browser notification settings
- Test with mock data first

### Service Worker Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check Application → Service Workers in DevTools

## 📊 Monitoring Usage

### Google Analytics (Optional)

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

## 🎯 Performance Optimization

### Enable Compression

GitHub Pages automatically compresses files, but you can:

1. Minify CSS/JS before deploying
2. Optimize images
3. Use WebP format for icons

### Cache Strategy

Service Worker already implements caching. To clear:

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
});
```

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [SQL Server Agent Jobs](https://docs.microsoft.com/en-us/sql/ssms/agent/sql-server-agent)
- [Web Push Notifications](https://web.dev/notifications/)

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console (F12) for errors
2. Review this deployment guide
3. Check GitHub Pages status: https://www.githubstatus.com
4. Open an issue on your repository

---

## ✅ Quick Checklist

Before going live, ensure:

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] PWA icons created and uploaded
- [ ] API endpoint configured
- [ ] Mock data disabled (if using real API)
- [ ] CORS enabled on API
- [ ] HTTPS enabled (automatic with GitHub Pages)
- [ ] Tested on desktop browser
- [ ] Tested on mobile device
- [ ] PWA installation tested
- [ ] Notifications tested
- [ ] Service Worker registered successfully

---

**Congratulations! Your SQL Job Monitor PWA is now live! 🎉**

Access it at: `https://YOUR-USERNAME.github.io/sql-job-monitor/`
