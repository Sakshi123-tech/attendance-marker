# Implementation Plan - Phase 8: Employee Onboarding & Authentication Completion

This plan outlines the design and step-by-step implementation for Phase 8, covering employee creation, role limitations, invitation flows, advanced authentication APIs, status management, and audit logging.

---

## User Review Required

Please review the proposed role limits and permission mapping.

> [!IMPORTANT]
> - **Role Limits:** System checks will strictly enforce: Max 1 `SUPER_ADMIN` (bootstrapped only), Max 3 `ADMIN` users, Max 3 `HR` users. Attempts to exceed these will yield a `400 Bad Request` validation error.
> - **Invites:** Onboarding links are generated as `${CLIENT_URL}/setup-account?token=<token>`. Ensure `CLIENT_URL` is set correctly in your `.env`.

### Permission Strategy
We will map roles to the following permission lists:
- `SUPER_ADMIN`: `['all']`
- `ADMIN`: `['manage_hr', 'manage_employees', 'view_reports', 'view_logs']`
- `HR`: `['manage_employees', 'view_reports']`
- `EMPLOYEE`: `['view_own_attendance']`
- `KIOSK`: `['mark_attendance']`

---

## Proposed Changes

### 1. Database Model Updates
We will add fields to standardise status tracking, invitation states, reset parameters, and logins.

#### [MODIFY] [User.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/models/User.js)
- Add new properties:
  - `invitationToken`: String (unhashed random hex)
  - `invitationExpiresAt`: Date
  - `resetPasswordToken`: String
  - `resetPasswordExpiresAt`: Date
  - `lastLoginAt`: Date
- Modify validation defaults and schemas.

---

### 2. Employee Management Module (Controller, Service, Router)
We will implement the Employee Module under the Service-Controller-Model architecture.

#### [NEW] [employeeService.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/services/employeeService.js)
- `createEmployee(creator, data)`:
  - Enforces hierarchical creation rules (SUPER_ADMIN -> ADMIN/HR/EMPLOYEE, ADMIN -> HR/EMPLOYEE, HR -> EMPLOYEE only).
  - Enforces role limits (Max 3 ADMINs, Max 3 HRs, 1 SUPER_ADMIN).
  - Generates a crypto-secure `invitationToken` and 24h expiration.
  - Dispatches onboarding invite email with the setup URL.
  - Logs the `USER_CREATED` audit trace.
- `updateEmployee(id, data)`: Updates fields like `fullName` and `department`.
- `deactivateEmployee(id)`: Sets `isActive` to `false` (blocking logins and setup).
- `listEmployees()`: Returns active employee lists.

#### [NEW] [employeeController.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/controllers/employeeController.js)
- `createEmployee`: Calls service, returns 201 with created profile.
- `updateEmployee`: Standard profile editor route.
- `deactivateEmployee`: Disables the target employee's account.
- `listEmployees`: Queries all active employees.

#### [NEW] [employeeRoutes.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/routes/employeeRoutes.js)
- Mounts employee-related actions under RBAC controls (`protect`, `authorizeRoles`).

---

### 3. Authentication & Onboarding Module Upgrades

#### [MODIFY] [authController.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/controllers/authController.js)
- `login`:
  - Restricts login for inactive users.
  - Blocks users who have not completed onboarding (`mustSetupPassword === true`).
  - Updates `lastLoginAt`.
  - Excludes JWT tokens from the JSON response body (stores only inside HttpOnly cookie).
  - Returns user profile, role, and dynamic permission scope.
- `setupAccount`:
  - Validates `token` and checks `invitationExpiresAt > Date.now()`.
  - Rejects setup if the user was deactivated.
  - Overwrites password, sets `mustSetupPassword` to false, marks `isEmailVerified` as true.
  - Clears invitation fields.
  - Logs the `USER_ACTIVATED` audit hook.
- `forgotPassword`: Generates secure reset token, saves database, and dispatches reset URL.
- `resetPassword`: Validates token expiration, hashes new password, and saves document.

#### [MODIFY] [authRoutes.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/routes/authRoutes.js)
- Mounts `/forgot-password` and `/reset-password` routes.

---

### 4. Auxiliary Upgrades (Validators, Email, Audit logs)

#### [NEW] [auditService.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/services/auditService.js)
- Implements `logAuditAction(userId, action, details)` hook placeholders:
  - `USER_CREATED`
  - `USER_ACTIVATED`
  - `LOGIN`
  - `LOGOUT`
  - `PASSWORD_RESET`

#### [MODIFY] [emailService.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/services/emailService.js)
- Adds a template for sending forgot-password recovery emails.

#### [MODIFY] [app.js](file:///c:/Users/agnih/Downloads/Attedence_marker_backend/app.js)
- Registers `/api/v1/employees` routes.

---

## Verification Plan

### Automated/Local Checks
1. Validate package syntax.
2. Verify role hierarchies using manual API testing templates (or Postman scripts).
3. Test edge cases:
   - Attempt to create a 4th Admin / HR user (should return a 400 validation error).
   - Attempt to login with an inactive account (should yield a 403 authorization block).
   - Attempt to login without finishing onboarding (should yield a 403 block).
   - Verify that the JWT is not present in the body of response payloads.
