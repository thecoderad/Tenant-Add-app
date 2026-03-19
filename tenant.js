// Tenant Dashboard JavaScript - With Database & Messaging
const ADMIN_ID = 0;

// OpenRouter API Configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

// System prompt to give AI context about the tenant website
const TENANT_SYSTEM_PROMPT = `You are an AI Assistant for TenantHub Tenant Dashboard - A Professional Tenant Management Platform.

Website Information:
- Name: TenantHub
- This is a tenant dashboard where tenants can view their analytics, manage profile, and contact admin
- URL path: /tenant.html

Features Available for Tenants:
1. Overview Dashboard - View tenant summary and status
2. Analytics - View usage statistics, page views, AI interactions
3. Messages - Chat with admin
4. AI Assistant - Smart help for tenant features
5. Profile - Update tenant details (name, email, password)

Your Capabilities as Tenant AI:
- Help tenants understand their dashboard and analytics
- Guide them through profile updates
- Explain how to contact admin
- Answer questions about their account status
- Help with platform features

Be professional, helpful, and concise. Use markdown formatting.`;

// n8n Webhook Configuration - Using Gemini 2.5 Flash model
const TENANT_WEBHOOK_URL = 'https://aiagent01.astrosevasankalp.online/webhook-test/aiagent';

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

    // Hide all pages first
    document.querySelectorAll('.tenant-page-content').forEach(p => {
        p.classList.add('hidden');
        p.style.display = 'none';
    });
    
    // Map page names to element IDs
    const pageIdMap = {
        'overview': 'overviewPage',
        'messages': 'messagesPage',
        'analytics': 'analyticsPage',
        'ai-chat': 'aiChatPage',
        'profile': 'profilePage'
    };
    
    const pageEl = document.getElementById(pageIdMap[page]);
    if (pageEl) {
        pageEl.classList.remove('hidden');
        pageEl.style.display = 'block';
    }

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

// AI Chat with OpenRouter API (NVIDIA Nemotron Model)
async function sendTenantMessage() {
    // Find the input element
    let input = document.querySelector('#aiChatPage #tenantChatInput') || document.getElementById('tenantChatInput');
    
    // If still not found, try to find any input in the AI chat page
    if (!input) {
        const aiChatPage = document.getElementById('aiChatPage');
        if (aiChatPage) {
            input = aiChatPage.querySelector('input[type="text"]');
        }
    }
    
    if (!input) {
        console.error('Chat input element not found');
        showTenantChatError('Chat input not found. Please refresh the page.');
        return;
    }
    
    const message = input.value.trim();

    if (!message) {
        showTenantChatError('Please enter a message first.');
        return;
    }

    // Validate message length
    if (message.length > 2000) {
        showTenantChatError('Message is too long. Please keep it under 2000 characters.');
        return;
    }

    analytics.queries++;
    updateAnalytics();

    // Add user message
    addTenantChatMessage(message, 'user');
    input.value = '';

    // Show loading
    addTenantChatMessage('🤔 Thinking...', 'bot', true);

    try {
        const response = await callTenantOpenRouterAPI(message);
        removeTenantLoadingMessage();
        
        if (response && response.trim()) {
            addTenantChatMessage(response, 'bot');
        } else {
            addTenantChatMessage('I received an empty response. Please try again.', 'bot');
        }
    } catch (error) {
        console.error('AI Error:', error);
        removeTenantLoadingMessage();
        
        let errorMessage = 'Sorry, I encountered an error. ';
        if (error.name === 'TimeoutError') {
            errorMessage += 'The request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Could not connect to the AI service. Please check your internet connection.';
        } else {
            errorMessage += 'Using fallback responses instead.';
        }
        
        addTenantChatMessage(errorMessage, 'bot');
        
        // Also show fallback response
        const fallback = getFallbackResponse(message);
        setTimeout(() => addTenantChatMessage(fallback, 'bot'), 500);
    }
}

/**
 * Call OpenRouter API with NVIDIA Nemotron model for tenant
 * @param {string} prompt - User's message
 * @returns {Promise<string>} AI response
 */
async function callTenantOpenRouterAPI(prompt) {
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt: must be a non-empty string');
    }
    
    const sanitizedPrompt = prompt.trim();
    if (sanitizedPrompt.length === 0) {
        throw new Error('Invalid prompt: must be a non-empty string');
    }

    const requestBody = {
        model: OPENROUTER_MODEL,
        messages: [
            {
                role: 'system',
                content: TENANT_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: sanitizedPrompt
            }
        ],
        max_tokens: 1500,
        temperature: 0.7
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'TenantHub'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', response.status, errorText);
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Handle OpenRouter response format
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return data.choices[0].message.content;
        }

        if (data.error) {
            throw new Error(data.error.message || 'API returned an error');
        }

        // Fallback to other formats
        if (data.response) {
            return data.response;
        }

        if (typeof data === 'string') {
            return data;
        }

        console.warn('Unexpected response format:', data);
        return 'I received an unexpected response format. Please try again.';
        
    } catch (error) {
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Request timed out');
            timeoutError.name = 'TimeoutError';
            throw timeoutError;
        }
        console.error('OpenRouter API call failed:', error);
        throw error;
    }
}

/**
 * Call n8n webhook (legacy fallback)
 * @param {string} prompt - User's message
 * @param {number} timeoutMs - Request timeout in milliseconds
 * @returns {Promise<string>} AI response
 */
async function callTenantWebhook(prompt, timeoutMs = 30000) {
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt: must be a non-empty string');
    }
    
    const sanitizedPrompt = prompt.trim();
    if (sanitizedPrompt.length === 0) {
        throw new Error('Invalid prompt: must be a non-empty string');
    }

    const url = `${TENANT_WEBHOOK_URL}?message=${encodeURIComponent(sanitizedPrompt)}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Webhook Error:', response.status, errorText);
            throw new Error(`Webhook Error: ${response.status} - ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Handle different response formats from n8n
        // Direct string response
        if (typeof data === 'string' && data.trim()) {
            return data.trim();
        }

        // Standard response formats
        if (data.response) {
            return data.response;
        }

        if (data.body && data.body.response) {
            return data.body.response;
        }

        if (data.text) {
            return data.text;
        }

        if (data.message) {
            return data.message;
        }

        if (data.output) {
            return typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
        }

        // Handle array response
        if (Array.isArray(data) && data.length > 0) {
            return typeof data[0] === 'string' ? data[0] : JSON.stringify(data[0]);
        }

        // If we got here, we couldn't parse the response
        console.warn('Unexpected response format:', data);
        return 'I received an unexpected response format. Please try again.';
        
    } catch (error) {
        if (error.name === 'AbortError') {
            const timeoutError = new Error('Request timed out');
            timeoutError.name = 'TimeoutError';
            throw timeoutError;
        }
        console.error('Webhook call failed:', error);
        throw error;
    }
}

// Legacy function for backwards compatibility
async function callTenantWebhookWithTimeout(prompt, timeoutMs = 30000) {
    // First try OpenRouter API
    try {
        return await callTenantOpenRouterAPI(prompt);
    } catch (e) {
        console.warn('OpenRouter failed, trying webhook:', e);
        // Fallback to webhook
        return callTenantWebhook(prompt, timeoutMs);
    }
}

// Show error in tenant chat
function showTenantChatError(message) {
    const messages = document.getElementById('tenantChatMessages');
    if (!messages) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message bot-message error';
    errorDiv.innerHTML = `<div class="message-content" style="color: #e53e3e;">⚠️ ${message}</div>`;
    messages.appendChild(errorDiv);
    messages.scrollTop = messages.scrollHeight;
    
    // Auto-remove error after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

function addTenantChatMessage(text, sender, isLoading = false) {
    const messages = document.getElementById('tenantChatMessages');
    if (!messages) {
        console.error('tenantChatMessages element not found!');
        return;
    }

    const div = document.createElement('div');
    div.className = `message ${sender}-message${isLoading ? ' loading' : ''}`;
    div.innerHTML = `<div class="message-content">${text}</div>`;
    messages.appendChild(div);
    
    // Force scroll to bottom
    messages.scrollTop = messages.scrollHeight;
    
    // Also try scrollIntoView
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
    // First navigate to AI chat page
    navigateTo('ai-chat');
    
    // Small delay to allow page to switch
    setTimeout(() => {
        // Find the input element in the AI chat page
        let input = document.querySelector('#aiChatPage #tenantChatInput');
        
        // If not found, try other selectors
        if (!input) {
            const aiChatPage = document.getElementById('aiChatPage');
            if (aiChatPage) {
                input = aiChatPage.querySelector('input[type="text"]');
            }
        }
        
        // Still not found? Try general search
        if (!input) {
            input = document.getElementById('tenantChatInput');
        }
        
        if (input) {
            input.value = text;
            // Trigger the sendTenantMessage function
            sendTenantMessage();
        } else {
            console.error('Could not find chat input');
            showTenantChatError('Could not find chat input. Please navigate to AI Chat page.');
        }
    }, 100);
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

// Fallback responses when webhook is unavailable
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
