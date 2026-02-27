// Notification Module for SQL Job Monitor
class NotificationManager {
    constructor(config) {
        this.config = config;
        this.permission = 'default';
        this.enabled = config.notifications.enabled;
        this.triggers = config.notifications.triggers;
        this.notifiedJobs = new Set(); // Track notified jobs to avoid duplicates
        this.init();
    }

    /**
     * Initialize notification manager
     */
    init() {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            this.enabled = false;
            return;
        }

        // Get current permission
        this.permission = Notification.permission;
        
        // Load notification permission from storage
        this.loadSettings();
    }

    /**
     * Request notification permission from user
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            // Save permission state
            this.saveSettings();
            
            if (permission === 'granted') {
                this.enabled = true;
                this.showNotification(
                    'Notifications Enabled',
                    'You will now receive alerts for SQL job status changes',
                    'info'
                );
                return true;
            } else {
                console.log('Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Show browser notification
     */
    showNotification(title, message, type = 'info', jobId = null) {
        if (!this.enabled || this.permission !== 'granted') {
            return;
        }

        const options = {
            body: message,
            icon: this.getIconForType(type),
            badge: 'assets/icons/icon-96x96.png',
            tag: jobId || `notification-${Date.now()}`,
            requireInteraction: type === 'failed', // Keep failure notifications visible
            timestamp: Date.now(),
            vibrate: type === 'failed' ? [200, 100, 200] : [100]
        };

        try {
            const notification = new Notification(title, options);

            // Auto-close after 10 seconds (except for failures)
            if (type !== 'failed') {
                setTimeout(() => notification.close(), 10000);
            }

            // Handle notification click
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                notification.close();
                
                // If there's a job ID, could scroll to that job
                if (jobId) {
                    this.focusJob(jobId);
                }
            };

            // Play sound if enabled
            if (this.config.notifications.playSound) {
                this.playNotificationSound(type);
            }

        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    /**
     * Get icon based on notification type
     */
    getIconForType(type) {
        const icons = {
            success: 'assets/icons/icon-192x192.png',
            failed: 'assets/icons/icon-192x192.png',
            warning: 'assets/icons/icon-192x192.png',
            running: 'assets/icons/icon-192x192.png',
            info: 'assets/icons/icon-192x192.png'
        };
        return icons[type] || icons.info;
    }

    /**
     * Play notification sound
     */
    playNotificationSound(type) {
        try {
            // Create simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different types
            const frequencies = {
                success: 800,
                failed: 400,
                warning: 600,
                running: 700,
                info: 750
            };

            oscillator.frequency.value = frequencies[type] || frequencies.info;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    }

    /**
     * Focus on a specific job in the UI
     */
    focusJob(jobId) {
        const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
        if (jobCard) {
            jobCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            jobCard.style.animation = 'pulse 1s ease';
            setTimeout(() => {
                jobCard.style.animation = '';
            }, 1000);
        }
    }

    /**
     * Check job and send notification if needed
     */
    checkJobAndNotify(job, previousJobs = []) {
        if (!this.enabled || this.permission !== 'granted') {
            return;
        }

        // Find previous state of this job
        const previousJob = previousJobs.find(j => j.id === job.id);
        
        // Check if status changed
        const statusChanged = previousJob && previousJob.status !== job.status;
        
        // Generate unique notification key
        const notificationKey = `${job.id}-${job.status}-${job.lastRun}`;
        
        // Avoid duplicate notifications
        if (this.notifiedJobs.has(notificationKey)) {
            return;
        }

        // Check if we should notify based on status
        let shouldNotify = false;
        let notificationTitle = '';
        let notificationMessage = '';
        let notificationType = job.status;

        // Job failed
        if (job.status === 'failed' && this.triggers.onFailure) {
            shouldNotify = true;
            notificationTitle = `❌ Job Failed: ${job.name}`;
            notificationMessage = job.message || 'The job has failed. Please check the logs.';
        }
        
        // Job succeeded (and status changed)
        else if (job.status === 'success' && this.triggers.onSuccess && statusChanged) {
            shouldNotify = true;
            notificationTitle = `✅ Job Completed: ${job.name}`;
            notificationMessage = job.message || 'The job completed successfully.';
        }
        
        // Job has warnings
        else if (job.status === 'warning' && this.triggers.onWarning) {
            shouldNotify = true;
            notificationTitle = `⚠️ Job Warning: ${job.name}`;
            notificationMessage = job.message || 'The job completed with warnings.';
        }
        
        // Long-running job
        else if (job.status === 'running' && this.triggers.onLongRunning) {
            const runningTime = this.calculateRunningTime(job.lastRun);
            const threshold = this.config.notifications.longRunningThreshold;
            
            if (runningTime > threshold) {
                shouldNotify = true;
                notificationTitle = `⏱️ Long-Running Job: ${job.name}`;
                notificationMessage = `Job has been running for ${Math.floor(runningTime / 60)} minutes.`;
                notificationType = 'warning';
            }
        }

        if (shouldNotify) {
            this.showNotification(notificationTitle, notificationMessage, notificationType, job.id);
            this.notifiedJobs.add(notificationKey);
            
            // Clean up old notification keys (keep last 100)
            if (this.notifiedJobs.size > 100) {
                const keys = Array.from(this.notifiedJobs);
                this.notifiedJobs.delete(keys[0]);
            }
        }
    }

    /**
     * Calculate how long a job has been running (in seconds)
     */
    calculateRunningTime(lastRun) {
        const lastRunDate = new Date(lastRun);
        const now = new Date();
        return (now - lastRunDate) / 1000;
    }

    /**
     * Batch check multiple jobs
     */
    checkJobsAndNotify(currentJobs, previousJobs = []) {
        currentJobs.forEach(job => {
            this.checkJobAndNotify(job, previousJobs);
        });
    }

    /**
     * Update notification triggers
     */
    updateTriggers(triggers) {
        this.triggers = { ...this.triggers, ...triggers };
        this.saveSettings();
    }

    /**
     * Enable/disable notifications
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.saveSettings();
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            const settings = {
                enabled: this.enabled,
                permission: this.permission,
                triggers: this.triggers
            };
            localStorage.setItem(
                this.config.storageKeys.notificationPermission,
                JSON.stringify(settings)
            );
        } catch (error) {
            console.warn('Failed to save notification settings:', error);
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.config.storageKeys.notificationPermission);
            if (saved) {
                const settings = JSON.parse(saved);
                this.enabled = settings.enabled !== undefined ? settings.enabled : this.enabled;
                this.triggers = settings.triggers || this.triggers;
            }
        } catch (error) {
            console.warn('Failed to load notification settings:', error);
        }
    }

    /**
     * Get current notification status
     */
    getStatus() {
        return {
            supported: 'Notification' in window,
            permission: this.permission,
            enabled: this.enabled,
            triggers: this.triggers
        };
    }

    /**
     * Clear notification history
     */
    clearHistory() {
        this.notifiedJobs.clear();
    }
}

// Create and export notification manager instance
const notificationManager = new NotificationManager(CONFIG);
