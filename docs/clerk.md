# Add Clerk Authentication

Set up Clerk authentication by following the official quickstart for this project's framework.

---

# Before You Start

Before generating or modifying authentication code:

1. Read `package.json` and determine the installed Clerk package and version.
2. Read the project's local authentication architecture.
3. Read this document completely.
4. Read any Clerk-related documentation inside the `docs/` folder.
5. Do not assume Clerk APIs from memory or older tutorials.
6. Never replace working authentication code with examples from a different SDK version.

Project documentation always takes precedence over remembered examples.

---

## Step 1: Detect the framework

Read `package.json` and match against this table:

| Dependency | Quickstart |
|------------|-----------|
| `next` | https://clerk.com/docs/nextjs/getting-started/quickstart.md |
| `@remix-run/react` | https://clerk.com/docs/remix/getting-started/quickstart.md |
| `astro` | https://clerk.com/docs/astro/getting-started/quickstart.md |
| `nuxt` | https://clerk.com/docs/nuxt/getting-started/quickstart.md |
| `react-router` | https://clerk.com/docs/react-router/getting-started/quickstart.md |
| `@tanstack/react-start` | https://clerk.com/docs/tanstack-react-start/getting-started/quickstart.md |
| `react` (no framework) | https://clerk.com/docs/react/getting-started/quickstart.md |
| `vue` | https://clerk.com/docs/vue/getting-started/quickstart.md |
| `express` | https://clerk.com/docs/expressjs/getting-started/quickstart.md |
| `fastify` | https://clerk.com/docs/fastify/getting-started/quickstart.md |
| `expo` | https://clerk.com/docs/expo/getting-started/quickstart.md |

Other: Chrome Extension, Android, iOS, Vanilla JS at https://clerk.com/docs/llms.txt

---

## Step 2: Fetch and follow the quickstart

Read the quickstart URL from the table above and follow every step:

1. Install the SDK package
2. Add the provider/middleware
3. Create sign-in/sign-up routes if needed
4. Test the integration

Always prefer the official Clerk documentation over community tutorials.

---

## Step 3: API Keys

**Next.js only:** Use Keyless mode (default). No manual key setup needed. Clerk auto-generates development keys on first run and shows a "Claim your application" banner.

**All other frameworks:** Get your API keys from https://dashboard.clerk.com and set them as environment variables.

---

## Step 4: If using shadcn/ui

If `components.json` exists in the project root:

```bash
npm install @clerk/ui
```

Apply the theme in your provider:

```tsx
import { shadcn } from '@clerk/ui/themes'

<ClerkProvider appearance={{ theme: shadcn }}>
  {children}
</ClerkProvider>
```

Add to global CSS:

```css
@import '@clerk/ui/themes/shadcn.css';
```

---

# Clerk + Supabase Integration

If this project uses Supabase:

- Use Clerk JWT Templates for authentication.
- Create authenticated Supabase clients using the project's existing authentication architecture.
- Do not create duplicate Supabase clients.
- Do not bypass the project's authentication flow.
- Do not hardcode JWT template names if they are already configured through environment variables.

---

# Project Architecture

Respect the project's existing architecture.

Authentication belongs inside:

```
src/auth/
```

Database operations belong inside:

```
src/services/database.js
```

Pages should obtain an authenticated Supabase client using the project's existing hook (for example `useSupabase()`) and pass that client into the database service.

Never:

- call React hooks inside services
- import Clerk inside services
- create additional authentication layers
- duplicate authentication helpers

Always reuse the existing architecture.

---

## Critical Rules

- Verify the installed Clerk version before generating code.
- Never assume APIs from memory.
- Prefer local project documentation over remembered examples.
- Use official Clerk documentation whenever possible.
- Next.js 15+: `auth()` is async. Always `await auth()`.
- `ClerkProvider` goes inside `<body>`, not wrapping `<html>`.
- Never expose `CLERK_SECRET_KEY` in client code.
- Use `@clerk/nextjs`, not `@clerk/clerk-react` (for Next.js projects).
- Do not replace working authentication code with examples from another Clerk SDK version.

---

Full documentation:

https://clerk.com/docs/llms.txt
