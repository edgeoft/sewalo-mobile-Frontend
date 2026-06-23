# Sipalu API - Authentication Documentation

> **Backend:** Laravel 12 (PHP) · **Auth:** JWT (tymon/jwt-auth) · **SMS:** Sparrow · **Email:** Brevo

---

## Table of Contents

1. [Base URL & Headers](#1-base-url--headers)
2. [Rate Limiting](#2-rate-limiting)
3. [Authentication Flow Overview](#3-authentication-flow-overview)
4. [User Roles & Statuses](#4-user-roles--statuses)
5. [Endpoints](#5-endpoints)
   - [5.1 Signup](#51-signup)
   - [5.2 Login](#52-login)
   - [5.3 Verify OTP](#53-verify-otp)
   - [5.4 Resend OTP](#54-resend-otp)
   - [5.5 Forgot Password](#55-forgot-password-otp-based)
   - [5.6 Reset Password](#56-reset-password-otp-based)
   - [5.7 Refresh Token](#57-refresh-token)
   - [5.8 Get Profile](#58-get-profile)
   - [5.9 Update Profile](#59-update-profile)
   - [5.10 Complete Profile](#510-complete-profile)
   - [5.11 Change Password](#511-change-password)
   - [5.12 Logout](#512-logout)
   - [5.13 Email Verification (Resend)](#513-email-verification-resend)
   - [5.14 Email Verification (Verify)](#514-email-verification-verify-url)
   - [5.15 Google Auth](#515-google-auth)
   - [5.16 Referral Code](#516-referral-code)
   - [5.17 Referral Stats](#517-referral-stats)
   - [5.18 Admin Login](#518-admin-login)
   - [5.19 Admin Logout](#519-admin-logout)
   - [5.20 Admin Profile](#520-admin-profile)
   - [5.21 Admin Forgot Password](#521-admin-forgot-password)
   - [5.22 Admin Reset Password](#522-admin-reset-password)
   - [5.23 Admin: List Users](#523-admin-list-users)
   - [5.24 Admin: Create User](#524-admin-create-user)
   - [5.25 Admin: Get User by ID](#525-admin-get-user-by-id)
   - [5.26 Admin: Update User](#526-admin-update-user)
   - [5.27 Admin: Update User Status](#527-admin-update-user-status)
   - [5.28 Admin: Delete User](#528-admin-delete-user)
6. [TypeScript Types](#6-typescript-types)
7. [React Native Integration Examples](#7-react-native-integration-examples)
8. [Error Codes Reference](#8-error-codes-reference)

---

## 1. Base URL & Headers

### Base URL

```
https://your-api-domain.com/api
```

### Default Headers

```http
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

### Authenticated Requests

```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

---

## 2. Rate Limiting

| Scope          | Limit         | Applied To                          |
| -------------- | ------------- | ----------------------------------- |
| `auth`         | 5 req/min     | Signup, login, OTP, admin auth      |
| `api`          | 60 req/min    | Public endpoints (categories, etc.) |
| `authenticated`| 120 req/min   | Authenticated user endpoints         |
| `admin`        | 180 req/min   | Admin endpoints                     |
| email resend   | 6 req/min     | Email verification resend           |

**Response when rate limited (HTTP 429):**

```json
{
  "message": "Too Many Attempts."
}
```

---

## 3. Authentication Flow Overview

### 3.1 Standard User Flow (Phone + Password)

```
Signup → OTP → Verify OTP → Complete Profile → Authenticated
                ↓
            Login → Authenticated (if phone verified)
```

**Step by step:**

1. **Signup** (`POST /auth/signup`) → User registers with phone + password. OTP sent via SMS.
2. **Verify OTP** (`POST /auth/verify-otp`) → OTP verified. JWT token returned. Status remains `pending`.
3. **Complete Profile** (`POST /user/complete`) → User provides email, address, city, state, country, dob, coordinates. Status changes to `completed`.
4. **Admin verifies user** → Admin sets status to `verified`. User is fully active.
5. **Login** (`POST /auth/login`) → Phone + password. Returns JWT token.

### 3.2 JWT Token Details

| Property      | Value                |
|---------------|----------------------|
| Algorithm     | HS256                |
| Token TTL     | 7 days (10080 min)   |
| Refresh TTL   | 14 days (20160 min)  |
| Token Type    | Bearer               |
| Blacklist     | Enabled (can revoke) |

### 3.3 OTP Details

| Property  | Value                      |
|-----------|----------------------------|
| Length    | 6 digits                   |
| Expiry    | 10 minutes                 |
| Types     | `signup`, `login`, `reset_password` |
| SMS       | Sparrow SMS (graceful failure) |

> **Dev note:** When `APP_ENV` is not `production` and `sms.enabled` is `false`, the OTP is returned directly in the API response for testing.

---

## 4. User Roles & Statuses

### Roles

| Role       | Description                         |
|------------|-------------------------------------|
| `customer` | Regular user who books services     |
| `provider` | Service provider                    |
| `hybrid`   | Can act as both customer & provider |
| `admin`    | Platform administrator              |

### Statuses

| Status      | Description                                      |
|-------------|--------------------------------------------------|
| `pending`   | Registered, OTP verified, profile not completed  |
| `completed` | Profile completed, awaiting admin verification   |
| `verified`  | Fully active, approved by admin                  |
| `rejected`  | Application rejected by admin                    |
| `suspended` | Temporarily suspended by admin                   |
| `inactive`  | Account deactivated by admin or system           |

### Status Transition Diagram

```
pending → completed → verified (active)
                        ↓
                 rejected / suspended / inactive
```

---

## 5. Endpoints

---

### 5.1 Signup

**`POST /api/auth/signup`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+9779812345678",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "customer",
  "referral_code": "ABC12345"
}
```

#### Validation Rules

| Field                  | Rules                                    |
|------------------------|------------------------------------------|
| `name`                 | required, string, max:255                |
| `email`                | nullable, email, unique (soft-delete)    |
| `phone`                | required, string, max:20, unique         |
| `password`             | required, string, min:8, confirmed       |
| `role`                 | required, in: `customer,provider,hybrid` |
| `referral_code`        | nullable, string, max:20                 |

#### Success Response (201)

```json
{
  "message": "User registered successfully. Please verify your phone number with the OTP sent.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+9779812345678",
    "slug": "john-doe-a1b2c3",
    "role": "customer",
    "current_role": "customer",
    "status": "pending",
    "status_message": null,
    "avatar": null,
    "city": null,
    "state": null,
    "country": null,
    "address": null,
    "dob": null,
    "description": null,
    "education": null,
    "experience": null,
    "document": null,
    "coordinates": null,
    "availability": null,
    "availability_days": null,
    "start_time": null,
    "end_time": null,
    "profile_views": 0,
    "avg_rating": null,
    "loyalty_points": 0,
    "email_verified_at": null,
    "phone_verified_at": null,
    "profile_verified_at": null,
    "last_login_at": null,
    "certificates": null,
    "language": null,
    "created_at": "2026-06-17T10:00:00.000000Z",
    "updated_at": "2026-06-17T10:00:00.000000Z"
  },
  "otp": "123456"
}
```

> **Note:** `otp` is only returned in non-production environments when SMS is disabled.

#### Error: Email already exists (422)

```json
{
  "message": "User already exists with this email",
  "user": { "...user data..." }
}
```

#### Error: Validation (422)

```json
{
  "message": "The phone has already been taken.",
  "errors": {
    "phone": ["The phone has already been taken."]
  }
}
```

---

### 5.2 Login

**`POST /api/auth/login`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "phone": "+9779812345678",
  "password": "password123"
}
```

#### Validation Rules

| Field      | Rules                    |
|------------|--------------------------|
| `phone`    | required, string, max:20 |
| `password` | required, string         |
| `remember` | boolean (optional)       |

#### Success Response (200)

```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+9779812345678",
    "role": "customer",
    "status": "verified",
    "avatar": null,
    "loyalty_points": 100,
    "email_verified_at": "2026-06-17T10:05:00.000000Z",
    "phone_verified_at": "2026-06-17T10:01:00.000000Z",
    "last_login_at": "2026-06-17T12:00:00.000000Z",
    "..."
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1774828800
}
```

#### Error: Phone not verified (403)

```json
{
  "message": "Please verify your phone number first. OTP sent to your phone.",
  "user": { "...user data..." },
  "otp": "123456"
}
```

> **Note:** `otp` is only returned in non-production environments when SMS is disabled. The client should navigate to OTP verification screen.

#### Error: Invalid credentials (422)

```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "phone": ["The provided credentials are incorrect."]
  }
}
```

---

### 5.3 Verify OTP

**`POST /api/auth/verify-otp`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "phone": "+9779812345678",
  "otp": "123456",
  "type": "signup"
}
```

#### Validation Rules

| Field   | Rules                                            |
|---------|--------------------------------------------------|
| `phone` | required, string, max:20                         |
| `otp`   | required, string, size:6, regex:/^[0-9]{6}$/    |
| `type`  | required, in: `signup,login,reset_password`      |

#### Success: signup type (200)

```json
{
  "message": "Phone number verified successfully. Please complete your profile.",
  "user": { "...user data..." },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1774828800
}
```

#### Success: login type (200)

```json
{
  "message": "Phone number verified successfully. You are now logged in.",
  "user": { "...user data..." },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1774828800
}
```

#### Success: reset_password type (200)

```json
{
  "message": "Phone number verified successfully. You can now reset your password."
}
```

#### Error: Invalid or expired OTP (422)

```json
{
  "message": "Invalid or expired OTP",
  "errors": {
    "otp": ["Invalid or expired OTP. Please check your OTP and try again."]
  }
}
```

#### Error: User not found (404)

```json
{
  "message": "No user found with this phone number",
  "errors": {
    "phone": ["No user found with this phone number"]
  }
}
```

---

### 5.4 Resend OTP

**`POST /api/auth/resend-otp`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "phone": "+9779812345678",
  "type": "signup"
}
```

#### Validation Rules

| Field   | Rules                                       |
|---------|---------------------------------------------|
| `phone` | required, string, max:20                    |
| `type`  | required, in: `signup,login,reset_password` |

#### Success Response (201)

```json
{
  "message": "An OTP has been sent to your phone number for verification. Please enter the OTP to complete your registration.",
  "otp": "123456"
}
```

#### Error: User not found (404)

```json
{
  "message": "No user found with this phone number",
  "errors": {
    "phone": ["No user found with this phone number"]
  }
}
```

---

### 5.5 Forgot Password (OTP Based)

**`POST /api/auth/forgot-password`**

Rate limit: `throttle:6,1` (6 req/min)

#### Request Body

```json
{
  "phone": "+9779812345678"
}
```

#### Validation Rules

| Field   | Rules                    |
|---------|--------------------------|
| `phone` | required, string, max:20 |

#### Success Response (200)

```json
{
  "message": "OTP sent to your phone for password reset.",
  "otp": "123456"
}
```

#### Error: User not found (404)

```json
{
  "message": "No user found with this phone number.",
  "errors": {
    "phone": ["No user found with this phone number"]
  }
}
```

#### Error: SMS failure (500)

```json
{
  "message": "Unable to send OTP. Please try again later."
}
```

---

### 5.6 Reset Password (OTP Based)

**`POST /api/auth/reset-password`**

Rate limit: `throttle:6,1` (6 req/min)

> **Prerequisite:** OTP must be verified first via `POST /api/auth/verify-otp` with type `reset_password`.

#### Request Body

```json
{
  "phone": "+9779812345678",
  "otp": "123456",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

#### Validation Rules

| Field                  | Rules                                  |
|------------------------|----------------------------------------|
| `phone`                | required, string, max:20               |
| `otp`                  | required, string, size:6, digits       |
| `password`             | required, string, min:8, confirmed     |
| `password_confirmation`| required, string, min:8                |

#### Success Response (200)

```json
{
  "message": "Password has been reset successfully."
}
```

#### Error: Invalid or expired OTP (422)

```json
{
  "message": "Invalid or expired OTP.",
  "errors": {
    "otp": ["Invalid or expired OTP. Please check your OTP and try again."]
  }
}
```

#### Error: User not found (404)

```json
{
  "message": "No user found with this phone number.",
  "errors": {
    "phone": ["No user found with this phone number"]
  }
}
```

---

### 5.7 Refresh Token

**`POST /api/auth/refresh-token`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Validation Rules

| Field           | Rules              |
|-----------------|--------------------|
| `refresh_token` | required, string   |

#### Success Response (200)

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1774828800
}
```

#### Error: Invalid token (401)

```json
{
  "message": "Invalid refresh token."
}
```

---

### 5.8 Get Profile

**`GET /api/user`**

Auth: `auth:api` · Rate limit: `throttle:authenticated` (120 req/min)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+9779812345678",
    "slug": "john-doe-a1b2c3",
    "role": "customer",
    "current_role": "customer",
    "status": "verified",
    "status_message": null,
    "avatar": "https://s3.amazonaws.com/bucket/avatars/abc.jpg",
    "city": "Kathmandu",
    "state": "Bagmati",
    "country": "Nepal",
    "address": "123 Main St",
    "dob": "1990-01-01",
    "description": "Professional developer",
    "education": [
      {
        "degree": "B.Sc. Computer Science",
        "institute": "Tribhuvan University",
        "start_date": "2008-01-01",
        "end_date": "2012-12-31"
      }
    ],
    "experience": [
      {
        "title": "Software Engineer",
        "company_name": "Tech Corp",
        "start_date": "2013-01-01",
        "end_date": null
      }
    ],
    "document": "https://s3.amazonaws.com/bucket/documents/doc.pdf",
    "coordinates": {
      "lat": 27.7172,
      "lng": 85.3240
    },
    "availability": "always",
    "availability_days": ["monday", "tuesday", "wednesday"],
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "profile_views": 42,
    "avg_rating": 4.5,
    "loyalty_points": 250,
    "email_verified_at": "2026-06-17T10:05:00.000000Z",
    "phone_verified_at": "2026-06-17T10:01:00.000000Z",
    "profile_verified_at": "2026-06-17T11:00:00.000000Z",
    "last_login_at": "2026-06-17T12:00:00.000000Z",
    "certificates": ["cert1.pdf", "cert2.pdf"],
    "language": ["English", "Nepali"],
    "created_at": "2026-06-17T10:00:00.000000Z",
    "updated_at": "2026-06-17T12:00:00.000000Z"
  }
}
```

#### Error: Unauthenticated (401)

```json
{
  "message": "Unauthenticated."
}
```

---

### 5.9 Update Profile

**`PUT /api/user`**

Auth: `auth:api` · Rate limit: `throttle:authenticated` (120 req/min)

#### Request Body (all fields optional)

```json
{
  "avatar": "base64_or_s3_key",
  "name": "John Updated",
  "email": "newemail@example.com",
  "phone": "+9779812345679",
  "city": "Pokhara",
  "state": "Gandaki",
  "country": "Nepal",
  "address": "456 New St",
  "dob": "1991-02-02",
  "description": "Updated description",
  "education": [
    {
      "degree": "M.Sc. CS",
      "institute": "MIT",
      "start_date": "2013-01-01",
      "end_date": "2015-12-31"
    }
  ],
  "experience": [
    {
      "title": "Senior Engineer",
      "company_name": "Big Corp",
      "start_date": "2016-01-01",
      "end_date": null
    }
  ],
  "portfolio_url": "https://portfolio.com/john",
  "availability": "weekdays",
  "availability_days": ["monday", "wednesday", "friday"],
  "start_time": "09:00:00",
  "end_time": "18:00:00",
  "document": "base64_or_s3_key",
  "language": ["English", "Nepali", "Hindi"]
}
```

#### Validation Rules

| Field                        | Rules                                                  |
|------------------------------|--------------------------------------------------------|
| `name`                       | sometimes, string, max:255                             |
| `email`                      | sometimes, email, unique (ignore current user)         |
| `phone`                      | sometimes, string, max:20                              |
| `city`                       | sometimes, string, max:100                             |
| `state`                      | sometimes, string, max:100                             |
| `country`                    | sometimes, string, max:100                             |
| `address`                    | sometimes, string, max:255                             |
| `dob`                        | sometimes, date, before: 18 years ago                  |
| `description`                | nullable, string, max:1000                             |
| `education`                  | nullable, array                                        |
| `education.*.degree`         | sometimes, nullable, string, max:255                   |
| `education.*.institute`      | sometimes, nullable, string, max:255                   |
| `education.*.start_date`     | sometimes, nullable, date_format:Y-m-d                 |
| `education.*.end_date`       | nullable, date_format:Y-m-d, after_or_equal:start_date |
| `experience`                 | nullable, array                                        |
| `experience.*.title`         | sometimes, nullable, string, max:255                   |
| `experience.*.company_name`  | sometimes, nullable, string, max:255                   |
| `experience.*.start_date`    | sometimes, nullable, date_format:Y-m-d                 |
| `experience.*.end_date`      | nullable, date_format:Y-m-d, after_or_equal:start_date |
| `portfolio_url`              | sometimes, url, max:255                                |
| `availability`               | sometimes, in: `always,weekends,weekdays,custom`       |
| `availability_days`          | sometimes, array                                       |
| `start_time`                 | sometimes, date_format:H:i:s                           |
| `end_time`                   | sometimes, date_format:H:i:s                           |
| `language`                   | sometimes, array                                       |

#### Success Response (200)

```json
{
  "message": "Profile updated successfully",
  "user": { "...updated user data..." }
}
```

---

### 5.10 Complete Profile

**`POST /api/user/complete`**

Auth: `auth:api` · Rate limit: `throttle:authenticated` (120 req/min)

> Called after OTP verification during initial signup. Changes user status to `completed`.

#### Request Body

```json
{
  "email": "john@example.com",
  "city": "Kathmandu",
  "state": "Bagmati",
  "country": "Nepal",
  "address": "123 Main St",
  "dob": "1990-01-01",
  "coordinates": {
    "lat": 27.7172,
    "lng": 85.3240
  },
  "avatar": "base64_or_s3_key",
  "document": "base64_or_s3_key",
  "description": "Professional developer",
  "education": [
    {
      "degree": "B.Sc. CS",
      "institute": "TU",
      "start_date": "2008-01-01",
      "end_date": "2012-12-31"
    }
  ],
  "experience": [
    {
      "title": "Developer",
      "company_name": "Tech Co",
      "start_date": "2013-01-01",
      "end_date": null
    }
  ],
  "availability": "always",
  "availability_days": ["monday", "tuesday"],
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "language": ["English", "Nepali"]
}
```

#### Validation Rules

| Field              | Rules                                                  |
|--------------------|--------------------------------------------------------|
| `email`            | required, email, unique (ignore current user)          |
| `city`             | required, string, max:100                              |
| `state`            | required, string, max:100                              |
| `country`          | required, string, max:100                              |
| `address`          | required, string, max:255                              |
| `dob`              | required, date, before: 18 years ago                   |
| `coordinates`      | required, array                                        |
| `avatar`           | sometimes, string                                      |
| `document`         | nullable, string                                       |
| `description`      | nullable, string, max:1000                             |
| `education.*`      | (same as Update Profile)                               |
| `experience.*`     | (same as Update Profile)                               |
| `availability`     | sometimes, in: `always,weekends,weekdays,custom`       |
| `start_time`       | sometimes, date_format:H:i:s                           |
| `end_time`         | sometimes, date_format:H:i:s                           |
| `language`         | sometimes, array                                       |

#### Success Response (200)

```json
{
  "message": "Profile completed successfully",
  "user": { "...user data with status: completed..." }
}
```

> **Referral bonus:** On successful profile completion, if the user was referred, both the referrer and the new user receive 100 loyalty points each.

---

### 5.11 Change Password

**`POST /api/user/change-password`**

Auth: `auth:api` · Rate limit: `throttle:authenticated` (120 req/min)

#### Request Body

```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

#### Validation Rules

| Field              | Rules                              |
|--------------------|------------------------------------|
| `old_password`     | required, string                   |
| `new_password`     | required, string, min:8, same:confirm_password |
| `confirm_password` | required, string, min:8            |

#### Success Response (200)

```json
{
  "message": "Password changed successfully"
}
```

#### Error: Invalid old password (400)

```json
{
  "message": "Invalid old password"
}
```

---

### 5.12 Logout

**`POST /api/logout`**

Auth: `auth:api` · Rate limit: `throttle:authenticated` (120 req/min)

#### Headers

```http
Authorization: Bearer <access_token>
```

#### Success Response (200)

```json
{
  "message": "Successfully logged out"
}
```

---

### 5.13 Email Verification (Resend)

**`POST /api/auth/email/resend`**

Rate limit: `throttle:6,1` (6 req/min)

#### Request Body

```json
{
  "email": "john@example.com"
}
```

#### Validation Rules

| Field   | Rules            |
|---------|------------------|
| `email` | required, email  |

#### Success Response (200)

```json
{
  "message": "Verification link sent."
}
```

#### Success: If already verified (200)

```json
{
  "message": "Email already verified."
}
```

#### Error: User not found (404)

```json
{
  "message": "User not found."
}
```

#### Forgot Password via Email (optional `type` field)

```json
{
  "email": "john@example.com",
  "type": "forgot-password"
}
```

Response (200):
```json
{
  "message": "Password reset link sent to your email."
}
```

---

### 5.14 Email Verification (Verify URL)

**`GET /api/auth/verify-email/{id}/{hash}`**

> Signed route (60-minute expiry). Must include `expires` and `signature` query params.

#### Full URL Example

```
GET /api/auth/verify-email/550e8400-e29b-41d4-a716-446655440000/6749542628cd0edf2cafc86338d801bc2052a485ef9e9dc098aaec6ccafafa8c?expires=1748148822&signature=abc123...
```

#### Success Response (200)

```json
{
  "message": "Email has been verified.",
  "user": { "...user data..." },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1774828800
}
```

#### Error: Invalid link (400)

```json
{
  "message": "Invalid verification link."
}
```

#### Error: User not found (404)

```json
{
  "message": "User not found."
}
```

---

### 5.15 Google Auth

**`POST /api/auth/google`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "token": "google_id_token_string",
  "role": "customer"
}
```

#### Validation Rules

| Field   | Rules                                  |
|---------|----------------------------------------|
| `token` | required, string (Google ID token)     |
| `role`  | required, in: `customer,provider,hybrid` |

#### Success Response (200)

```json
{
  "message": "Login successful",
  "user": { "...user data (email_verified_at set automatically)..." },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1774828800
}
```

#### Error: Invalid token (422)

```json
{
  "message": "Invalid Google token"
}
```

---

### 5.16 Referral Code

**`GET /api/user/referral-code`**

Auth: `auth:api` · Rate limit: `throttle:authenticated` (120 req/min)

#### Success Response (200)

```json
{
  "success": true,
  "message": "Referral code retrieved successfully",
  "data": {
    "referral_code": "ABC12345",
    "status": "active",
    "created_at": "2026-06-17T10:00:00.000000Z"
  }
}
```

#### Error: Only verified customers (403)

```json
{
  "success": false,
  "message": "Only verified customers can generate referral codes"
}
```

#### Error: Customer role only (403)

```json
{
  "success": false,
  "message": "Only customers can generate referral codes"
}
```

---

### 5.17 Referral Stats

**`GET /api/user/referral-stats`**

Auth: `auth:api` · Rate limit: `throttle:authenticated` (120 req/min)

#### Success Response (200)

```json
{
  "success": true,
  "message": "Referral statistics retrieved successfully",
  "data": {
    "total_referred": 15,
    "by_status": {
      "pending": 5,
      "verified": 3,
      "added": 7
    },
    "referral_code": "ABC12345"
  }
}
```

---

### 5.18 Admin Login

**`POST /api/admin/login`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "email": "admin@sewalo.com",
  "password": "password123"
}
```

#### Validation Rules

| Field      | Rules              |
|------------|--------------------|
| `email`    | required, email    |
| `password` | required, string   |

#### Success Response (200)

```json
{
  "message": "Admin login successful",
  "user": { "...user data (role === 'admin')..." },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1774828800
}
```

#### Error: Invalid credentials (401)

```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": ["Invalid email or password"]
  }
}
```

#### Error: Not an admin (401)

```json
{
  "message": "Unauthorized access. Admin privileges required.",
  "errors": {
    "role": ["You do not have admin privileges"]
  }
}
```

---

### 5.19 Admin Logout

**`POST /api/admin/logout`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

#### Success Response (200)

```json
{
  "message": "Admin logged out successfully"
}
```

---

### 5.20 Admin Profile

**`GET /api/admin/profile`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

#### Success Response (200)

```json
{
  "user": { "...admin user data..." }
}
```

---

### 5.21 Admin Forgot Password

**`POST /api/admin/forgot-password`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "email": "admin@sewalo.com"
}
```

#### Success Response (200)

```json
{
  "message": "Password reset link sent to your email."
}
```

---

### 5.22 Admin Reset Password

**`POST /api/admin/reset-password`**

Rate limit: `throttle:auth` (5 req/min)

#### Request Body

```json
{
  "email": "admin@sewalo.com",
  "token": "reset_token_from_email",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

#### Success Response (200)

```json
{
  "message": "Password has been reset successfully."
}
```

---

### 5.23 Admin: List Users

**`GET /api/users`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

#### Query Parameters

| Parameter        | Type    | Values                                                        | Default      |
|------------------|---------|---------------------------------------------------------------|--------------|
| `page`           | integer |                                                               | 1            |
| `per_page`       | integer | 1–100                                                         | 15           |
| `search`         | string  | Searches name, email, phone                                   |              |
| `role`           | string  | `customer, provider, hybrid, admin`                           |              |
| `status`         | string  | `pending, completed, verified, rejected, suspended, inactive` |              |
| `city`           | string  |                                                               |              |
| `state`          | string  |                                                               |              |
| `country`        | string  |                                                               |              |
| `email_verified` | string  | `yes, no`                                                     |              |
| `phone_verified` | string  | `yes, no`                                                     |              |
| `sort_by`        | string  | `created_at, name, email, last_login_at, loyalty_points, avg_rating, profile_views` | `created_at` |
| `sort_order`     | string  | `asc, desc`                                                   | `desc`       |
| `created_from`   | date    | YYYY-MM-DD                                                    |              |
| `created_to`     | date    | YYYY-MM-DD                                                    |              |
| `last_login_from`| date    | YYYY-MM-DD                                                    |              |
| `last_login_to`  | date    | YYYY-MM-DD                                                    |              |

#### Success Response (200)

```json
{
  "users": {
    "current_page": 1,
    "data": [ "...array of user objects..." ],
    "first_page_url": "https://api.example.com/api/users?page=1",
    "from": 1,
    "last_page": 10,
    "last_page_url": "https://api.example.com/api/users?page=10",
    "links": [ "...pagination links..." ],
    "next_page_url": "https://api.example.com/api/users?page=2",
    "path": "https://api.example.com/api/users",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 150
  },
  "filters_applied": {
    "search": "john",
    "role": "provider",
    "status": "verified"
  }
}
```

---

### 5.24 Admin: Create User

**`POST /api/users`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "+9779812345678",
  "status": "verified"
}
```

#### Validation Rules

| Field      | Rules                                                    |
|------------|----------------------------------------------------------|
| `name`     | required, string, max:255                                |
| `email`    | nullable, email, unique                                  |
| `password` | required, string, min:8                                  |
| `role`     | required, in: `customer,provider,hybrid,admin`           |
| `phone`    | required, string, max:20, unique                         |
| `status`   | nullable, in: `pending,completed,verified,rejected,suspended,inactive` |

#### Success Response (201)

```json
{
  "message": "User created successfully",
  "user": { "...user data..." }
}
```

---

### 5.25 Admin: Get User by ID

**`GET /api/users/{id}`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

#### URL Parameter

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | UUID   | User ID     |

#### Success Response (200)

```json
{
  "user": { "...full user data including all relations..." }
}
```

---

### 5.26 Admin: Update User

**`PUT /api/users/{id}`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

#### Request Body (all fields optional)

```json
{
  "name": "John Updated",
  "email": "updated@example.com",
  "role": "provider",
  "phone": "+9779812345670",
  "status": "verified",
  "status_message": "Documents verified successfully",
  "address": "123 New St",
  "city": "Kathmandu",
  "state": "Bagmati",
  "country": "Nepal",
  "coordinates": {
    "lat": 27.7172,
    "lng": 85.3240
  }
}
```

#### Validation Rules

| Field                        | Rules                                                    |
|------------------------------|----------------------------------------------------------|
| `name`                       | sometimes, string, max:255                               |
| `email`                      | sometimes, nullable, email, unique (ignore current)      |
| `role`                       | sometimes, in: `customer,provider,hybrid,admin`          |
| `phone`                      | sometimes, string, max:20, unique (ignore current)       |
| `status`                     | sometimes, in: `pending,completed,verified,rejected,suspended,inactive` |
| `status_message`             | nullable, max:2000, required_if: `rejected,suspended,inactive` |
| `address`                    | sometimes, nullable, max:500                             |
| `city`                       | sometimes, nullable, max:100                             |
| `state`                      | sometimes, nullable, max:100                             |
| `country`                    | sometimes, nullable, max:100                             |
| `coordinates`                | sometimes, nullable, array                               |
| `coordinates.lat`            | required_with:coordinates, numeric, between:-90,90       |
| `coordinates.lng`            | required_with:coordinates, numeric, between:-180,180     |

**Status Transition Validation:**

- Cannot set `rejected`/`suspended` if user already has that status.
- Setting `verified` requires: name, email, phone, and document (for non-customer roles) to be present.

#### Success Response (200)

```json
{
  "message": "User updated successfully",
  "user": { "...updated user data..." }
}
```

---

### 5.27 Admin: Update User Status

**`PUT /api/users/{id}/status`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

#### Request Body

```json
{
  "status": "verified",
  "status_message": "Account verified after document review"
}
```

#### Validation Rules

| Field            | Rules                                                    |
|------------------|----------------------------------------------------------|
| `status`         | required, in: `pending,completed,verified,rejected,suspended,inactive` |
| `status_message` | nullable, max:2000, required_if: `rejected,suspended,inactive` |

#### Success Response (200)

```json
{
  "message": "User status updated successfully",
  "user": { "...user data with new status..." }
}
```

---

### 5.28 Admin: Delete User

**`DELETE /api/users/{id}`**

Auth: `auth:api` + `admin` · Rate limit: `throttle:admin` (180 req/min)

> Soft delete - user data is preserved in the database with a `deleted_at` timestamp.

#### Success Response (200)

```json
{
  "message": "User deleted successfully"
}
```

---

## 6. TypeScript Types

### 6.1 Core Types

```typescript
// ============================
// Enums
// ============================

export type UserRole = 'customer' | 'provider' | 'hybrid' | 'admin';

export type UserStatus =
  | 'pending'
  | 'completed'
  | 'verified'
  | 'rejected'
  | 'suspended'
  | 'inactive';

export type OtpType = 'signup' | 'login' | 'reset_password';

export type AvailabilityType = 'always' | 'weekends' | 'weekdays' | 'custom';

export type ReferralStatus = 'pending' | 'verified' | 'added';

// ============================
// User Object (API Response)
// ============================

export interface User {
  id: string; // UUID
  name: string;
  email: string | null;
  phone: string;
  slug: string;
  role: UserRole;
  current_role: UserRole;
  status: UserStatus;
  status_message: string | null;
  avatar: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  dob: string | null; // YYYY-MM-DD
  description: string | null;
  education: EducationEntry[] | null;
  experience: ExperienceEntry[] | null;
  document: string | null;
  coordinates: Coordinates | null;
  availability: AvailabilityType | null;
  availability_days: string[] | null;
  start_time: string | null; // HH:mm:ss
  end_time: string | null; // HH:mm:ss
  profile_views: number;
  avg_rating: number | null;
  loyalty_points: number;
  email_verified_at: string | null; // ISO 8601
  phone_verified_at: string | null;
  profile_verified_at: string | null;
  last_login_at: string | null;
  certificates: string[] | null;
  language: string[] | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface EducationEntry {
  degree: string;
  institute: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
}

export interface ExperienceEntry {
  title: string;
  company_name: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// ============================
// Auth Request/Response Types
// ============================

export interface SignupRequest {
  name: string;
  email?: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  referral_code?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // unix timestamp
}

export interface OtpResponse {
  message: string;
  user?: User;
  access_token?: string;
  token_type?: 'bearer';
  expires_in?: number;
  otp?: string; // dev only
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string; // 6 digits
  type: OtpType;
}

export interface ResendOtpRequest {
  phone: string;
  type: OtpType;
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  phone: string;
  otp: string; // 6 digits
  password: string;
  password_confirmation: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface GoogleAuthRequest {
  token: string; // Google ID token
  role: UserRole;
}

// ============================
// Profile Types
// ============================

export interface UpdateProfileRequest {
  avatar?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  dob?: string;
  description?: string;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  portfolio_url?: string;
  availability?: AvailabilityType;
  availability_days?: string[];
  start_time?: string;
  end_time?: string;
  document?: string;
  language?: string[];
}

export interface CompleteProfileRequest {
  email: string;
  city: string;
  state: string;
  country: string;
  address: string;
  dob: string;
  coordinates: Coordinates;
  avatar?: string;
  document?: string;
  description?: string;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  availability?: AvailabilityType;
  availability_days?: string[];
  start_time?: string;
  end_time?: string;
  language?: string[];
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

// ============================
// Referral Types
// ============================

export interface ReferralCodeResponse {
  success: boolean;
  message: string;
  data: {
    referral_code: string;
    status: string;
    created_at: string;
  };
}

export interface ReferralStatsResponse {
  success: boolean;
  message: string;
  data: {
    total_referred: number;
    by_status: {
      pending: number;
      verified: number;
      added: number;
    };
    referral_code: string | null;
  };
}

// ============================
// Admin Types
// ============================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse extends AuthResponse {
  message: 'Admin login successful';
}

export interface AdminForgotPasswordRequest {
  email: string;
}

export interface AdminResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
  password: string;
  role: UserRole;
  phone: string;
  status?: UserStatus;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  status?: UserStatus;
  status_message?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: Coordinates;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
  status_message?: string;
}

export interface GetUsersQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  city?: string;
  state?: string;
  country?: string;
  email_verified?: 'yes' | 'no';
  phone_verified?: 'yes' | 'no';
  sort_by?: 'created_at' | 'name' | 'email' | 'last_login_at' | 'loyalty_points' | 'avg_rating' | 'profile_views';
  sort_order?: 'asc' | 'desc';
  created_from?: string;
  created_to?: string;
  last_login_from?: string;
  last_login_to?: string;
}

export interface PaginatedUsersResponse {
  users: {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  filters_applied: Partial<GetUsersQueryParams>;
}

// ============================
// Error Types
// ============================

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  error?: string; // exception message (dev only)
}
```

---

## 7. React Native Integration Examples

### 7.1 API Client Setup

```typescript
// api/client.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://your-api-domain.com/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          'https://your-api-domain.com/api/auth/refresh-token',
          { refresh_token: refreshToken }
        );

        await AsyncStorage.setItem(TOKEN_KEY, data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
        // Navigate to login screen
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 7.2 Auth Service

```typescript
// services/auth.ts
import apiClient from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  OtpResponse,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  GoogleAuthRequest,
  UpdateProfileRequest,
  CompleteProfileRequest,
  ChangePasswordRequest,
  ProfileResponse,
  MessageResponse,
  ReferralCodeResponse,
  ReferralStatsResponse,
  User,
} from '../types/auth';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

// ============================
// Public Auth Endpoints
// ============================

export const authService = {
  // ---- Signup ----
  async signup(data: SignupRequest): Promise<OtpResponse> {
    const response = await apiClient.post<OtpResponse>('/auth/signup', data);
    return response.data;
  },

  // ---- Login ----
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    await this.persistAuth(response.data);
    return response.data;
  },

  // ---- Verify OTP ----
  async verifyOtp(data: VerifyOtpRequest): Promise<OtpResponse> {
    const response = await apiClient.post<OtpResponse>('/auth/verify-otp', data);
    if (response.data.access_token) {
      await this.persistAuth(response.data as AuthResponse);
    }
    return response.data;
  },

  // ---- Resend OTP ----
  async resendOtp(data: ResendOtpRequest): Promise<OtpResponse> {
    const response = await apiClient.post<OtpResponse>('/auth/resend-otp', data);
    return response.data;
  },

  // ---- Forgot Password ----
  async forgotPassword(data: ForgotPasswordRequest): Promise<OtpResponse> {
    const response = await apiClient.post<OtpResponse>('/auth/forgot-password', data);
    return response.data;
  },

  // ---- Reset Password ----
  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/auth/reset-password', data);
    return response.data;
  },

  // ---- Refresh Token ----
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh-token', data);
    return response.data;
  },

  // ---- Google Auth ----
  async googleAuth(data: GoogleAuthRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', data);
    await this.persistAuth(response.data);
    return response.data;
  },

  // ---- Email Verification Resend ----
  async resendVerificationEmail(email: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/auth/email/resend', { email });
    return response.data;
  },

  // ---- Logout ----
  async logout(): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/logout');
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    return response.data;
  },

  // ---- Admin Login ----
  async adminLogin(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/admin/login', data);
    await this.persistAuth(response.data);
    return response.data;
  },

  // ---- Admin Logout ----
  async adminLogout(): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/admin/logout');
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    return response.data;
  },

  // ============================
  // Protected User Endpoints
  // ============================

  // ---- Get Profile ----
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/user');
    return response.data;
  },

  // ---- Update Profile ----
  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const response = await apiClient.put<ProfileResponse>('/user', data);
    return response.data;
  },

  // ---- Complete Profile ----
  async completeProfile(data: CompleteProfileRequest): Promise<ProfileResponse> {
    const response = await apiClient.post<ProfileResponse>('/user/complete', data);
    return response.data;
  },

  // ---- Change Password ----
  async changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>('/user/change-password', data);
    return response.data;
  },

  // ---- Referral Code ----
  async getReferralCode(): Promise<ReferralCodeResponse> {
    const response = await apiClient.get<ReferralCodeResponse>('/user/referral-code');
    return response.data;
  },

  // ---- Referral Stats ----
  async getReferralStats(): Promise<ReferralStatsResponse> {
    const response = await apiClient.get<ReferralStatsResponse>('/user/referral-stats');
    return response.data;
  },

  // ============================
  // Persistence Helpers
  // ============================

  async persistAuth(data: AuthResponse): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  },

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async getStoredUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
```

### 7.3 React Native Auth Hook

```typescript
// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';
import type { User, SignupRequest, LoginRequest } from '../types/auth';

const USER_KEY = 'user_data';
const TOKEN_KEY = 'access_token';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check stored auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const [token, userData] = await AsyncStorage.multiGet([
          TOKEN_KEY,
          USER_KEY,
        ]);

        if (token[1] && userData[1]) {
          setUser(JSON.parse(userData[1]));
          setIsAuthenticated(true);
        }
      } catch {
        // Storage read failed
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    return authService.signup(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if API call fails, clear local state
    }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { user: freshUser } = await authService.getProfile();
      setUser(freshUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch {
      // Profile fetch failed
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshProfile,
    setUser,
  };
}
```

### 7.4 React Native Auth Flow Example (Screen)

```typescript
// screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Validation', 'Phone and password are required');
      return;
    }

    setLoading(true);
    try {
      await login({ phone, password });
      // Navigation to main app happens automatically via auth state
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'An unexpected error occurred';

      if (error.response?.status === 403) {
        // Phone not verified - navigate to OTP screen
        const otp = error.response?.data?.otp; // dev only
        Alert.alert('Verify Phone', message);
        // navigation.navigate('VerifyOtp', { phone, otp, type: 'login' });
      } else {
        Alert.alert('Login Failed', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}
```

### 7.5 Full Signup Flow

```typescript
// screens/SignupScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { authService } from '../services/auth';

type SignupStep = 'form' | 'otp' | 'complete_profile';

export function SignupScreen() {
  const [step, setStep] = useState<SignupStep>('form');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Step 1: Submit signup form
  const handleSignup = async () => {
    try {
      const data = {
        name: 'John Doe',
        phone: '+9779812345678',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'customer' as const,
      };
      await authService.signup(data);
      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    try {
      const response = await authService.verifyOtp({
        phone,
        otp,
        type: 'signup',
      });
      if (response.access_token) {
        setAccessToken(response.access_token);
        setStep('complete_profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message);
    }
  };

  // Step 3: Complete profile
  const handleCompleteProfile = async () => {
    try {
      await authService.completeProfile({
        email: 'john@example.com',
        city: 'Kathmandu',
        state: 'Bagmati',
        country: 'Nepal',
        address: '123 Main St',
        dob: '1990-01-01',
        coordinates: { lat: 27.7172, lng: 85.3240 },
      });
      Alert.alert('Success', 'Profile completed! Awaiting verification.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message);
    }
  };

  // ... render based on step
}
```

---

## 8. Error Codes Reference

### HTTP Status Codes

| Code | Meaning              | Common Scenarios                                       |
|------|----------------------|--------------------------------------------------------|
| 200  | Success              | Login, profile, update                                 |
| 201  | Created              | Signup, resend OTP, create user                        |
| 400  | Bad Request          | Invalid old password, email resend failure             |
| 401  | Unauthorized         | Invalid credentials, expired/invalid token             |
| 403  | Forbidden            | Phone not verified, admin access denied                |
| 404  | Not Found            | User not found, provider not found                     |
| 422  | Validation Error     | Invalid input, missing fields, OTP invalid             |
| 429  | Too Many Requests    | Rate limit exceeded                                    |
| 500  | Server Error         | SMS failure, internal exception                        |

### Standard Error Response Shapes

**Validation Error (422)**

```json
{
  "message": "The phone has already been taken.",
  "errors": {
    "phone": ["The phone has already been taken."],
    "email": ["The email field is required."]
  }
}
```

**Unauthenticated (401)**

```json
{
  "message": "Unauthenticated."
}
```

**Forbidden (403)**

```json
{
  "message": "Unauthorized. Admin access required.",
  "errors": {
    "role": ["You do not have admin privileges"]
  }
}
```

**Server Error (500)**

```json
{
  "message": "An error occurred while processing your request.",
  "error": "Detailed exception message (dev only)"
}
```

---

## Quick Reference: Endpoint Summary

| #  | Method | Endpoint                        | Auth     | Rate Limit     | Description                  |
|----|--------|---------------------------------|----------|----------------|------------------------------|
| 1  | POST   | `/auth/signup`                  | Public   | 5/min          | Register new user            |
| 2  | POST   | `/auth/login`                   | Public   | 5/min          | Login with phone+password    |
| 3  | POST   | `/auth/verify-otp`              | Public   | 5/min          | Verify OTP                   |
| 4  | POST   | `/auth/resend-otp`              | Public   | 5/min          | Resend OTP                   |
| 5  | POST   | `/auth/forgot-password`         | Public   | 6/min          | Request password reset OTP   |
| 6  | POST   | `/auth/reset-password`          | Public   | 6/min          | Reset password with OTP      |
| 7  | POST   | `/auth/refresh-token`           | Public   | 5/min          | Refresh JWT token            |
| 8  | POST   | `/auth/email/resend`            | Public   | 6/min          | Resend email verification    |
| 9  | GET    | `/auth/verify-email/{id}/{hash}`| Signed   | -              | Verify email via URL         |
| 10 | POST   | `/auth/google`                  | Public   | 5/min          | Google OAuth login/signup    |
| 11 | GET    | `/user`                         | Bearer   | 120/min        | Get user profile             |
| 12 | PUT    | `/user`                         | Bearer   | 120/min        | Update user profile          |
| 13 | POST   | `/user/complete`                | Bearer   | 120/min        | Complete profile after signup|
| 14 | POST   | `/user/change-password`         | Bearer   | 120/min        | Change password              |
| 15 | GET    | `/user/referral-code`           | Bearer   | 120/min        | Get referral code            |
| 16 | GET    | `/user/referral-stats`          | Bearer   | 120/min        | Get referral statistics      |
| 17 | POST   | `/logout`                       | Bearer   | 120/min        | Logout                       |
| 18 | POST   | `/admin/login`                  | Public   | 5/min          | Admin login                  |
| 19 | POST   | `/admin/logout`                 | Bearer+Ad| 180/min        | Admin logout                 |
| 20 | GET    | `/admin/profile`                | Bearer+Ad| 180/min        | Admin profile                |
| 21 | POST   | `/admin/forgot-password`        | Public   | 5/min          | Admin forgot password        |
| 22 | POST   | `/admin/reset-password`         | Public   | 5/min          | Admin reset password         |
| 23 | GET    | `/users`                        | Bearer+Ad| 180/min        | List all users               |
| 24 | POST   | `/users`                        | Bearer+Ad| 180/min        | Create user                  |
| 25 | GET    | `/users/{id}`                   | Bearer+Ad| 180/min        | Get user details             |
| 26 | PUT    | `/users/{id}`                   | Bearer+Ad| 180/min        | Update user                  |
| 27 | PUT    | `/users/{id}/status`            | Bearer+Ad| 180/min        | Update user status           |
| 28 | DELETE | `/users/{id}`                   | Bearer+Ad| 180/min        | Soft delete user             |
| 29 | GET    | `/users/{id}/status-history`    | Bearer+Ad| 180/min        | User status change log       |
