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

// Serve tenant login page
app.get('/login/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'tenant-login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
