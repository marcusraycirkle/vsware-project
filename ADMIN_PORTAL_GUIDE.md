# MISpal Admin Portal - Complete Documentation

## 🎯 Overview

The MISpal Admin Portal is a comprehensive school management dashboard designed specifically for principals and administrators. It provides complete control over all aspects of school operations with a modern, intuitive interface inspired by tyro.school aesthetics and VSware.ie functionality.

## ✨ Features

### Dashboard & Analytics
- **Real-time Statistics**: Live metrics for students, teachers, classes, and attendance
- **Activity Feed**: Recent events and changes across the school system
- **Quick Stats**: Visual representation of daily attendance, behavior trends
- **Upcoming Events**: Calendar integration for important school dates
- **Pending Actions**: Task list for items requiring administrative approval

### Student Management
- **Complete Student Database**: Manage all student records with advanced filtering
- **Search & Filter**: Quick search by name, ID, year group, or status
- **Bulk Operations**: Import/export students via CSV or spreadsheet
- **Student Profiles**: Detailed views with academic, medical, and contact information
- **Status Tracking**: Active, inactive, graduated status management

### Teacher Management
- **Staff Directory**: Complete teacher database with subject specializations
- **Class Assignments**: View and manage teacher workload and schedules
- **Performance Metrics**: Teaching hours and class statistics
- **Contact Information**: Email and professional details
- **Subject Allocation**: Manage teacher-subject relationships

### School Settings
- **School Information**: Name, address, contact details configuration
- **Academic Year Setup**: Term dates and academic calendar
- **Branding**: School logo and identity management
- **Contact Details**: Phone, email, and address information

### Customization
- **Color Schemes**: Customize primary and accent colors
- **Theme Selection**: Light mode, dark mode, or auto (system-based)
- **Layout Options**: 
  - Compact sidebar toggle
  - Fixed header option
  - Rounded corners preference
- **Typography**: Font family and size customization
- **Logo Upload**: Custom school branding

### User Management
- **System Users**: Manage all portal users (admin, teachers, staff)
- **Role Assignment**: Principal, admin, teacher, staff roles
- **Permissions Control**: Fine-grained access control
- **User Status**: Active/inactive user management
- **Activity Tracking**: Last login and user activity logs

### Academic Management
- **Classes**: Class creation and student assignments
- **Subjects**: Subject management and teacher allocation
- **Timetable**: School-wide timetable management
- **Assessments**: Exam and assessment tracking

### Operations
- **Attendance**: School-wide attendance monitoring and reporting
- **Behavior**: Positive and negative behavior tracking
- **Enrollment**: New student enrollment processing
- **Room Booking**: Classroom and facility management

### Communication
- **Messages**: Internal messaging system for staff
- **Announcements**: School-wide announcement broadcasting
- **Notifications**: Real-time alerts for important events

## 🚀 Getting Started

### Accessing the Admin Portal

1. Navigate to: `https://your-domain.com/admin`
2. Login with administrator credentials
3. You'll be redirected to the admin dashboard

### First-Time Setup

1. **Configure School Settings**
   - Go to Settings > School Settings
   - Update school name, address, and contact information
   - Set academic year dates

2. **Customize Branding**
   - Go to Settings > Customization
   - Upload school logo
   - Choose color scheme
   - Adjust layout preferences

3. **Add Users**
   - Go to Settings > User Management
   - Add teachers and staff as system users
   - Assign appropriate roles

4. **Import Data**
   - Students: Go to Students > Import
   - Teachers: Go to Teachers > Add Teacher
   - Classes: Create classes and assign students

## 📱 User Interface

### Navigation Structure

**Main Sections:**
- Dashboard - Overview and quick stats
- Calendar - Events and important dates
- Analytics - Performance metrics and insights

**People:**
- Students - Student database
- Teachers - Teaching staff
- Parents - Parent information
- Staff - Administrative staff

**Academic:**
- Classes - Class management
- Subjects - Subject catalog
- Timetable - School scheduling
- Assessments - Exam and test management

**Operations:**
- Attendance - Daily attendance tracking
- Behavior - Conduct management
- Enrollment - New admissions
- Rooms - Facility booking

**Communication:**
- Messages - Internal messaging
- Announcements - School notices

**Settings:**
- School Settings - Basic information
- Customization - Look and feel
- User Management - System users
- Integrations - Third-party services

### Header Features

- **Global Search**: Quick search across students, teachers, and classes
- **Quick Actions**: Fast access to common tasks
- **Notifications**: Real-time alerts (bell icon)
- **User Menu**: Profile and settings access

## 🔧 API Endpoints

### Dashboard
```
GET /api/admin/dashboard/stats - Get dashboard statistics
GET /api/admin/dashboard/activity - Get recent activity
```

### School Settings
```
GET /api/admin/settings/school - Get school settings
PUT /api/admin/settings/school - Update school settings
```

### Customization
```
GET /api/admin/settings/customization - Get customization settings
PUT /api/admin/settings/customization - Update customization
```

### User Management
```
GET /api/admin/users - Get all users
POST /api/admin/users - Create new user
PUT /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user
```

### Bulk Operations
```
POST /api/admin/students/import - Bulk import students
GET /api/admin/students/export - Export student data
GET /api/admin/teachers/export - Export teacher data
```

### Analytics
```
GET /api/admin/analytics?period=7days - Get analytics data
```

## 🎨 Design System

### Colors
- Primary: `#4F46E5` (Indigo)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)
- Info: `#3B82F6` (Blue)

### Typography
- Font Family: Inter (Default)
- Base Size: 14px
- Headings: 700-800 weight
- Body: 400-500 weight

### Spacing
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px

### Components
- Border Radius: 12px (cards), 8px (inputs)
- Shadows: Subtle elevation system
- Transitions: 0.2s ease for interactions

## 🔒 Security & Permissions

### Role Hierarchy
1. **Principal** - Full access to all features
2. **Admin** - Full access to all features
3. **Teacher** - Limited to teaching-related features
4. **Staff** - Limited operational access

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Auto-redirect on unauthorized access

### Data Protection
- All admin routes require authentication
- Role-based access control (RBAC)
- Audit logging for sensitive operations

## 📊 Best Practices

### Student Management
1. Use bulk import for large datasets
2. Keep student information up-to-date
3. Regularly review inactive students
4. Maintain proper year group transitions

### Teacher Management
1. Assign subjects appropriately
2. Monitor teaching loads
3. Update contact information regularly
4. Review class assignments each term

### System Maintenance
1. Regular data backups
2. User access audits
3. Remove inactive user accounts
4. Update school information as needed

## 🐛 Troubleshooting

### Common Issues

**Cannot access admin portal**
- Verify you have admin/principal role
- Check authentication token validity
- Clear browser cache and cookies

**Data not loading**
- Check internet connection
- Verify API server is running
- Check browser console for errors

**Import failing**
- Verify CSV format matches template
- Check for required fields
- Review error messages for specific issues

**Customization not saving**
- Ensure you clicked "Save Changes"
- Check for browser localStorage availability
- Verify API connection

## 🔄 Updates & Maintenance

### Regular Tasks
- **Daily**: Review pending actions, check attendance rates
- **Weekly**: Monitor analytics, review new enrollments
- **Monthly**: Generate reports, audit user access
- **Termly**: Update academic calendar, review settings

### Data Backup
- Export student data regularly
- Export teacher data regularly
- Document custom settings
- Save customization preferences

## 📞 Support

For technical support or feature requests, contact:
- Email: support@mispal.ie
- Documentation: https://support.vsware.ie/
- GitHub Issues: Report bugs and request features

## 🚧 Roadmap

### Coming Soon
- Advanced analytics dashboards
- Custom report builder
- Mobile app for iOS/Android
- Parent portal integration
- SMS/Email bulk messaging
- Attendance QR code scanning
- Behavior point system
- Grade book integration
- Library management
- Canteen management

## 📄 License

MISpal Admin Portal © 2026. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2026  
**Author**: MISpal Development Team
