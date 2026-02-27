# 🚀 SQL Job Monitor API - Complete Setup Guide

## 📋 Prerequisites

- ✅ Node.js 16+ installed ([Download](https://nodejs.org/))
- ✅ SQL Server with Agent jobs
- ✅ Access to `msdb` database
- ✅ SQL Server Authentication enabled

---

## 🎯 Quick Start (5 Steps)

### Step 1: Install Dependencies

```powershell
cd "d:\Vibe Coding Sample\api-server"
npm install
```

This installs:
- **express** - Web framework
- **mssql** - SQL Server driver
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

---

### Step 2: Configure Database Connection

Copy the example file and edit it:

```powershell
copy .env.example .env
notepad .env
```

**Edit `.env` file with your credentials:**

```env
# Local SQL Server Example
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_SERVER=localhost
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true

PORT=3000
FRONTEND_URL=http://localhost:8080
```

**For Azure SQL Database:**
```env
DB_USER=sqladmin
DB_PASSWORD=YourPassword123!
DB_SERVER=yourserver.database.windows.net
DB_ENCRYPT=true
DB_TRUST_CERT=false
```

---

### Step 3: Test Database Connection

```powershell
npm test
```

This will:
- ✅ Test connection to SQL Server
- ✅ Verify access to msdb database
- ✅ List sample SQL Agent jobs
- ✅ Show SQL Server version

**Expected output:**
```
✅ Successfully connected to SQL Server!
✅ Found 25 SQL Agent jobs in msdb database
✅ ALL TESTS PASSED!
```

---

### Step 4: Start the API Server

```powershell
npm start
```

**You should see:**
```
╔════════════════════════════════════════════════════════╗
║  SQL Job Monitor API Server                            ║
╚════════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:3000
📊 Database: localhost (msdb)
🔗 API Endpoints:
   - GET  http://localhost:3000/api/health
   - GET  http://localhost:3000/api/jobs
   - GET  http://localhost:3000/api/jobs/:jobId
   - GET  http://localhost:3000/api/job-history?jobId=xxx
   - GET  http://localhost:3000/api/stats

✅ Ready to accept requests!
```

---

### Step 5: Test the API

Open PowerShell and test:

```powershell
# Test health check
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get

# Get all jobs
Invoke-RestMethod -Uri "http://localhost:3000/api/jobs" -Method Get

# Get statistics
Invoke-RestMethod -Uri "http://localhost:3000/api/stats" -Method Get
```

**Or open in browser:**
- http://localhost:3000/api/health
- http://localhost:3000/api/jobs
- http://localhost:3000/api/stats

---

## 🔌 API Endpoints

### 1. Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "message": "API and database connection working",
  "timestamp": "2026-02-27T10:30:00Z",
  "database": "connected"
}
```

---

### 2. Get All Jobs
```http
GET /api/jobs
```
**Response:**
```json
[
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "name": "Daily Backup",
    "status": "success",
    "lastRun": "2026-02-27T09:00:00Z",
    "duration": 120,
    "nextRun": "2026-02-28T09:00:00Z",
    "message": "The job succeeded",
    "enabled": true,
    "description": "Daily database backup job"
  }
]
```

**Status values:**
- `success` - Job completed successfully
- `failed` - Job failed
- `running` - Job is currently executing
- `warning` - Job completed with warnings
- `unknown` - No execution history

---

### 3. Get Specific Job
```http
GET /api/jobs/:jobId
```
**Example:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/jobs/12345678-1234-1234-1234-123456789012"
```

---

### 4. Get Job History
```http
GET /api/job-history?jobId=xxx&limit=20
```
**Example:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/job-history?jobId=12345678-1234-1234-1234-123456789012&limit=10"
```

**Response:**
```json
[
  {
    "executionId": "123456",
    "startTime": "2026-02-27T09:00:00Z",
    "endTime": "2026-02-27T09:02:00Z",
    "status": "success",
    "duration": 120,
    "message": "The job succeeded",
    "retriesAttempted": 0
  }
]
```

---

### 5. Get Statistics
```http
GET /api/stats
```
**Response:**
```json
{
  "totalJobs": 25,
  "successCount": 20,
  "failedCount": 2,
  "runningCount": 1,
  "warningCount": 2,
  "unknownCount": 0
}
```

---

## 🔧 SQL Server Setup

### Enable SQL Server Authentication

1. **Open SQL Server Management Studio (SSMS)**
2. **Right-click server** → Properties
3. **Go to Security** page
4. **Select** "SQL Server and Windows Authentication mode"
5. **Restart SQL Server service**

### Create SQL User (if needed)

```sql
-- Create login
CREATE LOGIN api_user WITH PASSWORD = 'YourStrongPassword123!';

-- Grant access to msdb
USE msdb;
CREATE USER api_user FOR LOGIN api_user;

-- Grant read permissions
ALTER ROLE db_datareader ADD MEMBER api_user;

-- Grant specific permissions for SQL Agent
GRANT SELECT ON sysjobs TO api_user;
GRANT SELECT ON sysjobhistory TO api_user;
GRANT SELECT ON sysjobactivity TO api_user;
GRANT SELECT ON sysjobschedules TO api_user;
```

### Enable TCP/IP (if remote connection)

1. **Open SQL Server Configuration Manager**
2. **SQL Server Network Configuration** → Protocols
3. **Enable TCP/IP**
4. **Set port to 1433**
5. **Restart SQL Server service**

### Configure Firewall

```powershell
# Windows Firewall - Allow SQL Server
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

---

## 🔗 Connect Frontend to API

### Update Frontend Configuration

Edit `d:\Vibe Coding Sample\js\config.js`:

```javascript
const CONFIG = {
    // Disable mock data
    useMockData: false,
    
    // Set your API URL
    api: {
        baseUrl: 'http://localhost:3000',  // Local development
        // For production: 'https://your-api-url.com'
        
        endpoints: {
            jobs: '/api/jobs',
            jobHistory: '/api/job-history',
            jobDetails: '/api/jobs'
        }
    }
};
```

### Test Full Stack

1. **Start API server:**
   ```powershell
   cd "d:\Vibe Coding Sample\api-server"
   npm start
   ```

2. **Open frontend:**
   ```powershell
   cd "d:\Vibe Coding Sample"
   # Open index.html in browser
   ```

3. **Verify data loads** from SQL Server!

---

## 🚀 Deployment Options

### Option 1: Deploy to Render (Free)

1. **Push API code to GitHub**
   ```powershell
   cd "d:\Vibe Coding Sample\api-server"
   git init
   git add .
   git commit -m "API server"
   git remote add origin https://github.com/YOUR-USERNAME/sql-job-monitor-api.git
   git push -u origin main
   ```

2. **Go to [Render.com](https://render.com)**
3. **New Web Service** → Connect repository
4. **Set environment variables** from your .env
5. **Deploy!**

Your API will be at: `https://your-app.onrender.com`

---

### Option 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **New Project** → Deploy from GitHub
3. **Add environment variables**
4. **Deploy!**

---

### Option 3: Deploy to Azure

```powershell
# Install Azure CLI
# az login

# Create App Service
az webapp up --name sql-job-monitor-api --runtime "NODE:18-lts"

# Set environment variables
az webapp config appsettings set --name sql-job-monitor-api --settings DB_USER="your_user" DB_PASSWORD="your_password"
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables
```env
# NEVER commit .env to Git
# Always use environment variables for secrets
```

### 2. API Key Authentication (Optional)

Add to `server.js`:
```javascript
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Protect routes
app.get('/api/jobs', apiKeyAuth, async (req, res) => {
    // Your code
});
```

### 3. Rate Limiting

```powershell
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. HTTPS Only (Production)

In production, always use HTTPS. Most cloud providers (Render, Railway, Azure) provide this automatically.

---

## 🐛 Troubleshooting

### Connection Refused
```
❌ Error: connect ECONNREFUSED
```
**Fix:**
- ✅ Ensure SQL Server is running
- ✅ Check server address in .env
- ✅ Verify port 1433 is open

---

### Login Failed
```
❌ Error: Login failed for user 'xxx'
```
**Fix:**
- ✅ Check username/password in .env
- ✅ Enable SQL Server Authentication (Mixed Mode)
- ✅ Ensure user has access to msdb database

---

### Self-Signed Certificate Error
```
❌ Error: self signed certificate
```
**Fix:**
```env
DB_TRUST_CERT=true
```

---

### Cannot Access msdb
```
❌ Error: The SELECT permission was denied on the object 'sysjobs'
```
**Fix:**
```sql
USE msdb;
GRANT SELECT ON sysjobs TO api_user;
GRANT SELECT ON sysjobhistory TO api_user;
```

---

### CORS Error in Browser
```
❌ Access to fetch has been blocked by CORS policy
```
**Fix:**
1. Check `FRONTEND_URL` in .env matches your frontend URL
2. Restart API server after changing .env

---

## 📊 Performance Tips

### 1. Connection Pooling
Already configured! The app reuses database connections.

### 2. Caching (Optional)
Add simple in-memory cache:

```javascript
let jobsCache = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

app.get('/api/jobs', async (req, res) => {
    const now = Date.now();
    if (jobsCache && (now - cacheTime) < CACHE_DURATION) {
        return res.json(jobsCache);
    }
    
    // Fetch from database
    const jobs = await fetchJobs();
    jobsCache = jobs;
    cacheTime = now;
    res.json(jobs);
});
```

---

## ✅ Production Checklist

Before deploying:

- [ ] Test connection with `npm test`
- [ ] All environment variables set
- [ ] CORS configured for production URL
- [ ] HTTPS enabled
- [ ] Error logging configured
- [ ] Database user has minimum required permissions
- [ ] API authentication added (if needed)
- [ ] Rate limiting enabled
- [ ] Tested all endpoints
- [ ] Frontend connected successfully

---

## 📚 File Structure

```
api-server/
├── server.js              ← Main API server
├── package.json           ← Dependencies
├── .env.example           ← Example configuration
├── .env                   ← Your config (don't commit!)
├── test-connection.js     ← Connection test script
└── README.md              ← This file
```

---

## 🎉 You're Done!

Your API server is now:
- ✅ Connected to SQL Server
- ✅ Fetching SQL Agent job data
- ✅ Serving data to your PWA frontend
- ✅ Ready for production deployment

**Next:** Update your frontend config to use this API!

---

**Need help? Check the error messages - they include troubleshooting tips!**
