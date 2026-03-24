// ═══════════════════════════════════════════════════════════════
// TenantHub Database System - LocalStorage Persistent Storage
// ═══════════════════════════════════════════════════════════════

const DB_KEYS = {
    TENANTS: 'tenanthub_tenants',
    MESSAGES: 'tenanthub_messages',
    USERS: 'tenanthub_users',
    SETTINGS: 'tenanthub_settings',
    ANALYTICS: 'tenanthub_analytics'
};

// Initialize database with default data
function initDatabase() {
    if (!localStorage.getItem(DB_KEYS.TENANTS)) {
        const defaultTenants = [
            { id: 1, name: 'Acme Corporation', domain: 'acme.com', email: 'admin@acme.com', status: 'active', created: '2025-01-15', password: 'acme123' },
            { id: 2, name: 'TechStart Inc', domain: 'techstart.io', email: 'admin@techstart.io', status: 'active', created: '2025-02-20', password: 'tech456' },
            { id: 3, name: 'Global Services', domain: 'globalservices.net', email: 'admin@globalservices.net', status: 'inactive', created: '2025-03-01', password: 'global789' },
            { id: 4, name: 'Innovation Labs', domain: 'innovationlabs.co', email: 'admin@innovationlabs.co', status: 'pending', created: '2025-03-10', password: 'innov321' },
            { id: 5, name: 'Cloud Systems', domain: 'cloudsys.com', email: 'admin@cloudsys.com', status: 'active', created: '2025-03-12', password: 'cloud654' },
        ];
        localStorage.setItem(DB_KEYS.TENANTS, JSON.stringify(defaultTenants));
    }

    if (!localStorage.getItem(DB_KEYS.MESSAGES)) {
        const defaultMessages = [
            { id: 1, fromId: 1, toId: 0, content: 'Hello admin! I need help with my dashboard settings.', timestamp: '2025-03-15T10:30:00Z', read: true },
            { id: 2, fromId: 0, toId: 1, content: 'Hi! Sure, what do you need help with?', timestamp: '2025-03-15T10:35:00Z', read: true },
            { id: 3, fromId: 1, toId: 0, content: 'How do I update my company logo?', timestamp: '2025-03-15T10:40:00Z', read: true },
            { id: 4, fromId: 2, toId: 0, content: 'Can you help me understand the analytics?', timestamp: '2025-03-16T09:00:00Z', read: false },
        ];
        localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(defaultMessages));
    }

    if (!localStorage.getItem(DB_KEYS.USERS)) {
        const defaultUsers = {
            admin: { email: 'admin@tenanthub.com', password: 'admin123', role: 'admin' },
            tenants: [
                { email: 'admin@acme.com', password: 'acme123', id: 1, name: 'Acme Corporation' },
                { email: 'admin@techstart.io', password: 'tech456', id: 2, name: 'TechStart Inc' },
                { email: 'admin@globalservices.net', password: 'global789', id: 3, name: 'Global Services' },
                { email: 'admin@innovationlabs.co', password: 'innov321', id: 4, name: 'Innovation Labs' },
                { email: 'admin@cloudsys.com', password: 'cloud654', id: 5, name: 'Cloud Systems' },
            ]
        };
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
        const defaultSettings = {
            theme: 'dark',
            notifications: true,
            sessionTimeout: 30,
            defaultStatus: 'pending',
            allowRegistration: true,
            maxTenants: 100,
            aiEnabled: true,
            apiKey: 'AIzaSyC8rlJJ26KYDbmr_NmcBQ1dFRUvvC5tKUA'
        };
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }

    if (!localStorage.getItem(DB_KEYS.ANALYTICS)) {
        const defaultAnalytics = {};
        localStorage.setItem(DB_KEYS.ANALYTICS, JSON.stringify(defaultAnalytics));
    }
}

// Database CRUD operations
const db = {
    create(collection, item) {
        const items = this.getAll(collection);
        const newId = Math.max(...items.map(i => i.id || 0), 0) + 1;
        const newItem = { ...item, id: newId, createdAt: new Date().toISOString() };
        items.push(newItem);
        localStorage.setItem(DB_KEYS[collection.toUpperCase()], JSON.stringify(items));
        return newItem;
    },

    get(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === parseInt(id));
    },

    getAll(collection) {
        const data = localStorage.getItem(DB_KEYS[collection.toUpperCase()]);
        return data ? JSON.parse(data) : [];
    },

    update(collection, id, updates) {
        const items = this.getAll(collection);
        const index = items.findIndex(item => item.id === parseInt(id));
        if (index === -1) return null;
        items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(DB_KEYS[collection.toUpperCase()], JSON.stringify(items));
        return items[index];
    },

    delete(collection, id) {
        const items = this.getAll(collection);
        const filtered = items.filter(item => item.id !== parseInt(id));
        localStorage.setItem(DB_KEYS[collection.toUpperCase()], JSON.stringify(filtered));
        return true;
    },

    query(collection, filters = {}) {
        let items = this.getAll(collection);
        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                items = items.filter(item => {
                    if (typeof value === 'string') {
                        return item[key]?.toLowerCase().includes(value.toLowerCase());
                    }
                    return item[key] === value;
                });
            }
        }
        return items;
    },

    search(collection, query, fields = []) {
        const items = this.getAll(collection);
        const searchQuery = query.toLowerCase();
        return items.filter(item => {
            if (fields.length === 0) {
                return Object.values(item).some(val =>
                    String(val).toLowerCase().includes(searchQuery)
                );
            }
            return fields.some(field =>
                item[field]?.toLowerCase().includes(searchQuery)
            );
        });
    },

    count(collection) {
        return this.getAll(collection).length;
    },

    reset() {
        for (const key of Object.values(DB_KEYS)) {
            localStorage.removeItem(key);
        }
        initDatabase();
    }
};

// Chat/Messaging system
const chat = {
    send(fromId, toId, content, type = 'text') {
        const message = {
            id: Date.now(),
            fromId,
            toId,
            content,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };
        return db.create('messages', message);
    },

    getConversation(userId1, userId2) {
        const messages = db.getAll('messages');
        return messages.filter(m =>
            (m.fromId === userId1 && m.toId === userId2) ||
            (m.fromId === userId2 && m.toId === userId1)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    },

    getInbox(userId) {
        const messages = db.getAll('messages');
        return messages.filter(m => m.toId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    markAsRead(messageId) {
        return db.update('messages', messageId, { read: true });
    },

    markAllAsRead(userId) {
        const messages = this.getInbox(userId);
        messages.forEach(m => this.markAsRead(m.id));
    },

    getUnreadCount(userId) {
        const messages = db.getAll('messages');
        return messages.filter(m => m.toId === userId && !m.read).length;
    }
};

// Analytics tracking
const analytics = {
    track(tenantId, action) {
        const data = JSON.parse(localStorage.getItem(DB_KEYS.ANALYTICS) || '{}');
        if (!data[tenantId]) {
            data[tenantId] = { views: 0, queries: 0, sessions: 1, lastActive: new Date().toISOString() };
        }
        if (action === 'view') data[tenantId].views++;
        if (action === 'query') data[tenantId].queries++;
        data[tenantId].lastActive = new Date().toISOString();
        localStorage.setItem(DB_KEYS.ANALYTICS, JSON.stringify(data));
    },

    get(tenantId) {
        const data = JSON.parse(localStorage.getItem(DB_KEYS.ANALYTICS) || '{}');
        return data[tenantId] || { views: 0, queries: 0, sessions: 1 };
    }
};

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initDatabase);
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { db, chat, analytics, initDatabase, DB_KEYS };
}
