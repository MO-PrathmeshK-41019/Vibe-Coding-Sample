// Test Database Connection Script
// Run this to verify your SQL Server connection before starting the API

const sql = require('mssql');
require('dotenv').config();

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE || 'msdb',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
        enableArithAbort: true,
        connectionTimeout: 30000
    }
};

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  SQL Server Connection Test                            ║');
console.log('╚════════════════════════════════════════════════════════╝');
console.log('');

console.log('📋 Connection Configuration:');
console.log(`   Server: ${sqlConfig.server}`);
console.log(`   Port: ${sqlConfig.port}`);
console.log(`   Database: ${sqlConfig.database}`);
console.log(`   User: ${sqlConfig.user}`);
console.log(`   Encrypt: ${sqlConfig.options.encrypt}`);
console.log(`   Trust Certificate: ${sqlConfig.options.trustServerCertificate}`);
console.log('');

async function testConnection() {
    let pool;
    
    try {
        console.log('🔌 Attempting to connect to SQL Server...');
        pool = await sql.connect(sqlConfig);
        console.log('✅ Successfully connected to SQL Server!');
        console.log('');
        
        // Test query
        console.log('🧪 Running test query...');
        const result = await pool.request().query('SELECT @@VERSION as version');
        console.log('✅ Query executed successfully!');
        console.log('');
        
        console.log('📊 SQL Server Version:');
        console.log(result.recordset[0].version);
        console.log('');
        
        // Test msdb database access
        console.log('🧪 Testing access to msdb database...');
        const jobCountResult = await pool.request().query('SELECT COUNT(*) as jobCount FROM msdb.dbo.sysjobs');
        const jobCount = jobCountResult.recordset[0].jobCount;
        console.log(`✅ Found ${jobCount} SQL Agent jobs in msdb database`);
        console.log('');
        
        // Test specific job query
        console.log('🧪 Testing job query...');
        const jobsResult = await pool.request().query(`
            SELECT TOP 5 
                name, 
                enabled,
                date_created
            FROM msdb.dbo.sysjobs
            ORDER BY name
        `);
        
        if (jobsResult.recordset.length > 0) {
            console.log('✅ Sample jobs retrieved:');
            jobsResult.recordset.forEach((job, index) => {
                console.log(`   ${index + 1}. ${job.name} (${job.enabled ? 'Enabled' : 'Disabled'})`);
            });
        } else {
            console.log('⚠️  No jobs found in the database');
        }
        console.log('');
        
        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║  ✅ ALL TESTS PASSED!                                  ║');
        console.log('║  Your database connection is working correctly.        ║');
        console.log('║  You can now run: npm start                            ║');
        console.log('╚════════════════════════════════════════════════════════╝');
        
    } catch (err) {
        console.error('');
        console.error('╔════════════════════════════════════════════════════════╗');
        console.error('║  ❌ CONNECTION FAILED!                                 ║');
        console.error('╚════════════════════════════════════════════════════════╝');
        console.error('');
        console.error('Error Details:');
        console.error(`   Type: ${err.name}`);
        console.error(`   Message: ${err.message}`);
        console.error('');
        
        console.error('🔧 Troubleshooting Tips:');
        console.error('');
        
        if (err.code === 'ESOCKET') {
            console.error('   ❌ Cannot reach the SQL Server');
            console.error('   ✅ Check if SQL Server is running');
            console.error('   ✅ Verify the server address and port');
            console.error('   ✅ Check firewall settings');
            console.error('   ✅ Ensure TCP/IP is enabled in SQL Server Configuration Manager');
        } else if (err.code === 'ELOGIN') {
            console.error('   ❌ Authentication failed');
            console.error('   ✅ Verify your username and password in .env file');
            console.error('   ✅ Check if SQL Server authentication is enabled');
            console.error('   ✅ Ensure the user has access to msdb database');
        } else if (err.message.includes('self signed certificate')) {
            console.error('   ❌ SSL Certificate issue');
            console.error('   ✅ Set DB_TRUST_CERT=true in .env file for local development');
        } else if (err.message.includes('timeout')) {
            console.error('   ❌ Connection timeout');
            console.error('   ✅ Check network connectivity');
            console.error('   ✅ Verify SQL Server is accepting remote connections');
            console.error('   ✅ Check if SQL Browser service is running');
        }
        
        console.error('');
        console.error('📝 Common Solutions:');
        console.error('   1. Copy .env.example to .env and fill in your credentials');
        console.error('   2. Enable TCP/IP in SQL Server Configuration Manager');
        console.error('   3. Enable SQL Server Authentication (Mixed Mode)');
        console.error('   4. Grant access to msdb database for your user');
        console.error('   5. Configure Windows Firewall to allow SQL Server port 1433');
        console.error('');
        
        process.exit(1);
        
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

// Run the test
testConnection();
