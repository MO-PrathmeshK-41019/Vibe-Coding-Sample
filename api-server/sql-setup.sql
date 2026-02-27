-- ============================================
-- SQL Job Monitor - Database Setup Script
-- ============================================
-- This script sets up the required permissions and user for the API
-- Run this in SQL Server Management Studio (SSMS)

USE master;
GO

-- ============================================
-- STEP 1: Create API Login
-- ============================================
PRINT '============================================';
PRINT 'Creating API Login...';
PRINT '============================================';

-- Check if login exists
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'sql_job_monitor_api')
BEGIN
    -- Create login with strong password
    -- IMPORTANT: Change this password!
    CREATE LOGIN sql_job_monitor_api WITH PASSWORD = 'YourStrongPassword123!';
    PRINT '✅ Login created: sql_job_monitor_api';
END
ELSE
BEGIN
    PRINT '⚠️  Login already exists: sql_job_monitor_api';
END
GO

-- ============================================
-- STEP 2: Grant Access to msdb Database
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'Configuring msdb database access...';
PRINT '============================================';

USE msdb;
GO

-- Create user in msdb database
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'sql_job_monitor_api')
BEGIN
    CREATE USER sql_job_monitor_api FOR LOGIN sql_job_monitor_api;
    PRINT '✅ User created in msdb database';
END
ELSE
BEGIN
    PRINT '⚠️  User already exists in msdb database';
END
GO

-- ============================================
-- STEP 3: Grant Required Permissions
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'Granting permissions...';
PRINT '============================================';

-- Grant SELECT on SQL Agent tables
GRANT SELECT ON dbo.sysjobs TO sql_job_monitor_api;
PRINT '✅ Granted SELECT on sysjobs';

GRANT SELECT ON dbo.sysjobhistory TO sql_job_monitor_api;
PRINT '✅ Granted SELECT on sysjobhistory';

GRANT SELECT ON dbo.sysjobactivity TO sql_job_monitor_api;
PRINT '✅ Granted SELECT on sysjobactivity';

GRANT SELECT ON dbo.sysjobschedules TO sql_job_monitor_api;
PRINT '✅ Granted SELECT on sysjobschedules';

GRANT SELECT ON dbo.sysjobsteps TO sql_job_monitor_api;
PRINT '✅ Granted SELECT on sysjobsteps';

-- Grant EXECUTE on required functions
GRANT EXECUTE ON dbo.agent_datetime TO sql_job_monitor_api;
PRINT '✅ Granted EXECUTE on agent_datetime';

GO

-- ============================================
-- STEP 4: Test Permissions
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'Testing permissions...';
PRINT '============================================';

-- Test job query as the API user
EXECUTE AS USER = 'sql_job_monitor_api';

-- Try to query jobs
DECLARE @jobCount INT;
SELECT @jobCount = COUNT(*) FROM msdb.dbo.sysjobs;

REVERT;

PRINT '✅ Successfully queried ' + CAST(@jobCount AS VARCHAR) + ' jobs';
PRINT '';

-- ============================================
-- STEP 5: Display Summary
-- ============================================
PRINT '============================================';
PRINT 'Setup Complete!';
PRINT '============================================';
PRINT '';
PRINT '📋 Configuration Summary:';
PRINT '   Login: sql_job_monitor_api';
PRINT '   Database: msdb';
PRINT '   Permissions: SELECT on SQL Agent tables';
PRINT '';
PRINT '🔐 Next Steps:';
PRINT '   1. Copy the password to your .env file';
PRINT '   2. Update .env with:';
PRINT '      DB_USER=sql_job_monitor_api';
PRINT '      DB_PASSWORD=YourStrongPassword123!';
PRINT '   3. Test connection: npm test';
PRINT '   4. Start API server: npm start';
PRINT '';
PRINT '✅ Ready to use!';
PRINT '';

-- ============================================
-- OPTIONAL: View Current Permissions
-- ============================================
PRINT '============================================';
PRINT 'Current Permissions:';
PRINT '============================================';

SELECT 
    dp.name AS [User],
    o.name AS [Table],
    p.permission_name AS [Permission],
    p.state_desc AS [State]
FROM sys.database_permissions p
JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id
LEFT JOIN sys.objects o ON p.major_id = o.object_id
WHERE dp.name = 'sql_job_monitor_api'
ORDER BY o.name;

GO

-- ============================================
-- BONUS: Query to View SQL Agent Jobs
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'Sample SQL Agent Jobs:';
PRINT '============================================';

SELECT TOP 10
    name AS [Job Name],
    enabled AS [Enabled],
    date_created AS [Created],
    date_modified AS [Modified]
FROM msdb.dbo.sysjobs
ORDER BY name;

GO

-- ============================================
-- CLEANUP (Optional - Only if you want to remove)
-- ============================================
-- Uncomment these lines to remove the user and login:
/*
USE msdb;
DROP USER IF EXISTS sql_job_monitor_api;
GO

USE master;
DROP LOGIN IF EXISTS sql_job_monitor_api;
GO

PRINT '✅ Cleanup completed';
*/
