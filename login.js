// Login Page JavaScript

// Switch between admin and tenant tabs
function switchTab(type) {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.login-form');

    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.add('hidden'));

    if (type === 'admin') {
        tabs[0].classList.add('active');
        document.getElementById('adminLoginForm').classList.remove('hidden');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('tenantLoginForm').classList.remove('hidden');
    }
}

// Admin login handler
document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    // Check admin credentials
    const users = JSON.parse(localStorage.getItem('tenanthub_users') || '{}');
    if (users.admin && users.admin.email === email && users.admin.password === password) {
        window.location.href = 'admin.html';
    } else {
        showLoginError('Invalid admin credentials. Please check your email and password.');
    }
});

// Show login error
function showLoginError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        ${message}
    `;
    
    // Remove any existing error
    const existingError = document.querySelector('.login-error');
    if (existingError) existingError.remove();
    
    // Add error to the form
    const activeForm = document.querySelector('.login-form:not(.hidden)');
    activeForm.insertBefore(errorDiv, activeForm.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

// Tenant login handler - Now uses database properly
document.getElementById('tenantLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('tenantEmail').value.trim();
    const password = document.getElementById('tenantPassword').value;

    // Get tenant users from database
    const users = JSON.parse(localStorage.getItem('tenanthub_users') || '{}');
    const tenants = users.tenants || [];
    
    // Find matching tenant
    const tenant = tenants.find(t => t.email === email && t.password === password);

    if (tenant) {
        // Store current session
        sessionStorage.setItem('currentTenant', JSON.stringify(tenant));
        // Redirect to tenant dashboard with tenant ID
        window.location.href = `tenant.html?id=${tenant.id}`;
    } else {
        showLoginError('Invalid credentials. Please check your email and password.');
    }
});

// Add enter key support
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.login-form input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.closest('form').requestSubmit();
            }
        });
    });
});
