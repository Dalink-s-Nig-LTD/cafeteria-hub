

# Cafeteria POS System - Authentication, Role-Based Admin & Mobile Responsiveness

## Overview

This plan outlines the implementation of a complete authentication system using Convex, a role-based admin dashboard with superadmin/admin/cashier roles, and mobile responsiveness improvements across the application.

---

## 1. Convex Backend Setup

### 1.1 Initial Convex Configuration

Install Convex dependencies and initialize the project:
- `convex` - Core Convex package
- `@convex-dev/auth` - Authentication library
- Set up Convex project with `npx convex dev --configure=new`

### 1.2 Database Schema

Create the following tables in Convex:

```text
+-------------------+     +-------------------+     +-------------------+
|      users        |     |    user_roles     |     |   access_codes    |
+-------------------+     +-------------------+     +-------------------+
| _id               |<--->| userId            |     | _id               |
| email             |     | role (enum)       |     | code              |
| name              |     | createdAt         |     | role              |
| createdAt         |     | createdBy         |     | createdBy         |
+-------------------+     +-------------------+     | createdAt         |
                                                    | expiresAt         |
                                                    | usedAt            |
                                                    | usedBy            |
                                                    +-------------------+
```

**Role Enum Values:**
- `superadmin` - Full system access, can manage admins
- `admin` - Can view all data, export documents, generate cashier access codes
- `cashier` - Can process orders only

### 1.3 Convex Functions

**Authentication Functions:**
- `auth.ts` - Configure Convex Auth with Password provider
- `users.ts` - User queries and mutations (getUser, getCurrentUser)

**Role Management Functions:**
- `roles.ts` - Check user role, assign roles, get all users with roles

**Access Code Functions:**
- `accessCodes.ts` - Generate, validate, and invalidate access codes for cashiers

---

## 2. Authentication Pages

### 2.1 Auth Page Design (Based on Reference Image)

Create a split-screen layout similar to the provided reference:
- **Left side**: Login/Signup form with clean, minimal design
- **Right side**: Branded promotional area with university branding

**Form Features:**
- Email/Username input
- Password input with visibility toggle
- "Remember me" checkbox
- "Forgot password?" link
- Toggle between Login/Sign Up modes

### 2.2 New Files to Create

```text
src/pages/Auth.tsx              - Main auth page component
src/components/auth/
  AuthForm.tsx                  - Sign in/up form
  ForgotPasswordForm.tsx        - Password reset request
  ResetPasswordForm.tsx         - New password form
```

### 2.3 Password Reset Flow

1. User requests reset via email
2. Convex sends reset link (requires Resend integration)
3. User clicks link and sets new password

---

## 3. Role-Based Dashboard System

### 3.1 Role Hierarchy

```text
SUPERADMIN
    |
    +-- Full dashboard access
    +-- View all analytics
    +-- Manage admin users (create, remove)
    +-- Manage admin permissions
    +-- Generate access codes for admins
    +-- Export all documents
    |
ADMIN
    |
    +-- View dashboard analytics
    +-- View sales reports
    +-- Export documents (PDF, CSV)
    +-- Generate cashier access codes
    +-- Cannot manage other admins
    |
CASHIER
    |
    +-- Access via generated code only
    +-- Process orders
    +-- Print receipts
    +-- No access to admin features
```

### 3.2 Enhanced Admin Dashboard

**New Tabs for Admin Dashboard:**
1. **Overview** (existing) - Stats, charts, recent orders
2. **Menu Management** (existing) - Add/edit menu items
3. **User Management** (new - superadmin only) - Manage admin users
4. **Access Codes** (new) - Generate/manage cashier codes
5. **Reports** (new) - Export functionality

### 3.3 New Components

```text
src/components/admin/
  UserManagement.tsx            - Superadmin: manage admins
  AccessCodeGenerator.tsx       - Generate cashier codes
  ExportReports.tsx             - Export PDF/CSV reports
  AdminSidebar.tsx              - Navigation sidebar
```

### 3.4 Access Code System for Cashiers

Instead of hardcoded PINs, admins can:
- Generate unique 6-character alphanumeric codes
- Set expiration time (1 day, 1 week, 1 month, or custom)
- View active codes and their status
- Revoke codes

---

## 4. Mobile Responsiveness

### 4.1 Current Issues to Address

| Component | Issue | Solution |
|-----------|-------|----------|
| CashierDashboard | Fixed 384px cart sidebar | Collapsible drawer on mobile |
| MenuGrid | Hard to tap small cards | Larger touch targets |
| AdminDashboard | Charts cramped | Stack vertically |
| Landing | Cards cramped | Single column layout |
| Tables | Horizontal overflow | Card view on mobile |

### 4.2 Responsive Breakpoints

- **Mobile**: 0-640px (sm)
- **Tablet**: 641-1024px (md/lg)
- **Desktop**: 1025px+ (xl)

### 4.3 Component Updates

**CashierDashboard:**
- Add Sheet/Drawer component for cart on mobile
- Floating cart button with item count badge
- Full-screen cart overlay when opened

**MenuGrid:**
- 2 columns on mobile (existing)
- Larger tap targets (min 44x44px)
- Swipe gestures for quick add

**AdminDashboard:**
- Bottom navigation on mobile
- Hamburger menu for tabs
- Charts stack vertically
- Tables become card lists

**Auth Page:**
- Stack layout on mobile (form on top)
- Full-width inputs
- Larger touch targets for buttons

---

## 5. Updated Type Definitions

```typescript
// Enhanced user role type
export type UserRole = 'superadmin' | 'admin' | 'cashier' | null;

// Access code type
export interface AccessCode {
  id: string;
  code: string;
  role: 'cashier' | 'admin';
  createdBy: string;
  createdAt: Date;
  expiresAt: Date | null;
  usedAt: Date | null;
  usedBy: string | null;
}

// User profile for dashboard
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}
```

---

## 6. File Structure Summary

### New Files

```text
convex/
  _generated/           - Auto-generated by Convex
  auth.config.ts        - Auth configuration
  auth.ts               - Auth functions
  schema.ts             - Database schema
  users.ts              - User queries/mutations
  roles.ts              - Role management
  accessCodes.ts        - Access code management
  
src/
  lib/
    convex.ts           - Convex client setup
  
  pages/
    Auth.tsx            - Sign in/up page
    ResetPassword.tsx   - Password reset page
  
  components/
    auth/
      AuthForm.tsx
      ForgotPasswordForm.tsx
    admin/
      UserManagement.tsx
      AccessCodeGenerator.tsx
      ExportReports.tsx
      AdminSidebar.tsx
    cashier/
      MobileCart.tsx    - Mobile cart drawer
```

### Modified Files

```text
src/App.tsx                     - Add routes, wrap with ConvexProvider
src/main.tsx                    - Add Convex client
src/contexts/AuthContext.tsx    - Integrate with Convex auth
src/types/cafeteria.ts          - Add new types
src/pages/Index.tsx             - Update routing logic
src/pages/Landing.tsx           - Update for role selection
src/pages/CashierDashboard.tsx  - Mobile responsive updates
src/pages/AdminDashboard.tsx    - Add new tabs, sidebar
src/components/admin/*          - Mobile responsive updates
src/components/cashier/*        - Mobile responsive updates
src/index.css                   - Add mobile-specific styles
```

---

## 7. Implementation Order

1. **Phase 1: Convex Setup**
   - Install and configure Convex
   - Create database schema
   - Set up authentication functions

2. **Phase 2: Authentication UI**
   - Create Auth page with sign in/up forms
   - Integrate with Convex Auth
   - Update routing

3. **Phase 3: Role System**
   - Implement role-based access control
   - Create admin management features
   - Build access code generator

4. **Phase 4: Mobile Responsiveness**
   - Update CashierDashboard with mobile cart
   - Make AdminDashboard responsive
   - Fix all component breakpoints

---

## Technical Notes

### Convex Environment Variables

You will need to set up these environment variables:
- `VITE_CONVEX_URL` - Your Convex deployment URL

### Email Sending (Optional for Password Reset)

If you want password reset functionality:
- Requires Resend.com account
- Store `RESEND_API_KEY` in Convex environment

### Security Considerations

- Roles stored in separate table (not on user object)
- Server-side role validation in Convex functions
- Access codes hashed before storage
- Rate limiting on login attempts

