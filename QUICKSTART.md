# 🚀 TenantHub - Quick Start Guide

## Welcome to Your Enhanced Platform!

Your TenantHub platform has been completely redesigned with a **futuristic cyberpunk theme** and **powerful new features**.

---

## ✨ What's New?

### 🐛 Bug Fixes
- ✅ Dark theme toggle now works correctly
- ✅ No more error popups on startup
- ✅ Removed annoying sync notifications

### 🎨 New Futuristic Theme
- Professional cyberpunk aesthetics
- Neon glow effects
- Glass-morphic design
- Smooth animations
- Dark/Light mode toggle

### 🆕 New Features

#### 1. CRM Contacts
Manage your customers, prospects, and partners with:
- Contact database
- Search & filter
- Quick actions (Email/Call)
- CSV export
- Statistics dashboard

#### 2. Staff Management
Track and manage your team:
- Add/edit/remove staff
- Department management
- Role assignments
- Status tracking
- Team overview

#### 3. Logo & Branding
Upload and manage your business logo:
- Drag-and-drop upload
- Live preview
- Multiple formats (PNG, JPG, SVG)
- Size validation (max 5MB)

#### 4. AI Receptionist
Automate visitor interactions:
- Custom greeting messages
- Quick response templates
- Enable/disable toggle
- Live preview

---

## 🎯 Getting Started

### Step 1: Start the Server

If not already running:
```bash
npm start
```

Server will start at: **http://localhost:3000**

### Step 2: Login

#### Admin Login
- **URL**: http://localhost:3000
- **Email**: admin@tenanthub.com
- **Password**: admin123

#### Tenant Login Examples
- **Care Clinic**: http://localhost:3000/login/care-clinic
- **Little Stars Daycare**: http://localhost:3000/login/little-stars-daycare
- **Bella Salon**: http://localhost:3000/login/bella-salon

**Passwords**: clinic123, daycare123, salon123

---

## 📱 Navigation Guide

### Tenant Dashboard

After logging in as a tenant, you'll see:

**Sidebar Navigation:**
- **Main Section**
  - Dashboard
  - Communication Hub
  - Admin Chat
  - Email Support

- **Business Section** (NEW!)
  - Business-specific items (varies by type)
  - 🆕 CRM Contacts
  - 🆕 Staff Management
  - 🆕 Logo & Branding
  - 🆕 AI Receptionist

- **Other Sections**
  - Customers
  - Schedule
  - Catalog
  - Notes
  - Settings

---

## 🎨 Using the New Theme

### Toggle Dark/Light Mode
1. Look for the 🌙 or ☀️ button in the top-right corner
2. Click to switch themes
3. Your preference is saved automatically

### Theme Features
- **Dark Mode**: Deep space blue with neon accents
- **Light Mode**: Clean white with purple accents
- **Glass Effects**: Transparent cards with blur
- **Neon Glows**: Interactive elements glow on hover
- **Smooth Animations**: All transitions are buttery smooth

---

## 🆕 Using New Features

### CRM Contacts

1. **Access**: Click "CRM Contacts" in sidebar
2. **Add Contact**: 
   - Click "Add Contact" button
   - Fill in name, email, phone, company, position
   - Choose type (Customer/Prospect/Vendor/etc.)
   - Add notes (optional)
   - Click "Save Contact"
3. **Search**: Use the search bar to find contacts
4. **Actions**:
   - Edit: Click "Edit" on any contact card
   - Email: Opens your email client
   - Call: Opens phone dialer (on mobile)
5. **Export**: Click "Export" to download CSV

### Staff Management

1. **Access**: Click "Staff Management" in sidebar
2. **Add Staff**:
   - Click "Add Staff Member"
   - Fill in details (name, email, phone, role, department)
   - Set status (Active/Inactive/On Leave)
   - Click "Add Staff"
3. **Manage**:
   - Edit: Update staff information
   - Remove: Delete staff member (with confirmation)

### Logo Upload

1. **Access**: Click "Logo & Branding" in sidebar
2. **Upload**:
   - Click "Upload Logo" or "Choose File"
   - Select image file (PNG, JPG, SVG)
   - File must be under 5MB
3. **Preview**: See your logo in the preview section
4. **Manage**:
   - Change: Upload a new logo
   - Download: Save logo to your computer
   - Delete: Remove logo (with confirmation)

### AI Receptionist

1. **Access**: Click "AI Receptionist" in sidebar
2. **Enable/Disable**: Toggle the switch
3. **Customize Greeting**:
   - Edit the greeting message text
   - This shows to visitors when they arrive
4. **Add Quick Responses**:
   - Click "Add Response"
   - Enter trigger word/phrase
   - Enter AI response
   - Save
5. **Preview**: See how it looks in the preview section

---

## 💡 Pro Tips

### Theme Customization
- Press `F12` to open DevTools
- Go to Console
- Try: `document.body.setAttribute('data-theme', 'light')` for light mode
- Try: `document.body.removeAttribute('data-theme')` for dark mode

### Keyboard Shortcuts
- `Tab`: Navigate between interactive elements
- `Enter`: Activate buttons
- `Escape`: Close modals

### Data Management
- All data is saved automatically to localStorage
- To reset: Clear browser data or use private/incognito mode
- Export important data regularly using CSV export

---

## 🎨 Customization Guide

### Change Theme Colors
Edit `theme-futuristic.css`:

```css
:root {
    --neon-green: #00ff88;  /* Change to your color */
    --neon-cyan: #00d4ff;   /* Change to your color */
    --neon-purple: #bd00ff; /* Change to your color */
}
```

### Add Custom Logo
1. Upload via "Logo & Branding" section
2. Or edit the CSS:
```css
.brand-logo {
    background-image: url('your-logo.png');
    background-size: contain;
}
```

---

## 🔧 Troubleshooting

### Theme Not Working?
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + F5)
3. Check browser console for errors (F12)

### Features Not Loading?
1. Ensure server is running (check terminal)
2. Refresh the page
3. Check browser console for errors

### Logo Not Uploading?
1. Check file size (must be < 5MB)
2. Ensure file is an image (PNG, JPG, SVG)
3. Try a different browser

---

## 📊 Demo Data

The platform comes with sample data:

### Sample Contacts
- John Smith (CEO, Tech Corp)
- Sarah Johnson (Creative Director, Design Studio)

### Sample Staff
- Emily Davis (Manager, Operations)
- Michael Brown (Sales Representative)

---

## 🌐 Browser Compatibility

**Recommended Browsers:**
- ✅ Google Chrome (Best support)
- ✅ Microsoft Edge
- ✅ Firefox
- ✅ Safari

**Minimum Requirements:**
- Modern browser with ES6 support
- CSS Grid and Flexbox support
- LocalStorage enabled
- JavaScript enabled

---

## 📞 Support

### Documentation
- `README.md` - Platform overview
- `ENHANCEMENTS.md` - Detailed enhancement guide
- `DOCUMENTATION.md` - Technical documentation

### Common Issues

**Q: Dark mode not working?**
A: Check `enhanced-features.js` - the toggle function was fixed in this update.

**Q: Error popup on startup?**
A: This was fixed by adding the missing toast-container element.

**Q: How to add more features?**
A: Edit `business-features.js` and add new methods following the existing pattern.

---

## 🎉 Enjoy Your Enhanced Platform!

You now have:
- ✅ Professional futuristic design
- ✅ CRM system
- ✅ Staff management
- ✅ Logo upload
- ✅ AI receptionist
- ✅ Bug-free experience
- ✅ Smooth animations
- ✅ Responsive design

**Happy managing! 🚀**

---

**Last Updated**: March 2026
**Version**: 2.0 Enhanced
