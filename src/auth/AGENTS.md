# Authentication Module

## Purpose

The auth folder contains authentication-related functionality.

It is the only place responsible for integrating Clerk with Supabase.

No other folder should contain authentication logic.

---

# Current Modules

## supabase.js

Exports:

useSupabase()

Purpose:

Creates an authenticated Supabase client using the current Clerk session.

Internally it:

- reads the current Clerk session
- requests a JWT using the configured Clerk JWT template
- creates a Supabase client
- injects the JWT into every request

This client automatically authenticates all database requests.

---

# JWT

The JWT template name is configured through the environment variable:

VITE_CLERK_JWT_TEMPLATE

Do not hardcode template names elsewhere.

---

# Responsibility

This module owns:

- Clerk
- Session
- JWT
- Supabase client creation

This module does NOT own:

- database queries
- business logic
- storage
- UI
- routing

---

# Hooks

useSupabase() is a React hook.

It may only be called:

- inside React function components
- inside other custom React hooks

It must NEVER be called:

- inside services/
- inside utility files
- inside normal JavaScript modules

Doing so violates the Rules of Hooks.

---

# Database Usage

Typical usage:

```javascript
const supabase = useSupabase();

const users = await database.list(
    supabase,
    "users"
);
```

The authenticated client should then be passed to services/database.js.

---

# Architecture

Page
    ↓
useSupabase()
    ↓
Authenticated Supabase Client
    ↓
database.js
    ↓
Supabase
    ↓
PostgreSQL + RLS

Authentication and database logic must remain separated.

---

# Future Modules

Additional authentication-related files may be added here, such as:

- ProtectedRoute
- authentication helpers
- role helpers
- permission helpers

These should remain authentication-specific.

---

# Design Philosophy

Authentication should have exactly one responsibility:

Create an authenticated Supabase client.

It should never contain:

- SQL queries
- CRUD operations
- business logic
- application-specific functionality

Those belong inside the services layer.
