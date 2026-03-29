const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database
function getDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            tenants: [
                { id: 1, name: 'Acme Corporation', domain: 'acme.com', email: 'admin@acme.com', password: 'acme123', status: 'active', created: '2025-01-15', description: 'Leading manufacturer', slug: 'acme-corporation', businessType: 'office' },
                { id: 2, name: 'TechStart Inc', domain: 'techstart.io', email: 'admin@techstart.io', password: 'tech456', status: 'active', created: '2025-02-20', description: 'Technology solutions', slug: 'techstart-inc', businessType: 'office' },
                { id: 3, name: 'Global Services', domain: 'globalservices.net', email: 'admin@globalservices.net', password: 'global789', status: 'active', created: '2025-03-01', description: 'Business consulting', slug: 'global-services', businessType: 'office' },
                { id: 6, name: 'Care Clinic', domain: 'careclinic.com', email: 'admin@careclinic.com', password: 'clinic123', status: 'active', created: '2025-03-15', description: 'Family healthcare clinic', slug: 'care-clinic', businessType: 'clinic' },
                { id: 7, name: 'Little Stars Daycare', domain: 'littlestars.com', email: 'admin@littlestars.com', password: 'daycare123', status: 'active', created: '2025-03-16', description: 'Quality childcare services', slug: 'little-stars-daycare', businessType: 'daycare' },
                { id: 8, name: 'Bella Salon', domain: 'bellasalon.com', email: 'admin@bellasalon.com', password: 'salon123', status: 'active', created: '2025-03-17', description: 'Premium beauty salon', slug: 'bella-salon', businessType: 'salon' }
            ],
            users: { admin: { email: 'admin@tenanthub.com', password: 'admin123', role: 'admin' } },
            chatMessages: [],
            supportEmails: [],
            entities: {}
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!data.chatMessages) data.chatMessages = [];
    if (!data.supportEmails) data.supportEmails = [];
    if (!data.entities) data.entities = {};
    return data;
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Generate slug from name
function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ============ API ROUTES ============

// Get all tenants
app.get('/api/tenants', (req, res) => {
    const db = getDB();
    res.json(db.tenants);
});

// Get tenant by slug
app.get('/api/tenant/slug/:slug', (req, res) => {
    const db = getDB();
    const tenant = db.tenants.find(t => t.slug === req.params.slug);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json({ id: tenant.id, name: tenant.name, description: tenant.description, domain: tenant.domain, slug: tenant.slug, businessType: tenant.businessType });
});

// Get tenant by email
app.get('/api/tenant/lookup', (req, res) => {
    const db = getDB();
    const tenant = db.tenants.find(t => t.email === req.query.email);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json({ id: tenant.id, name: tenant.name, email: tenant.email, description: tenant.description, domain: tenant.domain, businessType: tenant.businessType });
});

// Create tenant
app.post('/api/tenants', (req, res) => {
    const db = getDB();
    const { name, domain, email, password, status, description, businessType } = req.body;
    
    if (db.tenants.find(t => t.email === email)) return res.status(400).json({ error: 'Email exists' });
    if (db.tenants.find(t => t.domain === domain)) return res.status(400).json({ error: 'Domain exists' });
    
    let slug = generateSlug(name);
    let counter = 1;
    while (db.tenants.find(t => t.slug === slug)) { slug = `${generateSlug(name)}-${counter++}`; }
    
    const newTenant = {
        id: Date.now(), name, domain, email, password,
        status: status || 'pending', description: description || '',
        businessType: businessType || 'office', slug,
        created: new Date().toISOString().split('T')[0],
        loginUrl: `http://localhost:${PORT}/login/${slug}`
    };
    
    db.tenants.push(newTenant);
    db.users[email] = { email, password, role: 'tenant', name };
    db.entities[newTenant.id] = { customers: [], patients: [], deals: [], appointments: [], tasks: [] };
    saveDB(db);
    res.json(newTenant);
});

// Update tenant
app.put('/api/tenants/:id', (req, res) => {
    const db = getDB();
    const idx = db.tenants.findIndex(t => t.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    
    const { name, domain, email, password, status, description, businessType } = req.body;
    
    // Keep existing password if not provided
    const newPassword = password || db.tenants[idx].password;
    const newEmail = email || db.tenants[idx].email;
    
    // Remove old user entry if email changed
    const oldEmail = db.tenants[idx].email;
    if (oldEmail && db.users[oldEmail] && newEmail !== oldEmail) {
        delete db.users[oldEmail];
    }
    
    // Update tenant
    db.tenants[idx] = { 
        ...db.tenants[idx], 
        name: name || db.tenants[idx].name,
        domain: domain || db.tenants[idx].domain,
        email: newEmail,
        password: newPassword,
        status: status || db.tenants[idx].status,
        description: description !== undefined ? description : db.tenants[idx].description,
        businessType: businessType || db.tenants[idx].businessType
    };
    
    // Update users object
    db.users[newEmail] = { 
        email: newEmail, 
        password: newPassword, 
        role: 'tenant', 
        name: name || db.tenants[idx].name 
    };
    
    saveDB(db);
    res.json(db.tenants[idx]);
});

// Delete tenant
app.delete('/api/tenants/:id', (req, res) => {
    const db = getDB();
    const idx = db.tenants.findIndex(t => t.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const email = db.tenants[idx].email;
    db.tenants.splice(idx, 1);
    delete db.users[email];
    saveDB(db);
    res.json({ success: true });
});

// Admin login
app.post('/api/login/admin', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@tenanthub.com' && password === 'admin123') {
        res.json({ success: true, role: 'admin', redirect: '/admin.html' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Tenant login by slug
app.post('/api/login/tenant-slug', (req, res) => {
    const db = getDB();
    const { slug, password } = req.body;
    const tenant = db.tenants.find(t => t.slug === slug && t.password === password);

    if (tenant) {
        if (tenant.status === 'inactive') return res.status(403).json({ error: 'Account inactive' });
        res.json({
            success: true,
            role: 'tenant',
            tenant: { id: tenant.id, name: tenant.name, email: tenant.email, description: tenant.description, domain: tenant.domain, businessType: tenant.businessType },
            redirect: '/tenant.html'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Staff login by slug
app.post('/api/login/staff', (req, res) => {
    const db = getDB();
    const { slug, email, password, staffSlug } = req.body;
    const tenant = db.tenants.find(t => t.slug === slug);

    if (!tenant) {
        return res.status(404).json({ error: 'Business not found' });
    }

    // Check if staff exists for this tenant
    let staff = db.staff?.[tenant.id]?.find(s => s.email === email && s.password === password);
    
    // If staffSlug provided, verify it matches
    if (staff && staffSlug) {
        const generatedSlug = staff.slug || staff.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (generatedSlug !== staffSlug) {
            staff = null;
        }
    }

    if (staff) {
        if (staff.status === 'inactive') return res.status(403).json({ error: 'Account inactive' });
        res.json({
            success: true,
            role: 'staff',
            staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role, slug: staff.slug },
            tenant: { id: tenant.id, name: tenant.name, email: tenant.email, description: tenant.description, domain: tenant.domain, businessType: tenant.businessType },
            redirect: '/staff-dashboard.html'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Chat API
app.get('/api/chat', (req, res) => {
    const db = getDB();
    res.json(db.chatMessages || []);
});

app.get('/api/chat/:tenantId', (req, res) => {
    const db = getDB();
    const messages = (db.chatMessages || []).filter(m => m.tenantId == req.params.tenantId);
    res.json(messages);
});

app.post('/api/chat', (req, res) => {
    const db = getDB();
    if (!db.chatMessages) db.chatMessages = [];
    db.chatMessages.push({ ...req.body, timestamp: new Date().toISOString() });
    saveDB(db);
    res.json(req.body);
});

// Mark chat message as read
app.put('/api/chat/:id', (req, res) => {
    const db = getDB();
    const idx = (db.chatMessages || []).findIndex(m => m.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.chatMessages[idx] = { ...db.chatMessages[idx], ...req.body };
    saveDB(db);
    res.json(db.chatMessages[idx]);
});

// Support Email API
app.get('/api/support-email', (req, res) => {
    const db = getDB();
    res.json(db.supportEmails || []);
});

// Get support emails for specific tenant
app.get('/api/support-email/tenant/:tenantId', (req, res) => {
    const db = getDB();
    const emails = (db.supportEmails || []).filter(e => e.tenantId == req.params.tenantId);
    res.json(emails);
});

app.post('/api/support-email', (req, res) => {
    const db = getDB();
    if (!db.supportEmails) db.supportEmails = [];
    db.supportEmails.push({ ...req.body, timestamp: new Date().toISOString(), status: 'pending' });
    saveDB(db);
    res.json(req.body);
});

app.put('/api/support-email/:id', (req, res) => {
    const db = getDB();
    const idx = (db.supportEmails || []).findIndex(e => e.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.supportEmails[idx] = { ...db.supportEmails[idx], ...req.body };
    saveDB(db);
    res.json(db.supportEmails[idx]);
});

// Tenant stats API
app.get('/api/tenant/:tenantId/stats', (req, res) => {
    const db = getDB();
    const entities = db.entities[req.params.tenantId] || { customers: [], deals: [], appointments: [], tasks: [] };
    res.json({
        customers: entities.customers?.length || 0,
        deals: entities.deals?.length || 0,
        appointments: entities.appointments?.length || 0,
        tasks: entities.tasks?.length || 0,
        activeDeals: entities.deals?.filter(d => d.status === 'active').length || 0
    });
});

// Entity management
app.get('/api/entities/:tenantId/:type', (req, res) => {
    const db = getDB();
    const entities = db.entities[req.params.tenantId] || {};
    res.json(entities[req.params.type] || []);
});

app.post('/api/entities/:tenantId/:type', (req, res) => {
    const db = getDB();
    if (!db.entities[req.params.tenantId]) db.entities[req.params.tenantId] = { customers: [], deals: [], appointments: [], tasks: [] };
    const newEntity = { id: Date.now(), ...req.body, created: new Date().toISOString().split('T')[0] };
    db.entities[req.params.tenantId][req.params.type].push(newEntity);
    saveDB(db);
    res.json(newEntity);
});

// ==================== ENHANCED FEATURES API ====================

// Notifications
app.get('/api/notifications/:tenantId', (req, res) => {
    const db = getDB();
    const notifications = db.notifications?.[req.params.tenantId] || [];
    res.json(notifications);
});

app.post('/api/notifications/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.notifications) db.notifications = {};
    if (!db.notifications[req.params.tenantId]) db.notifications[req.params.tenantId] = [];
    const notification = { id: Date.now(), ...req.body, timestamp: new Date().toISOString() };
    db.notifications[req.params.tenantId].push(notification);
    saveDB(db);
    res.json(notification);
});

app.put('/api/notifications/:tenantId/:id', (req, res) => {
    const db = getDB();
    const notifications = db.notifications?.[req.params.tenantId] || [];
    const idx = notifications.findIndex(n => n.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    notifications[idx] = { ...notifications[idx], ...req.body };
    saveDB(db);
    res.json(notifications[idx]);
});

// Calendar Events
app.get('/api/calendar/:tenantId', (req, res) => {
    const db = getDB();
    const events = db.calendarEvents?.[req.params.tenantId] || [];
    res.json(events);
});

app.post('/api/calendar/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.calendarEvents) db.calendarEvents = {};
    if (!db.calendarEvents[req.params.tenantId]) db.calendarEvents[req.params.tenantId] = [];
    const event = { id: Date.now(), ...req.body, created: new Date().toISOString() };
    db.calendarEvents[req.params.tenantId].push(event);
    saveDB(db);
    res.json(event);
});

app.delete('/api/calendar/:tenantId/:id', (req, res) => {
    const db = getDB();
    const events = db.calendarEvents?.[req.params.tenantId] || [];
    const idx = events.findIndex(e => e.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    events.splice(idx, 1);
    saveDB(db);
    res.json({ success: true });
});

// Files
app.get('/api/files/:tenantId', (req, res) => {
    const db = getDB();
    const files = db.files?.[req.params.tenantId] || [];
    res.json(files);
});

app.post('/api/files/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.files) db.files = {};
    if (!db.files[req.params.tenantId]) db.files[req.params.tenantId] = [];
    const file = { id: Date.now(), ...req.body, uploaded: new Date().toISOString() };
    db.files[req.params.tenantId].push(file);
    saveDB(db);
    res.json(file);
});

app.delete('/api/files/:tenantId/:id', (req, res) => {
    const db = getDB();
    const files = db.files?.[req.params.tenantId] || [];
    const idx = files.findIndex(f => f.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    files.splice(idx, 1);
    saveDB(db);
    res.json({ success: true });
});

// Activity Logs
app.get('/api/activities/:tenantId', (req, res) => {
    const db = getDB();
    const activities = db.activities?.[req.params.tenantId] || [];
    res.json(activities.slice(0, 50)); // Return last 50 activities
});

app.post('/api/activities/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.activities) db.activities = {};
    if (!db.activities[req.params.tenantId]) db.activities[req.params.tenantId] = [];
    const activity = { id: Date.now(), ...req.body, timestamp: new Date().toISOString() };
    db.activities[req.params.tenantId].unshift(activity);
    // Keep only last 100 activities
    db.activities[req.params.tenantId].splice(100);
    saveDB(db);
    res.json(activity);
});

// Reports
app.get('/api/reports/:tenantId/:type', (req, res) => {
    const db = getDB();
    const entities = db.entities[req.params.tenantId] || { customers: [], deals: [], appointments: [], tasks: [] };
    const type = req.params.type;

    let report = {
        type,
        generated: new Date().toISOString(),
        data: {}
    };

    switch(type) {
        case 'revenue':
            report.data = {
                total: entities.deals?.length * 100 || 0,
                deals: entities.deals?.length || 0,
                average: entities.deals?.length > 0 ? (entities.deals.length * 100) / entities.deals.length : 0
            };
            break;
        case 'customers':
            report.data = {
                total: entities.customers?.length || 0,
                newThisMonth: entities.customers?.filter(c => {
                    const created = new Date(c.created);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length || 0
            };
            break;
        case 'appointments':
            report.data = {
                total: entities.appointments?.length || 0,
                upcoming: entities.appointments?.filter(a => new Date(a.date) > new Date()).length || 0,
                completed: entities.appointments?.filter(a => a.status === 'completed').length || 0
            };
            break;
        case 'tasks':
            report.data = {
                total: entities.tasks?.length || 0,
                pending: entities.tasks?.filter(t => t.status !== 'completed').length || 0,
                completed: entities.tasks?.filter(t => t.status === 'completed').length || 0
            };
            break;
        default:
            report.data = { entities };
    }

    res.json(report);
});

// ==================== BUSINESS FEATURES API ====================

// CRM Contacts
app.get('/api/contacts/:tenantId', (req, res) => {
    const db = getDB();
    const contacts = db.contacts?.[req.params.tenantId] || [];
    res.json(contacts);
});

app.post('/api/contacts/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.contacts) db.contacts = {};
    if (!db.contacts[req.params.tenantId]) db.contacts[req.params.tenantId] = [];
    const contact = { id: Date.now(), ...req.body, created: new Date().toISOString() };
    db.contacts[req.params.tenantId].push(contact);
    saveDB(db);
    res.json(contact);
});

app.put('/api/contacts/:tenantId/:id', (req, res) => {
    const db = getDB();
    const contacts = db.contacts?.[req.params.tenantId] || [];
    const idx = contacts.findIndex(c => c.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    contacts[idx] = { ...contacts[idx], ...req.body };
    saveDB(db);
    res.json(contacts[idx]);
});

app.delete('/api/contacts/:tenantId/:id', (req, res) => {
    const db = getDB();
    const contacts = db.contacts?.[req.params.tenantId] || [];
    const idx = contacts.findIndex(c => c.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    contacts.splice(idx, 1);
    saveDB(db);
    res.json({ success: true });
});

// Staff Management
app.get('/api/staff/:tenantId', (req, res) => {
    const db = getDB();
    const staff = db.staff?.[req.params.tenantId] || [];
    res.json(staff);
});

app.post('/api/staff/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.staff) db.staff = {};
    if (!db.staff[req.params.tenantId]) db.staff[req.params.tenantId] = [];
    const member = { id: Date.now(), ...req.body, joined: new Date().toISOString() };
    db.staff[req.params.tenantId].push(member);
    saveDB(db);
    res.json(member);
});

app.put('/api/staff/:tenantId/:id', (req, res) => {
    const db = getDB();
    const staff = db.staff?.[req.params.tenantId] || [];
    const idx = staff.findIndex(s => s.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    staff[idx] = { ...staff[idx], ...req.body };
    saveDB(db);
    res.json(staff[idx]);
});

app.delete('/api/staff/:tenantId/:id', (req, res) => {
    const db = getDB();
    const staff = db.staff?.[req.params.tenantId] || [];
    const idx = staff.findIndex(s => s.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    staff.splice(idx, 1);
    saveDB(db);
    res.json({ success: true });
});

// Logo Upload (base64)
app.get('/api/logo/:tenantId', (req, res) => {
    const db = getDB();
    const logo = db.logos?.[req.params.tenantId] || null;
    res.json(logo);
});

app.post('/api/logo/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.logos) db.logos = {};
    const logo = { id: Date.now(), ...req.body, uploaded: new Date().toISOString() };
    db.logos[req.params.tenantId] = logo;
    saveDB(db);
    res.json(logo);
});

app.delete('/api/logo/:tenantId', (req, res) => {
    const db = getDB();
    if (db.logos) delete db.logos[req.params.tenantId];
    saveDB(db);
    res.json({ success: true });
});

// AI Receptionist Settings
app.get('/api/ai-receptionist/:tenantId', (req, res) => {
    const db = getDB();
    const settings = db.aiReceptionist?.[req.params.tenantId] || { enabled: true, greeting: 'Hello! Welcome to our business. How can I help you today?', responses: [] };
    res.json(settings);
});

app.put('/api/ai-receptionist/:tenantId', (req, res) => {
    const db = getDB();
    if (!db.aiReceptionist) db.aiReceptionist = {};
    db.aiReceptionist[req.params.tenantId] = { id: Date.now(), ...req.body, updated: new Date().toISOString() };
    saveDB(db);
    res.json(db.aiReceptionist[req.params.tenantId]);
});

// ==================== NVIDIA AI API PROXY ====================
// Proxy endpoint for NVIDIA NIM AI API (optional - for production use)
app.post('/api/ai/chat', async (req, res) => {
    const { message, context, conversationHistory = [] } = req.body;
    
    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
    const INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
    
    try {
        const messages = [
            { role: 'system', content: context || 'You are a helpful AI assistant for TenantHub, a multi-tenant business management platform.' },
            ...conversationHistory,
            { role: 'user', content: message }
        ];
        
        const payload = {
            model: 'moonshotai/kimi-k2.5',
            messages: messages,
            max_tokens: 16384,
            temperature: 1.0,
            top_p: 1.0,
            stream: false,
            chat_template_kwargs: {
                thinking: true
            }
        };
        
        const response = await fetch(INVOKE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`NVIDIA API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json({
            success: true,
            response: data.choices?.[0]?.message?.content || 'No response generated',
            raw: data
        });
    } catch (error) {
        console.error('AI Proxy Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve tenant login page
app.get('/login/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'tenant-login.html'));
});

// Serve staff login page
app.get('/staff/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'staff-login.html'));
});

// Serve tenant dashboard
app.get('/tenant.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'tenant.html'));
});

// Serve staff dashboard
app.get('/staff-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'staff-dashboard.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin dashboard
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 TenantHub Server running at http://localhost:${PORT}    ║
║                                                           ║
║   Admin: admin@tenanthub.com / admin123                   ║
║   Tenants: admin@acme.com / acme123                       ║
║                                                           ║
║   Login URLs:                                             ║
║   /login/care-clinic                                      ║
║   /login/little-stars-daycare                             ║
║   /login/bella-salon                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝`);
});
