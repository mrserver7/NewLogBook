# Admin Setup Instructions

## Issue
The user `mrserver.ksa@gmail.com` cannot access the admin panel at `/admin/users` and receives an "Access Denied" error because they don't have administrator privileges in the database.

## Solution
The application has a built-in setup page that can grant admin privileges to users. Follow these steps:

### Step 1: Access the Setup Page
Navigate to: **https://newlogbook.onrender.com/setup**

### Step 2: Grant Admin Access
1. The email field should already be pre-filled with `mrserver.ksa@gmail.com`
2. Enter the setup secret: `setup-admin-2024`
3. Click "Run Setup"

### Step 3: Verify Admin Access
1. After successful setup, log in with your Auth0 account using `mrserver.ksa@gmail.com`
2. Navigate to: **https://newlogbook.onrender.com/admin/users**
3. You should now have full access to the admin panel

## What the Setup Does
- Sets the specified user's role to 'admin' in the database
- Activates the user account (sets isActive: true)
- Adds default medical procedures to the database
- No code changes are required

## Security Note
The setup secret `setup-admin-2024` is hardcoded in the application for initial setup purposes. After setting up the admin user, this endpoint remains available but should only be used by authorized personnel.

## Admin Panel Features
Once you have admin access, you can:
- View and manage all users
- Edit user roles and permissions
- View system analytics
- Monitor user activity and case statistics
- Access user-specific case data

## Troubleshooting
If you still can't access the admin panel after running setup:
1. Make sure you're logged in with the exact email address `mrserver.ksa@gmail.com`
2. Clear your browser cache and cookies
3. Log out and log back in
4. Try running the setup process again

## Support
If you continue to experience issues, the setup endpoint can be called multiple times safely, and the admin role assignment is idempotent.