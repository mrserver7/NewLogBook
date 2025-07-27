# Admin Setup and Procedure Configuration

Due to MongoDB connectivity constraints in some environments, here are the manual steps to set up the application:

## 1. Set Main User as Admin

### Option A: Using the Setup Page
1. Navigate to `/setup` in your browser when the app is deployed
2. Enter the admin email: `mrserver.ksa@gmail.com`
3. Enter the setup secret: `setup-admin-2024`
4. Click "Run Setup"

### Option B: Direct Database Update
If you have direct access to MongoDB, update the user document:

```javascript
db.users.updateOne(
  { email: "mrserver.ksa@gmail.com" },
  { $set: { role: "admin", isActive: true } }
)
```

### Option C: API Call
Make a POST request to the setup endpoint:

```bash
curl -X POST https://your-app-url.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{"email": "mrserver.ksa@gmail.com", "secret": "setup-admin-2024"}'
```

## 2. Add Default Procedures

The setup endpoint will automatically add the following procedures:

### General Anesthesia
- General Anesthesia
- Sedation
- MAC (Monitored Anesthesia Care)

### Regional Anesthesia
- Spinal Anesthesia
- Epidural Anesthesia
- Combined Spinal-Epidural
- Nerve Block

### Local Anesthesia
- Local Anesthesia

### Surgical Procedures
- Appendectomy
- Cholecystectomy  
- Hernia Repair
- Total Knee Replacement
- Hip Replacement
- Cesarean Section
- Vaginal Delivery
- Cataract Surgery

### Endoscopy
- Colonoscopy
- Upper Endoscopy
- Bronchoscopy

### Orthopedic
- Arthroscopy

### Other
- Other (allows custom procedure names)

## 3. Testing Admin Access

After setup:
1. Log in with the admin email: `mrserver.ksa@gmail.com`
2. Check that you can see the Admin section in the sidebar
3. Navigate to `/admin/users` to manage users
4. Navigate to `/admin/analytics` for system analytics

## 4. Testing Procedure Selection

1. Go to `/new-case` to create a new case
2. In the Procedure field, you should see:
   - A dropdown with categorized procedures
   - An "Add Custom Procedure" option at the top
   - Ability to search through procedures
   - When selecting "Add Custom Procedure", an input field appears for custom names

## 5. User Management Features

As an admin, you can:
- View all users in the system
- Edit user information (name, email, specialty, institution)
- Change user roles (user/admin)
- Activate/deactivate users
- View user statistics
- View individual user's cases

## Troubleshooting

If the setup doesn't work:
1. Check that the application is running and accessible
2. Verify MongoDB connection is working
3. Check the application logs for errors
4. Ensure the user with email `mrserver.ksa@gmail.com` exists in the database (they need to log in at least once)

## Changes Made

### Server Side
1. Added `PATCH /api/admin/users/:userId` endpoint for updating users
2. Added `POST /api/setup` endpoint for initial configuration
3. Added `updateUser` method to storage interface
4. Fixed MongoDB connection string encoding in `.env`

### Client Side
1. Enhanced procedure selector to always show custom procedure option
2. Added clear/reset functionality for procedure selection
3. Improved handling when no procedures are available
4. Added setup page at `/setup` for manual configuration
5. Enhanced admin user management with role editing capabilities

### Features Implemented
- ✅ Admin user role assignment
- ✅ User role management in admin panel
- ✅ Enhanced procedure selector with custom procedure names
- ✅ Fallback setup mechanism for deployment environments
- ✅ Improved user experience for case creation