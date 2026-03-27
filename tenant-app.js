// TenantHub Tenant Dashboard Application

const API = '/api';
let tenantData = null;
let chatMessages = [];
let realTimeSync = null;

// Business type configurations for dynamic navigation
const businessTypes = {
    clinic: {
        name: 'Clinic',
        icon: 'user-doctor',
        color: '#ef4444',
        showClinical: true,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Patients', icon: 'procedures', section: 'patients' },
            { label: 'Treatments', icon: 'stethoscope', section: 'treatments' }
        ]
    },
    daycare: {
        name: 'Daycare',
        icon: 'children',
        color: '#f59e0b',
        showClinical: false,
        showFinance: false,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Children', icon: 'child', section: 'patients' },
            { label: 'Parents', icon: 'users', section: 'customers' }
        ]
    },
    salon: {
        name: 'Salon',
        icon: 'scissors',
        color: '#ec4899',
        showClinical: false,
        showFinance: false,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Clients', icon: 'users', section: 'customers' },
            { label: 'Services', icon: 'spa', section: 'catalog' }
        ]
    },
    restaurant: {
        name: 'Restaurant',
        icon: 'utensils',
        color: '#f97316',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Orders', icon: 'receipt', section: 'customers' },
            { label: 'Menu', icon: 'book-open', section: 'catalog' }
        ]
    },
    retail: {
        name: 'Retail',
        icon: 'store',
        color: '#8b5cf6',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Customers', icon: 'users', section: 'customers' },
            { label: 'Products', icon: 'box', section: 'catalog' }
        ]
    },
    gym: {
        name: 'Gym',
        icon: 'dumbbell',
        color: '#10b981',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Members', icon: 'users', section: 'customers' },
            { label: 'Classes', icon: 'calendar-check', section: 'schedule' }
        ]
    },
    office: {
        name: 'Office',
        icon: 'briefcase',
        color: '#3b82f6',
        showClinical: false,
        showFinance: false,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Team', icon: 'users', section: 'customers' },
            { label: 'Projects', icon: 'folder-open', section: 'notes' }
        ]
    },
    school: {
        name: 'School',
        icon: 'graduation-cap',
        color: '#6366f1',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Students', icon: 'user-graduate', section: 'patients' },
            { label: 'Courses', icon: 'book', section: 'catalog' }
        ]
    },
    spa: {
        name: 'Spa',
        icon: 'spa',
        color: '#14b8a6',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Clients', icon: 'users', section: 'customers' },
            { label: 'Treatments', icon: 'spa', section: 'catalog' }
        ]
    },
    auto: {
        name: 'Auto Service',
        icon: 'car',
        color: '#6b7280',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Customers', icon: 'users', section: 'customers' },
            { label: 'Services', icon: 'tools', section: 'catalog' }
        ]
    },
    'real-estate': {
        name: 'Real Estate',
        icon: 'house',
        color: '#06b6d4',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Properties', icon: 'building', section: 'catalog' },
            { label: 'Clients', icon: 'users', section: 'customers' }
        ]
    },
    legal: {
        name: 'Legal',
        icon: 'scale-balanced',
        color: '#374151',
        showClinical: false,
        showFinance: true,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Cases', icon: 'gavel', section: 'notes' },
            { label: 'Clients', icon: 'users', section: 'customers' }
        ]
    },
    other: {
        name: 'Business',
        icon: 'building',
        color: '#6b7280',
        showClinical: false,
        showFinance: false,
        sections: [
            { label: 'Schedule', icon: 'calendar', section: 'schedule' },
            { label: 'Customers', icon: 'users', section: 'customers' },
            { label: 'Services', icon: 'briefcase', section: 'catalog' }
        ]
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Tenant Dashboard Loaded ===');
    loadTenant();
});

// Load tenant data
function loadTenant() {
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
            if (user) fetchFromAPI();
            else redirectToLogin();
        }
    } else if (user) {
        fetchFromAPI();
    }
}

function fetchFromAPI() {
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
}

function redirectToLogin() {
    showToast('Please login again', 'error');
    setTimeout(() => window.location.href = '/index.html', 2000);
}

// Load UI
function loadUI() {
    // Update branding
    document.getElementById('brand-name').textContent = tenantData.name;
    document.getElementById('user-name').textContent = tenantData.name.split(' ')[0];
    document.getElementById('user-email').textContent = tenantData.email;
    document.getElementById('user-avatar').textContent = tenantData.name.charAt(0).toUpperCase();
    document.getElementById('support-email-from').value = tenantData.email;
    
    // Update welcome
    updateGreeting();
    
    // Setup business-specific navigation
    setupBusinessNav();
    
    // Load data
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
    
    // Determine title based on business type
    let title = greeting;
    const config = businessTypes[tenantData?.businessType] || businessTypes.other;
    
    if (tenantData?.businessType === 'clinic' || tenantData?.businessType === 'daycare') {
        title += ', Doctor';
    } else if (tenantData?.businessType === 'school') {
        title += ', Principal';
    } else {
        title += `, ${tenantData?.name.split(' ')[0] || 'User'}`;
    }
    
    document.getElementById('welcome-title').textContent = title;
}

// Setup business-specific navigation
function setupBusinessNav() {
    const config = businessTypes[tenantData.businessType] || businessTypes.other;
    const navSection = document.getElementById('dynamic-nav-section');
    
    // Show/hide special sections
    document.getElementById('clinical-section').style.display = config.showClinical ? 'block' : 'none';
    document.getElementById('finance-section').style.display = config.showFinance ? 'block' : 'none';
    
    // Create navigation items
    navSection.innerHTML = `
        <div class="nav-section-label">BUSINESS</div>
        ${config.sections.map(s => `
            <button class="nav-item" onclick="showSection('${s.section}', this)">
                <i class="fas fa-${s.icon} nav-icon"></i>
                <span>${s.label}</span>
            </button>
        `).join('')}
    `;
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

    realTimeSync.subscribe('chatMessages', (newData) => {
        const tenantMessages = newData.filter(m => m.tenantId === tenantData.id);
        if (JSON.stringify(tenantMessages) !== JSON.stringify(chatMessages)) {
            chatMessages = tenantMessages;
            renderChat();
            localStorage.setItem(`chat_${tenantData.id}`, JSON.stringify(chatMessages));
        }
    });

    realTimeSync.subscribe('stats', (stats) => {
        updateStatsUI(stats);
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
    // Main stats
    document.getElementById('stat-today-patients').textContent = stats.appointments || 0;
    document.getElementById('stat-new-prospects').textContent = stats.customers || 0;
    document.getElementById('stat-inquiries').textContent = Math.floor((stats.customers || 0) / 2);
    document.getElementById('stat-pending-tasks').textContent = stats.tasks || 0;
    document.getElementById('stat-collections').textContent = '$' + ((stats.activeDeals || 0) * 100);
    
    // Info values
    document.getElementById('info-treatment-plans').textContent = stats.customers || 0;
    document.getElementById('info-care-gaps').textContent = Math.floor((stats.tasks || 0) / 3);
    document.getElementById('info-recall-due').textContent = Math.floor((stats.appointments || 0) / 2);
    document.getElementById('info-campaigns').textContent = Math.floor((stats.tasks || 0) / 4);
    document.getElementById('info-open-rate').textContent = '--%';
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

// Show section
function showSection(section, navElement) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navElement) navElement.classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.overview-card, .stats-row, .welcome-banner, .overview-row').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show requested section
    const sectionMap = {
        'dashboard': () => showDashboard(),
        'comm-hub': () => showSectionById('comm-hub-section'),
        'chat': () => showSectionById('chat-section'),
        'support': () => showSectionById('support-section'),
        'customers': () => showPlaceholder('Customers', 'fa-users'),
        'notes': () => showPlaceholder('Notes', 'fa-sticky-note'),
        'schedule': () => showPlaceholder('Schedule', 'fa-calendar'),
        'patients': () => showPlaceholder('Patients', 'fa-procedures'),
        'treatments': () => showPlaceholder('Treatments', 'fa-stethoscope'),
        'billing': () => showPlaceholder('Billing', 'fa-file-invoice-dollar'),
        'marketing': () => showPlaceholder('Marketing', 'fa-bullhorn'),
        'outreach': () => showPlaceholder('Outreach', 'fa-paper-plane'),
        'reputation': () => showPlaceholder('Reputation', 'fa-star'),
        'loyalty': () => showPlaceholder('Loyalty', 'fa-gift'),
        'compliance': () => showPlaceholder('Compliance', 'fa-shield-alt'),
        'catalog': () => showPlaceholder('Catalog', 'fa-box'),
        'analytics': () => showPlaceholder('Analytics', 'fa-chart-bar'),
        'automation': () => showPlaceholder('Automation', 'fa-robot'),
        'ai-ops': () => showPlaceholder('AI Operations', 'fa-brain'),
        'settings': () => showPlaceholder('Settings', 'fa-cog')
    };
    
    if (sectionMap[section]) {
        sectionMap[section]();
    }
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        'comm-hub': 'Communication Hub',
        chat: 'Admin Chat',
        support: 'Email Support',
        customers: 'Customers',
        notes: 'Notes',
        schedule: 'Schedule',
        patients: 'Patients',
        treatments: 'Treatments',
        billing: 'Billing',
        marketing: 'Marketing',
        outreach: 'Outreach',
        reputation: 'Reputation',
        loyalty: 'Loyalty',
        compliance: 'Compliance',
        catalog: 'Catalog',
        analytics: 'Analytics',
        automation: 'Automation',
        'ai-ops': 'AI Operations',
        settings: 'Settings'
    };
    document.getElementById('page-title')?.textContent = titles[section] || section;
    
    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        toggleSidebar();
    }
}

function showDashboard() {
    document.querySelector('.welcome-banner').style.display = 'flex';
    document.querySelector('.stats-row').style.display = 'grid';
    document.querySelector('.overview-row').style.display = 'grid';
    document.querySelectorAll('.overview-card').forEach(el => {
        if (el.closest('.overview-row') || el.querySelector('.ai-content')) {
            el.style.display = 'block';
        }
    });
}

function showSectionById(id) {
    showDashboard();
    document.getElementById(id).style.display = 'block';
    // Scroll to section
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function showPlaceholder(title, icon) {
    showDashboard();
    const placeholder = document.createElement('div');
    placeholder.className = 'section-content active';
    placeholder.innerHTML = `
        <div class="overview-card" style="margin-top: 24px;">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-${icon}"></i> ${title}</h3>
            </div>
            <div class="card-content">
                <div class="content-placeholder">
                    <i class="fas fa-${icon}"></i>
                    <p>${title} features coming soon</p>
                </div>
            </div>
        </div>
    `;
    document.querySelector('.content-area').appendChild(placeholder);
    setTimeout(() => placeholder.remove(), 5000);
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('active');
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
        <div class="chat-message ${m.sender}">
            <div class="chat-bubble ${m.sender}">${escapeHtml(m.text)}</div>
            <div class="chat-time">${new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
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
                <div style="text-align: center; padding: 40px; color: var(--gray-400);">
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
                        <div style="font-size: var(--font-size-xs); color: var(--gray-500); margin-top: 4px;">
                            ${new Date(e.timestamp).toLocaleString()}
                        </div>
                    </div>
                    <span class="badge" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: ${e.status === 'resolved' ? 'var(--success-light)' : 'var(--warning-light)'}; color: ${e.status === 'resolved' ? 'var(--success)' : 'var(--warning)'};">
                        ${e.status || 'pending'}
                    </span>
                </div>
                <div style="white-space: pre-wrap; color: var(--gray-600); font-size: var(--font-size-sm);">${escapeHtml(e.message)}</div>
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
        showToast('Error sending email', 'error');
    });
}

// Utility functions
function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function showToast(msg, type = 'info') {
    const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        info: 'var(--primary)'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-size: var(--font-size-sm);
        font-weight: 500;
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

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
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
