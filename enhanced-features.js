/**
 * TenantHub - Enhanced Tenant Features Module
 * Includes: Notifications, Calendar, Reports, Settings, Files, Dark Mode
 */

class EnhancedTenantFeatures {
    constructor(options = {}) {
        this.tenantId = options.tenantId;
        this.api = '/api';
        this.currentMonth = new Date();
        this.notifications = [];
        this.files = [];
        this.calendarEvents = [];
        this.settings = {
            emailNotifications: true,
            pushNotifications: true,
            darkMode: false,
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadNotifications();
        this.loadCalendarEvents();
        this.loadFiles();
        this.setupEventListeners();
        this.applyTheme();
    }

    // ==================== THEME MANAGEMENT ====================
    
    toggleTheme() {
        const body = document.body;
        const isLight = body.getAttribute('data-theme') === 'light';
        
        if (isLight) {
            body.removeAttribute('data-theme');
            this.settings.darkMode = false;
            this.updateThemeButtons('dark');
        } else {
            body.setAttribute('data-theme', 'light');
            this.settings.darkMode = true;
            this.updateThemeButtons('light');
        }
        
        this.saveSettings();
        this.showToast(`Switched to ${isLight ? 'dark' : 'light'} mode`, 'success');
    }

    updateThemeButtons(mode) {
        const icons = document.querySelectorAll('.theme-toggle .icon');
        const labels = document.querySelectorAll('.theme-toggle span:last-child');
        
        icons.forEach(icon => {
            icon.textContent = mode === 'light' ? '☀️' : '🌙';
        });
        
        labels.forEach(label => {
            label.textContent = mode === 'light' ? 'Light Mode' : 'Dark Mode';
        });
    }

    applyTheme() {
        if (this.settings.darkMode) {
            document.body.setAttribute('data-theme', 'light');
            this.updateThemeButtons('light');
        } else {
            document.body.removeAttribute('data-theme');
            this.updateThemeButtons('dark');
        }
    }

    // ==================== NOTIFICATION SYSTEM ====================
    
    loadNotifications() {
        // Load from localStorage or API
        const stored = localStorage.getItem(`notifications_${this.tenantId}`);
        if (stored) {
            this.notifications = JSON.parse(stored);
        } else {
            // Generate sample notifications
            this.notifications = [
                {
                    id: 1,
                    type: 'info',
                    message: 'Welcome to TenantHub! Your account is now active.',
                    time: new Date(Date.now() - 3600000).toISOString(),
                    read: false
                },
                {
                    id: 2,
                    type: 'success',
                    message: 'Your profile has been updated successfully.',
                    time: new Date(Date.now() - 7200000).toISOString(),
                    read: false
                },
                {
                    id: 3,
                    type: 'warning',
                    message: 'You have 3 appointments scheduled for tomorrow.',
                    time: new Date(Date.now() - 86400000).toISOString(),
                    read: true
                }
            ];
            this.saveNotifications();
        }
        this.renderNotifications();
    }

    saveNotifications() {
        localStorage.setItem(`notifications_${this.tenantId}`, JSON.stringify(this.notifications));
    }

    addNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            type,
            message,
            time: new Date().toISOString(),
            read: false
        };
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.renderNotifications();
        this.showBrowserNotification(message, type);
    }

    showBrowserNotification(message, type) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('TenantHub', {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    markNotificationAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.renderNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.renderNotifications();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.renderNotifications();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    renderNotifications() {
        const container = document.getElementById('notification-list');
        if (!container) return;

        const unreadCount = this.getUnreadCount();
        const countBadge = document.getElementById('notification-count');
        if (countBadge) {
            countBadge.textContent = unreadCount;
            countBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash" style="font-size: 2rem; margin-bottom: 12px; opacity: 0.3;"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.read ? 'read' : 'unread'}" onclick="tenantFeatures.markNotificationAsRead(${n.id})">
                <div class="notification-icon ${n.type}">
                    <i class="fas fa-${this.getNotificationIcon(n.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">${this.escapeHtml(n.message)}</div>
                    <div class="notification-time">${this.formatTime(n.time)}</div>
                </div>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            danger: 'times-circle'
        };
        return icons[type] || 'bell';
    }

    toggleNotificationCenter() {
        const center = document.getElementById('notification-center');
        if (center) {
            center.classList.toggle('active');
        }
    }

    // ==================== CALENDAR MODULE ====================
    
    loadCalendarEvents() {
        const stored = localStorage.getItem(`calendar_${this.tenantId}`);
        if (stored) {
            this.calendarEvents = JSON.parse(stored);
        } else {
            // Sample events
            this.calendarEvents = [
                {
                    id: 1,
                    title: 'Team Meeting',
                    date: new Date().toISOString().split('T')[0],
                    type: 'meeting'
                },
                {
                    id: 2,
                    title: 'Project Deadline',
                    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                    type: 'deadline'
                },
                {
                    id: 3,
                    title: 'Client Appointment',
                    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
                    type: 'appointment'
                }
            ];
            this.saveCalendarEvents();
        }
        this.renderCalendar();
    }

    saveCalendarEvents() {
        localStorage.setItem(`calendar_${this.tenantId}`, JSON.stringify(this.calendarEvents));
    }

    addCalendarEvent(title, date, type = 'meeting') {
        const event = {
            id: Date.now(),
            title,
            date,
            type
        };
        this.calendarEvents.push(event);
        this.saveCalendarEvents();
        this.renderCalendar();
        this.addNotification(`Event added: ${title}`, 'info');
    }

    renderCalendar() {
        const grid = document.getElementById('calendar-days');
        if (!grid) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        const monthTitle = document.getElementById('calendar-month-year');
        if (monthTitle) {
            monthTitle.textContent = `${monthNames[month]} ${year}`;
        }

        let html = '';
        
        // Previous month days
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevLastDay.getDate() - i;
            html += `<div class="calendar-day other-month"><div class="calendar-day-number">${day}</div></div>`;
        }
        
        // Current month days
        const today = new Date().toISOString().split('T')[0];
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const dayEvents = this.calendarEvents.filter(e => e.date === dateStr);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''}" onclick="tenantFeatures.onDayClick('${dateStr}')">
                    <div class="calendar-day-number">${day}</div>
                    <div class="calendar-day-events">
                        ${dayEvents.slice(0, 3).map(e => `
                            <div class="calendar-event ${e.type}">${this.escapeHtml(e.title)}</div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `<div class="calendar-event">+${dayEvents.length - 3} more</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Next month days
        const endDay = new Date(year, month + 1, 6).getDay();
        const remainingDays = 42 - (startDay + totalDays);
        for (let day = 1; day <= remainingDays; day++) {
            html += `<div class="calendar-day other-month"><div class="calendar-day-number">${day}</div></div>`;
        }
        
        grid.innerHTML = html;
    }

    onDayClick(date) {
        const dayEvents = this.calendarEvents.filter(e => e.date === date);
        const title = prompt(`Add event for ${date}:`);
        if (title) {
            const type = prompt('Event type (meeting, deadline, appointment):', 'meeting');
            this.addCalendarEvent(title, date, type || 'meeting');
        }
    }

    navigateCalendar(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
    }

    // ==================== REPORTS MODULE ====================
    
    generateReport(type) {
        const stats = {
            revenue: Math.floor(Math.random() * 10000) + 5000,
            customers: Math.floor(Math.random() * 100) + 20,
            appointments: Math.floor(Math.random() * 50) + 10,
            tasks: Math.floor(Math.random() * 30) + 5
        };
        
        const change = Math.random() > 0.5 ? 'positive' : 'negative';
        const changePercent = Math.floor(Math.random() * 20) + 5;
        
        return {
            value: stats[type] || 0,
            change: change,
            changePercent: changePercent
        };
    }

    renderReports() {
        const reports = [
            { id: 'revenue', title: 'Total Revenue', icon: 'fa-dollar-sign', class: 'revenue' },
            { id: 'customers', title: 'Active Customers', icon: 'fa-users', class: 'customers' },
            { id: 'appointments', title: 'Appointments', icon: 'fa-calendar-check', class: 'appointments' },
            { id: 'tasks', title: 'Pending Tasks', icon: 'fa-tasks', class: 'tasks' }
        ];

        reports.forEach(report => {
            const data = this.generateReport(report.id);
            const element = document.getElementById(`report-${report.id}`);
            if (element) {
                element.innerHTML = `
                    <div class="report-header">
                        <div class="report-icon ${report.class}">
                            <i class="fas ${report.icon}"></i>
                        </div>
                        <div class="report-title">${report.title}</div>
                    </div>
                    <div class="report-value">$${data.value.toLocaleString()}</div>
                    <div class="report-change ${data.change}">
                        <i class="fas fa-${data.change === 'positive' ? 'arrow-up' : 'arrow-down'}"></i>
                        <span>${data.changePercent}% from last month</span>
                    </div>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-primary" onclick="tenantFeatures.exportReport('${report.id}')">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="tenantFeatures.viewReportDetails('${report.id}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                    </div>
                `;
            }
        });
    }

    exportReport(type) {
        const data = this.generateReport(type);
        const csv = `Report Type,Value,Change\n${type},${data.value},${data.changePercent}%`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Report exported successfully', 'success');
    }

    viewReportDetails(type) {
        this.showToast(`Viewing details for ${type} report`, 'info');
    }

    // ==================== FILE MANAGER ====================
    
    loadFiles() {
        const stored = localStorage.getItem(`files_${this.tenantId}`);
        if (stored) {
            this.files = JSON.parse(stored);
        } else {
            this.files = [];
            this.saveFiles();
        }
        this.renderFiles();
    }

    saveFiles() {
        localStorage.setItem(`files_${this.tenantId}`, JSON.stringify(this.files));
    }

    uploadFile(file) {
        const fileData = {
            id: Date.now(),
            name: file.name,
            size: this.formatFileSize(file.size),
            type: this.getFileType(file.name),
            date: new Date().toISOString(),
            url: URL.createObjectURL(file)
        };
        this.files.push(fileData);
        this.saveFiles();
        this.renderFiles();
        this.addNotification(`File uploaded: ${file.name}`, 'success');
    }

    deleteFile(id) {
        const index = this.files.findIndex(f => f.id === id);
        if (index > -1) {
            this.files.splice(index, 1);
            this.saveFiles();
            this.renderFiles();
            this.showToast('File deleted', 'success');
        }
    }

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const types = {
            pdf: 'pdf',
            jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
            doc: 'document', docx: 'document', txt: 'document',
            xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet'
        };
        return types[ext] || 'file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    renderFiles() {
        const container = document.getElementById('file-list');
        if (!container) return;

        if (this.files.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <div class="empty-state-title">No files yet</div>
                    <div class="empty-state-desc">Upload your first file to get started</div>
                </div>
            `;
            return;
        }

        const icons = {
            pdf: 'fa-file-pdf',
            image: 'fa-file-image',
            document: 'fa-file-word',
            spreadsheet: 'fa-file-excel',
            file: 'fa-file'
        };

        container.innerHTML = this.files.map(f => `
            <div class="file-item">
                <div class="file-icon ${f.type}">
                    <i class="fas ${icons[f.type] || icons.file}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(f.name)}</div>
                    <div class="file-size">${f.size} • ${this.formatTime(f.date)}</div>
                </div>
                <div class="file-menu">
                    <button class="file-menu-btn" onclick="tenantFeatures.downloadFile(${f.id})" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-menu-btn" onclick="tenantFeatures.deleteFile(${f.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    downloadFile(id) {
        const file = this.files.find(f => f.id === id);
        if (file && file.url) {
            const a = document.createElement('a');
            a.href = file.url;
            a.download = file.name;
            a.click();
            this.showToast('Download started', 'success');
        }
    }

    // ==================== SETTINGS MODULE ====================
    
    loadSettings() {
        const stored = localStorage.getItem(`settings_${this.tenantId}`);
        if (stored) {
            this.settings = { ...this.settings, ...JSON.parse(stored) };
        }
        this.renderSettings();
    }

    saveSettings() {
        localStorage.setItem(`settings_${this.tenantId}`, JSON.stringify(this.settings));
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        if (key === 'darkMode') {
            this.toggleTheme();
        }
        
        this.showToast('Settings saved', 'success');
    }

    renderSettings() {
        // Render toggle states
        const toggles = {
            emailNotifications: this.settings.emailNotifications,
            pushNotifications: this.settings.pushNotifications,
            darkMode: this.settings.darkMode
        };

        Object.entries(toggles).forEach(([key, value]) => {
            const toggle = document.getElementById(`toggle-${key}`);
            if (toggle) {
                toggle.classList.toggle('active', value);
            }
        });

        // Render other settings
        const langSelect = document.getElementById('setting-language');
        if (langSelect) langSelect.value = this.settings.language;
    }

    // ==================== QUICK ACTIONS ====================
    
    quickAddCustomer() {
        const name = prompt('Customer name:');
        if (name) {
            this.addNotification(`Customer "${name}" added`, 'success');
            this.showToast('Customer added successfully', 'success');
        }
    }

    quickAddAppointment() {
        const title = prompt('Appointment title:');
        if (title) {
            const date = prompt('Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
            if (date) {
                this.addCalendarEvent(title, date, 'appointment');
                this.showToast('Appointment scheduled', 'success');
            }
        }
    }

    quickCreateTask() {
        const task = prompt('Task description:');
        if (task) {
            this.addNotification(`Task created: ${task}`, 'info');
            this.showToast('Task created', 'success');
        }
    }

    quickSendInvoice() {
        const customer = prompt('Customer name:');
        if (customer) {
            const amount = prompt('Amount:');
            if (amount) {
                this.addNotification(`Invoice sent to ${customer}`, 'success');
                this.showToast('Invoice sent', 'success');
            }
        }
    }

    // ==================== ACTIVITY TRACKING ====================
    
    logActivity(title, type = 'info') {
        const activities = JSON.parse(localStorage.getItem(`activities_${this.tenantId}`) || '[]');
        activities.unshift({
            id: Date.now(),
            title,
            type,
            time: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        activities.splice(50);
        
        localStorage.setItem(`activities_${this.tenantId}`, JSON.stringify(activities));
        this.renderActivityTimeline();
    }

    renderActivityTimeline() {
        const container = document.getElementById('activity-timeline');
        if (!container) return;

        const activities = JSON.parse(localStorage.getItem(`activities_${this.tenantId}`) || '[]');
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-title">No recent activity</div>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(a => `
            <div class="activity-item ${a.type}">
                <div class="activity-content">
                    <div class="activity-title">${this.escapeHtml(a.title)}</div>
                    <div class="activity-time">${this.formatTime(a.time)}</div>
                </div>
            </div>
        `).join('');
    }

    // ==================== UTILITY FUNCTIONS ====================
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = { success: '✓', error: '✕', info: 'ℹ' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
        `;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    setupEventListeners() {
        // File upload
        const fileInput = document.getElementById('file-upload-input');
        const fileDrop = document.getElementById('file-drop-zone');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.uploadFile(e.target.files[0]);
                }
            });
        }

        if (fileDrop) {
            fileDrop.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileDrop.style.borderColor = 'var(--primary)';
            });

            fileDrop.addEventListener('dragleave', () => {
                fileDrop.style.borderColor = 'var(--border-color)';
            });

            fileDrop.addEventListener('drop', (e) => {
                e.preventDefault();
                fileDrop.style.borderColor = 'var(--border-color)';
                if (e.dataTransfer.files.length > 0) {
                    this.uploadFile(e.dataTransfer.files[0]);
                }
            });
        }

        // Settings toggles
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const setting = toggle.id.replace('toggle-', '');
                this.updateSetting(setting, !this.settings[setting]);
            });
        });

        // Request notification permission on load
        this.requestNotificationPermission();
    }
}

// Initialize global instance
let tenantFeatures;

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const tenant = JSON.parse(sessionStorage.getItem('current_tenant') || '{}');
        if (tenant.id) {
            tenantFeatures = new EnhancedTenantFeatures({ tenantId: tenant.id });
            
            // Log initial activity
            tenantFeatures.logActivity('Dashboard accessed', 'info');
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedTenantFeatures;
}
