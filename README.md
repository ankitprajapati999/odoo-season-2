# Odoo Hackathon Season 2

A full-stack web application built for the Odoo Hackathon using modern web technologies with secure authentication and Row Level Security.

---

## Tech Stack

### Frontend

- React
- Vite

### Authentication

- Clerk

### Database

- Supabase
- PostgreSQL
- Row Level Security (RLS)

---

## Project Structure

```
src
├── auth
│   └── supabase.js
│
├── services
│   └── database.js
│
├── components
├── pages
├── layouts
├── hooks
├── contexts
└── utils
```

---

## Authentication Flow

```
React Page
      │
      ▼
useSupabase()
      │
      ▼
Authenticated Supabase Client
      │
      ▼
database.js
      │
      ▼
Supabase
      │
      ▼
PostgreSQL + RLS
```

---

## Development

```bash
npm install
npm run dev
```

---

## Environment Variables

```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_CLERK_JWT_TEMPLATE=
```

---

## Notes

- Clerk handles authentication.
- Supabase handles the database and storage.
- PostgreSQL Row Level Security protects user data.
- Database access should always go through `services/database.js`.
- Authenticated Supabase clients should always be created using `auth/supabase.js`.

---

Built for Odoo Hackathon Season 2 🚀
