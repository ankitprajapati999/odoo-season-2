# AGENTS.md

# AI Project Instructions

This document defines the global rules every AI coding agent must follow before making any modification to this repository.

These instructions apply to the entire project unless a deeper `AGENTS.md` overrides them for its own folder.

---

# Primary Goal

Your primary goal is to assist in building a maintainable, modular, production-quality application suitable for rapid hackathon development.

Prioritize:

- correctness
- simplicity
- modularity
- readability
- maintainability
- consistency

Do not over-engineer solutions.

Hackathon speed is important, but maintainability must not be sacrificed.

---

# Before Writing Any Code

Always perform these steps before modifying code.

1. Read this file completely.

2. Read every applicable `AGENTS.md` file from the project root down to the folder you are modifying.

Example:

```
AGENTS.md
↓

src/AGENTS.md

↓

src/services/AGENTS.md
```

3. Read the files that already exist inside the target folder.

Understand the existing architecture before making changes.

Never generate duplicate implementations because you failed to inspect existing code.

---

# Scope of Changes

Modify ONLY what the user requested.

Do NOT make unrelated improvements.

Do NOT rename files.

Do NOT reorganize folders.

Do NOT refactor unrelated modules.

Do NOT change architecture without being explicitly instructed.

Example:

If the user asks:

> Build the Dashboard page.

You should NOT:

- modify Analytics page
- modify Authentication
- modify Settings
- change routing
- rename components
- improve unrelated code

Only touch the files necessary to complete the requested task.

---

# Respect Existing Architecture

Never bypass existing abstractions.

If functionality already exists:

- extend it
- reuse it
- improve it

Do NOT duplicate it.

Example:

Database access belongs inside:

```
src/services/database.js
```

Authentication belongs inside:

```
src/auth/
```

Do not create another authentication module or another database helper.

---

# Framework Documentation

Never assume framework APIs from memory.

Before modifying framework-related code:

- React
- Clerk
- Supabase
- React Router
- Tailwind
- Shadcn
- Vite
- etc.

Always determine the currently installed version.

Then use APIs that match that version.

---

# Documentation Priority

When documentation exists inside:

```
docs/
```

Always read it first.

Local documentation takes precedence over remembered examples.

The documentation inside this repository reflects the project's chosen SDK versions.

---

# Installed Skills

This project may contain framework skills installed using commands similar to:

```
npx skills add <framework>
```

Always consult those skills before modifying framework-specific code.

Never assume APIs from memory if skills exist.

---

# Clerk

This project uses the modern Clerk React SDK.

Do not replace working code with examples from older SDK versions.

Verify exported APIs before generating authentication code.

Always follow:

- installed version
- project documentation
- local skills

instead of online blog posts.

---

# Architecture

Respect the current architecture.

Current flow:

```
React Page
        ↓
useSupabase()
        ↓
Authenticated Client
        ↓
database.js
        ↓
Supabase
        ↓
PostgreSQL
```

Authentication and database logic must remain separated.

---

# React Rules

Follow the Rules of Hooks.

Hooks may only be called:

- inside React components
- inside custom hooks

Never call hooks inside:

- services
- utilities
- helper modules
- normal JavaScript files

---

# Code Style

Write code that is:

- simple
- readable
- modular
- reusable

Avoid unnecessary abstractions.

Avoid clever code.

Prefer explicit code over magic.

---

# Error Handling

Do not silently ignore errors.

Return meaningful errors whenever possible.

Do not hide exceptions unless explicitly requested.

---

# Security

Never bypass authentication.

Never bypass authorization.

Respect:

- Clerk
- Supabase
- PostgreSQL RLS

Do not generate code that weakens existing security.

---

# Online Verification

Frameworks evolve rapidly.

For framework-specific APIs, behavior, configuration, or integration:

- verify against the latest official documentation whenever possible
- prefer official documentation over community tutorials
- avoid using deprecated APIs

Especially verify:

- Clerk
- Supabase
- React
- React Router
- Vite

---

# Logging

Every meaningful modification performed by an AI agent should be recorded.

Logs must be stored inside:

```
logs/
```

Create the folder if it does not already exist.

Create one log file per session.

Recommended filename:

```
YYYY-MM-DD_HH-MM_AI.md
```

Each log should include:

- Timestamp
- Files modified
- Reason for change
- Summary of changes
- Architectural decisions
- New dependencies (if any)
- Breaking changes (if any)
- TODO items (if any)

Example:

```
## 2026-07-10 09:45

Modified:

- src/services/database.js
- src/pages/Dashboard.jsx

Reason:

Implemented dashboard data loading.

Summary:

- Added dashboard statistics query.
- Reused existing database service.
- No authentication changes.

Breaking Changes:

None.
```

---

# Dependencies

Before installing a new package:

- verify it is actually necessary
- avoid duplicate libraries
- prefer existing project dependencies

Never install packages simply because they are familiar.

---

# Keep AI-Friendly Architecture

Whenever possible:

- reuse services
- reuse hooks
- reuse components

Do not duplicate logic.

Every new module should have a single responsibility.

---

# Final Rule

Before finishing any task, ask yourself:

- Did I modify only what the user requested?
- Did I read the relevant project files?
- Did I reuse existing architecture?
- Did I avoid duplicate implementations?
- Did I follow the project's documentation?
- Did I preserve security?
- Did I document my work?

If any answer is "No", correct it before completing the task.

---

# TransitOps Specific Rules

## 1. Database Schema is Production-Ready
The database schema has been designed and finalized in `supabase_schema_and_guide.md`.
Never:
- Create new tables, drop tables, rename tables, or rename columns.
- Add or remove columns.
- Modify triggers, PostgreSQL functions, constraints, or RLS policies.
- Generate migrations or run schema modification commands.
- If a schema modification appears necessary, stop and ask the project owner.

## 2. Business Logic is Database-Enforced
Do not duplicate business rules in frontend code:
- Status transitions for vehicles and drivers are handled automatically via triggers when inserting or updating `trips` or `maintenance_logs`.
- Cargo capacity, driver license expiry, and suspended status checks are validated via database constraints and triggers.

## 3. Database Access Methods
- NEVER create a new Supabase client. Always use `useSupabase()` from `src/auth/supabase.js`.
- NEVER query the database directly in components (do not use `supabase.from(...)`).
- ALWAYS call the centralized CRUD helpers from `src/services/database.js`:
  - `database.list()`
  - `database.getById()`
  - `database.create()`
  - `database.update()`
  - `database.deleteRecord()`
