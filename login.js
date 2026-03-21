// Login Page JavaScript - Enhanced with Theme Toggle

// Theme Toggle Function
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (currentTheme === 'dark') {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Dark';
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light';
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light';
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Dark';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    initDatabase();
});

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

    // Check admin credentials from database
    const users = JSON.parse(localStorage.getItem('tenanthub_users') || '{}');
    if (users.admin && users.admin.email === email && users.admin.password === password) {
        // Set admin session
        localStorage.setItem('tenanthub_admin_logged_in', 'true');
        showLoginSuccess('Redirecting to Admin Dashboard...');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
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

// Show login success
function showLoginSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'login-success';
    successDiv.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        ${message}
    `;
    successDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(72, 187, 120, 0.2) 0%, rgba(72, 187, 120, 0.1) 100%);
        color: #48bb78;
        border: 1px solid rgba(72, 187, 120, 0.3);
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        animation: slideUp 0.3s ease;
    `;

    // Remove any existing messages
    const existingError = document.querySelector('.login-error');
    const existingSuccess = document.querySelector('.login-success');
    if (existingError) existingError.remove();
    if (existingSuccess) existingSuccess.remove();

    // Add success to the form
    const activeForm = document.querySelector('.login-form:not(.hidden)');
    activeForm.insertBefore(successDiv, activeForm.firstChild);
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
        showLoginSuccess('Redirecting to Tenant Dashboard...');
        setTimeout(() => {
            // Redirect to tenant dashboard with tenant ID
            window.location.href = `tenant.html?id=${tenant.id}`;
        }, 1000);
    } else {
        showLoginError('Invalid credentials. Please check your email and password.');
    }
});

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        // Change icon to hide
        const toggle = input.parentElement.querySelector('.password-toggle svg');
        toggle.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.078 9.78l4.28 4.28M3.375 17.535V19h1.25v-1.465M3.375 5.465V5h1.25v.465m13.225 0a9.673 9.673 0 111.25 2.904m-4.482 7.723h1.25m-4.781-2.165a3 3 0 111-2.415m-4.787 2.14v-.001l-.001.002m1.378 3.014a3 3 0 112.127-3.518M9.575 16.11l1.95-1.95M3 10l13 0v2M8 7.5A3.5 3.5 0 119.5 8m-3 0V9m1-8V4a1 1 0 112 0v1a1 1 0 11-2 0v1a1 1 0 102 0V4a1 1 0 11-2 0v3a1 1 0 11-2 0V5a1 1 0 012 0z"/>
        `;
    } else {
        input.type = 'password';
        // Change icon to show
        const toggle = input.parentElement.querySelector('.password-toggle svg');
        toggle.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C1.448 7 5 5 12 5c7.336 0 11.573 3 12.458 7"/>
        `;
    }
}

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

// Add input validation feedback
document.querySelectorAll('.login-form input').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value && !this.checkValidity()) {
            this.style.borderColor = '#f56565';
            this.style.boxShadow = '0 0 0 4px rgba(245, 101, 101, 0.1)';
        } else if (this.value && this.checkValidity()) {
            this.style.borderColor = '#48bb78';
            this.style.boxShadow = '0 0 0 4px rgba(72, 187, 120, 0.1)';
        }
    });

    input.addEventListener('focus', function() {
        this.style.borderColor = '';
        this.style.boxShadow = '';
    });
});