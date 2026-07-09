# AGENTS.md

# Services Module Guide

This document defines the architecture, responsibilities, and development rules for everything inside the `src/services/` directory.

Every AI coding agent and developer **must read this document before modifying any file inside this directory.**

---

# Purpose

The `services` directory is the application's infrastructure layer.

It provides reusable integrations with external services while hiding implementation details from the rest of the application.

React components and pages should never communicate directly with external providers when an appropriate service already exists.

---

# Directory Structure

```text
src/
└── services/
    ├── AGENTS.md
    ├── supabase.js
    └── database.js
```

---

# Development Philosophy

Infrastructure should be written once.

Business logic should be written later.

This project is intended for rapid hackathon development, so services should remain:

* Generic
* Small
* Reusable
* Easy to understand
* Easy for AI agents to extend

Avoid over-engineering.

---

# supabase.js

## Purpose

This file creates and exports exactly one configured Supabase client.

It is the only location responsible for connecting the frontend to Supabase.

---

## Responsibilities

* Read environment variables.
* Validate required environment variables.
* Create the Supabase client.
* Export the configured client.

---

## Current Environment Variables

```text
VITE_SUPABASE_URL

VITE_SUPABASE_PUBLISHABLE_KEY
```

Never hardcode credentials.

Never commit secrets.

---

## Rules

### DO

* Import the exported client.
* Reuse this client everywhere.
* Keep this file extremely small.

### DO NOT

* Add CRUD functions.
* Add business logic.
* Add storage logic.
* Add authentication logic.
* Create another Supabase client anywhere else in the project.

There must always be a single source of truth for the Supabase connection.

---

# database.js

## Purpose

This file provides generic CRUD operations for every database table.

It exists to prevent database code from being duplicated throughout the application.

React pages and reusable components should never execute:

```javascript
supabase.from(...)
```

directly.

Instead they should call the exported database service.

---

# Available Functions

The current API intentionally remains small.

```javascript
database.create()

database.getById()

database.list()

database.update()

database.deleteRecord()
```

These functions are generic.

They work with any table.

---

# Generic Design

Functions should receive table names and data.

Example:

```javascript
await database.create("employees", {
    name: "John"
});
```

Avoid creating functions such as:

```javascript
createEmployee()

createVehicle()

createFleet()

createCustomer()
```

Those belong inside feature-specific modules if they become necessary.

---

# Filtering

The current implementation supports simple equality filters.

Example:

```javascript
await database.list("employees", {
    filters: {
        status: "active"
    }
});
```

If more advanced filtering becomes necessary during the hackathon, extend this file instead of writing raw Supabase queries inside React components.

---

# Error Handling

All database operations should throw readable JavaScript Errors.

Do not silently ignore database failures.

Do not return inconsistent error structures.

Keep error handling centralized whenever possible.

---

# Extension Rules

If new database functionality becomes necessary:

Preferred approach:

1. Extend `database.js`
2. Reuse existing helper functions
3. Keep APIs generic

Avoid:

* Creating duplicate database helpers
* Creating multiple service files that perform similar CRUD operations
* Copy-pasting Supabase queries throughout the project

---

# React Integration Rules

Preferred architecture:

```text
React Page

↓

database.js

↓

supabase.js

↓

Supabase
```

Avoid:

```text
React Page

↓

supabase.from(...)
```

The second approach creates duplicated infrastructure code.

---

# AI Agent Instructions

Before generating code:

1. Read this document.
2. Inspect both `supabase.js` and `database.js`.
3. Reuse existing functions whenever possible.
4. Do not duplicate CRUD logic.
5. Do not create another Supabase client.
6. Extend the existing service if additional database functionality is required.
7. Keep services generic.
8. Keep business logic outside the services directory.
9. Maintain the existing coding style.
10. Preserve backward compatibility whenever practical.

---

# Future Expansion

Additional services should only be created when an actual requirement exists.

Examples include:

* storage.js
* api.js
* ai.js
* notifications.js

Do not create placeholder files for hypothetical future features.

Create them only when the project requires them.

---

# Goal

The objective of the `services` directory is to provide a single, reusable infrastructure layer that allows developers and AI agents to focus on implementing business features instead of repeatedly writing connection and CRUD logic.

When in doubt, extend the existing services instead of creating new ones.

without asking user about the important dicisions and getting approval don't take risky action
