// Admin Dashboard JavaScript - Browser-Based Multi-Tenant Management
const ADMIN_ID = 0; // Admin user ID

// System prompt to give AI context about the website
const SYSTEM_PROMPT = `You are an AI Assistant for TenantHub - A Professional Multi-Tenant Management Platform.

Website Information:
- Name: TenantHub
- URL: This is a multi-tenant management dashboard
- Purpose: Manage tenants, track analytics, handle messaging between admin and tenants
- Paths: /admin.html (Admin), /tenant.html (Tenant), /index.html (Login)

Features Available:
1. Tenant Management - Create, edit, delete, activate/deactivate tenants
2. Analytics Dashboard - View tenant statistics, activity charts
3. Messaging System - Chat between admin and tenants
4. AI Assistant - Smart help for all platform features
5. Profile Management - Update tenant details

Your Capabilities:
- Help admin with tenant management tasks
- Create new tenants when requested (you can create them directly!)
- Answer questions about the platform
- Provide analytics and statistics
- Guide users through features

Be professional, helpful, and concise. Use markdown formatting.`;

let currentPage = 'dashboard';
let currentChatTenant = null;
let chatHistory = [];
let tenants = [];
let messages = [];

// Initialize

document.addEventListener('DOMContentLoaded', () => {
    loadTenantsFromStorage();
    loadMessagesFromStorage();
    updateStats();
    renderDashboardTable();
    renderTenantsTable();
    setupNavigation();
    setupEventListeners();
    loadTenantList();
    updateMessageCount();
});

// Load tenants from localStorage
function loadTenantsFromStorage() {
    const stored = localStorage.getItem('tenanthub_tenants');
    if (stored) {
        tenants = JSON.parse(stored);
    } else {
        // Create default admin tenant
        tenants = [{
            id: 0,
            name: 'Admin Tenant',
            domain: 'admin.com',
            email: 'admin@admin.com',
            password: 'admin123',
            status: 'active',
            created: new Date().toISOString().split('T')[0]
        }];
        saveTenantsToStorage();
    }
}

// Save tenants to localStorage
function saveTenantsToStorage() {
    localStorage.setItem('tenanthub_tenants', JSON.stringify(tenants));
}

// Load messages from localStorage
function loadMessagesFromStorage() {
    const stored = localStorage.getItem('tenanthub_messages');
    if (stored) {
        messages = JSON.parse(stored);
    } else {
        messages = [];
    }
}

// Save messages to localStorage
function saveMessagesToStorage() {
    localStorage.setItem('tenanthub_messages', JSON.stringify(messages));
}

// Update statistics from database
function updateStats() {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const inactiveTenants = tenants.filter(t => t.status === 'inactive').length;
    const pendingTenants = tenants.filter(t => t.status === 'pending').length;

    document.getElementById('totalTenants').textContent = totalTenants;
    document.getElementById('activeTenants').textContent = activeTenants;
    document.getElementById('inactiveTenants').textContent = inactiveTenants;
    document.getElementById('pendingTenants').textContent = pendingTenants;
}

// Update message count badge
function updateMessageCount() {
    const unreadCount = messages.filter(m => m.toId === ADMIN_ID && !m.read).length;
    const navItem = document.querySelector('[data-page="messages"]');
    if (navItem) {
        navItem.setAttribute('data-count', unreadCount);
    }
}

// Render dashboard table
function renderDashboardTable() {
    const tbody = document.getElementById('dashboardTableBody');
    const recent = tenants.slice(0, 5);

    tbody.innerHTML = recent.map(t => `
        <tr>
            <td><strong>${t.name}</strong></td>
            <td>${t.domain}</td>
            <td>${t.email}</td>
            <td><span class="status-badge status-${t.status}">${t.status.toUpperCase()}</span></td>
            <td>${t.created}</td>
            <td>
                <button class="btn btn-action btn-edit" onclick="editTenant(${t.id})">Edit</button>
                <button class="btn btn-action btn-delete" onclick="deleteTenant(${t.id})">Delete</button>
                <button class="btn btn-action btn-generate" onclick="generateCredentials(${t.id})">Credentials</button>
            </td>
        </tr>
    `).join('');
}

// Render tenants table
function renderTenantsTable() {
    const tbody = document.getElementById('tenantsTableBody');

    tbody.innerHTML = tenants.map(t => `
        <tr>
            <td><strong>${t.name}</strong></td>
            <td>${t.domain}</td>
            <td>${t.email}</td>
            <td><span class="status-badge status-${t.status}">${t.status.toUpperCase()}</span></td>
            <td>${t.created}</td>
            <td>
                <button class="btn btn-action btn-edit" onclick="editTenant(${t.id})">Edit</button>
                <button class="btn btn-action btn-delete" onclick="deleteTenant(${t.id})">Delete</button>
                <button class="btn btn-action btn-generate" onclick="generateCredentials(${t.id})">Credentials</button>
                <button class="btn btn-action btn-chat" onclick="openChatWithTenant(${t.id})" title="Chat">💬</button>
            </td>
        </tr>
    `).join('');
}

// Load tenant list for chat sidebar
function loadTenantList() {
    const tenantList = document.getElementById('tenantList');
    if (!tenantList) return;

    tenantList.innerHTML = tenants.map(t => {
        const lastMessage = messages.filter(m => m.toId === t.id || m.fromId === t.id).slice(-1)[0];
        const unreadCount = messages.filter(m => m.toId === t.id && !m.read).length;
        const initials = t.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        return `
            <li class="tenant-item" onclick="openChatWithTenant(${t.id})" data-tenant-id="${t.id}">
                <div class="tenant-name">${t.name}</div>
                ${lastMessage ? `<div class="last-message">${lastMessage.content}</div>` : '<div class="last-message">No messages yet</div>'}
                ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
            </li>
        `;
    }).join('');
}

// Open chat with specific tenant
function openChatWithTenant(tenantId) {
    currentChatTenant = tenantId;
    const tenant = tenants.find(t => t.id === tenantId);

    // Update UI
    document.querySelectorAll('.tenant-item').forEach(el => {
        el.classList.remove('active');
        if (parseInt(el.dataset.tenantId) === tenantId) {
            el.classList.add('active');
        }
    });

    // Update header
    const headerName = document.getElementById('chatTenantName');
    const headerEmail = document.getElementById('chatTenantEmail');
    const headerAvatar = document.getElementById('chatAvatar');

    if (headerName) headerName.textContent = tenant.name;
    if (headerEmail) headerEmail.textContent = tenant.email;
    if (headerAvatar) headerAvatar.textContent = tenant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // Load conversation
    loadConversation(tenantId);

    // Mark messages as read
    messages.forEach(m => {
        if (m.toId === ADMIN_ID && m.fromId === tenantId) {
            m.read = true;
        }
    });
    saveMessagesToStorage();
    updateMessageCount();
}

// Load conversation history
function loadConversation(tenantId) {
    const conversation = messages.filter(m => 
        (m.fromId === ADMIN_ID && m.toId === tenantId) || 
        (m.fromId === tenantId && m.toId === ADMIN_ID)
    );
    const container = document.getElementById('chatConversation');

    if (!container) return;

    if (conversation.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #718096;">No messages yet. Start the conversation!</div>';
        return;
    }

    container.innerHTML = conversation.map(msg => {
        const date = new Date(msg.timestamp);
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const sender = msg.fromId === ADMIN_ID ? 'admin' : 'tenant';

        return `
            <div class="message-row ${sender}">
                <div class="message-bubble">
                    ${msg.content}
                </div>
                <div class="message-meta">${time}</div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

// Send message to tenant
function sendMessageToTenant() {
    const input = document.getElementById('tenantChatInput');
    const message = input.value.trim();

    if (!message || !currentChatTenant) return;

    // Save to messages
    const newMessage = {
        id: Date.now(),
        fromId: ADMIN_ID,
        toId: currentChatTenant,
        content: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    messages.push(newMessage);
    saveMessagesToStorage();

    // Reload conversation
    loadConversation(currentChatTenant);

    // Clear input
    input.value = '';

    // Update tenant list
    loadTenantList();
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    currentPage = page;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = document.querySelector(`[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        tenants: 'Tenant Management',
        'ai-assistant': 'AI Assistant',
        settings: 'Settings',
        messages: 'Messages'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Hide all pages first
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.add('hidden');
        p.style.display = 'none';
    });
    
    // Map page names to element IDs
    const pageIdMap = {
        'dashboard': 'dashboardPage',
        'tenants': 'tenantsPage',
        'messages': 'messagesPage',
        'ai-assistant': 'aiPage',
        'settings': 'settingsPage'
    };
    
    const pageEl = document.getElementById(pageIdMap[page]);
    if (pageEl) {
        pageEl.classList.remove('hidden');
        pageEl.style.display = 'block';
    }

    // Special handling for messages page
    if (page === 'messages' && currentChatTenant) {
        loadConversation(currentChatTenant);
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Modal functions
function openTenantModal() {
    const modal = document.getElementById('tenantModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        document.getElementById('modalTitle').textContent = 'Add New Tenant';
        document.getElementById('tenantForm').reset();
        document.getElementById('tenantId').value = '';
    }
}

function closeTenantModal() {
    const modal = document.getElementById('tenantModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

// Edit tenant
function editTenant(id) {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
        document.getElementById('tenantId').value = tenant.id;
        document.getElementById('tenantName').value = tenant.name;
        document.getElementById('tenantDomain').value = tenant.domain;
        document.getElementById('adminEmail').value = tenant.email;
        document.getElementById('adminPassword').value = tenant.password || '';
        document.getElementById('tenantStatus').value = tenant.status;
        document.getElementById('modalTitle').textContent = 'Edit Tenant';
        const modal = document.getElementById('tenantModal');
        modal.style.display = 'block';
        modal.classList.add('show');
    }
}

// Delete tenant
function deleteTenant(id) {
    if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
        tenants = tenants.filter(t => t.id !== id);
        saveTenantsToStorage();
        updateStats();
        renderDashboardTable();
        renderTenantsTable();
        loadTenantList();
    }
}

// Generate credentials
function generateCredentials(id) {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
        const newPassword = Math.random().toString(36).slice(-8);
        tenant.password = newPassword;
        saveTenantsToStorage();

        alert(`Credentials for ${tenant.name}:

Email: ${tenant.email}
Password: ${newPassword}

Tenant Dashboard URL: tenant.html`);
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const tenantForm = document.getElementById('tenantForm');
    const chatInput = document.getElementById('chatInput');

    if (searchInput) {
        searchInput.addEventListener('input', filterTenants);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTenants);
    }
    if (tenantForm) {
        tenantForm.addEventListener('submit', handleFormSubmit);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessageToTenant();
            }
        });
    }
}

// Filter tenants
function filterTenants() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;

    let filtered = tenants;
    if (status) {
        filtered = filtered.filter(t => t.status === status);
    }

    if (search) {
        filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(search) ||
            t.domain.toLowerCase().includes(search) ||
            t.email.toLowerCase().includes(search)
        );
    }

    renderFilteredTable(filtered);
}

function renderFilteredTable(filtered) {
    const tbody = document.getElementById('tenantsTableBody');
    tbody.innerHTML = filtered.map(t => `
        <tr>
            <td><strong>${t.name}</strong></td>
            <td>${t.domain}</td>
            <td>${t.email}</td>
            <td><span class="status-badge status-${t.status}">${t.status.toUpperCase()}</span></td>
            <td>${t.created}</td>
            <td>
                <button class="btn btn-action btn-edit" onclick="editTenant(${t.id})">Edit</button>
                <button class="btn btn-action btn-delete" onclick="deleteTenant(${t.id})">Delete</button>
                <button class="btn btn-action btn-generate" onclick="generateCredentials(${t.id})">Credentials</button>
                <button class="btn btn-action btn-chat" onclick="openChatWithTenant(${t.id})" title="Chat">💬</button>
            </td>
        </tr>
    `).join('');
}

// Handle form submit
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('tenantId').value;
    const tenantData = {
        name: document.getElementById('tenantName').value,
        domain: document.getElementById('tenantDomain').value,
        email: document.getElementById('adminEmail').value,
        password: document.getElementById('adminPassword').value || Math.random().toString(36).slice(-8),
        status: document.getElementById('tenantStatus').value,
        created: new Date().toISOString().split('T')[0]
    };

    if (id) {
        const index = tenants.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            tenants[index] = { ...tenants[index], ...tenantData };
        }
    } else {
        tenantData.id = Date.now();
        tenants.push(tenantData);
    }

    saveTenantsToStorage();
    updateStats();
    renderDashboardTable();
    renderTenantsTable();
    loadTenantList();
    closeTenantModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('tenantModal');
    if (event.target === modal) {
        closeTenantModal();
    }
}

// AI Chat (browser-based)
function sendMessage() {
    // Find the input element - check both textarea and input types
    let input = document.querySelector('#aiPage #chatInput') || document.getElementById('chatInput');
    
    // If still not found, try to find any input/textarea in the AI page
    if (!input) {
        const aiPage = document.getElementById('aiPage');
        if (aiPage) {
            input = aiPage.querySelector('input[type="text"]') || aiPage.querySelector('textarea');
        }
    }
    
    if (!input) {
        console.error('Chat input element not found');
        return;
    }
    
    const message = input.value.trim();

    if (!message) {
        showChatError('Please enter a message first.');
        return;
    }

    // Validate message length
    if (message.length > 2000) {
        showChatError('Message is too long. Please keep it under 2000 characters.');
        return;
    }

    // Add user message
    addChatMessage(message, 'user');
    input.value = '';

    // Show loading
    addChatMessage('🤔 Processing...', 'bot', true);

    // Handle admin commands
    handleAdminCommand(message).then(result => {
        removeLoadingMessage();
        if (result.handled) {
            addChatMessage(result.message, 'bot');
        } else {
            // Fallback response
            const fallback = getAdminFallbackResponse(message);
            addChatMessage(fallback, 'bot');
        }
    }).catch(error => {
        console.error('AI Error:', error);
        removeLoadingMessage();
        showChatError('Sorry, I encountered an error. Using fallback responses instead.');
        const fallback = getAdminFallbackResponse(message);
        setTimeout(() => addChatMessage(fallback, 'bot'), 500);
    });
}

// Handle admin commands directly (create, delete, update tenants)
async function handleAdminCommand(message) {
    const lowerMessage = message.toLowerCase();
    
    // CREATE TENANT commands
    const createKeywords = ['create tenant', 'add tenant', 'new tenant', 'register tenant', 'add new tenant', 'create new tenant'];
    if (createKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return await createTenantFromMessage(message);
    }
    
    // DELETE TENANT commands
    const deleteKeywords = ['delete tenant', 'remove tenant', 'delete', 'remove'];
    if (deleteKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return await deleteTenantFromMessage(message);
    }
    
    // UPDATE TENANT commands
    const updateKeywords = ['update tenant', 'edit tenant', 'change tenant', 'modify tenant'];
    if (updateKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return await updateTenantFromMessage(message);
    }
    
    // RESET PASSWORD commands
    const resetKeywords = ['reset password', 'change password', 'new password', 'generate password'];
    if (resetKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return await resetTenantPassword(message);
    }
    
    // Not a command
    return { handled: false, message: '' };
}

// Create tenant from message
async function createTenantFromMessage(message) {
    // Extract tenant info from message
    const nameMatch = message.match(/(?:name|called|tenant|company|organization)[\s:]+([A-Za-z0-9\s]+?)(?:domain|email|@|\.|with|for|$)/i);
    const domainMatch = message.match(/(?:domain|at|\.){1}([a-z0-9]+\.[a-z]+)/i);
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    
    const name = nameMatch ? nameMatch[1].trim() : null;
    const domain = domainMatch ? domainMatch[1].trim() : null;
    const email = emailMatch ? emailMatch[1].trim() : null;
    
    // Validate required fields
    if (!name) {
        return {
            handled: true,
            message: "⚠️ I need more information to create a tenant.\n\nPlease provide:\n- **Tenant Name** (required)\n- Domain (optional)\n- Admin Email (optional)\n\nExample: 'Create a tenant named ABC Company with domain abc.com'"
        };
    }
    
    const tenantData = {
        name: name,
        domain: domain || name.toLowerCase().replace(/\s+/g, '') + '.com',
        email: email || 'admin@' + (domain || name.toLowerCase().replace(/\s+/g, '') + '.com'),
        password: Math.random().toString(36).slice(-8),
        status: 'active',
        created: new Date().toISOString().split('T')[0]
    };
    
    try {
        tenantData.id = Date.now();
        tenants.push(tenantData);
        saveTenantsToStorage();
        updateStats();
        renderDashboardTable();
        renderTenantsTable();
        loadTenantList();
        
        return {
            handled: true,
            message: `✅ **Tenant Created Successfully!**\n\n**Details:**\n- 🏢 **Name:** ${tenantData.name}\n- 🌐 **Domain:** ${tenantData.domain}\n- 📧 **Email:** ${tenantData.email}\n- 🔑 **Password:** ${tenantData.password}\n- ✅ **Status:** Active\n\nThe tenant can now login with these credentials!`
        };
    } catch (e) {
        console.error('Tenant creation failed:', e);
        return {
            handled: true,
            message: '❌ Failed to create tenant. Please try again or use the manual form.'
        };
    }
}

// Delete tenant from message
async function deleteTenantFromMessage(message) {
    // Try to find tenant name or domain in message
    const nameMatch = message.match(/(?:tenant|company|name)[:\s]+([A-Za-z0-9\s]+?)(?:$|\?|with|for)/i);
    const domainMatch = message.match(/(?:domain|at)[:\s]*([a-z0-9]+\.[a-z]+)/i);
    
    let tenantToDelete = null;
    
    if (nameMatch) {
        const searchName = nameMatch[1].trim().toLowerCase();
        tenantToDelete = tenants.find(t => t.name.toLowerCase().includes(searchName));
    }
    
    if (!tenantToDelete && domainMatch) {
        const searchDomain = domainMatch[1].trim().toLowerCase();
        tenantToDelete = tenants.find(t => t.domain.toLowerCase().includes(searchDomain));
    }
    
    if (!tenantToDelete) {
        // List available tenants
        if (tenants.length === 0) {
            return { handled: true, message: '❌ No tenants found in the system.' };
        }
        
        const tenantList = tenants.map(t => t.name + ' (' + t.domain + ')').join('\n');
        return {
            handled: true,
            message: `⚠️ I couldn't find which tenant to delete.\n\n**Available Tenants:**\n${tenantList}\n\nPlease specify the tenant name or domain.\nExample: 'Delete tenant ABC Company' or 'Delete tenant with domain abc.com'`
        };
    }
    
    // Confirm deletion
    try {
        tenants = tenants.filter(t => t.id !== tenantToDelete.id);
        saveTenantsToStorage();
        updateStats();
        renderDashboardTable();
        renderTenantsTable();
        loadTenantList();
        
        return {
            handled: true,
            message: `✅ **Tenant Deleted Successfully!**\n\n**Deleted:**\n- 🏢 ${tenantToDelete.name}\n- 🌐 ${tenantToDelete.domain}\n\nThe tenant has been removed from the system.`
        };
    } catch (e) {
        return { handled: true, message: '❌ Failed to delete tenant. Please try again.' };
    }
}

// Update tenant from message
async function updateTenantFromMessage(message) {
    const nameMatch = message.match(/(?:tenant|company|name)[:\s]+([A-Za-z0-9\s]+?)(?:$|\?|with|for)/i);
    let tenantToUpdate = null;
    
    if (nameMatch) {
        const searchName = nameMatch[1].trim().toLowerCase();
        tenantToUpdate = tenants.find(t => t.name.toLowerCase().includes(searchName));
    }
    
    if (!tenantToUpdate) {
        const tenantList = tenants.map(t => `• **${t.name}** (${t.domain})`).join('\n');
        return {
            handled: true,
            message: `⚠️ I couldn't find which tenant to update.\n\n**Available Tenants:**\n${tenantList}\n\nPlease specify the tenant name.\nExample: 'Update tenant ABC Company with new email admin@new.com'`
        };
    }
    
    // Extract updates
    const newEmailMatch = message.match(/email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const newDomainMatch = message.match(/domain[:\s]*([a-z0-9]+\.[a-z]+)/i);
    const newStatusMatch = message.match(/status[:\s]*(active|inactive|pending)/i);
    
    const updates = {};
    if (newEmailMatch) updates.email = newEmailMatch[1];
    if (newDomainMatch) updates.domain = newDomainMatch[1];
    if (newStatusMatch) updates.status = newStatusMatch[1];
    
    if (Object.keys(updates).length === 0) {
        return {
            handled: true,
            message: `⚠️ What would you like to update for ${tenantToUpdate.name}?\n\n**Current Details:**\n- Email: ${tenantToUpdate.email}\n- Domain: ${tenantToUpdate.domain}\n- Status: ${tenantToUpdate.status}\n\nPlease specify what to change.\nExample: Update tenant ABC Company with email new@email.com`
        };
    }
    
    try {
        const index = tenants.findIndex(t => t.id === tenantToUpdate.id);
        if (index !== -1) {
            tenants[index] = { ...tenants[index], ...updates };
            saveTenantsToStorage();
            updateStats();
            renderDashboardTable();
            renderTenantsTable();
            loadTenantList();
            
            const updatedTenant = tenants[index];
            let details = '';
            if (updates.email) details += '- 📧 Email: ' + updates.email + '\n';
            if (updates.domain) details += '- 🌐 Domain: ' + updates.domain + '\n';
            if (updates.status) details += '- ✅ Status: ' + updates.status + '\n';
            return {
                handled: true,
                message: `✅ **Tenant Updated Successfully!**\n\n**Updated:** ${updatedTenant.name}\n\n**New Details:**\n${details}`
            };
        }
    } catch (e) {
        return { handled: true, message: '❌ Failed to update tenant. Please try again.' };
    }
}

// Reset tenant password
async function resetTenantPassword(message) {
    const nameMatch = message.match(/(?:tenant|company|name)[:\s]+([A-Za-z0-9\s]+?)(?:$|\?|for)/i);
    let tenantToReset = null;
    
    if (nameMatch) {
        const searchName = nameMatch[1].trim().toLowerCase();
        tenantToReset = tenants.find(t => t.name.toLowerCase().includes(searchName));
    }
    
    if (!tenantToReset) {
        const tenantList = tenants.map(t => '• **' + t.name + '**').join('\n');
        return {
            handled: true,
            message: `⚠️ I couldn't find which tenant's password to reset.\n\n**Available Tenants:**\n${tenantList}\n\nPlease specify the tenant name.\nExample: 'Reset password for ABC Company'`
        };
    }
    
    try {
        const newPassword = Math.random().toString(36).slice(-8);
        const index = tenants.findIndex(t => t.id === tenantToReset.id);
        if (index !== -1) {
            tenants[index].password = newPassword;
            saveTenantsToStorage();
            
            return {
                handled: true,
                message: `✅ **Password Reset Successfully!**\n\n**Tenant:** ${tenantToReset.name}\n\n🔐 **New Password:** ${newPassword}\n\nPlease share this password with the tenant securely.`
            };
        }
    } catch (e) {
        return { handled: true, message: '❌ Failed to reset password. Please try again.' };
    }
}

// Show error in chat
function showChatError(message) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message bot-message error';
    errorDiv.innerHTML = `<div class="message-content" style="color: #e53e3e;">⚠️ ${message}</div>`;
    messages.appendChild(errorDiv);
    messages.scrollTop = messages.scrollHeight;
    
    // Auto-remove error after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

// Fallback responses when API is unavailable
function getAdminFallbackResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for action commands
    if (lowerPrompt.includes('create') || lowerPrompt.includes('add') || lowerPrompt.includes('new tenant')) {
        // Extract tenant info from prompt
        const nameMatch = prompt.match(/(?:name|called|tenant[:\s]+)([A-Za-z\s]+?)(?:domain|email|@|$)/i);
        const domainMatch = prompt.match(/(?:domain|at|\.){1}([a-z0-9]+\.[a-z]+)/i);
        const emailMatch = prompt.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        
        if (nameMatch || domainMatch || emailMatch) {
            const tenantData = {
                name: nameMatch ? nameMatch[1].trim() : 'New Tenant',
                domain: domainMatch ? domainMatch[1].trim() : 'example.com',
                email: emailMatch ? emailMatch[1].trim() : 'admin@example.com',
                password: Math.random().toString(36).slice(-8),
                status: 'active',
                created: new Date().toISOString().split('T')[0]
            };
            
            try {
                tenantData.id = Date.now();
                tenants.push(tenantData);
                saveTenantsToStorage();
                updateStats();
                renderDashboardTable();
                renderTenantsTable();
                loadTenantList();
                return `✅ Tenant created successfully!\n\n**Details:**\n- Name: ${tenantData.name}\n- Domain: ${tenantData.domain}\n- Email: ${tenantData.email}\n- Password: ${tenantData.password}\n- Status: Active\n\nThe tenant can now login with these credentials.`;
            } catch (e) {
                return `I understand you want to create a tenant. Please use the '+ Add Tenant' button on the Tenants page to create a new tenant with the details.`;
            }
        }
        
        return `To create a new tenant:\n1. Go to the **Tenants** page\n2. Click **'+ Add Tenant'**\n3. Fill in the details\n\nOr I can create one for you if you provide:\n- Tenant name\n- Domain (e.g., example.com)\n- Admin email`;
    }
    
    if ((lowerPrompt.includes('delete') || lowerPrompt.includes('remove')) && (lowerPrompt.includes('tenant'))) {
        return "To delete a tenant:\n1. Go to the **Tenants** page\n2. Find the tenant in the list\n3. Click the **Delete** button\n4. Confirm the deletion\n\n⚠️ Warning: This action cannot be undone!";
    }
    
    if (lowerPrompt.includes('credential') || lowerPrompt.includes('password') || lowerPrompt.includes('reset')) {
        return "To reset tenant credentials:\n1. Go to the **Tenants** page\n2. Find the tenant\n3. Click **'Credentials'** button\n4. A new password will be generated\n\nThe tenant will receive a new login password.";
    }
    
    if (lowerPrompt.includes('message') || lowerPrompt.includes('chat') || lowerPrompt.includes('send')) {
        return "To message a tenant:\n1. Go to the **Messages** page\n2. Select a tenant from the list\n3. Type your message\n4. Click **Send**\n\nYou can communicate directly with tenants!";
    }
    
    if (lowerPrompt.includes('analytics') || lowerPrompt.includes('stats') || lowerPrompt.includes('report') || lowerPrompt.includes('dashboard')) {
        const stats = tenants;
        const active = stats.filter(t => t.status === 'active').length;
        const inactive = stats.filter(t => t.status === 'inactive').length;
        const pending = stats.filter(t => t.status === 'pending').length;
        
        return `📊 **Current Analytics:**\n\n- **Total Tenants:** ${stats.length}\n- **Active:** ${active}\n- **Inactive:** ${inactive}\n- **Pending:** ${pending}\n\nYou can view detailed analytics on the Dashboard page!`;
    }
    
    if (lowerPrompt.includes('list') || lowerPrompt.includes('show') && lowerPrompt.includes('tenant')) {
        const tenantsList = tenants;
        if (tenantsList.length === 0) return 'No tenants found.';
        
        let list = '📋 **Tenant List:**\n\n';
        tenantsList.forEach(t => {
            list += `• **${t.name}** (${t.domain}) - ${t.status.toUpperCase()}\n`;
        });
        return list;
    }
    
    if (lowerPrompt.includes('edit') || lowerPrompt.includes('update') && lowerPrompt.includes('tenant')) {
        return "To edit a tenant:\n1. Go to the **Tenants** page\n2. Find the tenant\n3. Click **'Edit'** button\n4. Modify the details\n5. Click **Save**";
    }
    
    }

// Add chat message to conversation
function addChatMessage(text, sender, isLoading = false) {
    const messages = document.getElementById('chatMessages');
    if (!messages) {
        console.error('chatMessages element not found!');
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

// Remove loading message
function removeLoadingMessage() {
    const loading = document.querySelector('.message.loading');
    if (loading) loading.remove();
}

// Handle key press events
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Toggle API key visibility
function toggleApiKey() {
    const input = document.getElementById('apiKeyInput');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Send suggestion to AI chat
function sendAdminSuggestion(text) {
    // First navigate to AI page
    navigateTo('ai-assistant');
    
    // Small delay to allow page to switch
    setTimeout(() => {
        // Find the input element in the AI page
        let input = document.querySelector('#aiPage #chatInput');
        
        // If not found, try other selectors
        if (!input) {
            const aiPage = document.getElementById('aiPage');
            if (aiPage) {
                input = aiPage.querySelector('input[type="text"]');
            }
        }
        
        // Still not found? Try general search
        if (!input) {
            input = document.getElementById('chatInput');
        }
        
        if (input) {
            input.value = text;
            // Trigger the sendMessage function
            sendMessage();
        } else {
            console.error('Could not find chat input');
            showChatError('Could not find chat input. Please navigate to AI Assistant page.');
        }
    }, 100);
}

// Clear admin chat history
function clearAdminChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        const messages = document.getElementById('chatMessages');
        if (messages) {
            messages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        Chat cleared! How can I help you with tenant management today?
                    </div>
                </div>
            `;
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeTenantModal();
    }
    // Ctrl+N to open new tenant modal
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openTenantModal();
    }
});

// Admin logout function
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('tenanthub_admin_logged_in');
        window.location.href = 'index.html';
    }
}

// Initialize tenants and messages
loadTenantsFromStorage();
loadMessagesFromStorage();
