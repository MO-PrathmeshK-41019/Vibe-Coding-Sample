# SQL Job Monitor - PWA

A Progressive Web App (PWA) for monitoring SQL Server Agent Jobs with real-time alerts and notifications.

## 🚀 Features

- **Real-time Monitoring**: Track SQL job status, execution history, and performance
- **Push Notifications**: Get instant alerts when jobs fail or complete
- **PWA Support**: Install on desktop/mobile, works offline, background sync
- **Responsive Design**: Works seamlessly on all devices
- **Easy Deployment**: Static files ready for GitHub Pages
- **Zero Backend Required**: Connects directly to your monitoring API

## 📱 Technology Stack

### Frontend (100% JavaScript)
- **HTML5** - Semantic structure
- **CSS3** - Modern, responsive design with CSS Grid/Flexbox
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS
- **Service Workers** - Offline support and background notifications
- **Web Notifications API** - Browser push notifications
- **LocalStorage** - Client-side data persistence

### Why This Stack?
- ✅ **Easy to Understand**: Pure JavaScript, no complex frameworks
- ✅ **GitHub Pages Ready**: Static files, no build process required
- ✅ **Fast & Lightweight**: No heavy dependencies
- ✅ **Modern Standards**: Uses latest web APIs
- ✅ **Easy to Customize**: Simple code structure

## 📂 Project Structure

```
sql-job-monitor/
│
├── index.html              # Main dashboard page
├── manifest.json           # PWA configuration
├── service-worker.js       # Offline & notification handler
│
├── css/
│   └── styles.css         # All styling
│
├── js/
│   ├── app.js             # Main application logic
│   ├── api.js             # API integration
│   ├── notifications.js   # Notification handler
│   └── config.js          # Configuration settings
│
├── assets/
│   └── icons/             # PWA icons (various sizes)
│
├── README.md              # This file
└── DEPLOYMENT.md          # GitHub Pages setup guide
```

## 🔧 Setup & Configuration

### 1. Configure Your API Endpoint

Edit `js/config.js`:

```javascript
const API_CONFIG = {
    baseUrl: 'https://your-api.example.com',
    endpoints: {
        jobs: '/api/jobs',
        history: '/api/job-history'
    },
    refreshInterval: 30000 // 30 seconds
};
```

### 2. Local Development

Simply open `index.html` in a modern browser:

```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server

# Or just double-click index.html
```

### 3. Deploy to GitHub Pages

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

Quick steps:
1. Create a GitHub repository
2. Push this code
3. Enable GitHub Pages in Settings
4. Access at `https://yourusername.github.io/repo-name`

## 🔔 Notification Setup

1. **First Visit**: Browser will ask for notification permission
2. **Grant Permission**: Click "Allow" to receive alerts
3. **Configure Alerts**: Set which job statuses trigger notifications

### Notification Triggers
- ❌ Job Failures
- ⚠️ Job Warnings
- ✅ Job Completions (optional)
- ⏱️ Long-Running Jobs
- 🔄 Job Retries

## 💡 Usage

### Dashboard Features

1. **Job Status Overview**
   - Real-time status cards
   - Color-coded indicators (Success/Failed/Running)
   - Last execution time

2. **Job History**
   - Execution logs
   - Duration tracking
   - Error messages

3. **Filters & Search**
   - Filter by status
   - Search by job name
   - Date range selection

4. **Auto-Refresh**
   - Configurable refresh intervals
   - Manual refresh button
   - Last updated timestamp

## 🔌 API Integration

Your backend API should provide these endpoints:

### GET /api/jobs
Returns list of SQL jobs with current status:

```json
[
  {
    "id": "job-123",
    "name": "Daily Backup",
    "status": "success",
    "lastRun": "2026-02-26T10:30:00Z",
    "duration": 120,
    "nextRun": "2026-02-27T10:30:00Z"
  }
]
```

### GET /api/job-history?jobId={id}
Returns execution history for a specific job:

```json
[
  {
    "executionId": "exec-456",
    "startTime": "2026-02-26T10:30:00Z",
    "endTime": "2026-02-26T10:32:00Z",
    "status": "success",
    "message": "Completed successfully"
  }
]
```

## 🔒 Security Considerations

- **API Authentication**: Add Bearer tokens in `api.js`
- **CORS**: Ensure your API allows requests from GitHub Pages
- **HTTPS**: Always use HTTPS for API endpoints
- **No Secrets in Code**: Use environment-specific configs

## 🛠️ Customization

### Change Colors
Edit CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #2196F3;
    --success-color: #4CAF50;
    --error-color: #F44336;
}
```

### Add New Job Status Types
Extend status mapping in `js/app.js`:

```javascript
const STATUS_TYPES = {
    success: { icon: '✅', color: 'green' },
    failed: { icon: '❌', color: 'red' },
    running: { icon: '🔄', color: 'blue' }
};
```

## 📱 Install as App

### Desktop (Chrome/Edge)
1. Click the install icon in address bar
2. Or: Menu → Install SQL Job Monitor

### Mobile (Android/iOS)
1. Open in browser
2. Menu → Add to Home Screen
3. App icon appears on home screen

## 🐛 Troubleshooting

### Notifications Not Working
- Check browser notification permissions
- Ensure HTTPS (required for service workers)
- Check browser console for errors

### Data Not Loading
- Verify API endpoint in `config.js`
- Check CORS settings on your API
- Open browser DevTools → Network tab

### PWA Not Installing
- Must be served over HTTPS (except localhost)
- Check manifest.json is valid
- Ensure service-worker.js is accessible

## 📊 Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (limited PWA support)
- ✅ Mobile browsers (Android/iOS)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - Feel free to use and modify!

## 🆘 Support

- **Issues**: Open a GitHub issue
- **Questions**: Check the Discussions tab
- **Updates**: Watch the repository for updates

---

**Built with ❤️ for SQL Server DBAs and DevOps teams**
