# Admin Setup and Troubleshooting Guide

This guide explains how to set up admin access and troubleshoot common issues with the NewLogBook application.

## Quick Setup Steps

### 1. First Login
**Important**: You MUST login to the application at least once before running the setup process.

1. Go to your deployed application URL
2. Click "Sign In" and complete the Auth0 authentication
3. This creates your user record in the database

### 2. Run Setup
1. Navigate to `/setup` in your browser (e.g., `https://your-app.com/setup`)
2. Enter admin email: `mrserver.ksa@gmail.com`
3. Enter setup secret: `setup-admin-2024`
4. Click "Run Setup"

### 3. Verify Admin Access
1. Go to Settings page
2. Look for "Admin Diagnostics" section (visible to admin users)
3. Click "Run Diagnostics" to check your status
4. Try accessing `/admin/users` to confirm admin panel access

## Troubleshooting

### Problem: "User not found in database"

**Cause**: You haven't logged in yet, so your user record doesn't exist.

**Solution**:
1. Go to the main application URL
2. Complete the Auth0 login process
3. Then run the setup process again

### Problem: "Setup completed but still can't access admin panel"

**Cause**: Possible ID mismatch between Auth0 and database.

**Debugging Steps**:
1. Go to Settings → Admin Diagnostics
2. Click "Run Diagnostics"
3. Compare the "Auth Claims ID" with "Database User ID"
4. If they don't match, there's an ID synchronization issue

**Solution**:
1. Logout completely from the application
2. Clear your browser cache/cookies
3. Login again
4. Run setup process again

### Problem: "Database connection timeout"

**Cause**: MongoDB is not accessible or connection string is incorrect.

**For Development**:
- This is expected if MongoDB isn't running locally
- The application will still function with Auth0 authentication
- Admin features require a working database

**For Production**:
1. Check your MongoDB connection string in `.env`
2. Ensure MongoDB Atlas/cluster is accessible
3. Verify firewall settings allow connections

### Problem: "Access Denied - Admin Access Required"

**Cause**: Your user exists but doesn't have admin role.

**Solution**:
1. Use the setup process: `/setup`
2. Or manually update database:
   ```javascript
   db.users.updateOne(
     { email: "mrserver.ksa@gmail.com" },
     { $set: { role: "admin", isActive: true } }
   )
   ```

## API Endpoints for Manual Setup

### Setup Endpoint
```bash
curl -X POST https://your-app.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "mrserver.ksa@gmail.com", "secret": "setup-admin-2024"}'
```

### Debug User Status
```bash
curl -H "Cookie: your-session-cookie" \
  https://your-app.com/api/debug/user-status
```

## Manual Database Setup

If the automatic setup fails, you can manually update the database:

### MongoDB Commands
```javascript
// Connect to your MongoDB
use your-database-name

// Find the user
db.users.findOne({ email: "mrserver.ksa@gmail.com" })

// Set as admin
db.users.updateOne(
  { email: "mrserver.ksa@gmail.com" },
  { $set: { role: "admin", isActive: true } }
)

// Verify the update
db.users.findOne({ email: "mrserver.ksa@gmail.com" })
```

## Common ID Mismatch Issues

Auth0 user IDs sometimes change or get formatted differently. To fix:

1. Login to the application
2. Check the debug endpoint to see current Auth0 ID
3. Update the database user record to match:
   ```javascript
   db.users.updateOne(
     { email: "mrserver.ksa@gmail.com" },
     { $set: { id: "auth0|new-user-id", role: "admin", isActive: true } }
   )
   ```

## Security Notes

- The setup secret (`setup-admin-2024`) should be changed in production
- The setup endpoint should be disabled after initial setup
- Only use the admin diagnostics in trusted environments

## Contact Support

If you continue to have issues:
1. Run the diagnostics and capture the output
2. Check the server logs for errors
3. Provide both when requesting support

The enhanced error messages and diagnostics should help identify the specific issue preventing admin access.