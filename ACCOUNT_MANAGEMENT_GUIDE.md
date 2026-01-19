# MISpal Account Management System

## Overview
This document outlines the new account management system for MISpal, including staff account creation, role hierarchy for teachers, and automated email notifications.

## Updated Accounts

All demo accounts have been replaced with production accounts. All accounts use PIN: **1234**

### Production Accounts

| Email | Role | Name | Role Hierarchy |
|-------|------|------|----------------|
| mary.costello@shannoncomp.ie | Principal | Mary Costello | Principal |
| caseyashecontact@gmail.com | Secretary | Casey Ashe | Secretary |
| 24zuzannafrankowska@shannoncomp.ie | Student | Zuzanna Frankowska | Student |
| 24corykilmartin@shannoncomp.ie | Teacher | Cory Kilmartin | Mid |
| marcusray@cirkledevelopment.co.uk | Parent | Marcus Ray | Parent |

**Note**: Demo login buttons have been removed from the login page. Users must now enter credentials manually.

## Backend API Endpoints

### Staff Management Routes (`/api/staff`)

#### 1. Get All Staff
- **Endpoint**: `GET /api/staff`
- **Authentication**: Required
- **Authorization**: Principal, Secretary
- **Response**: List of all staff (Teachers, Secretaries, Principals)

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "email": "24corykilmartin@shannoncomp.ie",
      "name": "Cory Kilmartin",
      "role": "Teacher",
      "department": "Mathematics",
      "designation": "Teacher",
      "roleHierarchy": "Mid",
      "createdAt": "2026-01-19T..."
    }
  ]
}
```

#### 2. Create New Staff Account
- **Endpoint**: `POST /api/staff/create`
- **Authentication**: Required
- **Authorization**: Principal, Secretary
- **Required Fields**:
  - `email` (string): Staff email address
  - `name` (string): Staff member's full name
  - `role` (string): Staff role (Teacher, Secretary, Principal)
- **Optional Fields**:
  - `department` (string): Department name
  - `designation` (string): Job title
  - `roleHierarchy` (string): For teachers - Avg, Mid, High, HR

**Request Example**:
```json
{
  "email": "new.teacher@shannoncomp.ie",
  "name": "New Teacher",
  "role": "Teacher",
  "department": "Science",
  "designation": "Science Teacher",
  "roleHierarchy": "Avg"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Staff account created successfully",
  "data": {
    "id": "...",
    "email": "new.teacher@shannoncomp.ie",
    "name": "New Teacher",
    "role": "Teacher",
    "tempPin": "483521",
    "roleHierarchy": "Avg"
  }
}
```

**Automated Email**: An account creation email is automatically sent to the provided email address with login credentials.

#### 3. Update Staff Account
- **Endpoint**: `PUT /api/staff/:id`
- **Authentication**: Required
- **Authorization**: Principal, Secretary
- **Updatable Fields**:
  - `name`
  - `department`
  - `designation`
  - `roleHierarchy`
  - `isActive`

#### 4. Delete Staff Account
- **Endpoint**: `DELETE /api/staff/:id`
- **Authentication**: Required
- **Authorization**: Principal only
- **Automated Email**: Account deletion email is sent to the user

#### 5. Get Teacher Role Hierarchy
- **Endpoint**: `GET /api/staff/teachers/roles`
- **Authentication**: Required
- **Authorization**: Principal, Secretary

**Response**:
```json
{
  "success": true,
  "roles": {
    "Avg": {
      "level": 1,
      "permissions": ["view_grades", "view_attendance", "add_notes"]
    },
    "Mid": {
      "level": 2,
      "permissions": ["view_grades", "view_attendance", "add_notes", "manage_assessments", "send_messages"]
    },
    "High": {
      "level": 3,
      "permissions": ["view_grades", "view_attendance", "add_notes", "manage_assessments", "send_messages", "manage_classes"]
    },
    "HR": {
      "level": 4,
      "permissions": ["view_grades", "view_attendance", "add_notes", "manage_assessments", "send_messages", "manage_classes", "manage_staff", "manage_subjects"]
    }
  }
}
```

#### 6. Update Teacher Role Hierarchy
- **Endpoint**: `PUT /api/staff/teachers/:id/role`
- **Authentication**: Required
- **Authorization**: Principal only
- **Body**:
```json
{
  "roleHierarchy": "High"
}
```

#### 7. Reset User PIN
- **Endpoint**: `POST /api/staff/:id/reset-pin`
- **Authentication**: Required
- **Authorization**: Principal only
- **Automated Email**: New PIN is sent to user's email

## Teacher Role Hierarchy System

Teachers in MISpal have a 4-level hierarchy similar to Discord roles:

### 1. **Avg (Average)** - Level 1
- View grades
- View attendance
- Add notes

### 2. **Mid (Middle)** - Level 2
- All Avg permissions +
- Manage assessments
- Send messages

### 3. **High** - Level 3
- All Mid permissions +
- Manage classes
- View class reports

### 4. **HR** - Level 4
- All High permissions +
- Manage staff
- Manage subjects
- View analytics

## Email Notifications

### Account Creation Email
Sent automatically when a new staff account is created:
- **From**: accounts@shannoncomp.ie
- **Content**: 
  - Welcome message
  - Email address for login
  - Temporary 6-digit PIN
  - Instructions for PIN change
  - MISpal documentation link
  - Support contact information

### Account Deletion Email
Sent automatically when an account is deleted:
- **From**: accounts@shannoncomp.ie
- **Content**:
  - Notification of account deletion
  - Instruction to contact Principal if unexpected
  - Support information

### PIN Reset Email
Sent when admin resets a user's PIN:
- **From**: accounts@shannoncomp.ie
- **Content**:
  - New temporary PIN
  - Instruction to change PIN after login
  - Support information

## Security Considerations

1. **PIN Generation**: Random 6-digit PINs are generated for new accounts
2. **PIN Hashing**: All PINs are hashed using bcrypt before storage
3. **Authorization**: Only Principals can delete accounts or reset PINs
4. **Audit Trail**: Staff account creation includes `createdBy` and `createdAt` timestamps
5. **Email Validation**: Checks for duplicate email addresses before account creation

## Frontend Integration

### Staff Management UI Components (To Be Implemented)

1. **Staff List View**
   - Display all staff with filters
   - Edit staff details
   - Update role hierarchy
   - Delete staff
   - Reset PIN

2. **Create Staff Modal**
   - Form for new staff account
   - Role selector with role hierarchy options
   - Department and designation fields

3. **Role Hierarchy Settings**
   - Visual representation of hierarchy levels
   - Permission display for each level
   - Quick role assignment

## API Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error scenarios:
- 400: Invalid input or duplicate email
- 401: Authentication required
- 403: Insufficient permissions
- 404: User not found
- 500: Server error

## Future Enhancements

1. **Bulk Account Import**: CSV import for multiple staff
2. **Account Templates**: Pre-configured templates for common roles
3. **Audit Logging**: Detailed logs of account management actions
4. **SSO Integration**: Single Sign-On via Microsoft/Google
5. **Two-Factor Authentication**: Enhanced security options
6. **Account Approval Workflow**: Require approval before account creation
7. **Custom Roles**: Allow creation of custom role hierarchies
