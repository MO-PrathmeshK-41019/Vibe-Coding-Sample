# 🚀 Quick Start Guide - SQL Job Monitor PWA

Get your SQL Job Monitor up and running in **5 minutes**!

## 📋 What You'll Need

- ✅ A code editor (VS Code recommended)
- ✅ A modern web browser (Chrome, Edge, Firefox)
- ✅ GitHub account (free)
- ✅ Internet connection

## 🎯 Three Ways to Start

### Option 1: Test with Mock Data (Fastest - No Setup Required!)

1. **Open `index.html` in your browser**
   - Just double-click `index.html`
   - OR right-click → Open with → Chrome/Edge

2. **Enable notifications**
   - Click the 🔔 button
   - Click "Allow" when prompted

3. **Explore the app!**
   - See mock SQL jobs
   - Click on jobs to view details
   - Test filtering and search
   - Try installing as PWA

**Mock data is enabled by default** in `js/config.js`:
```javascript
useMockData: true
```

---

### Option 2: Deploy to GitHub Pages (Recommended)

**Step 1: Create GitHub Repository** (2 minutes)
```powershell
# Navigate to your project folder
cd "d:\Vibe Coding Sample"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repo (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/sql-job-monitor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Step 2: Enable GitHub Pages** (1 minute)
1. Go to your repository on GitHub
2. Click **Settings**
3. Click **Pages** in the sidebar
4. Under **Source**, select **main** branch and **/ (root)** folder
5. Click **Save**

**Step 3: Access Your App!** (Wait 1-2 minutes)
```
https://YOUR-USERNAME.github.io/sql-job-monitor/
```

---

### Option 3: Full Setup with Real SQL Server (Advanced)

**Prerequisites:**
- SQL Server with Agent jobs
- Access to create an API

**Step 1: Set Up Backend API**
See detailed guide: [API-BACKEND-GUIDE.md](API-BACKEND-GUIDE.md)

Quick Node.js example:
```powershell
# Create API folder
mkdir api
cd api

# Initialize Node.js
npm init -y

# Install dependencies
npm install express mssql cors dotenv

# Create server.js (see API-BACKEND-GUIDE.md for code)

# Run the API
node server.js
```

**Step 2: Configure PWA**
Edit `js/config.js`:
```javascript
// Disable mock data
useMockData: false,

// Set your API URL
api: {
    baseUrl: 'https://your-api-url.com',
    // ... rest of config
}
```

**Step 3: Deploy Both**
- Deploy API to Render/Railway/Azure
- Deploy PWA to GitHub Pages
- Update API URL in settings

---

## 🎨 Customization

### Change Colors

Edit `css/styles.css`:
```css
:root {
    --primary-color: #2196F3;  /* Change to your color */
    --success-color: #4CAF50;
    --error-color: #F44336;
}
```

### Change App Name

Edit `index.html`:
```html
<title>Your App Name</title>
<h1>Your App Name</h1>
```

Edit `manifest.json`:
```json
{
    "name": "Your App Name",
    "short_name": "YourApp"
}
```

### Change Refresh Interval

Edit `js/config.js`:
```javascript
refresh: {
    interval: 30000,  // Change to desired milliseconds
}
```

### Configure Notifications

Edit `js/config.js`:
```javascript
notifications: {
    triggers: {
        onFailure: true,     // Notify on failures
        onWarning: true,     // Notify on warnings
        onSuccess: false,    // Don't notify on success
        onLongRunning: true  // Notify on long jobs
    }
}
```

---

## 🧪 Testing Your App

### Test Offline Mode
1. Open the app
2. Open DevTools (F12)
3. Go to Network tab
4. Select "Offline"
5. Refresh page
6. App should still work with cached data!

### Test as PWA
1. Open in Chrome/Edge
2. Look for install icon (⊕) in address bar
3. Click to install
4. App opens in standalone window
5. Should appear in Start Menu/Apps

### Test Notifications
1. Click 🔔 button to enable
2. Wait for auto-refresh (30 seconds)
3. Or manually refresh
4. Should see notification if job status changes

---

## 📱 Project Structure

```
sql-job-monitor/
│
├── index.html              ← Main page
├── manifest.json           ← PWA config
├── service-worker.js       ← Offline support
│
├── css/
│   └── styles.css         ← All styling
│
├── js/
│   ├── app.js             ← Main application
│   ├── api.js             ← API calls
│   ├── config.js          ← ⚙️ CONFIGURE HERE
│   └── notifications.js   ← Notification handler
│
├── assets/
│   └── icons/             ← PWA icons (add your own)
│
├── README.md              ← Full documentation
├── DEPLOYMENT.md          ← Deployment guide
├── API-BACKEND-GUIDE.md   ← Backend setup guide
└── .gitignore             ← Git ignore file
```

---

## 🐛 Troubleshooting

### App Not Loading?
- ✅ Check browser console (F12)
- ✅ Ensure `config.js` is loaded
- ✅ Try hard refresh (Ctrl+Shift+R)

### No Data Showing?
- ✅ Check if `useMockData: true` in config.js
- ✅ If using real API, check API URL
- ✅ Check browser console for errors
- ✅ Verify CORS is enabled on API

### Notifications Not Working?
- ✅ Must use HTTPS (or localhost)
- ✅ Click 🔔 button to enable
- ✅ Check browser notification settings
- ✅ Some browsers block on file:// protocol

### PWA Not Installing?
- ✅ Must be served over HTTPS
- ✅ Need valid manifest.json
- ✅ Need at least one icon
- ✅ Service worker must register successfully

### Service Worker Issues?
```javascript
// In browser console, unregister service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
});

// Then hard refresh (Ctrl+Shift+R)
```

---

## 🎓 Learning Path

1. **Start Simple** ✅
   - Open `index.html` locally
   - Explore with mock data
   - Understand the UI

2. **Deploy to GitHub Pages** 🚀
   - Learn Git basics
   - Deploy to internet
   - Share with team

3. **Add Real Backend** 🔧
   - Create Node.js API
   - Connect to SQL Server
   - Deploy API to cloud

4. **Customize** 🎨
   - Change colors/branding
   - Add new features
   - Extend functionality

---

## 📚 Important Files to Configure

### 1. `js/config.js` - Most Important!
```javascript
// Set your API URL here
baseUrl: 'https://your-api.com',

// Enable/disable mock data
useMockData: true,

// Set refresh interval
interval: 30000,
```

### 2. `manifest.json` - PWA Settings
```json
{
    "name": "Your App Name",
    "theme_color": "#2196F3"
}
```

### 3. `service-worker.js` - Cache Settings
```javascript
const CACHE_NAME = 'sql-job-monitor-v1';
```

---

## ✅ Pre-Launch Checklist

Before sharing with your team:

- [ ] Test in multiple browsers
- [ ] Test on mobile device
- [ ] Configure real API or mock data
- [ ] Add your own app icons
- [ ] Customize colors/branding
- [ ] Test notifications
- [ ] Test offline mode
- [ ] Deploy to GitHub Pages
- [ ] Update README with your info
- [ ] Test installation as PWA

---

## 🆘 Get Help

### Documentation
- 📖 [README.md](README.md) - Full documentation
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to GitHub
- 🔧 [API-BACKEND-GUIDE.md](API-BACKEND-GUIDE.md) - Backend setup

### Debugging
1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for Service Worker status

### Common Issues
- **CORS errors**: Enable CORS on your API
- **Offline doesn't work**: Check service worker registration
- **No notifications**: Must use HTTPS and grant permission

---

## 🎉 Next Steps

Once your app is running:

1. **Share with your team**
   - Send them the GitHub Pages URL
   - Show them how to install as PWA

2. **Monitor usage**
   - Check for failed jobs
   - Set up alerting workflow
   - Gather feedback

3. **Extend functionality**
   - Add more job details
   - Create charts/graphs
   - Add job control features (start/stop)

4. **Optimize**
   - Add more caching
   - Improve performance
   - Add analytics

---

## 🌟 Features You Get

✨ **Real-time Monitoring** - Auto-refreshes every 30 seconds  
🔔 **Push Notifications** - Instant alerts for job failures  
📱 **Progressive Web App** - Install on desktop/mobile  
🌐 **Offline Support** - Works without internet  
🎨 **Responsive Design** - Perfect on any device  
🔒 **Secure** - HTTPS by default on GitHub Pages  
⚡ **Fast** - Cached for instant loading  
🎯 **Easy to Use** - Clean, intuitive interface  

---

**Ready to get started? Open `index.html` or deploy to GitHub Pages!**

**Questions? Check the documentation or open an issue on GitHub.**

---

Made with ❤️ for SQL Server DBAs and DevOps teams
