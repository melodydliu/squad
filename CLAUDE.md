# Squad - Claude Code Guide

## Project Overview

Squad is a mobile-first freelance crew management platform for creative studios. It connects **studios** (admins) with **freelance designers** for event coordination, design review, and inventory management. Starting with floral design studios, built to scale to other creative industries.

Built with React + TypeScript + Next.js 15 (App Router), backed by Supabase (PostgreSQL, Auth, Storage).

## Quick Reference

```bash
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Production build
npm start          # Start production server
npm test           # Run tests (single run)
npm run test:watch # Run tests in watch mode
npm run lint       # Next.js lint
```

## Architecture

- **Framework**: Next.js 15 App Router (React 18)
- **Styling**: Tailwind CSS 3 with custom theme (sage/blush/warm palette)
- **UI Components**: shadcn/ui (Radix primitives) in `src/components/ui/`
- **State/Data**: TanStack React Query v5 + Supabase client
- **Routing**: Next.js App Router (file-based routing in `src/app/`)
- **Forms**: React Hook Form + Zod
- **Auth**: Supabase Auth via `@supabase/ssr` + middleware + `src/hooks/useAuth.tsx`
- **Path alias**: `@/*` maps to `./src/*`

### Key Directories

```
src/
├── app/                  # Next.js App Router (file-based routing)
│   ├── layout.tsx        # Root layout (html/body shell, Providers)
│   ├── providers.tsx     # Client providers (QueryClient, Auth, Toaster)
│   ├── globals.css       # Tailwind + theme CSS variables
│   ├── not-found.tsx     # 404 page
│   ├── (auth)/           # Public auth routes (login, signup, forgot/reset password)
│   └── (protected)/      # Protected routes (admin, freelancer, project, etc.)
│       └── layout.tsx    # Auth guard layout
├── views/            # Page components (imported by app/ wrappers, renamed from pages/)
├── components/       # Shared components (all "use client")
│   ├── ui/           # shadcn/ui primitives (don't edit directly unless needed)
│   └── inventory/    # Inventory-specific components
├── hooks/            # Custom hooks (auth, data fetching, utilities)
├── integrations/     # Supabase client, server, middleware helpers & auto-generated types
├── data/             # Types and helper functions
└── lib/              # Utilities (cn helper)

middleware.ts         # Next.js middleware (Supabase session refresh + route guards)
```

### Database (Supabase)

- Hosted PostgreSQL with Row Level Security on all tables
- Migrations in `supabase/migrations/`
- Auto-generated types in `src/integrations/supabase/types.ts`
- Key tables: projects, project_assignments, freelancer_responses, floral_items, floral_item_designs, flower_inventory, hard_good_inventory, notifications
- New users auto-assigned `freelancer` role; admins promoted manually

### Auth Flow

- `@supabase/ssr` handles cookie-based session management
- `middleware.ts` refreshes sessions and enforces route-level access control
- `useAuth()` hook provides session, user, role, loading state (client-side)
- Two roles: `admin` and `freelancer` with separate dashboards
- Protected routes redirect unauthenticated users to login (middleware + client layout)
- Public routes redirect authenticated users to their dashboard

### Supabase Client Setup

- **Browser client**: `src/integrations/supabase/client.ts` — uses `createBrowserClient` from `@supabase/ssr`
- **Server client**: `src/integrations/supabase/server.ts` — uses `createServerClient` with `cookies()` for server components/API routes
- **Middleware helper**: `src/integrations/supabase/middleware.ts` — `updateSession()` for session refresh in middleware

## Development Conventions

### Code Style

- TypeScript strict mode
- All page/component/hook files use `"use client"` directive
- Tailwind CSS for all styling — preserve the existing custom theme (sage, blush, warm colors, Plus Jakarta Sans + DM Sans fonts)
- Use existing shadcn/ui components before creating custom ones
- Mobile-first design (max-width 512px layout)
- Gradual refactoring is OK when touching existing code, but don't refactor code unrelated to the current task

### Commits

- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- Keep commits focused and atomic

### Testing

- Test critical business logic, hooks, and utility functions
- Use Vitest + Testing Library
- Test files go in `src/test/` or colocated with the module

### Package Manager

- Use **npm** (package-lock.json is the source of truth)

## Things to Watch Out For

- The `.env.local` file contains Supabase credentials — it's in `.gitignore`, don't commit it
- Environment variables use `NEXT_PUBLIC_` prefix (not `VITE_`)
- The `src/integrations/supabase/types.ts` file is auto-generated — regenerate rather than hand-edit
- The `src/components/ui/` directory contains shadcn/ui components — modify sparingly
- Dev server runs on port **8080** (configured in package.json scripts)
- The `src/app/` directory contains thin page wrappers that import from `src/views/`
- `src/views/` was renamed from `pages/` to avoid conflict with Next.js Pages Router auto-detection
