// ═══════════════════════════════════════════════════════════════
// TenantHub - Real-Time Data Synchronization
// Fast, efficient auto-refresh with selective DOM updates
// ═══════════════════════════════════════════════════════════════

const RealTimeSync = {
    // Configuration
    config: {
        refreshInterval: 2000,        // 2 seconds for rapid updates
        chatRefreshInterval: 1500,    // 1.5 seconds for chat
        statsRefreshInterval: 3000,   // 3 seconds for stats
        enableAnimation: true,
        maxRetries: 3,
        retryDelay: 1000
    },

    // State management
    state: {
        tenants: [],
        chatMessages: [],
        supportEmails: [],
        stats: null,
        lastUpdate: {},
        isSyncing: false,
        listeners: {},
        retryCount: 0,
        lastSyncTime: null
    },

    // Initialize real-time sync
    init(options = {}) {
        this.config = { ...this.config, ...options };
        console.log('[RealTimeSync] Initialized with', this.config.refreshInterval + 'ms interval');
        
        // Initialize sync status indicator
        this.initSyncStatus();
        
        // Start auto-refresh loops
        this.startTenantSync();
        this.startChatSync();
        this.startEmailSync();
        this.startStatsSync();

        // Listen for visibility changes (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Listen for storage events (cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key.startsWith('tenanthub_')) {
                this.forceRefresh();
            }
        });
        
        // Update status periodically
        this.statusInterval = setInterval(() => this.updateSyncStatus(), 1000);
    },

    // Subscribe to data changes
    subscribe(dataType, callback) {
        if (!this.state.listeners[dataType]) {
            this.state.listeners[dataType] = [];
        }
        this.state.listeners[dataType].push(callback);
        return () => {
            this.state.listeners[dataType] = this.state.listeners[dataType].filter(cb => cb !== callback);
        };
    },

    // Notify listeners of data change
    notify(dataType, newData, oldData) {
        if (this.state.listeners[dataType]) {
            this.state.listeners[dataType].forEach(callback => {
                try {
                    callback(newData, oldData);
                } catch (err) {
                    console.error('[RealTimeSync] Listener error:', err);
                }
            });
        }

        // Dispatch custom event for external listeners
        const event = new CustomEvent(`tenanthub:${dataType}:update`, {
            detail: { newData, oldData, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    },

    // Fetch data with error handling
    async fetch(endpoint, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(`/api${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' }
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[RealTimeSync] Fetch error (${endpoint}):`, error.message);
            this.state.retryCount++;
            
            if (this.state.retryCount < this.config.maxRetries) {
                await this.sleep(this.config.retryDelay);
                return this.fetch(endpoint, options);
            }
            
            throw error;
        }
    },

    // Check if data has changed
    hasChanged(dataType, newData) {
        const oldData = this.state[dataType];
        const oldStr = JSON.stringify(oldData);
        const newStr = JSON.stringify(newData);
        return oldStr !== newStr;
    },

    // Update state and notify listeners
    updateState(dataType, newData) {
        const oldData = this.state[dataType];
        
        if (this.hasChanged(dataType, newData)) {
            this.state[dataType] = newData;
            this.state.lastUpdate[dataType] = Date.now();
            this.notify(dataType, newData, oldData);
            return true;
        }
        return false;
    },

    // Sync tenants
    async syncTenants() {
        if (this.state.isSyncing) return;
        this.state.isSyncing = true;
        this.updateSyncStatus('syncing');

        try {
            const tenants = await this.fetch('/tenants');
            const changed = this.updateState('tenants', tenants);
            
            if (changed) {
                console.log('[RealTimeSync] Tenants updated:', tenants.length);
                this.triggerVisualUpdate('tenants');
            }
            
            this.trackSync();
        } catch (error) {
            console.error('[RealTimeSync] Tenant sync failed:', error.message);
            this.trackSyncError();
        } finally {
            this.state.isSyncing = false;
            if (!this.state.isSyncing && this.state.retryCount === 0) {
                this.updateSyncStatus('synced');
            }
        }
    },

    // Sync chat messages
    async syncChat(tenantId = null) {
        if (this.state.isSyncing) return;
        this.state.isSyncing = true;

        try {
            const endpoint = tenantId ? `/chat/${tenantId}` : '/chat';
            const messages = await this.fetch(endpoint);
            const changed = this.updateState('chatMessages', messages);
            
            if (changed) {
                console.log('[RealTimeSync] Chat messages updated:', messages.length);
                this.triggerVisualUpdate('chat');
                this.trackSync();
            }
        } catch (error) {
            console.error('[RealTimeSync] Chat sync failed:', error.message);
            this.trackSyncError();
        } finally {
            this.state.isSyncing = false;
        }
    },

    // Sync support emails
    async syncEmails() {
        if (this.state.isSyncing) return;
        this.state.isSyncing = true;
        this.updateSyncStatus('syncing');

        try {
            const emails = await this.fetch('/support-email');
            const changed = this.updateState('supportEmails', emails);
            
            if (changed) {
                console.log('[RealTimeSync] Support emails updated:', emails.length);
                this.triggerVisualUpdate('emails');
                this.trackSync();
            }
        } catch (error) {
            console.error('[RealTimeSync] Email sync failed:', error.message);
            this.trackSyncError();
        } finally {
            this.state.isSyncing = false;
            if (!this.state.isSyncing && this.state.retryCount === 0) {
                this.updateSyncStatus('synced');
            }
        }
    },

    // Sync stats
    async syncStats(tenantId) {
        if (this.state.isSyncing || !tenantId) return;
        this.state.isSyncing = true;

        try {
            const stats = await this.fetch(`/tenant/${tenantId}/stats`);
            const changed = this.updateState('stats', stats);
            
            if (changed) {
                console.log('[RealTimeSync] Stats updated');
                this.triggerVisualUpdate('stats');
            }
        } catch (error) {
            console.error('[RealTimeSync] Stats sync failed:', error.message);
        } finally {
            this.state.isSyncing = false;
        }
    },

    // Trigger visual update with animation
    triggerVisualUpdate(elementType) {
        if (!this.config.enableAnimation) return;

        const indicators = {
            tenants: ['.tenant-grid', '#tenant-grid', '#tenants-list'],
            chat: ['#chat-messages', '.chat-body'],
            emails: ['#support-emails-container'],
            stats: ['.overview-stats', '.dashboard-stats']
        };

        const selectors = indicators[elementType] || [];
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                // Subtle pulse animation
                element.style.transition = 'opacity 0.2s ease';
                element.style.opacity = '0.7';
                setTimeout(() => {
                    element.style.opacity = '1';
                }, 200);

                // Add update indicator
                this.showUpdateIndicator(element);
            }
        });
    },

    // Show subtle update indicator
    showUpdateIndicator(element) {
        // Remove existing indicator
        const existing = element.querySelector('.update-indicator');
        if (existing) existing.remove();

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'update-indicator';
        indicator.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--neon-green);
            color: var(--bg-primary);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            z-index: 10;
            animation: pulse 0.5s ease;
        `;

        element.style.position = 'relative';
        element.appendChild(indicator);

        // Remove after animation
        setTimeout(() => indicator.remove(), 1000);
    },

    // Start auto-refresh loops
    startTenantSync() {
        this.tenantInterval = setInterval(() => this.syncTenants(), this.config.refreshInterval);
    },

    startChatSync() {
        this.chatInterval = setInterval(() => {
            const tenantData = sessionStorage.getItem('current_tenant');
            if (tenantData) {
                const tenant = JSON.parse(tenantData);
                this.syncChat(tenant.id);
            } else {
                this.syncChat();
            }
        }, this.config.chatRefreshInterval);
    },

    startEmailSync() {
        this.emailInterval = setInterval(() => this.syncEmails(), this.config.refreshInterval * 2);
    },

    startStatsSync() {
        this.statsInterval = setInterval(() => {
            const tenantData = sessionStorage.getItem('current_tenant');
            if (tenantData) {
                const tenant = JSON.parse(tenantData);
                this.syncStats(tenant.id);
            }
        }, this.config.statsRefreshInterval);
    },

    // Pause all sync
    pause() {
        console.log('[RealTimeSync] Paused (tab hidden)');
        clearInterval(this.tenantInterval);
        clearInterval(this.chatInterval);
        clearInterval(this.emailInterval);
        clearInterval(this.statsInterval);
    },

    // Resume all sync
    resume() {
        console.log('[RealTimeSync] Resumed (tab visible)');
        this.startTenantSync();
        this.startChatSync();
        this.startEmailSync();
        this.startStatsSync();
        this.forceRefresh();
    },

    // Force immediate refresh
    async forceRefresh() {
        console.log('[RealTimeSync] Force refresh');
        await Promise.all([
            this.syncTenants(),
            this.syncChat(),
            this.syncEmails()
        ]);
    },

    // Stop all sync
    destroy() {
        clearInterval(this.tenantInterval);
        clearInterval(this.chatInterval);
        clearInterval(this.emailInterval);
        clearInterval(this.statsInterval);
        clearInterval(this.statusInterval);
        this.state.listeners = {};
    },

    // Utility: Sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Get current state
    getState(dataType) {
        return this.state[dataType];
    },

    // Get last update time
    getLastUpdate(dataType) {
        return this.state.lastUpdate[dataType];
    },

    // Initialize sync status indicator
    initSyncStatus() {
        const indicator = document.getElementById('sync-status');
        if (!indicator) return;
        
        indicator.style.display = 'flex';
        this.updateSyncStatus('synced');
    },

    // Update sync status indicator
    updateSyncStatus(status) {
        const indicator = document.getElementById('sync-status');
        if (!indicator) return;

        const icon = indicator.querySelector('i');
        const text = indicator.querySelector('span');

        indicator.classList.remove('syncing', 'synced', 'error');

        if (status === 'syncing' || this.state.isSyncing) {
            indicator.classList.add('syncing');
            if (icon) icon.className = 'fas fa-sync';
            if (text) text.textContent = 'Syncing...';
        } else if (status === 'error') {
            indicator.classList.add('error');
            if (icon) icon.className = 'fas fa-exclamation-triangle';
            if (text) text.textContent = 'Sync error';
        } else {
            indicator.classList.add('synced');
            if (icon) icon.className = 'fas fa-check-circle';
            
            // Show time since last sync
            const lastSync = this.state.lastSyncTime;
            if (lastSync) {
                const seconds = Math.floor((Date.now() - lastSync) / 1000);
                if (text) text.textContent = seconds < 60 ? `Synced ${seconds}s ago` : 'Live';
            } else {
                if (text) text.textContent = 'Live';
            }
        }
    },

    // Track successful sync
    trackSync() {
        this.state.lastSyncTime = Date.now();
        this.state.retryCount = 0;
        this.updateSyncStatus('synced');
    },

    // Track sync error
    trackSyncError() {
        this.state.retryCount++;
        if (this.state.retryCount >= this.config.maxRetries) {
            this.updateSyncStatus('error');
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// DOM Update Helpers - Selective element updates
// ═══════════════════════════════════════════════════════════════

const DOMUpdater = {
    // Update text content only if changed
    updateText(selector, newText) {
        const element = document.querySelector(selector);
        if (element && element.textContent !== newText) {
            element.textContent = newText;
            return true;
        }
        return false;
    },

    // Update HTML content only if changed
    updateHTML(selector, newHTML) {
        const element = document.querySelector(selector);
        if (element && element.innerHTML !== newHTML) {
            element.innerHTML = newHTML;
            return true;
        }
        return false;
    },

    // Update count badges with animation
    updateCount(selector, count) {
        const element = document.querySelector(selector);
        if (element) {
            const currentCount = parseInt(element.textContent) || 0;
            if (currentCount !== count) {
                element.textContent = count;
                
                // Pulse animation if count increased
                if (count > currentCount) {
                    element.style.animation = 'pulse 0.3s ease';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 300);
                }
                return true;
            }
        }
        return false;
    },

    // Update grid/list with minimal DOM manipulation
    updateList(selector, items, renderItem) {
        const element = document.querySelector(selector);
        if (!element) return false;

        const currentItems = element.querySelectorAll('[data-item-id]');
        const currentIds = Array.from(currentItems).map(el => el.dataset.itemId);
        const newIds = items.map(item => String(item.id));

        // Check if complete re-render needed
        const hasChanges = currentIds.length !== newIds.length || 
                          currentIds.some((id, i) => id !== newIds[i]);

        if (!hasChanges) return false;

        // Update existing items, add new ones, remove deleted ones
        const fragment = document.createDocumentFragment();
        
        items.forEach((item, index) => {
            const existingEl = element.querySelector(`[data-item-id="${item.id}"]`);
            const newHTML = renderItem(item, index);
            
            if (existingEl) {
                // Update in place
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;
                const newEl = tempDiv.firstElementChild;
                
                if (newEl) {
                    existingEl.replaceWith(newEl);
                }
            } else {
                // Create new element
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;
                if (tempDiv.firstElementChild) {
                    fragment.appendChild(tempDiv.firstElementChild);
                }
            }
        });

        // Remove deleted items
        currentIds.forEach(id => {
            if (!newIds.includes(id)) {
                const el = element.querySelector(`[data-item-id="${id}"]`);
                if (el) el.remove();
            }
        });

        // Append new items
        element.appendChild(fragment);

        return true;
    },

    // Update stat numbers with counting animation
    updateStat(selector, newValue, duration = 500) {
        const element = document.querySelector(selector);
        if (!element) return false;

        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        
        if (currentValue === newValue) return false;

        const increment = (newValue - currentValue) / (duration / 16);
        let current = currentValue;

        const animate = () => {
            current += increment;
            
            if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
                element.textContent = newValue.toLocaleString();
                return;
            }

            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(animate);
        };

        animate();
        return true;
    }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RealTimeSync, DOMUpdater };
}
