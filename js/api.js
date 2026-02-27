// API Module for SQL Job Monitor
class JobMonitorAPI {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.api.baseUrl;
        this.endpoints = config.api.endpoints;
        this.timeout = config.api.timeout;
        this.useMockData = config.useMockData;
    }

    /**
     * Get authentication headers if enabled
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.config.api.auth.enabled) {
            const { type, token, headerName } = this.config.api.auth;
            
            if (type === 'bearer') {
                headers[headerName] = `Bearer ${token}`;
            } else if (type === 'apikey') {
                headers[headerName] = token;
            }
        }

        return headers;
    }

    /**
     * Make HTTP request with timeout
     */
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - server not responding');
            }
            
            throw error;
        }
    }

    /**
     * Get all SQL jobs
     */
    async getJobs() {
        try {
            // Return mock data if enabled
            if (this.useMockData) {
                console.log('Using mock data for jobs');
                return this.config.mockData.jobs;
            }

            const url = `${this.baseUrl}${this.endpoints.jobs}`;
            const jobs = await this.fetchWithTimeout(url);
            
            // Cache the jobs data
            this.cacheJobs(jobs);
            
            return jobs;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            
            // Try to return cached data on error
            const cachedJobs = this.getCachedJobs();
            if (cachedJobs) {
                console.log('Returning cached jobs due to API error');
                return cachedJobs;
            }
            
            throw error;
        }
    }

    /**
     * Get job details by ID
     */
    async getJobDetails(jobId) {
        try {
            if (this.useMockData) {
                const job = this.config.mockData.jobs.find(j => j.id === jobId);
                return job || null;
            }

            const url = `${this.baseUrl}${this.endpoints.jobDetails}/${jobId}`;
            return await this.fetchWithTimeout(url);
        } catch (error) {
            console.error(`Error fetching job details for ${jobId}:`, error);
            throw error;
        }
    }

    /**
     * Get job execution history
     */
    async getJobHistory(jobId) {
        try {
            if (this.useMockData) {
                console.log('Using mock data for history');
                return this.config.mockData.history;
            }

            const url = `${this.baseUrl}${this.endpoints.jobHistory}?jobId=${jobId}`;
            return await this.fetchWithTimeout(url);
        } catch (error) {
            console.error(`Error fetching history for job ${jobId}:`, error);
            throw error;
        }
    }

    /**
     * Cache jobs data to localStorage
     */
    cacheJobs(jobs) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                jobs: jobs
            };
            localStorage.setItem(
                this.config.storageKeys.cachedJobs,
                JSON.stringify(cacheData)
            );
        } catch (error) {
            console.warn('Failed to cache jobs:', error);
        }
    }

    /**
     * Get cached jobs from localStorage
     */
    getCachedJobs() {
        try {
            const cached = localStorage.getItem(this.config.storageKeys.cachedJobs);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            
            // Check if cache is less than 5 minutes old
            const cacheAge = Date.now() - cacheData.timestamp;
            if (cacheAge < 300000) { // 5 minutes
                return cacheData.jobs;
            }

            return null;
        } catch (error) {
            console.warn('Failed to retrieve cached jobs:', error);
            return null;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            if (this.useMockData) {
                return { success: true, message: 'Using mock data mode' };
            }

            const jobs = await this.getJobs();
            return { 
                success: true, 
                message: 'API connection successful',
                jobCount: jobs.length 
            };
        } catch (error) {
            return { 
                success: false, 
                message: error.message 
            };
        }
    }

    /**
     * Clear cached data
     */
    clearCache() {
        try {
            localStorage.removeItem(this.config.storageKeys.cachedJobs);
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }
}

// Create and export API instance
const api = new JobMonitorAPI(CONFIG);
