// Main Application Logic for SQL Job Monitor
class SQLJobMonitorApp {
    constructor() {
        this.jobs = [];
        this.filteredJobs = [];
        this.refreshInterval = null;
        this.isLoading = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing SQL Job Monitor...');
        
        // Load saved settings
        this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check notification permission
        this.updateNotificationButton();
        
        // Load initial data
        await this.loadJobs();
        
        // Start auto-refresh if enabled
        this.setupAutoRefresh();
        
        // Update connection status
        this.updateConnectionStatus();
        
        console.log('Application initialized successfully');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadJobs();
        });

        // Notification button
        document.getElementById('notificationBtn').addEventListener('click', async () => {
            const granted = await notificationManager.requestPermission();
            this.updateNotificationButton();
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterJobs();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterJobs();
        });

        // Auto-refresh checkbox
        document.getElementById('autoRefresh').addEventListener('change', (e) => {
            CONFIG.refresh.autoRefresh = e.target.checked;
            this.setupAutoRefresh();
            this.saveSettings();
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.loadJobs();
        });

        // Modal close buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeSettingsModal').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
                this.closeSettingsModal();
            }
        });

        // Settings form buttons
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettingsFromForm();
        });

        document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Online/offline events
        window.addEventListener('online', () => {
            this.updateConnectionStatus();
            this.loadJobs();
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus();
        });
    }

    /**
     * Load jobs from API
     */
    async loadJobs() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        this.hideError();

        try {
            // Store previous jobs for comparison
            const previousJobs = [...this.jobs];
            
            // Fetch jobs from API
            this.jobs = await api.getJobs();
            
            // Check for notifications
            if (previousJobs.length > 0) {
                notificationManager.checkJobsAndNotify(this.jobs, previousJobs);
            }
            
            // Update UI
            this.updateSummaryCards();
            this.filterJobs();
            this.updateLastUpdated();
            
            console.log(`Loaded ${this.jobs.length} jobs`);
        } catch (error) {
            console.error('Failed to load jobs:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    /**
     * Filter jobs based on search and status filter
     */
    filterJobs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredJobs = this.jobs.filter(job => {
            // Search filter
            const matchesSearch = job.name.toLowerCase().includes(searchTerm);
            
            // Status filter
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        this.renderJobs();
    }

    /**
     * Render jobs to the grid
     */
    renderJobs() {
        const jobsGrid = document.getElementById('jobsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredJobs.length === 0) {
            jobsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        jobsGrid.innerHTML = this.filteredJobs.map(job => this.createJobCard(job)).join('');

        // Add click listeners to job cards
        jobsGrid.querySelectorAll('.job-card').forEach(card => {
            card.addEventListener('click', () => {
                const jobId = card.dataset.jobId;
                this.openJobDetails(jobId);
            });
        });
    }

    /**
     * Create HTML for a job card
     */
    createJobCard(job) {
        const lastRun = this.formatDate(job.lastRun);
        const nextRun = this.formatDate(job.nextRun);
        const duration = job.duration ? this.formatDuration(job.duration) : 'Running...';
        const statusIcon = this.getStatusIcon(job.status);

        return `
            <div class="job-card status-${job.status}" data-job-id="${job.id}">
                <div class="job-card-header">
                    <div>
                        <h3 class="job-name">${this.escapeHtml(job.name)}</h3>
                        <span class="job-status ${job.status}">
                            ${statusIcon} ${this.capitalize(job.status)}
                        </span>
                    </div>
                </div>
                <div class="job-info">
                    <div class="job-info-row">
                        <span class="icon">🕐</span>
                        <span>Last Run: ${lastRun}</span>
                    </div>
                    <div class="job-info-row">
                        <span class="icon">⏱️</span>
                        <span>Duration: ${duration}</span>
                    </div>
                    <div class="job-info-row">
                        <span class="icon">📅</span>
                        <span>Next Run: ${nextRun}</span>
                    </div>
                    ${job.message ? `
                    <div class="job-info-row">
                        <span class="icon">💬</span>
                        <span>${this.escapeHtml(job.message)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Update summary cards
     */
    updateSummaryCards() {
        const counts = {
            total: this.jobs.length,
            success: this.jobs.filter(j => j.status === 'success').length,
            failed: this.jobs.filter(j => j.status === 'failed').length,
            running: this.jobs.filter(j => j.status === 'running').length
        };

        document.getElementById('totalCount').textContent = counts.total;
        document.getElementById('successCount').textContent = counts.success;
        document.getElementById('failedCount').textContent = counts.failed;
        document.getElementById('runningCount').textContent = counts.running;
    }

    /**
     * Open job details modal
     */
    async openJobDetails(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        // Update modal with job details
        document.getElementById('modalJobName').textContent = job.name;
        document.getElementById('modalStatus').innerHTML = `
            <span class="job-status ${job.status}">${this.getStatusIcon(job.status)} ${this.capitalize(job.status)}</span>
        `;
        document.getElementById('modalLastRun').textContent = this.formatDate(job.lastRun);
        document.getElementById('modalDuration').textContent = job.duration ? this.formatDuration(job.duration) : 'Running...';
        document.getElementById('modalNextRun').textContent = this.formatDate(job.nextRun);
        document.getElementById('modalMessage').textContent = job.message || 'No message';

        // Show modal
        document.getElementById('jobModal').style.display = 'flex';

        // Load job history
        this.loadJobHistory(jobId);
    }

    /**
     * Load job history
     */
    async loadJobHistory(jobId) {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '<p>Loading history...</p>';

        try {
            const history = await api.getJobHistory(jobId);
            
            if (history.length === 0) {
                historyList.innerHTML = '<p>No execution history available.</p>';
                return;
            }

            historyList.innerHTML = history.map(item => `
                <div class="history-item ${item.status}">
                    <div><strong>Start:</strong> ${this.formatDate(item.startTime)}</div>
                    <div><strong>End:</strong> ${this.formatDate(item.endTime)}</div>
                    <div><strong>Duration:</strong> ${this.formatDuration(item.duration || 0)}</div>
                    <div><strong>Status:</strong> ${this.capitalize(item.status)}</div>
                    <div><strong>Message:</strong> ${this.escapeHtml(item.message || 'N/A')}</div>
                </div>
            `).join('');
        } catch (error) {
            historyList.innerHTML = `<p style="color: var(--error-color);">Failed to load history: ${error.message}</p>`;
        }
    }

    /**
     * Close job details modal
     */
    closeModal() {
        document.getElementById('jobModal').style.display = 'none';
    }

    /**
     * Open settings modal
     */
    openSettings() {
        // Populate form with current settings
        document.getElementById('apiUrlInput').value = CONFIG.api.baseUrl;
        document.getElementById('refreshIntervalInput').value = CONFIG.refresh.interval / 1000;
        document.getElementById('notifyFailure').checked = CONFIG.notifications.triggers.onFailure;
        document.getElementById('notifyWarning').checked = CONFIG.notifications.triggers.onWarning;
        document.getElementById('notifySuccess').checked = CONFIG.notifications.triggers.onSuccess;
        document.getElementById('notifyLongRunning').checked = CONFIG.notifications.triggers.onLongRunning;

        document.getElementById('settingsModal').style.display = 'flex';
    }

    /**
     * Close settings modal
     */
    closeSettingsModal() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    /**
     * Save settings from form
     */
    saveSettingsFromForm() {
        // Update config
        CONFIG.api.baseUrl = document.getElementById('apiUrlInput').value;
        CONFIG.refresh.interval = parseInt(document.getElementById('refreshIntervalInput').value) * 1000;
        CONFIG.notifications.triggers.onFailure = document.getElementById('notifyFailure').checked;
        CONFIG.notifications.triggers.onWarning = document.getElementById('notifyWarning').checked;
        CONFIG.notifications.triggers.onSuccess = document.getElementById('notifySuccess').checked;
        CONFIG.notifications.triggers.onLongRunning = document.getElementById('notifyLongRunning').checked;

        // Update notification manager
        notificationManager.updateTriggers(CONFIG.notifications.triggers);

        // Save to localStorage
        this.saveSettings();

        // Restart auto-refresh with new interval
        this.setupAutoRefresh();

        // Close modal
        this.closeSettingsModal();

        // Show success message
        alert('Settings saved successfully!');
    }

    /**
     * Setup auto-refresh
     */
    setupAutoRefresh() {
        // Clear existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        // Setup new interval if enabled
        if (CONFIG.refresh.autoRefresh) {
            this.refreshInterval = setInterval(() => {
                this.loadJobs();
            }, CONFIG.refresh.interval);
            console.log(`Auto-refresh enabled: ${CONFIG.refresh.interval / 1000}s`);
        }
    }

    /**
     * Update notification button
     */
    updateNotificationButton() {
        const btn = document.getElementById('notificationBtn');
        const status = notificationManager.getStatus();
        
        if (status.permission === 'granted') {
            btn.innerHTML = '<span class="icon">🔔</span><span class="btn-text">Notifications On</span>';
            btn.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
        } else {
            btn.innerHTML = '<span class="icon">🔕</span><span class="btn-text">Enable Notifications</span>';
            btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }
    }

    /**
     * Update connection status indicator
     */
    updateConnectionStatus() {
        const statusEl = document.getElementById('connectionStatus');
        if (navigator.onLine) {
            statusEl.textContent = '● Online';
            statusEl.className = 'status-online';
        } else {
            statusEl.textContent = '● Offline';
            statusEl.className = 'status-offline';
        }
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = this.formatDate(now.toISOString());
    }

    /**
     * Show/hide loading state
     */
    showLoading(show) {
        document.getElementById('loadingState').style.display = show ? 'block' : 'none';
        if (!show) {
            document.getElementById('jobsGrid').style.display = 'grid';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('jobsGrid').style.display = 'none';
    }

    /**
     * Hide error message
     */
    hideError() {
        document.getElementById('errorState').style.display = 'none';
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString(CONFIG.display.dateFormat, CONFIG.display.timeOptions);
    }

    /**
     * Format duration (seconds to readable format)
     */
    formatDuration(seconds) {
        if (!seconds) return '0s';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }

    /**
     * Get status icon
     */
    getStatusIcon(status) {
        const icons = {
            success: '✅',
            failed: '❌',
            running: '🔄',
            warning: '⚠️'
        };
        return icons[status] || '❓';
    }

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(CONFIG.storageKeys.settings, JSON.stringify({
                apiBaseUrl: CONFIG.api.baseUrl,
                refreshInterval: CONFIG.refresh.interval,
                autoRefresh: CONFIG.refresh.autoRefresh,
                notificationTriggers: CONFIG.notifications.triggers
            }));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKeys.settings);
            if (saved) {
                const settings = JSON.parse(saved);
                CONFIG.api.baseUrl = settings.apiBaseUrl || CONFIG.api.baseUrl;
                CONFIG.refresh.interval = settings.refreshInterval || CONFIG.refresh.interval;
                CONFIG.refresh.autoRefresh = settings.autoRefresh !== undefined ? settings.autoRefresh : CONFIG.refresh.autoRefresh;
                CONFIG.notifications.triggers = settings.notificationTriggers || CONFIG.notifications.triggers;
                
                // Update UI
                document.getElementById('autoRefresh').checked = CONFIG.refresh.autoRefresh;
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }
}

// Initialize the application
const app = new SQLJobMonitorApp();
