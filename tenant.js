// Tenant Dashboard JavaScript - With Database & Messaging
const API_KEY = 'AIzaSyC8rlJJ26KYDbmr_NmcBQ1dFRUvvC5tKUA';
const ADMIN_ID = 0;

// Current tenant session
let currentTenant = null;
let chatHistory = [];
let analytics = {
    views: 0,
    queries: 0,
    sessions: 1
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTenantSession();
    updateAnalytics();
    renderChart();
    setupNavigation();
    loadTenantMessages();
    updateMessageCount();
});

// Load tenant from database
function loadTenantSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantId = urlParams.get('id');

    // Get tenant from database
    const tenants = db.getAll('tenants');

    if (tenantId) {
        currentTenant = db.get('tenants', tenantId);
    }

    // Default to first tenant if none specified
    if (!currentTenant && tenants.length > 0) {
        currentTenant = tenants[0];
    }

    // Update UI with tenant info
    const nameDisplay = document.getElementById('tenantNameDisplay');
    const domainDisplay = document.getElementById('tenantDomainDisplay');
    const welcomeName = document.getElementById('welcomeName');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileTenantName = document.getElementById('profileTenantName');
    const profileDomain = document.getElementById('profileDomain');
    const profileEmailInput = document.getElementById('profileEmailInput');
    const tenantStatusDisplay = document.getElementById('tenantStatusDisplay');
    const tenantLogo = document.getElementById('tenantLogo');

    if (currentTenant) {
        if (nameDisplay) nameDisplay.textContent = currentTenant.name;
        if (domainDisplay) domainDisplay.textContent = currentTenant.domain;
        if (welcomeName) welcomeName.textContent = currentTenant.name.split(' ')[0];
        if (profileName) profileName.textContent = currentTenant.name;
        if (profileEmail) profileEmail.textContent = currentTenant.email;
        if (profileTenantName) profileTenantName.value = currentTenant.name;
        if (profileDomain) profileDomain.value = currentTenant.domain;
        if (profileEmailInput) profileEmailInput.value = currentTenant.email;
        if (tenantStatusDisplay) tenantStatusDisplay.textContent = currentTenant.status.toUpperCase();
        if (tenantLogo) tenantLogo.textContent = `🏢 ${currentTenant.name}`;
    }
}

// Update analytics display
function updateAnalytics() {
    const viewsCount = document.getElementById('viewsCount');
    const queriesCount = document.getElementById('queriesCount');
    const pageViews = document.getElementById('pageViews');
    const aiInteractions = document.getElementById('aiInteractions');
    const sessionCount = document.getElementById('sessionCount');
    const avgSession = document.getElementById('avgSession');

    if (viewsCount) viewsCount.textContent = analytics.views;
    if (queriesCount) queriesCount.textContent = analytics.queries;
    if (pageViews) pageViews.textContent = analytics.views;
    if (aiInteractions) aiInteractions.textContent = analytics.queries;
    if (sessionCount) sessionCount.textContent = analytics.sessions;
    if (avgSession) avgSession.textContent = '5 min';
}

// Render animated chart
function renderChart() {
    const chartBars = document.getElementById('chartBars');
    if (!chartBars) return;

    const data = [65, 45, 80, 55, 90, 70, 85];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    chartBars.innerHTML = data.map((value, i) => `
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
            <div class="bar" style="height: ${value}%;"></div>
            <span style="margin-top: 8px; font-size: 12px; color: #6b7280;">${days[i]}</span>
        </div>
    `).join('');
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('.tenant-nav .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update nav items
    document.querySelectorAll('.tenant-nav .nav-item').forEach(item => item.classList.remove('active'));
    const navItem = document.querySelector(`[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Update page title
    const titles = {
        overview: 'Overview',
        messages: 'Messages',
        analytics: 'Analytics',
        'ai-chat': 'AI Chat',
        profile: 'Profile'
    };
    const pageTitle = document.getElementById('tenantPageTitle');
    if (pageTitle) pageTitle.textContent = titles[page] || page;

    // Show correct page
    document.querySelectorAll('.tenant-page-content').forEach(p => p.classList.add('hidden'));
    const pageEl = document.getElementById(`${page}Page`);
    if (pageEl) pageEl.classList.remove('hidden');

    // Reload messages if navigating to messages page
    if (page === 'messages') {
        loadTenantMessages();
    }
}

// Toggle sidebar
function toggleTenantSidebar() {
    document.querySelector('.tenant-sidebar').classList.toggle('active');
}

// Refresh dashboard
function refreshDashboard() {
    analytics.views++;
    analytics.sessions++;
    updateAnalytics();
    renderChart();
    showNotification('Dashboard refreshed!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Load tenant messages from admin
function loadTenantMessages() {
    if (!currentTenant) return;

    const messagesArea = document.getElementById('tenantMessagesArea');
    if (!messagesArea) return;

    const messages = chat.getConversation(ADMIN_ID, currentTenant.id);

    if (messages.length === 0) {
        messagesArea.innerHTML = '<div style="text-align: center; padding: 40px; color: #718096;">No messages yet. Start a conversation with admin!</div>';
        return;
    }

    messagesArea.innerHTML = messages.map(msg => {
        const date = new Date(msg.timestamp);
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const sender = msg.fromId === ADMIN_ID ? 'admin' : 'tenant';

        return `
            <div class="tenant-message-row ${sender}">
                <div class="tenant-message-bubble">
                    ${msg.content}
                </div>
                <div class="tenant-message-meta">${time}</div>
            </div>
        `;
    }).join('');

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Send message to admin
function sendTenantMessageToAdmin() {
    const input = document.getElementById('tenantMessageInput');
    const message = input?.value.trim();

    if (!message || !currentTenant) return;

    // Save to database
    chat.send(currentTenant.id, ADMIN_ID, message);

    // Reload messages
    loadTenantMessages();

    // Clear input
    if (input) input.value = '';

    // Show notification
    showNotification('Message sent to admin!');
}

// Update message count
function updateMessageCount() {
    if (!currentTenant) return;

    const unreadCount = chat.getUnreadCount(currentTenant.id);
    const navItem = document.querySelector('[data-page="messages"]');
    if (navItem) {
        navItem.setAttribute('data-count', unreadCount);
    }
}

// AI Chat functions
function sendTenantMessage() {
    const input = document.getElementById('tenantChatInput');
    const message = input?.value.trim();

    if (!message) return;

    analytics.queries++;
    updateAnalytics();

    // Add user message
    addTenantChatMessage(message, 'user');
    if (input) input.value = '';

    // Show loading
    addTenantChatMessage('Thinking...', 'bot', true);

    callTenantGeminiAPI(message).then(response => {
        removeTenantLoadingMessage();
        addTenantChatMessage(response, 'bot');
    }).catch(() => {
        removeTenantLoadingMessage();
        addTenantChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
    });
}

async function callTenantGeminiAPI(prompt) {
    const systemContext = `You are an AI assistant for ${currentTenant?.name}. Help the tenant with their questions about dashboard usage, analytics, and general assistance.`;
    const fullPrompt = `${systemContext}\n\nUser question: ${prompt}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error('Invalid response from API');
    } catch (error) {
        console.error('AI API Error:', error);
        throw error;
    }
}

function addTenantChatMessage(text, sender, isLoading = false) {
    const messages = document.getElementById('tenantChatMessages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `message ${sender}-message${isLoading ? ' loading' : ''}`;
    div.innerHTML = `<div class="message-content">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function removeTenantLoadingMessage() {
    const loading = document.querySelector('.message.loading');
    if (loading) loading.remove();
}

function handleTenantKeyPress(event) {
    if (event.key === 'Enter') {
        sendTenantMessage();
    }
}

// Send suggestion to AI chat
function sendSuggestion(text) {
    const input = document.getElementById('tenantChatInput');
    if (input) {
        input.value = text;
        sendTenantMessage();
    }
}

// Clear chat history
function clearTenantChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        const messages = document.getElementById('tenantChatMessages');
        if (messages) {
            messages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        Chat cleared! How can I help you today?
                    </div>
                </div>
            `;
            showNotification('Chat history cleared!');
        }
    }
}

// Enhanced AI response with better error handling
async function callTenantGeminiAPI(prompt) {
    const systemContext = `You are an AI assistant for ${currentTenant?.name}. Help the tenant with their questions about dashboard usage, analytics, and general assistance. Be friendly, helpful, and concise.`;
    const fullPrompt = `${systemContext}\n\nUser question: ${prompt}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error('Invalid response from API');
    } catch (error) {
        console.error('AI API Error:', error);
        // Return a fallback message when API fails
        return getFallbackResponse(prompt);
    }
}

// Fallback responses when API is unavailable
function getFallbackResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for profile update commands
    if ((lowerPrompt.includes('update') || lowerPrompt.includes('change') || lowerPrompt.includes('edit')) && 
        (lowerPrompt.includes('profile') || lowerPrompt.includes('email') || lowerPrompt.includes('password'))) {
        return "To update your profile:\n1. Click on **Profile** in the sidebar\n2. Update your email or password\n3. Click **Save Changes**\n\nYour changes will be saved immediately!";
    }
    
    // Check for message commands
    if (lowerPrompt.includes('message') || lowerPrompt.includes('contact') || lowerPrompt.includes('admin')) {
        return "To contact the admin:\n1. Click on **Messages** in the sidebar\n2. Type your message in the text box\n3. Click **Send**\n\nThe admin will respond as soon as possible!";
    }
    
    // Check for analytics commands
    if (lowerPrompt.includes('analytics') || lowerPrompt.includes('stats') || lowerPrompt.includes('view') || lowerPrompt.includes('dashboard')) {
        return "To view your analytics:\n1. Click on **Analytics** in the sidebar\n2. View your dashboard views, AI queries, and session data\n3. Check the activity chart\n\nYour analytics show your engagement with the platform!";
    }
    
    // Check for status commands
    if (lowerPrompt.includes('status') || lowerPrompt.includes('account')) {
        let status = 'Active';
        if (currentTenant && currentTenant.status) {
            status = currentTenant.status.charAt(0).toUpperCase() + currentTenant.status.slice(1);
        }
        return `Your account status: **${status}**\n\nYou can view your full profile details on the Profile page.`;
    }
    
    // Check for AI chat help
    if (lowerPrompt.includes('ai') || lowerPrompt.includes('chat') || lowerPrompt.includes('help')) {
        return `🤖 **AI Assistant Help:**\n\nI can help you with:\n\n📊 **Analytics** - "Show my analytics"\n👤 **Profile** - "Update my profile"\n💬 **Message Admin** - "Contact admin"\n📈 **Stats** - "View my stats"\n🔒 **Security** - "Change password"\n\n**Quick actions:**\n- Use the quick buttons above the chat\n- Or type naturally what you need\n\nWhat would you like help with?`;
    }
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
        return `Hello! 👋 Welcome to ${currentTenant?.name || 'TenantHub'}!\n\nI'm here to help you with:\n\n📊 **Your Analytics** - View usage stats\n👤 **Profile** - Update your details\n💬 **Admin** - Send messages\n🤖 **AI Chat** - Ask me anything\n\n**Try:** "Show my analytics" or "Update my email"\n\nHow can I help you today?`;
    }
    
    return `I'm here to help! Try these commands:\n\n📊 "Show my analytics"\n👤 "Update my profile"\n💬 "Contact admin"\n📈 "View my stats"\n🔒 "Change password"\n\nWhat would you like to do?`;
}

// Profile form submit
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newEmail = document.getElementById('profileEmailInput').value;
            const newPassword = document.getElementById('profilePassword').value;

            if (currentTenant) {
                if (newEmail && currentTenant.email) {
                    db.update('tenants', currentTenant.id, { email: newEmail });
                    currentTenant.email = newEmail;
                }
                if (newPassword) {
                    db.update('tenants', currentTenant.id, { password: newPassword });
                }

                const profileEmailDisplay = document.getElementById('profileEmail');
                if (profileEmailDisplay) profileEmailDisplay.textContent = currentTenant.email;
                showNotification('Profile updated successfully!');
            }
        });
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+M to open messages
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        navigateTo('messages');
    }
});
