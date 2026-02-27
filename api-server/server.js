// Complete Node.js + Express API for SQL Job Monitor
// This connects to SQL Server and fetches SQL Agent job data

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS for your frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Set to your GitHub Pages URL in production
    credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// SQL SERVER CONNECTION CONFIGURATION
// ============================================

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // e.g., 'localhost' or 'server.database.windows.net'
    database: 'msdb', // SQL Agent jobs are stored in msdb database
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // true for Azure SQL
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true', // true for local dev
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Global connection pool
let pool = null;

// Initialize connection pool
async function initializePool() {
    try {
        pool = await sql.connect(sqlConfig);
        console.log('✅ Connected to SQL Server successfully');
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        throw err;
    }
}

// Get or create connection pool
async function getPool() {
    if (!pool) {
        pool = await initializePool();
    }
    return pool;
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', async (req, res) => {
    try {
        const currentPool = await getPool();
        const result = await currentPool.request().query('SELECT 1 as test');
        
        res.json({
            status: 'healthy',
            message: 'API and database connection working',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (err) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'Database connection failed',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// GET ALL SQL AGENT JOBS
// ============================================

app.get('/api/jobs', async (req, res) => {
    try {
        const currentPool = await getPool();
        
        const result = await currentPool.request().query(`
            WITH LatestJobHistory AS (
                SELECT 
                    job_id,
                    instance_id,
                    run_status,
                    run_date,
                    run_time,
                    run_duration,
                    message,
                    ROW_NUMBER() OVER (PARTITION BY job_id ORDER BY instance_id DESC) as rn
                FROM msdb.dbo.sysjobhistory
                WHERE step_id = 0  -- Only overall job status, not individual steps
            ),
            NextScheduledRun AS (
                SELECT 
                    js.job_id,
                    MIN(msdb.dbo.agent_datetime(
                        CASE 
                            WHEN js.next_run_date = 0 THEN 99991231
                            ELSE js.next_run_date 
                        END,
                        CASE 
                            WHEN js.next_run_time = 0 THEN 235959
                            ELSE js.next_run_time 
                        END
                    )) as next_run
                FROM msdb.dbo.sysjobschedules js
                GROUP BY js.job_id
            )
            SELECT 
                CAST(j.job_id AS VARCHAR(50)) as id,
                j.name,
                j.enabled,
                j.description,
                CASE 
                    -- Check if job is currently running
                    WHEN EXISTS (
                        SELECT 1 
                        FROM msdb.dbo.sysjobactivity ja
                        WHERE ja.job_id = j.job_id
                        AND ja.start_execution_date IS NOT NULL
                        AND ja.stop_execution_date IS NULL
                        AND ja.session_id = (SELECT MAX(session_id) FROM msdb.dbo.sysjobactivity)
                    ) THEN 'running'
                    -- Check last run status
                    WHEN ljh.run_status = 1 THEN 'success'
                    WHEN ljh.run_status IN (0, 3) THEN 'failed'
                    WHEN ljh.run_status = 2 THEN 'warning'
                    WHEN ljh.run_status = 4 THEN 'running'
                    ELSE 'unknown'
                END as status,
                -- Last run timestamp
                msdb.dbo.agent_datetime(ljh.run_date, ljh.run_time) as lastRun,
                -- Duration in seconds
                CASE 
                    WHEN ljh.run_duration IS NOT NULL THEN
                        (ljh.run_duration / 10000 * 3600) +  -- hours to seconds
                        ((ljh.run_duration / 100) % 100 * 60) +  -- minutes to seconds
                        (ljh.run_duration % 100)  -- seconds
                    ELSE NULL
                END as duration,
                -- Next scheduled run
                nsr.next_run as nextRun,
                -- Status message
                ISNULL(ljh.message, 'No execution history') as message,
                -- Additional info
                j.date_created as dateCreated,
                j.date_modified as dateModified
            FROM msdb.dbo.sysjobs j
            LEFT JOIN LatestJobHistory ljh ON j.job_id = ljh.job_id AND ljh.rn = 1
            LEFT JOIN NextScheduledRun nsr ON j.job_id = nsr.job_id
            ORDER BY j.name
        `);
        
        // Transform data to match frontend expectations
        const jobs = result.recordset.map(job => ({
            id: job.id,
            name: job.name,
            status: job.status,
            lastRun: job.lastRun ? job.lastRun.toISOString() : null,
            duration: job.duration,
            nextRun: job.nextRun && job.nextRun.getFullYear() < 9999 ? job.nextRun.toISOString() : null,
            message: job.message,
            enabled: job.enabled,
            description: job.description
        }));
        
        console.log(`✅ Retrieved ${jobs.length} jobs`);
        res.json(jobs);
        
    } catch (err) {
        console.error('❌ Error fetching jobs:', err);
        res.status(500).json({ 
            error: 'Failed to fetch jobs',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// GET SPECIFIC JOB DETAILS
// ============================================

app.get('/api/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const currentPool = await getPool();
        
        const result = await currentPool.request()
            .input('jobId', sql.VarChar(50), jobId)
            .query(`
                SELECT 
                    CAST(j.job_id AS VARCHAR(50)) as id,
                    j.name,
                    j.enabled,
                    j.description,
                    j.date_created as dateCreated,
                    j.date_modified as dateModified,
                    SUSER_SNAME(j.owner_sid) as owner
                FROM msdb.dbo.sysjobs j
                WHERE CAST(j.job_id AS VARCHAR(50)) = @jobId
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ 
                error: 'Job not found',
                jobId: jobId 
            });
        }
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        console.error('❌ Error fetching job details:', err);
        res.status(500).json({ 
            error: 'Failed to fetch job details',
            message: err.message 
        });
    }
});

// ============================================
// GET JOB EXECUTION HISTORY
// ============================================

app.get('/api/job-history', async (req, res) => {
    try {
        const { jobId, limit = 20 } = req.query;
        
        if (!jobId) {
            return res.status(400).json({ 
                error: 'jobId query parameter is required',
                example: '/api/job-history?jobId=12345678-1234-1234-1234-123456789012'
            });
        }
        
        const currentPool = await getPool();
        
        const result = await currentPool.request()
            .input('jobId', sql.VarChar(50), jobId)
            .input('limit', sql.Int, parseInt(limit))
            .query(`
                SELECT TOP (@limit)
                    CAST(instance_id AS VARCHAR(50)) as executionId,
                    msdb.dbo.agent_datetime(run_date, run_time) as startTime,
                    DATEADD(SECOND, 
                        (run_duration / 10000 * 3600) +
                        ((run_duration / 100) % 100 * 60) +
                        (run_duration % 100),
                        msdb.dbo.agent_datetime(run_date, run_time)
                    ) as endTime,
                    CASE run_status
                        WHEN 0 THEN 'failed'
                        WHEN 1 THEN 'success'
                        WHEN 2 THEN 'warning'
                        WHEN 3 THEN 'cancelled'
                        WHEN 4 THEN 'running'
                        ELSE 'unknown'
                    END as status,
                    -- Duration in seconds
                    (run_duration / 10000 * 3600) +
                    ((run_duration / 100) % 100 * 60) +
                    (run_duration % 100) as duration,
                    message,
                    retries_attempted as retriesAttempted
                FROM msdb.dbo.sysjobhistory
                WHERE CAST(job_id AS VARCHAR(50)) = @jobId
                    AND step_id = 0  -- Only overall job status
                ORDER BY run_date DESC, run_time DESC
            `);
        
        // Transform data
        const history = result.recordset.map(item => ({
            executionId: item.executionId,
            startTime: item.startTime ? item.startTime.toISOString() : null,
            endTime: item.endTime ? item.endTime.toISOString() : null,
            status: item.status,
            duration: item.duration,
            message: item.message,
            retriesAttempted: item.retriesAttempted
        }));
        
        console.log(`✅ Retrieved ${history.length} history records for job ${jobId}`);
        res.json(history);
        
    } catch (err) {
        console.error('❌ Error fetching job history:', err);
        res.status(500).json({ 
            error: 'Failed to fetch job history',
            message: err.message 
        });
    }
});

// ============================================
// GET JOB STATISTICS
// ============================================

app.get('/api/stats', async (req, res) => {
    try {
        const currentPool = await getPool();
        
        const result = await currentPool.request().query(`
            WITH LatestJobStatus AS (
                SELECT 
                    j.job_id,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 
                            FROM msdb.dbo.sysjobactivity ja
                            WHERE ja.job_id = j.job_id
                            AND ja.start_execution_date IS NOT NULL
                            AND ja.stop_execution_date IS NULL
                        ) THEN 'running'
                        WHEN ljh.run_status = 1 THEN 'success'
                        WHEN ljh.run_status IN (0, 3) THEN 'failed'
                        WHEN ljh.run_status = 2 THEN 'warning'
                        ELSE 'unknown'
                    END as status
                FROM msdb.dbo.sysjobs j
                LEFT JOIN (
                    SELECT 
                        job_id,
                        run_status,
                        ROW_NUMBER() OVER (PARTITION BY job_id ORDER BY instance_id DESC) as rn
                    FROM msdb.dbo.sysjobhistory
                    WHERE step_id = 0
                ) ljh ON j.job_id = ljh.job_id AND ljh.rn = 1
                WHERE j.enabled = 1
            )
            SELECT 
                COUNT(*) as totalJobs,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successCount,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedCount,
                SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as runningCount,
                SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warningCount,
                SUM(CASE WHEN status = 'unknown' THEN 1 ELSE 0 END) as unknownCount
            FROM LatestJobStatus
        `);
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        console.error('❌ Error fetching statistics:', err);
        res.status(500).json({ 
            error: 'Failed to fetch statistics',
            message: err.message 
        });
    }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path,
        availableEndpoints: [
            'GET /api/health',
            'GET /api/jobs',
            'GET /api/jobs/:jobId',
            'GET /api/job-history?jobId=xxx',
            'GET /api/stats'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
    try {
        // Test database connection
        await initializePool();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║  SQL Job Monitor API Server                            ║');
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
            console.log(`🚀 Server running on: http://localhost:${PORT}`);
            console.log(`📊 Database: ${sqlConfig.server} (msdb)`);
            console.log(`🔗 API Endpoints:`);
            console.log(`   - GET  http://localhost:${PORT}/api/health`);
            console.log(`   - GET  http://localhost:${PORT}/api/jobs`);
            console.log(`   - GET  http://localhost:${PORT}/api/jobs/:jobId`);
            console.log(`   - GET  http://localhost:${PORT}/api/job-history?jobId=xxx`);
            console.log(`   - GET  http://localhost:${PORT}/api/stats`);
            console.log('');
            console.log('✅ Ready to accept requests!');
            console.log('Press Ctrl+C to stop the server');
            console.log('');
        });
        
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    
    try {
        if (pool) {
            await pool.close();
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
    }
});

// Start the server
startServer();

module.exports = app; // Export for testing
