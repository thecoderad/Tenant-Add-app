# TenantHub - Multi-Tenant Business Management Platform

A complete Node.js-based multi-tenant management platform with WhatsApp-like chat, support email system, and business-type-specific features.

---

## ⚡ Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
**Option A - Using the launcher (Windows):**
```
Double-click start.bat
```

**Option B - Using command line:**
```bash
node server.js
```

### Step 3: Open Browser
Navigate to: **http://localhost:3000**

> ⚠️ **IMPORTANT:** Keep the server running while using TenantHub. The tenant login pages require the server to be active.

---

## 🔐 Login Credentials

### Admin Access
| Field | Value |
|-------|-------|
| URL | http://localhost:3000 |
| Email | admin@tenanthub.com |
| Password | admin123 |

### Demo Tenants
| Business | Login URL | Email | Password |
|----------|-----------|-------|----------|
| Care Clinic | `/login/care-clinic` | admin@careclinic.com | clinic123 |
| Little Stars Daycare | `/login/little-stars-daycare` | admin@littlestars.com | daycare123 |
| Bella Salon | `/login/bella-salon` | admin@bellasalon.com | salon123 |
| Acme Corporation | `/login/acme-corporation` | admin@acme.com | acme123 |

---

## 🏢 Business Types Supported

When creating a new business, select from 13 types:

1. **Office/Corporate** - Employees, Tasks, Meetings, Projects
2. **Clinic/Healthcare** - Patients, Appointments, Prescriptions, Billing
3. **Daycare/Childcare** - Children, Parents, Attendance, Activities
4. **Restaurant/Food** - Orders, Reservations, Menu, Staff
5. **Retail/Store** - Products, Customers, Sales, Inventory
6. **Salon/Beauty** - Clients, Appointments, Services, Staff
7. **Gym/Fitness** - Members, Classes, Trainers, Subscriptions
8. **School/Education** - Students, Teachers, Classes, Grades
9. **Spa/Wellness** - Clients, Appointments, Treatments, Packages
10. **Auto Service** - Customers, Vehicles, Services, Appointments
11. **Real Estate** - Properties, Clients, Listings, Contracts
12. **Legal Services** - Clients, Cases, Documents, Appointments
13. **Other** - Customers, Services, Appointments, Reports

---

## 📋 Features

### Admin Dashboard
- ✅ **Tenant Management** - Create, edit, delete businesses
- ✅ **Business Type Selection** - Choose from 13 business types
- ✅ **Personalized Login URLs** - Auto-generated for each tenant
- ✅ **Chat Messages** - WhatsApp-like chat with all tenants
- ✅ **Support Emails** - View and manage support requests
- ✅ **Analytics** - Platform-wide statistics
- ✅ **Settings** - Platform configuration

### Tenant Dashboard
- ✅ **Business Stats** - Customers, appointments, deals, tasks
- ✅ **Admin Chat** - Real-time WhatsApp-style messaging
- ✅ **Email Support** - Contact admin via email
- ✅ **AI Assistant** - Built-in help bot
- ✅ **Profile** - View business information

---

## 🔗 Personalized Login URLs

Each tenant gets a clean, professional login URL:

```
http://localhost:3000/login/{business-slug}
```

Examples:
- `http://localhost:3000/login/care-clinic`
- `http://localhost:3000/login/little-stars-daycare`
- `http://localhost:3000/login/bella-salon`

**Features:**
- Shows business name and logo
- Displays business type badge
- Shows relevant features for that business type
- Password-only login (email pre-filled from URL)

---

## 💬 Chat System

### Tenant Side
- Real-time messaging with admin
- Message bubbles (green for tenant)
- Timestamps on all messages
- Clear chat history option
- Auto-refresh every 5 seconds

### Admin Side
- View all tenant messages
- Messages grouped by tenant
- Unread message count badge
- Reply functionality
- Persistent storage in database

---

## 📧 Support Email System

### Tenant Side
- Pre-filled support email: `support@tenanthub.com`
- Subject and message fields
- Opens default email client
- Saves copy to database for tracking

### Admin Side
- View all support emails
- See sender details (name, email)
- Subject and full message content
- Status tracking (pending/resolved)
- Mark as resolved button
- Pending count badge

---

## 📊 API Endpoints

### Authentication
```
POST /api/login/admin       - Admin login
POST /api/login/tenant      - Tenant login by email
POST /api/login/tenant-slug - Tenant login by slug
```

### Tenant Management
```
GET    /api/tenants          - Get all tenants
GET    /api/tenants/:id      - Get single tenant
POST   /api/tenants          - Create tenant
PUT    /api/tenants/:id      - Update tenant
DELETE /api/tenants/:id      - Delete tenant
GET    /api/tenant/slug/:slug - Get tenant by slug
```

### Chat System
```
GET  /api/chat           - Get all messages (admin)
GET  /api/chat/:tenantId - Get messages for tenant
POST /api/chat           - Send message
```

### Support Emails
```
GET    /api/support-email      - Get all support emails
POST   /api/support-email      - Send support email
PUT    /api/support-email/:id  - Update email status
```

### Entity Management
```
GET    /api/entities/:tenantId/:type - Get entities
POST   /api/entities/:tenantId/:type - Create entity
PUT    /api/entities/:tenantId/:type/:id - Update entity
DELETE /api/entities/:tenantId/:type/:id - Delete entity
```

---

## 🗄️ Database Structure

Data is stored in `database.json`:

```json
{
  "tenants": [...],
  "users": {...},
  "chatMessages": [...],
  "supportEmails": [...],
  "entities": {...},
  "analytics": {...}
}
```

---

## 🛠️ Troubleshooting

### "Tenant Not Found" Error
**Cause:** Server is not running

**Solution:**
1. Open `start.bat` or run `node server.js`
2. Wait for "Server running at http://localhost:3000" message
3. Refresh the tenant login page

### Can't Login as Admin
**Cause:** Wrong credentials or server not running

**Solution:**
1. Verify server is running (check console)
2. Use exact credentials: `admin@tenanthub.com` / `admin123`
3. Clear browser cache

### CSS Not Loading
**Cause:** Server not serving static files

**Solution:**
1. Ensure server is running on port 3000
2. Use absolute paths in HTML (already fixed)
3. Clear browser cache (Ctrl+Shift+R)

### Port 3000 Already in Use
**Solution:**
```bash
# Find and kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📁 File Structure

```
Tenant-Add-app/
├── server.js              # Node.js backend
├── package.json           # Dependencies
├── database.json          # Auto-generated data
├── start.bat              # Windows launcher
├── index.html             # Main login page
├── admin.html             # Admin dashboard
├── tenant.html            # Tenant dashboard
├── tenant-login.html      # Personalized tenant login
├── global-styles.css      # Shared styles
└── login-styles.css       # Login page styles
```

---

## 🚀 Usage Flow

1. **Admin creates business:**
   - Login to admin dashboard
   - Click "Create Business"
   - Select business type
   - Fill in details
   - Copy generated login URL

2. **Tenant receives credentials:**
   - Login URL (e.g., `/login/care-clinic`)
   - Password (set by admin)

3. **Tenant logs in:**
   - Visit personalized URL
   - See business name and features
   - Enter password
   - Access tenant dashboard

4. **Communication:**
   - Tenant uses Admin Chat for instant messages
   - Tenant uses Email Support for detailed requests
   - Admin responds from dashboard

---

## 📝 License

MIT License - Free for personal and commercial use.

---

**Built with Node.js, Express, and modern vanilla JavaScript**
