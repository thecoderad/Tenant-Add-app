/**
 * TenantHub - Advanced Business Features Module
 * CRM Contacts, Staff Management, Logo Upload, AI Receptionist
 */

class BusinessFeatures {
    constructor(options = {}) {
        this.tenantId = options.tenantId;
        this.api = '/api';
        this.contacts = [];
        this.staff = [];
        this.logo = null;
        this.aiReceptionist = {
            enabled: true,
            greeting: 'Hello! Welcome to our business. How can I help you today?',
            responses: []
        };
        this.tenantSlug = null;
        this.init();
    }

    init() {
        this.loadContacts();
        this.loadStaff();
        this.loadLogo();
        this.loadAIReceptionist();
        this.loadTenantSlug();
        this.setupEventListeners();
    }

    async loadTenantSlug() {
        try {
            const res = await fetch(`${this.api}/tenant/slug/${this.tenantId}`);
            if (res.ok) {
                const data = await res.json();
                this.tenantSlug = data.slug;
            }
        } catch (err) {
            console.error('Error loading tenant slug:', err);
        }
    }

    getTenantSlug() {
        return this.tenantSlug || 'tenant';
    }

    generateStaffSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    copyStaffLink(url, name) {
        navigator.clipboard.writeText(url);
        this.showToast(`Staff link for ${name} copied!`, 'success');
    }

    // ═══════════════════════════════════════════════════════════════
    // CRM CONTACTS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    loadContacts() {
        const stored = localStorage.getItem(`contacts_${this.tenantId}`);
        if (stored) {
            this.contacts = JSON.parse(stored);
        } else {
            // Sample contacts
            this.contacts = [
                {
                    id: 1,
                    name: 'John Smith',
                    email: 'john.smith@email.com',
                    phone: '+1 (555) 123-4567',
                    company: 'Tech Corp',
                    position: 'CEO',
                    type: 'customer',
                    status: 'active',
                    avatar: null,
                    notes: 'VIP customer',
                    created: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Sarah Johnson',
                    email: 'sarah.j@email.com',
                    phone: '+1 (555) 234-5678',
                    company: 'Design Studio',
                    position: 'Creative Director',
                    type: 'prospect',
                    status: 'active',
                    avatar: null,
                    notes: 'Interested in premium package',
                    created: new Date().toISOString()
                }
            ];
            this.saveContacts();
        }
        this.renderContacts();
    }

    saveContacts() {
        localStorage.setItem(`contacts_${this.tenantId}`, JSON.stringify(this.contacts));
    }

    addContact(contact) {
        const newContact = {
            id: Date.now(),
            ...contact,
            status: contact.status || 'active',
            created: new Date().toISOString()
        };
        this.contacts.push(newContact);
        this.saveContacts();
        this.renderContacts();
        this.showToast('Contact added successfully', 'success');
        this.logActivity(`Added new contact: ${contact.name}`, 'success');
    }

    updateContact(id, updates) {
        const index = this.contacts.findIndex(c => c.id === id);
        if (index > -1) {
            this.contacts[index] = { ...this.contacts[index], ...updates };
            this.saveContacts();
            this.renderContacts();
            this.showToast('Contact updated successfully', 'success');
            this.logActivity(`Updated contact: ${this.contacts[index].name}`, 'info');
        }
    }

    deleteContact(id) {
        if (confirm('Are you sure you want to delete this contact?')) {
            const index = this.contacts.findIndex(c => c.id === id);
            if (index > -1) {
                const name = this.contacts[index].name;
                this.contacts.splice(index, 1);
                this.saveContacts();
                this.renderContacts();
                this.showToast('Contact deleted successfully', 'success');
                this.logActivity(`Deleted contact: ${name}`, 'danger');
            }
        }
    }

    searchContacts(query) {
        const term = query.toLowerCase();
        return this.contacts.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.phone.toLowerCase().includes(term) ||
            c.company.toLowerCase().includes(term)
        );
    }

    filterContactsByType(type) {
        return this.contacts.filter(c => c.type === type);
    }

    getContactStats() {
        return {
            total: this.contacts.length,
            customers: this.contacts.filter(c => c.type === 'customer').length,
            prospects: this.contacts.filter(c => c.type === 'prospect').length,
            vendors: this.contacts.filter(c => c.type === 'vendor').length,
            active: this.contacts.filter(c => c.status === 'active').length
        };
    }

    renderContacts() {
        const container = document.getElementById('contacts-list');
        if (!container) return;

        const stats = this.getContactStats();

        if (this.contacts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fas fa-users" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>No contacts yet</h3>
                    <p>Add your first contact to get started</p>
                    <button class="btn btn-primary" onclick="businessFeatures.showAddContactModal()">
                        <i class="fas fa-plus"></i> Add Contact
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="contacts-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div class="stat-card mini">
                    <div class="stat-value" style="font-size: 1.5rem;">${stats.total}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-card mini">
                    <div class="stat-value" style="font-size: 1.5rem; color: var(--neon-green);">${stats.customers}</div>
                    <div class="stat-label">Customers</div>
                </div>
                <div class="stat-card mini">
                    <div class="stat-value" style="font-size: 1.5rem; color: var(--neon-cyan);">${stats.prospects}</div>
                    <div class="stat-label">Prospects</div>
                </div>
                <div class="stat-card mini">
                    <div class="stat-value" style="font-size: 1.5rem; color: var(--neon-purple);">${stats.active}</div>
                    <div class="stat-label">Active</div>
                </div>
            </div>

            <div class="contacts-actions" style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
                <div class="search-box" style="flex: 1; min-width: 250px; position: relative;">
                    <i class="fas fa-search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                    <input type="text" id="contacts-search" placeholder="Search contacts..." 
                        style="width: 100%; padding: 12px 16px 12px 44px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); color: var(--text-primary);"
                        oninput="businessFeatures.handleContactSearch(this.value)">
                </div>
                <button class="btn btn-primary" onclick="businessFeatures.showAddContactModal()">
                    <i class="fas fa-plus"></i> Add Contact
                </button>
                <button class="btn btn-outline" onclick="businessFeatures.exportContacts()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>

            <div class="contacts-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${this.contacts.map(contact => `
                    <div class="contact-card card" style="cursor: pointer;" onclick="businessFeatures.viewContact(${contact.id})">
                        <div class="contact-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <div class="contact-avatar" style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem;">
                                    ${contact.avatar ? `<img src="${contact.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : contact.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style="margin: 0; font-size: 1rem; color: var(--text-primary);">${contact.name}</h3>
                                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${contact.position} at ${contact.company}</p>
                                </div>
                            </div>
                            <span class="badge badge-${contact.type === 'customer' ? 'active' : contact.type === 'prospect' ? 'info' : 'pending'}">
                                ${contact.type}
                            </span>
                        </div>
                        <div class="contact-info" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                                <i class="fas fa-envelope" style="width: 16px; color: var(--neon-cyan);"></i>
                                ${contact.email}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                                <i class="fas fa-phone" style="width: 16px; color: var(--neon-green);"></i>
                                ${contact.phone}
                            </div>
                        </div>
                        ${contact.notes ? `
                            <div class="contact-notes" style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--border-radius-sm); font-size: 0.85rem; color: var(--text-secondary);">
                                <i class="fas fa-sticky-note" style="margin-right: 6px; color: var(--neon-yellow);"></i>
                                ${contact.notes}
                            </div>
                        ` : ''}
                        <div class="contact-actions" style="display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light);">
                            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); businessFeatures.editContact(${contact.id})" style="flex: 1;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); businessFeatures.contactAction('email', '${contact.email}')" style="flex: 1;">
                                <i class="fas fa-envelope"></i> Email
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); businessFeatures.contactAction('call', '${contact.phone}')" style="flex: 1;">
                                <i class="fas fa-phone"></i> Call
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    handleContactSearch(query) {
        const filtered = this.searchContacts(query);
        const container = document.getElementById('contacts-list');
        const grid = container.querySelector('.contacts-grid');
        
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>No contacts found matching "${query}"</p>
                </div>
            `;
        } else {
            grid.innerHTML = filtered.map(contact => `
                <div class="contact-card card" style="cursor: pointer;" onclick="businessFeatures.viewContact(${contact.id})">
                    <div class="contact-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div class="contact-avatar" style="width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem;">
                                ${contact.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style="margin: 0; font-size: 1rem; color: var(--text-primary);">${contact.name}</h3>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${contact.position} at ${contact.company}</p>
                            </div>
                        </div>
                        <span class="badge badge-${contact.type === 'customer' ? 'active' : contact.type === 'prospect' ? 'info' : 'pending'}">
                            ${contact.type}
                        </span>
                    </div>
                    <div class="contact-info" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                            <i class="fas fa-envelope" style="width: 16px; color: var(--neon-cyan);"></i>
                            ${contact.email}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                            <i class="fas fa-phone" style="width: 16px; color: var(--neon-green);"></i>
                            ${contact.phone}
                        </div>
                    </div>
                    <div class="contact-actions" style="display: flex; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-light);">
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); businessFeatures.editContact(${contact.id})" style="flex: 1;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); businessFeatures.contactAction('email', '${contact.email}')" style="flex: 1;">
                            <i class="fas fa-envelope"></i> Email
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    showAddContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            document.getElementById('contact-modal-title').textContent = 'Add New Contact';
            document.getElementById('contact-form').reset();
            document.getElementById('contact-id').value = '';
            modal.classList.add('active');
        } else {
            // Create modal if it doesn't exist
            this.createContactModal();
        }
    }

    createContactModal() {
        const modalHTML = `
            <div class="modal-overlay" id="contact-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h2 class="modal-title" id="contact-modal-title">Add New Contact</h2>
                        <button class="modal-close" onclick="businessFeatures.closeContactModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="contact-form" onsubmit="businessFeatures.saveContactFromForm(event)">
                        <input type="hidden" id="contact-id">
                        <div class="form-group">
                            <label class="form-label">Full Name *</label>
                            <input type="text" id="contact-name" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email *</label>
                            <input type="email" id="contact-email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone *</label>
                            <input type="tel" id="contact-phone" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Company</label>
                            <input type="text" id="contact-company" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Position</label>
                            <input type="text" id="contact-position" class="form-input">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Type</label>
                            <select id="contact-type" class="form-select">
                                <option value="customer">Customer</option>
                                <option value="prospect">Prospect</option>
                                <option value="vendor">Vendor</option>
                                <option value="partner">Partner</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea id="contact-notes" class="form-textarea" rows="3"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" onclick="businessFeatures.closeContactModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Contact
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeContactModal() {
        const modal = document.getElementById('contact-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    saveContactFromForm(event) {
        event.preventDefault();
        const id = document.getElementById('contact-id').value;
        const contactData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            company: document.getElementById('contact-company').value,
            position: document.getElementById('contact-position').value,
            type: document.getElementById('contact-type').value,
            notes: document.getElementById('contact-notes').value
        };

        if (id) {
            this.updateContact(parseInt(id), contactData);
        } else {
            this.addContact(contactData);
        }
        this.closeContactModal();
    }

    editContact(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            this.createContactModal();
            document.getElementById('contact-modal-title').textContent = 'Edit Contact';
            document.getElementById('contact-id').value = contact.id;
            document.getElementById('contact-name').value = contact.name;
            document.getElementById('contact-email').value = contact.email;
            document.getElementById('contact-phone').value = contact.phone;
            document.getElementById('contact-company').value = contact.company || '';
            document.getElementById('contact-position').value = contact.position || '';
            document.getElementById('contact-type').value = contact.type;
            document.getElementById('contact-notes').value = contact.notes || '';
            document.getElementById('contact-modal').classList.add('active');
        }
    }

    viewContact(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            alert(`Contact Details:\n\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nCompany: ${contact.company}\nPosition: ${contact.position}\nType: ${contact.type}\nNotes: ${contact.notes || 'N/A'}`);
        }
    }

    contactAction(action, value) {
        if (action === 'email') {
            window.location.href = `mailto:${value}`;
        } else if (action === 'call') {
            window.location.href = `tel:${value}`;
        }
    }

    exportContacts() {
        const csv = [
            ['Name', 'Email', 'Phone', 'Company', 'Position', 'Type', 'Status', 'Notes'].join(','),
            ...this.contacts.map(c => 
                [c.name, c.email, c.phone, c.company, c.position, c.type, c.status, c.notes || ''].map(f => `"${f}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Contacts exported successfully', 'success');
    }

    // ═══════════════════════════════════════════════════════════════
    // STAFF MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    async loadStaff() {
        try {
            const res = await fetch(`${this.api}/staff/${this.tenantId}`);
            const staff = await res.json();
            if (staff.length > 0) {
                this.staff = staff;
                this.saveStaff();
            } else {
                // Sample staff for demo
                this.staff = [
                    {
                        id: 1,
                        name: 'Emily Davis',
                        email: 'emily@business.com',
                        phone: '+1 (555) 111-2222',
                        role: 'Manager',
                        department: 'Operations',
                        status: 'active',
                        password: 'emily123',
                        avatar: null,
                        joined: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: 'Michael Brown',
                        email: 'michael@business.com',
                        phone: '+1 (555) 333-4444',
                        role: 'Sales Representative',
                        department: 'Sales',
                        status: 'active',
                        password: 'michael123',
                        avatar: null,
                        joined: new Date().toISOString()
                    }
                ];
                this.saveStaff();
            }
        } catch (err) {
            console.error('Error loading staff:', err);
        }
        this.renderStaff();
    }

    saveStaff() {
        localStorage.setItem(`staff_${this.tenantId}`, JSON.stringify(this.staff));
    }

    async addStaff(member) {
        const newMember = {
            id: Date.now(),
            ...member,
            status: member.status || 'active',
            joined: new Date().toISOString()
        };
        
        try {
            const res = await fetch(`${this.api}/staff/${this.tenantId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            const saved = await res.json();
            this.staff.push(saved);
            this.saveStaff();
            this.renderStaff();
            this.showToast('Staff member added successfully', 'success');
            this.logActivity(`Added staff member: ${member.name}`, 'success');
        } catch (err) {
            this.showToast('Error adding staff member', 'error');
        }
    }

    async updateStaff(id, updates) {
        try {
            const res = await fetch(`${this.api}/staff/${this.tenantId}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const updated = await res.json();
            const index = this.staff.findIndex(s => s.id === id);
            if (index > -1) {
                this.staff[index] = updated;
                this.saveStaff();
                this.renderStaff();
            }
            this.showToast('Staff member updated successfully', 'success');
        } catch (err) {
            this.showToast('Error updating staff member', 'error');
        }
    }

    async deleteStaff(id) {
        if (confirm('Are you sure you want to remove this staff member?')) {
            try {
                const res = await fetch(`${this.api}/staff/${this.tenantId}/${id}`, {
                    method: 'DELETE'
                });
                await res.json();
                const index = this.staff.findIndex(s => s.id === id);
                if (index > -1) {
                    const name = this.staff[index].name;
                    this.staff.splice(index, 1);
                    this.saveStaff();
                    this.renderStaff();
                    this.showToast('Staff member removed successfully', 'success');
                    this.logActivity(`Removed staff member: ${name}`, 'danger');
                }
            } catch (err) {
                this.showToast('Error removing staff member', 'error');
            }
        }
    }

    getStaffStats() {
        return {
            total: this.staff.length,
            active: this.staff.filter(s => s.status === 'active').length,
            departments: [...new Set(this.staff.map(s => s.department))].length
        };
    }

    renderStaff() {
        const container = document.getElementById('staff-list');
        if (!container) return;

        const stats = this.getStaffStats();

        if (this.staff.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fas fa-users-cog" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>No staff members yet</h3>
                    <p>Add your first team member to get started</p>
                    <button class="btn btn-primary" onclick="businessFeatures.showAddStaffModal()">
                        <i class="fas fa-plus"></i> Add Staff
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="staff-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div class="stat-card mini">
                    <div class="stat-value" style="font-size: 1.5rem;">${stats.total}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-card mini">
                    <div class="stat-value" style="font-size: 1.5rem; color: var(--neon-green);">${stats.active}</div>
                    <div class="stat-label">Active</div>
                </div>
                <div class="stat-card mini">
                    <div class="stat-value" style="font-size: 1.5rem; color: var(--neon-cyan);">${stats.departments}</div>
                    <div class="stat-label">Departments</div>
                </div>
            </div>

            <div class="staff-actions" style="display: flex; gap: 12px; margin-bottom: 24px;">
                <button class="btn btn-primary" onclick="businessFeatures.showAddStaffModal()">
                    <i class="fas fa-plus"></i> Add Staff Member
                </button>
            </div>

            <div class="staff-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                ${this.staff.map(member => {
                    const staffSlug = member.slug || this.generateStaffSlug(member.name);
                    const staffLoginUrl = `${window.location.origin}/staff/${this.getTenantSlug()}/${staffSlug}`;
                    return `
                    <div class="staff-card card">
                        <div class="staff-header" style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
                            <div class="staff-avatar" style="width: 56px; height: 56px; border-radius: 50%; background: var(--gradient-secondary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.3rem; flex-shrink: 0;">
                                ${member.avatar ? `<img src="${member.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : member.name.charAt(0)}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <h3 style="margin: 0; font-size: 1rem; color: var(--text-primary);">${member.name}</h3>
                                <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">${member.role}</p>
                                <span class="badge badge-${member.status === 'active' ? 'active' : 'inactive'}" style="margin-top: 4px;">${member.status}</span>
                            </div>
                        </div>
                        <div class="staff-info" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                                <i class="fas fa-building" style="width: 16px; color: var(--neon-purple);"></i>
                                ${member.department}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                                <i class="fas fa-envelope" style="width: 16px; color: var(--neon-cyan);"></i>
                                ${member.email}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                                <i class="fas fa-phone" style="width: 16px; color: var(--neon-green);"></i>
                                ${member.phone}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.75rem; background: var(--bg-tertiary); padding: 8px; border-radius: 8px; margin-top: 8px;">
                                <i class="fas fa-link" style="width: 16px; color: var(--neon-cyan);"></i>
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${staffLoginUrl}</span>
                            </div>
                            <button class="btn btn-sm btn-outline" onclick="businessFeatures.copyStaffLink('${staffLoginUrl}', '${member.name}')" style="width: 100%; margin-top: 4px;">
                                <i class="fas fa-copy"></i> Copy Staff Link
                            </button>
                        </div>
                        <div class="staff-actions" style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-primary" onclick="businessFeatures.editStaff(${member.id})" style="flex: 1;">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="businessFeatures.deleteStaff(${member.id})" style="flex: 1;">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `}}).join('')}
            </div>
        `;
    }

    showAddStaffModal() {
        const modal = document.getElementById('staff-modal');
        if (modal) {
            document.getElementById('staff-modal-title').textContent = 'Add Staff Member';
            document.getElementById('staff-form').reset();
            document.getElementById('staff-id').value = '';
            modal.classList.add('active');
        } else {
            this.createStaffModal();
        }
    }

    createStaffModal() {
        const modalHTML = `
            <div class="modal-overlay" id="staff-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h2 class="modal-title" id="staff-modal-title">Add Staff Member</h2>
                        <button class="modal-close" onclick="businessFeatures.closeStaffModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="staff-form" onsubmit="businessFeatures.saveStaffFromForm(event)">
                        <input type="hidden" id="staff-id">
                        <div class="form-group">
                            <label class="form-label">Full Name *</label>
                            <input type="text" id="staff-name" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email *</label>
                            <input type="email" id="staff-email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password *</label>
                            <input type="text" id="staff-password" class="form-input" required placeholder="Enter password for staff login">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone *</label>
                            <input type="tel" id="staff-phone" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Role *</label>
                            <input type="text" id="staff-role" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Department *</label>
                            <select id="staff-department" class="form-select" required>
                                <option value="">Select Department</option>
                                <option value="Operations">Operations</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Support">Support</option>
                                <option value="Finance">Finance</option>
                                <option value="HR">HR</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <select id="staff-status" class="form-select">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on-leave">On Leave</option>
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-ghost" onclick="businessFeatures.closeStaffModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Add Staff
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    closeStaffModal() {
        const modal = document.getElementById('staff-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    saveStaffFromForm(event) {
        event.preventDefault();
        const id = document.getElementById('staff-id').value;
        const staffData = {
            name: document.getElementById('staff-name').value,
            email: document.getElementById('staff-email').value,
            phone: document.getElementById('staff-phone').value,
            role: document.getElementById('staff-role').value,
            department: document.getElementById('staff-department').value,
            status: document.getElementById('staff-status').value,
            password: document.getElementById('staff-password').value || undefined
        };

        if (id) {
            this.updateStaff(parseInt(id), staffData);
        } else {
            this.addStaff(staffData);
        }
        this.closeStaffModal();
    }

    editStaff(id) {
        const member = this.staff.find(s => s.id === id);
        if (member) {
            this.createStaffModal();
            document.getElementById('staff-modal-title').textContent = 'Edit Staff Member';
            document.getElementById('staff-id').value = member.id;
            document.getElementById('staff-name').value = member.name;
            document.getElementById('staff-email').value = member.email;
            document.getElementById('staff-phone').value = member.phone;
            document.getElementById('staff-role').value = member.role;
            document.getElementById('staff-department').value = member.department;
            document.getElementById('staff-status').value = member.status;
            document.getElementById('staff-password').value = member.password || '';
            document.getElementById('staff-password').placeholder = 'Leave blank to keep current';
            document.getElementById('staff-modal').classList.add('active');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // LOGO UPLOAD
    // ═══════════════════════════════════════════════════════════════

    async loadLogo() {
        try {
            const res = await fetch(`${this.api}/logo/${this.tenantId}`);
            const logo = await res.json();
            if (logo && logo.data) {
                this.logo = logo;
                localStorage.setItem(`logo_${this.tenantId}`, JSON.stringify(this.logo));
            } else {
                const stored = localStorage.getItem(`logo_${this.tenantId}`);
                if (stored) {
                    this.logo = JSON.parse(stored);
                }
            }
            this.renderLogo();
            this.updateLogoInHeader();
        } catch (err) {
            console.error('Error loading logo:', err);
        }
    }

    async uploadLogo(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showToast('Please upload an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showToast('File size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const logoData = {
                data: e.target.result,
                name: file.name,
                size: file.size,
                uploaded: new Date().toISOString()
            };

            try {
                const res = await fetch(`${this.api}/logo/${this.tenantId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logoData)
                });
                const saved = await res.json();
                this.logo = saved;
                localStorage.setItem(`logo_${this.tenantId}`, JSON.stringify(this.logo));
                this.renderLogo();
                this.updateLogoInHeader();
                this.showToast('Logo uploaded successfully', 'success');
                this.logActivity('Uploaded new business logo', 'success');
            } catch (err) {
                this.showToast('Error uploading logo', 'error');
            }
        };
        reader.onerror = () => {
            this.showToast('Error uploading file', 'error');
        };
        reader.readAsDataURL(file);
    }

    updateLogoInHeader() {
        const logoElement = document.getElementById('brand-logo');
        if (logoElement && this.logo && this.logo.data) {
            logoElement.innerHTML = `<img src="${this.logo.data}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">`;
        }
    }

    renderLogo() {
        const container = document.getElementById('logo-preview');
        if (!container) return;

        if (this.logo && this.logo.data) {
            container.innerHTML = `
                <div class="logo-preview" style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                    <div style="width: 150px; height: 150px; border-radius: var(--border-radius-lg); overflow: hidden; border: 2px solid var(--border-color); box-shadow: var(--shadow-lg);">
                        <img src="${this.logo.data}" alt="Business Logo" style="width: 100%; height: 100%; object-fit: contain; background: var(--bg-card);">
                    </div>
                    <div class="logo-info" style="text-align: center;">
                        <p style="margin: 0; font-weight: 600; color: var(--text-primary);">${this.logo.name}</p>
                        <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--text-muted);">${(this.logo.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <div class="logo-actions" style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-outline" onclick="document.getElementById('logo-upload-input').click()">
                            <i class="fas fa-upload"></i> Change
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="businessFeatures.downloadLogo()">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="businessFeatures.deleteLogo()">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="logo-upload-placeholder" style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; border: 2px dashed var(--border-color); border-radius: var(--border-radius-lg); width: 100%; max-width: 300px;">
                    <i class="fas fa-image" style="font-size: 3rem; color: var(--text-muted); opacity: 0.5;"></i>
                    <div style="text-align: center;">
                        <p style="margin: 0; font-weight: 600; color: var(--text-primary);">No logo uploaded</p>
                        <p style="margin: 8px 0 0; font-size: 0.85rem; color: var(--text-muted);">Upload your business logo</p>
                    </div>
                    <button class="btn btn-primary" onclick="document.getElementById('logo-upload-input').click()">
                        <i class="fas fa-upload"></i> Upload Logo
                    </button>
                </div>
            `;
        }
    }

    downloadLogo() {
        if (this.logo && this.logo.data) {
            const a = document.createElement('a');
            a.href = this.logo.data;
            a.download = this.logo.name || 'logo.png';
            a.click();
            this.showToast('Logo download started', 'success');
        }
    }

    async deleteLogo() {
        if (confirm('Are you sure you want to delete the logo?')) {
            try {
                await fetch(`${this.api}/logo/${this.tenantId}`, { method: 'DELETE' });
                this.logo = null;
                localStorage.removeItem(`logo_${this.tenantId}`);
                this.renderLogo();
                this.updateLogoInHeader();
                this.showToast('Logo deleted successfully', 'success');
                this.logActivity('Deleted business logo', 'danger');
            } catch (err) {
                this.showToast('Error deleting logo', 'error');
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // AI RECEPTIONIST
    // ═══════════════════════════════════════════════════════════════

    loadAIReceptionist() {
        const stored = localStorage.getItem(`ai_receptionist_${this.tenantId}`);
        if (stored) {
            this.aiReceptionist = JSON.parse(stored);
        }
        this.renderAIReceptionist();
    }

    saveAIReceptionist() {
        localStorage.setItem(`ai_receptionist_${this.tenantId}`, JSON.stringify(this.aiReceptionist));
    }

    renderAIReceptionist() {
        const container = document.getElementById('ai-receptionist-settings');
        if (!container) return;

        container.innerHTML = `
            <div class="ai-receptionist-card card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-robot"></i>
                        AI Receptionist
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 0.875rem;">${this.aiReceptionist.enabled ? 'Enabled' : 'Disabled'}</span>
                        <label class="toggle-switch" style="position: relative; display: inline-block; width: 50px; height: 26px; cursor: pointer;">
                            <input type="checkbox" id="ai-receptionist-toggle" ${this.aiReceptionist.enabled ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                            <div class="toggle-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.aiReceptionist.enabled ? 'var(--success)' : 'var(--gray-300)'}; border-radius: 26px; transition: 0.3s;">
                                <span style="position: absolute; content: ''; height: 20px; width: 20px; left: ${this.aiReceptionist.enabled ? '28px' : '3px'}; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s;"></span>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label class="form-label">AI Greeting Message</label>
                        <textarea id="ai-greeting" class="form-textarea" rows="3"
                            onblur="businessFeatures.updateAISetting('greeting', this.value)"
                            style="width: 100%;">${this.aiReceptionist.greeting}</textarea>
                        <p class="form-hint">This message will be shown to visitors when they first arrive</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Quick Responses</label>
                        <div id="ai-responses" style="display: flex; flex-direction: column; gap: 12px;">
                            ${this.aiReceptionist.responses.map((r, i) => `
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <input type="text" value="${r.trigger}" placeholder="Trigger"
                                        onblur="businessFeatures.updateAIResponse(${i}, 'trigger', this.value)"
                                        style="flex: 1; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: var(--text-primary);">
                                    <input type="text" value="${r.answer}" placeholder="Response"
                                        onblur="businessFeatures.updateAIResponse(${i}, 'answer', this.value)"
                                        style="flex: 2; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); color: var(--text-primary);">
                                    <button class="btn btn-sm btn-outline" onclick="businessFeatures.deleteAIResponse(${i})" style="padding: 10px;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="businessFeatures.addAIResponse()" style="margin-top: 12px;">
                            <i class="fas fa-plus"></i> Add Response
                        </button>
                    </div>
                    <div class="ai-preview" style="margin-top: 24px; padding: 20px; background: var(--bg-tertiary); border-radius: var(--border-radius-md);">
                        <h4 style="margin: 0 0 12px; color: var(--text-primary);"><i class="fas fa-eye" style="color: var(--neon-cyan);"></i> Preview</h4>
                        <div class="ai-chat-preview" style="padding: 16px; background: var(--bg-card); border-radius: var(--border-radius-sm);">
                            <div class="ai-message" style="margin-bottom: 12px; display: flex; gap: 12px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <i class="fas fa-robot" style="color: white; font-size: 0.9rem;"></i>
                                </div>
                                <div style="flex: 1; background: var(--bg-tertiary); padding: 12px; border-radius: var(--border-radius-md); color: var(--text-secondary);">
                                    ${this.aiReceptionist.greeting}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for toggle
        setTimeout(() => {
            const toggle = document.getElementById('ai-receptionist-toggle');
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.toggleAIReceptionist(e.target.checked);
                });
            }
        }, 100);
    }

    toggleAIReceptionist(enabled) {
        this.aiReceptionist.enabled = enabled;
        this.saveAIReceptionist();
        this.renderAIReceptionist();
        this.showToast(`AI Receptionist ${enabled ? 'enabled' : 'disabled'}`, 'success');
        this.logActivity(`${enabled ? 'Enabled' : 'Disabled'} AI Receptionist`, 'info');
    }

    updateAISetting(key, value) {
        this.aiReceptionist[key] = value;
        this.saveAIReceptionist();
        this.renderAIReceptionist();
    }

    addAIResponse() {
        this.aiReceptionist.responses.push({ trigger: '', answer: '' });
        this.saveAIReceptionist();
        this.renderAIReceptionist();
    }

    updateAIResponse(index, field, value) {
        this.aiReceptionist.responses[index][field] = value;
        this.saveAIReceptionist();
    }

    deleteAIResponse(index) {
        this.aiReceptionist.responses.splice(index, 1);
        this.saveAIReceptionist();
        this.renderAIReceptionist();
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTIVITY LOGGING
    // ═══════════════════════════════════════════════════════════════

    logActivity(title, type = 'info') {
        const activities = JSON.parse(localStorage.getItem(`activities_${this.tenantId}`) || '[]');
        activities.unshift({
            id: Date.now(),
            title,
            type,
            time: new Date().toISOString()
        });
        activities.splice(50); // Keep last 50
        localStorage.setItem(`activities_${this.tenantId}`, JSON.stringify(activities));
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {
        // Logo upload
        const logoInput = document.getElementById('logo-upload-input');
        if (logoInput) {
            logoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.uploadLogo(e.target.files[0]);
                }
            });
        }
    }
}

// Initialize on DOM load
let businessFeatures;
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const stored = sessionStorage.getItem('current_tenant');
        if (stored) {
            const tenant = JSON.parse(stored);
            businessFeatures = new BusinessFeatures({ tenantId: tenant.id });
            window.businessFeatures = businessFeatures;
        }
    });
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BusinessFeatures };
}
