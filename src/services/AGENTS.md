# Services Module

## Purpose

The `services` folder contains reusable business-independent service layers.

Services are responsible for interacting with external systems such as the database or storage.

React components and pages should never implement raw Supabase queries directly.

Instead, they should call the appropriate service.

---

# Current Modules

## database.js

Purpose:

Provides generic CRUD operations for every database table.

Current API:

- create(client, table, data)
- getById(client, table, id, idColumn = "id")
- list(client, table, options = {})
- update(client, table, id, updates, idColumn = "id")
- deleteRecord(client, table, id, idColumn = "id")

These functions are intentionally generic and are designed to work with every table in the project.

---

# Authentication

database.js NEVER creates a Supabase client.

database.js NEVER imports Clerk.

database.js NEVER imports useSupabase().

database.js NEVER imports createClient().

An authenticated Supabase client must always be provided by the caller.

Example:

```javascript
const supabase = useSupabase();

const users = await database.list(
    supabase,
    "users"
);
```

database.js only performs database operations.

It is not responsible for authentication.

---

# React Components

React components should NEVER write:

supabase.from(...)

or

createClient(...)

or

Supabase SQL queries directly.

Always use database.js.

Correct:

database.create(...)
database.list(...)
database.update(...)
database.deleteRecord(...)

---

# Extending database.js

If additional generic database functionality is required during development, extend database.js.

Examples:

- pagination
- ordering
- searching
- batch inserts
- transactions (if needed)

Do not duplicate generic CRUD logic across pages.

---

# Storage

If file uploads become necessary during the hackathon, create:

services/storage.js

Storage-related functionality belongs there.

Do not place storage logic inside database.js.

---

# Design Philosophy

database.js should remain:

- generic
- reusable
- framework independent
- authentication independent

It should never know:

- Clerk
- React
- JWT
- Sessions
- UI

Its only responsibility is communicating with the database using the authenticated client it receives.
