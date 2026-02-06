# User Management Features Documentation

## Overview
Added comprehensive user management capabilities to the Smart Dispatcher application, allowing administrators to create new users, change passwords, and manage user accounts.

## Features

### 1. User Management Page (`/users`)
- **Access**: Admin users only
- **Location**: Settings → User Management (visible only to admins)
- **Displays**: Grid of all system users with their details

#### User Card Features:
- User name and role badge
- Username (@username)
- User ID
- Action buttons:
  - **🔒 Lock Icon**: Change password
  - **✏️ Edit Icon**: Edit user details (coming soon)
  - **🗑️ Trash Icon**: Delete user (disabled for last admin)

### 2. Create New User
- **Access**: Admin users only
- **Button**: "Create User" button at the top of Users page
- **Modal Form with fields**:
  - Username (min 3 characters)
  - Full Name
  - Password (min 6 characters)
  - Confirm Password
  - Role (Guest, Helpdesk Operator, Supervisor, Admin)

**Validation**:
- All fields required
- Username must be unique
- Username must be at least 3 characters
- Password must be at least 6 characters
- Passwords must match
- Role must be valid

**Response**: Success toast with confirmation

### 3. Change Own Password
- **Access**: All authenticated users
- **How to use**: Click lock icon on your own user card
- **Modal Form with fields**:
  - Current Password (required for security)
  - New Password (min 6 characters)
  - Confirm New Password

**Validation**:
- Current password must be correct
- New password must be at least 6 characters
- New passwords must match
- New password cannot be the same as current password

**Response**: Success toast with confirmation

### 4. Reset User Password (Admin Only)
- **Access**: Admin users only
- **How to use**: Click lock icon on another user's card
- **Modal Form with fields**:
  - New Password (min 6 characters)
  - Confirm Password
- **Warning**: Shows that the user will be logged out

**Validation**:
- New password must be at least 6 characters
- Passwords must match
- No current password required (admin override)

**Response**: Success toast with confirmation

## Backend API Endpoints

### Authentication
All endpoints (except `/login`) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### User Management Routes

#### `GET /api/users`
**Description**: Get all users
**Access**: Any authenticated user
**Returns**: Array of users with id, username, name, and role (no passwords)
**Example Response**:
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "name": "Administrator",
      "role": "admin"
    }
  ]
}
```

#### `GET /api/users/:id`
**Description**: Get single user by ID
**Access**: Any authenticated user
**Parameters**: `id` (user ID)
**Returns**: User object without password

#### `POST /api/users`
**Description**: Create new user
**Access**: Admin-authenticated users
**Request Body**:
```json
{
  "username": "newuser",
  "password": "password123",
  "name": "New User",
  "role": "guest"
}
```
**Validation**:
- All fields required
- Username must be unique
- Valid role: admin, supervisor, helpdesk, guest

**Returns**: Created user object with success message

**Error Responses**:
- 400: Missing fields or username exists
- 401: Unauthorized (not authenticated)

#### `PATCH /api/users/:id/password`
**Description**: Change password (user must know current password)
**Access**: Any authenticated user
**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```
**Validation**:
- Current password must match
- New password must be at least 6 characters

**Returns**: Success message and updated user object

**Error Responses**:
- 401: Current password incorrect
- 404: User not found

#### `PATCH /api/users/:id/password-reset`
**Description**: Reset user password (admin override)
**Access**: Admin-authenticated users only
**Request Body**:
```json
{
  "newPassword": "newpassword"
}
```
**Note**: Does not require current password

**Returns**: Success message and updated user object

**Error Responses**:
- 401: Unauthorized (must be admin)
- 404: User not found

#### `PATCH /api/users/:id`
**Description**: Update user details (name, role)
**Access**: Admin-authenticated users
**Request Body**:
```json
{
  "name": "Updated Name",
  "role": "supervisor"
}
```
**Returns**: Updated user object

**Error Responses**:
- 400: Invalid role
- 404: User not found

#### `DELETE /api/users/:id`
**Description**: Delete user
**Access**: Admin-authenticated users
**Note**: Cannot delete the last admin user

**Returns**: Deleted user object with success message

**Error Responses**:
- 400: Cannot delete last admin
- 404: User not found

## Frontend Components

### Pages
- **Users.jsx**: Main user management page displaying all users

### Modals
- **CreateUserModal.jsx**: Form to create new users
- **ChangePasswordModal.jsx**: Form for users to change their own password
- **ResetPasswordModal.jsx**: Form for admins to reset user passwords

### API Client
- **usersAPI** in `frontend/src/services/api.js`: Wrapper functions for all user management endpoints

## User Roles & Permissions

### Role Capabilities
- **Admin**:
  - View all users
  - Create new users
  - Change own password
  - Reset other users' passwords
  - Edit user details
  - Delete users
  - Access User Management page

- **Supervisor/Helpdesk/Guest**:
  - View user list (read-only)
  - Change own password only
  - Cannot create, edit, or delete users

## Security Considerations

### Current Implementation
- Passwords stored in memory (mock data)
- No password hashing (development mode)
- JWT tokens issued on successful login
- All endpoints require authentication

### For Production
Should implement:
1. Password hashing (bcrypt or similar)
2. Database persistence
3. Rate limiting on password change attempts
4. Audit logging for user management actions
5. Password complexity requirements
6. Account lockout after failed attempts
7. Email notifications for password resets
8. Two-factor authentication

## Testing

### Create User Test
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "newuser",
    "password": "pass123",
    "name": "New User",
    "role": "helpdesk"
  }'
```

### Change Password Test
```bash
curl -X PATCH http://localhost:3001/api/users/2/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "currentPassword": "oldpass",
    "newPassword": "newpass"
  }'
```

## Default Demo Users

The system comes with these default users:
- **Admin**: admin / admin123
- **Supervisor**: supervisor / super123
- **Helpdesk**: helpdesk / help123
- **Guest**: guest / guest123

## Future Enhancements
- [ ] Edit user roles and name
- [ ] Bulk user import
- [ ] User activity logs
- [ ] Password history
- [ ] Account deactivation without deletion
- [ ] User permissions management
- [ ] Department/team assignment
