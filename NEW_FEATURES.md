# TenantHub - New Features Documentation

## 🎨 Light/Dark Mode

### Overview
The entire webapp now supports a complete light/dark theme toggle that persists across sessions.

### Features
- **Global Theme Toggle**: Available on all pages (Login, Admin Dashboard, Tenant Dashboard)
- **Desktop & Mobile**: 
  - Desktop: Top-right corner toggle button
  - Mobile: Bottom-right floating action button
- **Smooth Transitions**: Animated theme switching with CSS transitions
- **Persistent**: Theme preference is saved per tenant

### How to Use
1. Click the theme toggle button (🌙/☀️) in the top-right corner
2. The theme will instantly switch between light and dark modes
3. Your preference is automatically saved

### Files Modified
- `theme.css` - New comprehensive theme system
- `index.html` - Added theme toggle
- `admin.html` - Added theme toggle
- `tenant.html` - Added theme toggle
- `global-styles.css` - Updated with theme variables

---

## 📬 Notification Center

### Overview
Real-time notification system for tenants to stay updated on important events.

### Features
- **Real-time Updates**: Notifications appear instantly
- **Multiple Types**: Info, Success, Warning, Danger
- **Unread Counter**: Badge showing number of unread notifications
- **Mark as Read**: Individual or bulk mark as read
- **Clear All**: Remove all notifications
- **Browser Notifications**: Optional browser push notifications

### Notification Types
1. **Info** (Blue) - General information
2. **Success** (Green) - Successful operations
3. **Warning** (Yellow) - Important reminders
4. **Danger** (Red) - Critical alerts

### How to Use
1. Click the bell icon (🔔) in the header
2. View all notifications in the dropdown
3. Click on a notification to mark it as read
4. Use "Mark all as read" or "Clear all" buttons

### API Endpoints
```
GET  /api/notifications/:tenantId     - Get all notifications
POST /api/notifications/:tenantId     - Create notification
PUT  /api/notifications/:tenantId/:id - Update notification
```

---

## 📅 Calendar Module

### Overview
Full-featured calendar for managing appointments, meetings, and deadlines.

### Features
- **Monthly View**: Navigate between months
- **Event Types**: Meeting, Deadline, Appointment
- **Color Coding**: Different colors for different event types
- **Add Events**: Click on any day to add events
- **Event Display**: Shows up to 3 events per day with "+X more" for additional
- **Today Highlight**: Current day is highlighted

### Event Types & Colors
- **Meeting** (Purple) - Team meetings, client calls
- **Deadline** (Red) - Project deadlines, due dates
- **Appointment** (Orange) - Client appointments, bookings

### How to Use
1. Navigate to Calendar from sidebar
2. Use arrow buttons to switch months
3. Click on any day to add a new event
4. Enter event title and select type
5. Events are saved automatically

### API Endpoints
```
GET    /api/calendar/:tenantId      - Get all events
POST   /api/calendar/:tenantId      - Create event
DELETE /api/calendar/:tenantId/:id  - Delete event
```

---

## 📊 Reports Module

### Overview
Comprehensive business analytics and reporting system.

### Features
- **Revenue Report**: Track income and deals
- **Customer Report**: Monitor customer growth
- **Appointments Report**: View appointment statistics
- **Tasks Report**: Track task completion
- **Export Functionality**: Download reports as CSV
- **Month-over-Month Comparison**: Shows percentage change
- **Visual Indicators**: Green for positive, red for negative growth

### Report Types

#### 1. Revenue Report
- Total revenue
- Number of deals
- Average deal value
- Monthly comparison

#### 2. Customer Report
- Total customers
- New customers this month
- Growth rate

#### 3. Appointments Report
- Total appointments
- Upcoming appointments
- Completed appointments

#### 4. Tasks Report
- Total tasks
- Pending tasks
- Completed tasks

### How to Use
1. Navigate to Reports from sidebar
2. View all report cards
3. Click "Export" to download as CSV
4. Click "Details" for more information
5. Use "Refresh" to update data

### API Endpoints
```
GET /api/reports/:tenantId/:type - Get report by type
```

---

## 📁 File Manager

### Overview
Secure file storage and management system for business documents.

### Features
- **Drag & Drop Upload**: Easy file upload
- **Multiple File Types**: PDF, Images, Documents, Spreadsheets
- **File Preview Icons**: Visual file type indicators
- **File Information**: Shows size and upload date
- **Download**: Download files anytime
- **Delete**: Remove unwanted files
- **Responsive**: Works on all devices

### Supported File Types
- **PDF** (.pdf) - Red icon
- **Images** (.jpg, .png, .gif) - Green icon
- **Documents** (.doc, .docx, .txt) - Blue icon
- **Spreadsheets** (.xls, .xlsx, .csv) - Green icon
- **Other** - Gray icon

### How to Use
1. Navigate to Files from sidebar
2. Drag and drop files or click "Upload"
3. View file list with icons and details
4. Click download icon to download
5. Click delete icon to remove file

### API Endpoints
```
GET    /api/files/:tenantId     - Get all files
POST   /api/files/:tenantId     - Upload file
DELETE /api/files/:tenantId/:id - Delete file
```

---

## ⚙️ Settings Module

### Overview
Centralized settings management for tenant preferences.

### Features
- **Three Tabs**: General, Notifications, Appearance
- **Toggle Switches**: Easy on/off controls
- **Persistent Settings**: Saved per tenant
- **Real-time Updates**: Changes apply immediately

### Settings Categories

#### 1. General Settings
- Business name (read-only)
- Email address (read-only)
- Account information

#### 2. Notification Settings
- **Email Notifications**: Receive updates via email
- **Push Notifications**: Browser notifications

#### 3. Appearance Settings
- **Dark Mode**: Toggle dark/light theme
- Theme preference saved automatically

### How to Use
1. Navigate to Settings from sidebar or click gear icon
2. Switch between tabs
3. Toggle settings on/off
4. Changes are saved automatically

---

## 📈 Activity Timeline

### Overview
Track all user actions and system events in chronological order.

### Features
- **Chronological Order**: Newest activities first
- **Color Coded**: Different colors for activity types
- **Timestamps**: Shows when each activity occurred
- **Auto-pruning**: Keeps last 50 activities
- **Visual Timeline**: Connected timeline design

### Activity Types
- **Info** (Blue) - General activities
- **Success** (Green) - Successful operations
- **Warning** (Yellow) - Important events
- **Danger** (Red) - Critical actions

### How to Use
1. Navigate to Activity from sidebar
2. View timeline of recent activities
3. Activities are automatically logged
4. Last 50 activities are retained

### API Endpoints
```
GET  /api/activities/:tenantId - Get activities
POST /api/activities/:tenantId - Log activity
```

---

## ⚡ Quick Actions

### Overview
Fast access to commonly used features for improved productivity.

### Features
- **One-Click Access**: Quick buttons for common tasks
- **Visual Icons**: Easy to identify actions
- **Responsive Grid**: Adapts to screen size

### Available Actions

#### 1. Add Customer
- Quick customer creation
- Enter name in prompt
- Automatically logged

#### 2. Add Appointment
- Schedule new appointments
- Enter title and date
- Added to calendar

#### 3. Create Task
- Quick task creation
- Enter task description
- Tracked in tasks

#### 4. Send Invoice
- Generate and send invoices
- Enter customer and amount
- Confirmation notification

### How to Use
1. Navigate to Quick Actions from sidebar
2. Click on desired action
3. Fill in prompted information
4. Action is executed immediately

---

## 🔧 Technical Implementation

### New Files Created
1. `theme.css` - Complete theme system with light/dark support
2. `enhanced-features.css` - Styles for new modules
3. `enhanced-features.js` - JavaScript module for all new features

### Modified Files
1. `server.js` - Added new API endpoints
2. `tenant.html` - Added new UI sections and features
3. `admin.html` - Added theme toggle
4. `index.html` - Added theme toggle
5. `global-styles.css` - Updated theme variables

### Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Mobile Support
- Responsive design for all features
- Touch-friendly controls
- Mobile-specific theme toggle button
- Optimized layouts for small screens

### Data Storage
- **Primary**: localStorage (client-side)
- **Backup**: Server API endpoints
- **Sync**: Automatic synchronization

### Performance
- Lazy loading of modules
- Efficient DOM updates
- Debounced API calls
- Optimized animations

---

## 🎯 Usage Examples

### Example 1: Adding a Customer Appointment
1. Click "Quick Actions" → "Add Appointment"
2. Enter "Client Meeting"
3. Select date
4. Appointment appears in Calendar
5. Notification is sent

### Example 2: Generating Monthly Report
1. Navigate to "Reports"
2. View all report cards
3. Click "Export" on Revenue report
4. CSV file downloads automatically

### Example 3: Uploading Documents
1. Go to "Files"
2. Drag PDF to upload area
3. File appears in list
4. Download anytime needed

### Example 4: Switching Theme
1. Click theme toggle (🌙/☀️)
2. Theme switches instantly
3. Preference is saved
4. Persists across sessions

---

## 📝 API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication
All tenant endpoints require tenant ID in the URL path.

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Format
```json
{
  "error": "Error message",
  "code": 404
}
```

---

## 🐛 Troubleshooting

### Theme not switching
- Clear browser cache
- Check if JavaScript is enabled
- Verify theme.css is loaded

### Notifications not appearing
- Check browser notification permissions
- Verify localStorage is enabled
- Refresh the page

### Calendar not loading
- Check console for errors
- Verify enhanced-features.js is loaded
- Clear localStorage for tenant

### Files not uploading
- Check file size limits
- Verify browser supports File API
- Check server storage space

### Reports showing incorrect data
- Click "Refresh" button
- Clear browser cache
- Verify API endpoints are working

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Contact admin via Support email
4. Use Admin Chat for immediate help

---

**Version**: 2.1.0  
**Last Updated**: March 27, 2026  
**Build**: Enhanced Features Release
