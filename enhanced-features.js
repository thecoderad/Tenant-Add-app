// ═══════════════════════════════════════════════════════════════
// TenantHub - Enhanced JavaScript Functionality
// Advanced features and utilities for the platform
// ═══════════════════════════════════════════════════════════════

// Enhanced database operations with validation
const enhancedDB = {
    ...db,

    // Validate tenant data before creation
    validateTenant(tenant) {
        const errors = [];

        if (!tenant.name || tenant.name.length < 2) {
            errors.push('Company name must be at least 2 characters');
        }

        if (!tenant.domain || !this.isValidDomain(tenant.domain)) {
            errors.push('Valid domain is required (e.g., company.com)');
        }

        if (!tenant.email || !this.isValidEmail(tenant.email)) {
            errors.push('Valid email is required');
        }

        if (!tenant.password || tenant.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        return { isValid: errors.length === 0, errors };
    },

    // Domain validation
    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
    },

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Enhanced tenant creation with validation
    createTenant(tenant) {
        const validation = this.validateTenant(tenant);

        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Check for duplicate domain or email
        const existingTenants = this.getAll('tenants');
        if (existingTenants.some(t => t.domain === tenant.domain)) {
            throw new Error('Domain already exists');
        }
        if (existingTenants.some(t => t.email === tenant.email)) {
            throw new Error('Email already exists');
        }

        return this.create('tenants', tenant);
    },

    // Bulk operations
    bulkUpdate(collection, updatesArray) {
        const items = this.getAll(collection);
        updatesArray.forEach(update => {
            const index = items.findIndex(item => item.id === update.id);
            if (index !== -1) {
                items[index] = { ...items[index], ...update.updates };
            }
        });
        localStorage.setItem(DB_KEYS[collection.toUpperCase()], JSON.stringify(items));
        return items;
    },

    // Export data
    exportCollection(collection) {
        const data = this.getAll(collection);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        return URL.createObjectURL(blob);
    },

    // Import data
    importCollection(collection, data) {
        localStorage.setItem(DB_KEYS[collection.toUpperCase()], JSON.stringify(data));
    }
};

// Advanced analytics tracking
const advancedAnalytics = {
    ...analytics,

    // Track detailed user interactions
    trackInteraction(tenantId, action, details = {}) {
        const baseData = this.get(tenantId);
        const interaction = {
            timestamp: new Date().toISOString(),
            action,
            details,
            userAgent: navigator.userAgent,
            page: window.location.pathname
        };

        // Store interactions
        const interactionsKey = `${DB_KEYS.ANALYTICS}_interactions`;
        const interactions = JSON.parse(localStorage.getItem(interactionsKey) || '{}');

        if (!interactions[tenantId]) {
            interactions[tenantId] = [];
        }

        interactions[tenantId].push(interaction);

        // Keep only last 100 interactions per tenant
        if (interactions[tenantId].length > 100) {
            interactions[tenantId] = interactions[tenantId].slice(-100);
        }

        localStorage.setItem(interactionsKey, JSON.stringify(interactions));

        // Call base analytics
        this.track(tenantId, action);
    },

    // Get interaction history
    getInteractions(tenantId) {
        const interactionsKey = `${DB_KEYS.ANALYTICS}_interactions`;
        const interactions = JSON.parse(localStorage.getItem(interactionsKey) || '{}');
        return interactions[tenantId] || [];
    },

    // Generate analytics report
    generateReport(tenantId, days = 30) {
        const interactions = this.getInteractions(tenantId);
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const filteredInteractions = interactions.filter(
            interaction => new Date(interaction.timestamp) > cutoffDate
        );

        const report = {
            totalInteractions: filteredInteractions.length,
            dailyActivity: {},
            popularActions: {},
            peakHours: {}
        };

        filteredInteractions.forEach(interaction => {
            const date = interaction.timestamp.split('T')[0];
            const hour = new Date(interaction.timestamp).getHours();

            report.dailyActivity[date] = (report.dailyActivity[date] || 0) + 1;
            report.popularActions[interaction.action] = (report.popularActions[interaction.action] || 0) + 1;
            report.peakHours[hour] = (report.peakHours[hour] || 0) + 1;
        });

        return report;
    }
};

// Enhanced chat system
const enhancedChat = {
    ...chat,

    // Rich message types
    sendRichMessage(fromId, toId, content, type = 'text', metadata = {}) {
        const message = {
            id: Date.now(),
            fromId,
            toId,
            content,
            type,
            timestamp: new Date().toISOString(),
            read: false,
            metadata
        };

        return enhancedDB.create('messages', message);
    },

    // File sharing capability
    sendFile(fromId, toId, file, description = '') {
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file)
        };

        return this.sendRichMessage(fromId, toId, description, 'file', fileData);
    },

    // Message reactions
    addReaction(messageId, userId, reaction) {
        const message = enhancedDB.get('messages', messageId);
        if (!message.metadata.reactions) {
            message.metadata.reactions = {};
        }
        if (!message.metadata.reactions[userId]) {
            message.metadata.reactions[userId] = [];
        }
        if (!message.metadata.reactions[userId].includes(reaction)) {
            message.metadata.reactions[userId].push(reaction);
        }
        return enhancedDB.update('messages', messageId, { metadata: message.metadata });
    },

    // Threaded conversations
    createThread(parentMessageId, fromId, toId, content) {
        const threadMessage = {
            content,
            fromId,
            toId,
            timestamp: new Date().toISOString(),
            parentId: parentMessageId,
            type: 'thread-reply'
        };

        return enhancedDB.create('messages', threadMessage);
    }
};

// UI Enhancement Utilities
const UIEnhancer = {
    // Create animated notifications
    notify(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `enhanced-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas fa-${this.getIconForType(type)}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.fadeOut(notification);
            }, duration);
        }

        return notification;
    },

    getIconForType(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    },

    fadeOut(element) {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        setTimeout(() => element.remove(), 300);
    },

    // Loading states
    showLoading(target = document.body) {
        const loader = document.createElement('div');
        loader.className = 'enhanced-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <span>Loading...</span>
            </div>
        `;

        if (target === document.body) {
            loader.style.position = 'fixed';
            loader.style.top = '0';
            loader.style.left = '0';
            loader.style.width = '100%';
            loader.style.height = '100%';
            loader.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loader.style.display = 'flex';
            loader.style.alignItems = 'center';
            loader.style.justifyContent = 'center';
            loader.style.zIndex = '9999';
        }

        target.appendChild(loader);
        return loader;
    },

    hideLoading(loader) {
        if (loader && loader.parentNode) {
            loader.remove();
        }
    },

    // Modal enhancements
    showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'enhanced-modal-overlay';
        modal.innerHTML = `
            <div class="enhanced-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.enhanced-modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="btn ${btn.className || 'btn-outline'}"
                                onclick="${btn.onclick || ''}; this.closest('.enhanced-modal-overlay').remove();">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    },

    // Form validation utilities
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.highlightError(input);
                isValid = false;
            } else {
                this.clearError(input);
            }

            // Check for custom validation
            if (input.hasAttribute('data-validate')) {
                const validator = input.getAttribute('data-validate');
                if (!this.runValidator(input.value, validator)) {
                    this.highlightError(input);
                    isValid = false;
                } else {
                    this.clearError(input);
                }
            }
        });

        return isValid;
    },

    highlightError(element) {
        element.style.borderColor = 'var(--neon-red)';
        element.style.boxShadow = '0 0 10px rgba(255, 56, 96, 0.5)';

        // Add error message if not already present
        if (!element.nextElementSibling || !element.nextElementSibling.classList.contains('form-error')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.textContent = 'This field is required';
            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        }
    },

    clearError(element) {
        element.style.borderColor = 'var(--border-color)';
        element.style.boxShadow = 'none';

        // Remove error message
        const error = element.nextElementSibling;
        if (error && error.classList.contains('form-error')) {
            error.remove();
        }
    },

    runValidator(value, validator) {
        // Built-in validators
        const validators = {
            email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            phone: /^\+?[\d\s\-\(\)]{10,}$/,
            url: /^https?:\/\/.+/
        };

        if (validators[validator]) {
            return validators[validator].test(value);
        }

        // Custom regex
        try {
            const regex = new RegExp(validator);
            return regex.test(value);
        } catch (e) {
            return true; // If invalid regex, don't block submission
        }
    },

    // Animation utilities
    animateElement(element, animationClass) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 1000);
    },

    // Data export/import
    exportData() {
        const data = {};
        for (const [key, value] of Object.entries(DB_KEYS)) {
            data[value] = JSON.parse(localStorage.getItem(value) || '[]');
        }
        return JSON.stringify(data, null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
};

// Security enhancements
const SecurityManager = {
    // Password strength checker
    checkPasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Include uppercase letters');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Include lowercase letters');

        if (/[0-9]/.test(password)) score += 1;
        else feedback.push('Include numbers');

        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        else feedback.push('Include special characters');

        const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strength = strengthLevels[score] || 'Very Strong';

        return {
            score,
            strength,
            feedback: feedback.length > 0 ? feedback : null
        };
    },

    // Session management
    createSession(userId, role) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            userId,
            role,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min default
        };

        sessionStorage.setItem('current_session', JSON.stringify(session));
        return session;
    },

    validateSession() {
        const session = JSON.parse(sessionStorage.getItem('current_session') || 'null');

        if (!session) return false;

        const now = new Date();
        const expiresAt = new Date(session.expiresAt);

        if (now > expiresAt) {
            this.destroySession();
            return false;
        }

        return session;
    },

    destroySession() {
        sessionStorage.removeItem('current_session');
        localStorage.removeItem('current_tenant_id');
    },

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Enhance all forms with validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!UIEnhancer.validateForm(form)) {
                e.preventDefault();
                UIEnhancer.notify('Please fix the highlighted fields', 'error');
            }
        });
    });

    // Add global event listeners
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            // Trigger save action if on a form
            const activeForm = document.activeElement.closest('form');
            if (activeForm) {
                activeForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
        });
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        enhancedDB,
        advancedAnalytics,
        enhancedChat,
        UIEnhancer,
        SecurityManager
    };
}