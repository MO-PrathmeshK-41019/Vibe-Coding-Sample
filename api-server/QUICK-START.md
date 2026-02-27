# 🚀 API Quick Start - Connect to SQL Server in 3 Minutes!

## Step 1: Install Node.js (if not installed)

Download and install from: https://nodejs.org/ (Choose LTS version)

Verify installation:
```powershell
node --version
npm --version
```

---

## Step 2: Setup SQL Server Access

### Option A: Use Existing SQL Login (Easiest)

If you already have a SQL login with access to msdb:

1. Open `.env` file
2. Enter your credentials:
```env
DB_USER=your_existing_user
DB_PASSWORD=your_existing_password
DB_SERVER=localhost
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

### Option B: Create New API User (Recommended)

1. **Open SQL Server Management Studio (SSMS)**
2. **Open** `sql-setup.sql` from this folder
3. **Change the password** in the script (line 22):
   ```sql
   CREATE LOGIN sql_job_monitor_api WITH PASSWORD = 'YourStrongPassword123!';
   ```
4. **Execute** the script (F5)
5. **Copy the credentials** to `.env` file

---

## Step 3: Install Dependencies & Start

```powershell
# Navigate to api-server folder
cd "d:\Vibe Coding Sample\api-server"

# Install packages
npm install

# Copy and configure .env
copy .env.example .env
notepad .env

# Test connection
npm test

# Start server
npm start
```

---

## ✅ Success! 

You should see:
```
✅ Connected to SQL Server successfully
🚀 Server running on: http://localhost:3000
✅ Ready to accept requests!
```

**Test in browser:** http://localhost:3000/api/jobs

---

## 🔗 Connect Frontend

Edit `d:\Vibe Coding Sample\js\config.js`:

```javascript
useMockData: false,  // Change from true to false

api: {
    baseUrl: 'http://localhost:3000',
    // ...
}
```

Open `index.html` in your browser - it should now show real SQL jobs!

---

## 🐛 Troubleshooting

### Can't connect to SQL Server?
Run the test script to see detailed error info:
```powershell
npm test
```

### SQL Server not accepting connections?
1. Enable SQL Server Authentication (Mixed Mode)
2. Enable TCP/IP in SQL Server Configuration Manager
3. Restart SQL Server service

### Permission denied?
Run the `sql-setup.sql` script in SSMS

---

## 📚 Full Documentation

See `README.md` in this folder for:
- Complete API documentation
- Deployment guides
- Security configuration
- Advanced troubleshooting

---

**That's it! Your API is connected to SQL Server! 🎉**
