// TenantHub - Main Script with Database Integration
// Uses localStorage for persistent data storage

let currentPage = 1;
const itemsPerPage = 5;
let filteredTenants = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Database is auto-initialized in database.js
    loadTenants();
    renderTable();
    setupEventListeners();
    updateStats();
});

// Load tenants from database
function loadTenants() {
    filteredTenants = db.getAll('tenants');
}

// Render the table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredTenants.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #718096;">
                    <svg style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 1a2 2 0 01-2 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 1V9a2 2 0 00-2-2m2 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m2 2V9a2 2 0 00-2-2m2 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2"></path>
                    </svg>
                    <p>No tenants found. Add your first tenant to get started!</p>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageData.map(tenant => `
            <tr>
                <td><strong>${tenant.name}</strong></td>
                <td>${tenant.domain}</td>
                <td>${tenant.email}</td>
                <td><span class="status-badge status-${tenant.status}">${tenant.status.toUpperCase()}</span></td>
                <td>${tenant.created}</td>
                <td>
                    <button class="btn btn-action btn-edit" onclick="editTenant(${tenant.id})">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.585-8.585z"/>
                        </svg>
                        Edit
                    </button>
                    <button class="btn btn-action btn-delete" onclick="deleteTenant(${tenant.id})">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updatePagination();
}

// Update dashboard stats
function updateStats() {
    const totalTenants = db.count('tenants');
    const activeTenants = db.query('tenants', { status: 'active' }).length;
    const pendingTenants = db.query('tenants', { status: 'pending' }).length;

    const statsEl = document.getElementById('dashboardStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${totalTenants}</div>
                    <div class="stat-label">Total Tenants</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${activeTenants}</div>
                    <div class="stat-label">Active</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${pendingTenants}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${chat.getUnreadCount(0)}</div>
                    <div class="stat-label">Messages</div>
                </div>
            </div>
        `;
    }
}

// Update pagination info
function updatePagination() {
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterTenants);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTenants);
    }

    const tenantForm = document.getElementById('tenantForm');
    if (tenantForm) {
        tenantForm.addEventListener('submit', handleFormSubmit);
    }
}

// Filter tenants
function filterTenants() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;

    filteredTenants = db.query('tenants', { status: status || undefined });

    if (search) {
        filteredTenants = filteredTenants.filter(tenant =>
            tenant.name.toLowerCase().includes(search) ||
            tenant.domain.toLowerCase().includes(search) ||
            tenant.email.toLowerCase().includes(search)
        );
    }

    currentPage = 1;
    renderTable();
}

// Pagination
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// Modal functions
function openModal() {
    const modal = document.getElementById('tenantModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('modalTitle').textContent = 'Add New Tenant';
        document.getElementById('tenantForm').reset();
        document.getElementById('tenantId').value = '';
    }
}

function closeModal() {
    const modal = document.getElementById('tenantModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Edit tenant
function editTenant(id) {
    const tenant = db.get('tenants', id);
    if (tenant) {
        document.getElementById('tenantId').value = tenant.id;
        document.getElementById('tenantName').value = tenant.name;
        document.getElementById('tenantDomain').value = tenant.domain;
        document.getElementById('adminEmail').value = tenant.email;
        document.getElementById('tenantStatus').value = tenant.status;
        document.getElementById('modalTitle').textContent = 'Edit Tenant';
        document.getElementById('tenantModal').style.display = 'block';
    }
}

// Delete tenant
function deleteTenant(id) {
    if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
        db.delete('tenants', id);
        loadTenants();
        filteredTenants = db.getAll('tenants');
        renderTable();
        updateStats();
    }
}

// Handle form submit
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('tenantId').value;
    const tenantData = {
        name: document.getElementById('tenantName').value,
        domain: document.getElementById('tenantDomain').value,
        email: document.getElementById('adminEmail').value,
        status: document.getElementById('tenantStatus').value,
    };

    if (id) {
        // Edit existing
        db.update('tenants', id, tenantData);
    } else {
        // Add new
        tenantData.created = new Date().toISOString().split('T')[0];
        db.create('tenants', tenantData);
    }

    loadTenants();
    filteredTenants = db.getAll('tenants');
    closeModal();
    renderTable();
    updateStats();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('tenantModal');
    if (modal && event.target === modal) {
        closeModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
    // Ctrl+N to open new tenant modal
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openModal();
    }
});
