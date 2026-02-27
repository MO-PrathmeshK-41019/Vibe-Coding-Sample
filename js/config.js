// Configuration settings for SQL Job Monitor
const CONFIG = {
    // API Configuration
    api: {
        // IMPORTANT: Replace with your actual API base URL
        baseUrl: 'https://your-api.example.com',
        
        // API Endpoints
        endpoints: {
            jobs: '/api/jobs',              // Get all jobs
            jobHistory: '/api/job-history', // Get job history by ID
            jobDetails: '/api/jobs'         // Get specific job details
        },
        
        // API Authentication (if required)
        auth: {
            enabled: false,
            type: 'bearer', // 'bearer' or 'apikey'
            token: '', // Add your token here if auth is enabled
            headerName: 'Authorization' // or 'X-API-Key' etc.
        },
        
        // Request timeout in milliseconds
        timeout: 10000
    },
    
    // Refresh Settings
    refresh: {
        // Auto-refresh interval in milliseconds (30 seconds default)
        interval: 30000,
        
        // Enable auto-refresh by default
        autoRefresh: true,
        
        // Minimum allowed interval (5 seconds)
        minInterval: 5000,
        
        // Maximum allowed interval (5 minutes)
        maxInterval: 300000
    },
    
    // Notification Settings
    notifications: {
        // Enable notifications by default
        enabled: true,
        
        // Notification triggers
        triggers: {
            onFailure: true,      // Notify on job failures
            onWarning: true,      // Notify on warnings
            onSuccess: false,     // Notify on successful completions
            onLongRunning: true   // Notify on long-running jobs
        },
        
        // Long-running job threshold in seconds (5 minutes)
        longRunningThreshold: 300,
        
        // Sound notifications
        playSound: true
    },
    
    // Display Settings
    display: {
        // Date/Time format
        dateFormat: 'en-US',
        
        // Time format options
        timeOptions: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        
        // Jobs per page (if pagination is implemented)
        jobsPerPage: 50,
        
        // Default sort order
        sortBy: 'lastRun', // 'name', 'status', 'lastRun', 'duration'
        sortOrder: 'desc'  // 'asc' or 'desc'
    },
    
    // Mock Data for Development/Testing
    // Set to true to use mock data instead of API calls
    useMockData: false,
    
    // Mock data for testing
    mockData: {
        jobs: [
            {
                id: 'job-001',
                name: 'Daily Database Backup',
                status: 'success',
                lastRun: new Date(Date.now() - 3600000).toISOString(),
                duration: 120,
                nextRun: new Date(Date.now() + 82800000).toISOString(),
                message: 'Backup completed successfully'
            },
            {
                id: 'job-002',
                name: 'Data Cleanup Job',
                status: 'failed',
                lastRun: new Date(Date.now() - 7200000).toISOString(),
                duration: 45,
                nextRun: new Date(Date.now() + 79200000).toISOString(),
                message: 'Error: Timeout expired'
            },
            {
                id: 'job-003',
                name: 'Report Generation',
                status: 'running',
                lastRun: new Date(Date.now() - 600000).toISOString(),
                duration: null,
                nextRun: new Date(Date.now() + 86400000).toISOString(),
                message: 'Processing...'
            },
            {
                id: 'job-004',
                name: 'Index Maintenance',
                status: 'success',
                lastRun: new Date(Date.now() - 1800000).toISOString(),
                duration: 300,
                nextRun: new Date(Date.now() + 84600000).toISOString(),
                message: 'Indexes rebuilt successfully'
            },
            {
                id: 'job-005',
                name: 'Log Archive Job',
                status: 'warning',
                lastRun: new Date(Date.now() - 900000).toISOString(),
                duration: 90,
                nextRun: new Date(Date.now() + 85500000).toISOString(),
                message: 'Completed with warnings'
            }
        ],
        
        history: [
            {
                executionId: 'exec-001',
                startTime: new Date(Date.now() - 86400000).toISOString(),
                endTime: new Date(Date.now() - 86280000).toISOString(),
                status: 'success',
                duration: 120,
                message: 'Completed successfully'
            },
            {
                executionId: 'exec-002',
                startTime: new Date(Date.now() - 172800000).toISOString(),
                endTime: new Date(Date.now() - 172680000).toISOString(),
                status: 'success',
                duration: 120,
                message: 'Completed successfully'
            },
            {
                executionId: 'exec-003',
                startTime: new Date(Date.now() - 259200000).toISOString(),
                endTime: new Date(Date.now() - 259080000).toISOString(),
                status: 'failed',
                duration: 120,
                message: 'Error: Connection timeout'
            }
        ]
    },
    
    // Storage Keys for LocalStorage
    storageKeys: {
        settings: 'sql-monitor-settings',
        lastUpdate: 'sql-monitor-last-update',
        cachedJobs: 'sql-monitor-cached-jobs',
        notificationPermission: 'sql-monitor-notification-permission'
    },
    
    // App Information
    app: {
        name: 'SQL Job Monitor',
        version: '1.0.0',
        description: 'Real-time SQL Server Agent Job Monitoring PWA'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
