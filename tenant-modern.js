// TenantHub Modern Tenant Dashboard JavaScript

const API = '/api';
let tenantData = null;
let chatMessages = [];
let realTimeSync = null;

// Business type configurations
const businessConfig = {
    clinic: {
        name: 'Clinic',
        icon: 'user-doctor',
        color: '#ef4444',
        sections: [
            { label: 'Today\'s Patients', icon: 'calendar-check', stat: 'appointments' },
            { label: 'Active Treatments', icon: 'clipboard-list', stat: 'customers' },
            { label: 'Pending Reports', icon: 'file-medical', stat: 'tasks' }
        ]
    },
    daycare: {
        name: 'Daycare',
        icon: 'children',
        color: '#f59e0b',
        sections: [
            { label: 'Children Enrolled', icon: 'child', stat: 'customers' },
            { label: 'Today\'s Attendance', icon: 'clipboard-check', stat: 'appointments' },
            { label: 'Parent Contacts', icon: 'users', stat: 'tasks' }
        ]
    },
    salon: {
        name: 'Salon',
        icon: 'scissors',
        color: '#ec4899',
        sections: [
            { label: 'Today\'s Appointments', icon: 'calendar', stat: 'appointments' },
            { label: 'Active Clients', icon: 'users', stat: 'customers' },
            { label: 'Services Offered', icon: 'spa', stat: 'tasks' }
        ]
    },
    restaurant: {
        name: 'Restaurant',
        icon: 'utensils',
        color: '#f97316',
        sections: [
            { label: 'Today\'s Orders', icon: 'receipt', stat: 'appointments' },
            { label: 'Reservations', icon: 'calendar-check', stat: 'customers' },
            { label: 'Menu Items', icon: 'book-open', stat: 'tasks' }
        ]
    },
    retail: {
        name: 'Retail',
        icon: 'store',
        color: '#8b5cf6',
        sections: [
            { label: 'Products', icon: 'box', stat: 'customers' },
            { label: 'Today\'s Sales', icon: 'cash-register', stat: 'appointments' },
            { label: 'Inventory Items', icon: 'tags', stat: 'tasks' }
        ]
    },
    gym: {
        name: 'Gym',
        icon: 'dumbbell',
        color: '#10b981',
        sections: [
            { label: 'Active Members', icon: 'users', stat: 'customers' },
            { label: 'Today\'s Classes', icon: 'calendar', stat: 'appointments' },
            { label: 'Training Plans', icon: 'clipboard-list', stat: 'tasks' }
        ]
    },
    office: {
        name: 'Office',
        icon: 'briefcase',
        color: '#3b82f6',
        sections: [
            { label: 'Team Members', icon: 'users', stat: 'customers' },
            { label: 'Active Projects', icon: 'folder-open', stat: 'appointments' },
            { label: 'Pending Tasks', icon: 'tasks', stat: 'tasks' }
        ]
    },
    school: {
        name: 'School',
        icon: 'graduation-cap',
        color: '#6366f1',
        sections: [
            { label: 'Students', icon: 'user-graduate', stat: 'customers' },
            { label: 'Today\'s Classes', icon: 'chalkboard-teacher', stat: 'appointments' },
            { label: 'Courses', icon: 'book', stat: 'tasks' }
        ]
    },
    spa: {
        name: 'Spa',
        icon: 'spa',
        color: '#14b8a6',
        sections: [
            { label: 'Today\'s Bookings', icon: 'calendar-check', stat: 'appointments' },
            { label: 'Active Clients', icon: 'users', stat: 'customers' },
            { label: 'Treatment Packages', icon: 'clipboard-list', stat: 'tasks' }
        ]
    },
    auto: {
        name: 'Auto Service',
        icon: 'car',
        color: '#6b7280',
        sections: [
            { label: 'Vehicles in Service', icon: 'car', stat: 'appointments' },
            { label: 'Total Customers', icon: 'users', stat: 'customers' },
            { label: 'Service Types', icon: 'tools', stat: 'tasks' }
        ]
    },
    'real-estate': {
        name: 'Real Estate',
        icon: 'house',
        color: '#06b6d4',
        sections: [
            { label: 'Property Listings', icon: 'building', stat: 'customers' },
            { label: 'Client Meetings', icon: 'calendar', stat: 'appointments' },
            { label: 'Active Contracts', icon: 'file-contract', stat: 'tasks' }
        ]
    },
    legal: {
        name: 'Legal Services',
        icon: 'scale-balanced',
        color: '#374151',
        sections: [
            { label: 'Active Cases', icon: 'gavel', stat: 'customers' },
            { label: 'Client Meetings', icon: 'users', stat: 'appointments' },
            { label: 'Legal Documents', icon: 'file-alt', stat: 'tasks' }
        ]
    },
    other: {
        name: 'Business',
        icon: 'building',
        color: '#6b7280',
        sections: [
            { label: 'Customers', icon: 'users', stat: 'customers' },
            { label: 'Appointments', icon: 'calendar', stat: 'appointments' },
            { label: 'Services', icon: 'briefcase', stat: 'tasks' }
        ]
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Modern Tenant Dashboard Loaded ===');
    loadTenant();
});

// Load tenant data
function loadTenant() {
    console.log('Loading tenant data...');
    const stored = sessionStorage.getItem('current_tenant');
    const user = sessionStorage.getItem('tenanthub_user');

    if (!stored && !user) {
        showToast('Please login', 'error');
        setTimeout(() => window.location.href = '/index.html', 2000);
        return;
    }

    if (stored) {
        try {
            tenantData = JSON.parse(stored);
            loadUI();
        } catch (e) {
            console.error('Parse error:', e);
            if (user) fetchFromAPI();
            else redirectToLogin();
        }
    } else if (user) {
        fetchFromAPI();
    }
}

function fetchFromAPI() {
    try {
        const userData = JSON.parse(sessionStorage.getItem('tenanthub_user'));
        if (userData && userData.email) {
            fetch(`${API}/tenant/lookup?email=${encodeURIComponent(userData.email)}`)
                .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                .then(data => {
                    tenantData = data;
                    sessionStorage.setItem('current_tenant', JSON.stringify(data));
                    loadUI();
                })
                .catch(() => redirectToLogin());
        } else {
            redirectToLogin();
        }
    } catch (e) {
        redirectToLogin();
    }
}

function redirectToLogin() {
    showToast('Please login again', 'error');
    setTimeout(() => window.location.href = '/index.html', 2000);
}

// Load UI
function loadUI() {
    console.log('Loading UI...');
    
    // Update sidebar
    document.getElementById('tenant-name-display').textContent = tenantData.name;
    document.getElementById('user-name').textContent = tenantData.name.split(' ')[0];
    document.getElementById('user-email').textContent = tenantData.email;
    document.getElementById('user-avatar').textContent = tenantData.name.charAt(0).toUpperCase();
    
    // Update profile
    document.getElementById('company-name').value = tenantData.name;
    document.getElementById('contact-email').value = tenantData.email;
    document.getElementById('company-domain').value = tenantData.domain || '';
    document.getElementById('business-type-display').value = formatBusinessType(tenantData.businessType);
    document.getElementById('support-email-from').value = tenantData.email;
    
    // Update welcome message
    updateGreeting();
    
    // Load business-specific navigation
    loadBusinessNav();
    
    // Load stats
    loadStats();
    loadChatMessages();
    loadSupportEmailHistory();
    
    // Initialize real-time sync
    initRealTimeSync();
}

// Update greeting based on time
function updateGreeting() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const config = businessConfig[tenantData?.businessType] || businessConfig.other;
    document.getElementById('welcome-greeting').textContent = `${greeting}, ${tenantData.name.split(' ')[0]}`;
    document.getElementById('welcome-message').textContent = `Here's your ${config.name.toLowerCase()} overview for today.`;
}

// Load business-specific navigation
function loadBusinessNav() {
    const config = businessConfig[tenantData.businessType] || businessConfig.other;
    const navList = document.getElementById('business-nav-list');
    
    navList.innerHTML = config.sections.map((section, index) => `
        <li class="nav-item">
            <button class="nav-link" onclick="showSection('dashboard', this)">
                <span class="nav-icon"><i class="fas fa-${section.icon}"></i></span>
                <span>${section.label}</span>
            </button>
        </li>
    `).join('');
    
    // Load business overview cards
    loadBusinessOverview(config);
}

// Load business overview cards
function loadBusinessOverview(config) {
    const grid = document.getElementById('business-overview-grid');
    grid.innerHTML = config.sections.map(section => `
        <div class="stat-card">
            <div class="stat-header">
                <div>
                    <div class="stat-label">${section.label}</div>
                    <div class="stat-value" id="biz-${section.stat}">0</div>
                </div>
                <div class="stat-icon" style="background: ${config.color}20; color: ${config.color};">
                    <i class="fas fa-${section.icon}"></i>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize real-time sync
function initRealTimeSync() {
    if (realTimeSync) realTimeSync.destroy();
    
    realTimeSync = Object.create(RealTimeSync);
    realTimeSync.init({
        refreshInterval: 3000,
        chatRefreshInterval: 2000,
        statsRefreshInterval: 3000,
        enableAnimation: true
    });

    realTimeSync.subscribe('chatMessages', (newData, oldData) => {
        const tenantMessages = newData.filter(m => m.tenantId === tenantData.id);
        if (JSON.stringify(tenantMessages) !== JSON.stringify(chatMessages)) {
            chatMessages = tenantMessages;
            renderChat();
            localStorage.setItem(`chat_${tenantData.id}`, JSON.stringify(chatMessages));
        }
    });

    realTimeSync.subscribe('stats', (newData) => {
        updateStatsUI(newData);
    });

    realTimeSync.subscribe('supportEmails', (newData) => {
        const tenantEmails = newData.filter(e => e.tenantId === tenantData.id);
        if (tenantEmails.length > 0) {
            loadSupportEmailHistory();
        }
    });
}

// Update stats UI
function updateStatsUI(stats) {
    const config = businessConfig[tenantData.businessType] || businessConfig.other;
    
    // Update main stats
    DOMUpdater.updateText('#stat-customers', stats.customers || 0);
    DOMUpdater.updateText('#stat-appointments', stats.appointments || 0);
    DOMUpdater.updateText('#stat-deals', stats.activeDeals || 0);
    DOMUpdater.updateText('#stat-tasks', stats.tasks || 0);
    
    // Update business-specific stats
    config.sections.forEach(section => {
        const value = stats[section.stat] || 0;
        DOMUpdater.updateText(`#biz-${section.stat}`, value);
    });
}

// Load stats
async function loadStats() {
    try {
        const res = await fetch(`${API}/tenant/${tenantData.id}/stats`);
        const stats = await res.json();
        updateStatsUI(stats);
    } catch (e) {
        console.error('Stats error:', e);
    }
}

// Load dashboard
function loadDashboard() {
    loadStats();
    loadChatMessages();
    loadSupportEmailHistory();
    showToast('Dashboard refreshed', 'success');
}

// Show section
function showSection(section, navElement) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    
    document.getElementById(section + '-section').classList.add('active');
    if (navElement) navElement.classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        chat: 'Admin Chat',
        support: 'Email Support',
        profile: 'Profile Settings'
    };
    const subtitles = {
        dashboard: 'Manage your business',
        chat: 'Communicate with admin',
        support: 'Get help and support',
        profile: 'View your business profile'
    };
    
    document.getElementById('page-title').textContent = titles[section];
    document.getElementById('page-subtitle').textContent = subtitles[section] || '';

    if (section === 'chat') {
        loadChatMessages();
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }, 100);
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        toggleSidebar();
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('tenant-sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

// Chat functions
function loadChatMessages() {
    const stored = localStorage.getItem(`chat_${tenantData.id}`);
    if (stored) {
        chatMessages = JSON.parse(stored);
        renderChat();
    }
}

function renderChat() {
    const container = document.getElementById('chat-messages');
    const empty = document.getElementById('empty-chat');
    
    if (chatMessages.length === 0) {
        empty.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    empty.style.display = 'none';
    container.innerHTML = chatMessages.map(m => `
        <div class="chat-message-bubble" style="margin-bottom: 16px; display: flex; flex-direction: column; max-width: 70%; ${m.sender === 'tenant' ? 'margin-left: auto;' : ''}">
            <div class="chat-bubble" style="padding: 12px 16px; border-radius: 12px; ${m.sender === 'tenant' ? 'background: var(--primary); color: white; border-bottom-right-radius: 4px;' : 'background: var(--gray-100); color: var(--text-primary); border-bottom-left-radius: 4px;'}">
                ${escapeHtml(m.text)}
            </div>
            <div class="chat-time" style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px; ${m.sender === 'tenant' ? 'text-align: right;' : ''}">
                ${new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </div>
        </div>
    `).join('');
    
    const chatBody = document.getElementById('chat-body');
    chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    const newMsg = {
        id: Date.now(),
        tenantId: tenantData.id,
        tenantName: tenantData.name,
        sender: 'tenant',
        text: msg,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    try {
        await fetch(`${API}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMsg)
        });
        chatMessages.push(newMsg);
        localStorage.setItem(`chat_${tenantData.id}`, JSON.stringify(chatMessages));
        renderChat();
        input.value = '';
        showToast('Message sent', 'success');
    } catch (e) {
        console.error(e);
        showToast('Error sending message', 'error');
    }
}

function clearChat() {
    if (confirm('Clear chat history?')) {
        chatMessages = [];
        localStorage.removeItem(`chat_${tenantData.id}`);
        renderChat();
    }
}

// Support email functions
async function loadSupportEmailHistory() {
    try {
        const res = await fetch(`${API}/support-email/tenant/${tenantData.id}`);
        const emails = await res.json();
        const container = document.getElementById('support-email-history');
        
        if (emails.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; opacity: 0.3;"></i>
                    <p>No support emails yet</p>
                </div>
            `;
            return;
        }
        
        emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        container.innerHTML = emails.map(e => `
            <div style="border: 1px solid var(--border-light); border-left: 3px solid ${e.status === 'resolved' ? 'var(--success)' : 'var(--warning)'}; border-radius: var(--radius-md); padding: var(--spacing-4); margin-bottom: var(--spacing-3);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(e.subject)}</div>
                        <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                            ${new Date(e.timestamp).toLocaleString()}
                        </div>
                    </div>
                    <span class="badge badge-${e.status === 'resolved' ? 'success' : 'warning'}">${e.status || 'pending'}</span>
                </div>
                <div style="white-space: pre-wrap; color: var(--text-secondary); font-size: var(--font-size-sm);">${escapeHtml(e.message)}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error loading support emails:', e);
    }
}

function sendSupportEmail() {
    const subject = document.getElementById('support-subject').value;
    const message = document.getElementById('support-message').value;
    
    if (!subject || !message) {
        showToast('Fill in all fields', 'error');
        return;
    }
    
    fetch(`${API}/support-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: Date.now(),
            tenantId: tenantData.id,
            tenantName: tenantData.name,
            tenantEmail: tenantData.email,
            subject,
            message
        })
    })
    .then(() => {
        document.getElementById('support-subject').value = '';
        document.getElementById('support-message').value = '';
        showToast('Email sent!', 'success');
        loadSupportEmailHistory();
    })
    .catch(e => {
        console.error(e);
        showToast('Error sending email', 'error');
    });
}

// Utility functions
function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function formatBusinessType(type) {
    if (!type) return 'Business';
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function showToast(msg, type = 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function logout() {
    sessionStorage.removeItem('tenanthub_user');
    sessionStorage.removeItem('current_tenant');
    window.location.href = '/index.html';
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
