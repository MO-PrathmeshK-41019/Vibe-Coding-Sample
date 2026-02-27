# SQL Job Monitor - API Backend Guide

This guide explains how to create a backend API to connect your PWA to SQL Server and retrieve job information.

## 🎯 Overview

Your PWA needs an API that provides:
1. **GET /api/jobs** - List all SQL Server Agent jobs
2. **GET /api/job-history?jobId={id}** - Get execution history for a job

## 📋 API Response Format

### Jobs Endpoint Response

```json
[
  {
    "id": "unique-job-id",
    "name": "Job Name",
    "status": "success|failed|running|warning",
    "lastRun": "2026-02-26T10:30:00Z",
    "duration": 120,
    "nextRun": "2026-02-27T10:30:00Z",
    "message": "Status message"
  }
]
```

### Job History Response

```json
[
  {
    "executionId": "unique-execution-id",
    "startTime": "2026-02-26T10:30:00Z",
    "endTime": "2026-02-26T10:32:00Z",
    "status": "success|failed",
    "duration": 120,
    "message": "Execution message"
  }
]
```

---

## 🚀 Option 1: Node.js + Express API (Recommended for Beginners)

### Step 1: Create API Project

```powershell
# Create new folder
mkdir sql-job-monitor-api
cd sql-job-monitor-api

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mssql cors dotenv
```

### Step 2: Create server.js

```javascript
// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// SQL Server Configuration
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: 'msdb', // SQL Agent jobs are in msdb
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Get all SQL jobs
app.get('/api/jobs', async (req, res) => {
    try {
        await sql.connect(sqlConfig);
        
        const result = await sql.query`
            SELECT 
                CAST(j.job_id AS VARCHAR(50)) as id,
                j.name,
                j.enabled,
                CASE 
                    WHEN ja.start_execution_date IS NOT NULL AND ja.stop_execution_date IS NULL 
                        THEN 'running'
                    WHEN ja.run_status = 1 
                        THEN 'success'
                    WHEN ja.run_status IN (0, 3) 
                        THEN 'failed'
                    WHEN ja.run_status = 2 
                        THEN 'warning'
                    ELSE 'unknown'
                END as status,
                ja.start_execution_date as lastRun,
                DATEDIFF(SECOND, ja.start_execution_date, 
                    ISNULL(ja.stop_execution_date, GETDATE())) as duration,
                js.next_run_date as nextRun,
                ja.message
            FROM msdb.dbo.sysjobs j
            LEFT JOIN (
                SELECT job_id, MAX(instance_id) as max_instance_id
                FROM msdb.dbo.sysjobhistory
                WHERE step_id = 0
                GROUP BY job_id
            ) jh ON j.job_id = jh.job_id
            LEFT JOIN msdb.dbo.sysjobhistory ja 
                ON jh.job_id = ja.job_id 
                AND jh.max_instance_id = ja.instance_id
            LEFT JOIN msdb.dbo.sysjobschedules js 
                ON j.job_id = js.job_id
            ORDER BY j.name
        `;
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch jobs',
            message: err.message 
        });
    }
});

// Get job history
app.get('/api/job-history', async (req, res) => {
    const { jobId } = req.query;
    
    if (!jobId) {
        return res.status(400).json({ error: 'jobId parameter is required' });
    }

    try {
        await sql.connect(sqlConfig);
        
        const result = await sql.query`
            SELECT TOP 20
                CAST(instance_id AS VARCHAR(50)) as executionId,
                msdb.dbo.agent_datetime(run_date, run_time) as startTime,
                DATEADD(SECOND, run_duration, 
                    msdb.dbo.agent_datetime(run_date, run_time)) as endTime,
                CASE run_status
                    WHEN 1 THEN 'success'
                    WHEN 0 THEN 'failed'
                    WHEN 2 THEN 'warning'
                    WHEN 3 THEN 'cancelled'
                    WHEN 4 THEN 'in_progress'
                    ELSE 'unknown'
                END as status,
                run_duration as duration,
                message
            FROM msdb.dbo.sysjobhistory
            WHERE job_id = CAST(${jobId} AS UNIQUEIDENTIFIER)
                AND step_id = 0
            ORDER BY run_date DESC, run_time DESC
        `;
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch job history',
            message: err.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`SQL Job Monitor API running on port ${PORT}`);
});
```

### Step 3: Create .env file

```env
# Database Configuration
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_SERVER=your_server.database.windows.net
DB_DATABASE=msdb

# API Configuration
PORT=3000
FRONTEND_URL=https://your-username.github.io

# Optional: API Key for authentication
API_KEY=your-secret-api-key
```

### Step 4: Test Locally

```powershell
# Start the server
node server.js

# Test in browser or PowerShell
curl http://localhost:3000/api/jobs
```

### Step 5: Deploy to Cloud

**Deploy to Render (Free):**
1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect your repository
5. Set environment variables
6. Deploy!

**Deploy to Railway (Free):**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy!

---

## 🔵 Option 2: Azure Functions (Serverless)

### Step 1: Install Azure Functions Core Tools

```powershell
npm install -g azure-functions-core-tools@4
```

### Step 2: Create Function App

```powershell
func init SQLJobMonitorAPI --javascript
cd SQLJobMonitorAPI
func new --name GetJobs --template "HTTP trigger"
func new --name GetJobHistory --template "HTTP trigger"
```

### Step 3: Implement GetJobs Function

```javascript
// GetJobs/index.js
const sql = require('mssql');

module.exports = async function (context, req) {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: 'msdb'
    };

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                CAST(job_id AS VARCHAR(50)) as id,
                name,
                enabled
            FROM msdb.dbo.sysjobs
        `;

        context.res = {
            status: 200,
            body: result.recordset,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};
```

### Step 4: Deploy to Azure

```powershell
# Login to Azure
az login

# Create resource group
az group create --name SQLJobMonitorRG --location eastus

# Create function app
az functionapp create --resource-group SQLJobMonitorRG \
    --consumption-plan-location eastus \
    --runtime node \
    --functions-version 4 \
    --name sql-job-monitor-api

# Deploy
func azure functionapp publish sql-job-monitor-api
```

---

## 🐍 Option 3: Python + Flask API

### Step 1: Create API

```python
# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import pyodbc
import os

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    conn = pyodbc.connect(
        f'DRIVER={{ODBC Driver 17 for SQL Server}};'
        f'SERVER={os.getenv("DB_SERVER")};'
        f'DATABASE=msdb;'
        f'UID={os.getenv("DB_USER")};'
        f'PWD={os.getenv("DB_PASSWORD")}'
    )
    return conn

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                CAST(job_id AS VARCHAR(50)) as id,
                name,
                enabled
            FROM msdb.dbo.sysjobs
        """)
        
        jobs = []
        for row in cursor.fetchall():
            jobs.append({
                'id': row.id,
                'name': row.name,
                'enabled': row.enabled
            })
        
        return jsonify(jobs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

### Step 2: Install Dependencies

```powershell
pip install flask flask-cors pyodbc python-dotenv
```

### Step 3: Run

```powershell
python app.py
```

---

## 🔒 Security Best Practices

### 1. API Key Authentication

Add to your API:

```javascript
// Middleware for API key validation
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
};

// Use on protected routes
app.get('/api/jobs', validateApiKey, async (req, res) => {
    // Your code here
});
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. SQL Injection Prevention

Always use parameterized queries:

```javascript
// Good ✅
await sql.query`SELECT * FROM jobs WHERE id = ${jobId}`;

// Bad ❌
await sql.query(`SELECT * FROM jobs WHERE id = '${jobId}'`);
```

---

## 🧪 Testing Your API

### Using PowerShell

```powershell
# Test GET jobs
Invoke-RestMethod -Uri "http://localhost:3000/api/jobs" -Method Get

# Test GET history
Invoke-RestMethod -Uri "http://localhost:3000/api/job-history?jobId=123" -Method Get
```

### Using Postman

1. Download Postman
2. Create new request
3. Set URL: `http://localhost:3000/api/jobs`
4. Click Send

---

## 📊 SQL Queries for SQL Server Agent Jobs

### Get All Jobs with Latest Status

```sql
SELECT 
    CAST(j.job_id AS VARCHAR(50)) as id,
    j.name,
    j.enabled,
    CASE 
        WHEN ja.run_status = 1 THEN 'success'
        WHEN ja.run_status IN (0, 3) THEN 'failed'
        WHEN ja.run_status = 2 THEN 'warning'
        ELSE 'unknown'
    END as status,
    msdb.dbo.agent_datetime(ja.run_date, ja.run_time) as lastRun,
    ja.run_duration as duration,
    ja.message
FROM msdb.dbo.sysjobs j
LEFT JOIN (
    SELECT job_id, MAX(instance_id) as max_instance_id
    FROM msdb.dbo.sysjobhistory
    WHERE step_id = 0
    GROUP BY job_id
) jh ON j.job_id = jh.job_id
LEFT JOIN msdb.dbo.sysjobhistory ja 
    ON jh.job_id = ja.job_id 
    AND jh.max_instance_id = ja.instance_id
ORDER BY j.name;
```

### Get Job Execution History

```sql
SELECT TOP 20
    CAST(instance_id AS VARCHAR(50)) as executionId,
    msdb.dbo.agent_datetime(run_date, run_time) as startTime,
    DATEADD(SECOND, run_duration, 
        msdb.dbo.agent_datetime(run_date, run_time)) as endTime,
    CASE run_status
        WHEN 1 THEN 'success'
        WHEN 0 THEN 'failed'
        ELSE 'unknown'
    END as status,
    run_duration as duration,
    message
FROM msdb.dbo.sysjobhistory
WHERE job_id = '12345678-1234-1234-1234-123456789012'
    AND step_id = 0
ORDER BY run_date DESC, run_time DESC;
```

---

## 🎯 Quick Start Checklist

- [ ] Choose API framework (Node.js recommended)
- [ ] Set up development environment
- [ ] Create API endpoints
- [ ] Test locally
- [ ] Configure CORS
- [ ] Add authentication (optional)
- [ ] Deploy to cloud
- [ ] Update PWA config with API URL
- [ ] Test end-to-end

---

**Need help? Check the main README.md or open an issue!**
