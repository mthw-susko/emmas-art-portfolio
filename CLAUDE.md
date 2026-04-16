# CLAUDE.md

Artist portfolio for Emma Fleming — Next.js 15 + Firebase + Resend.

## Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build (Turbopack)
npm run lint         # ESLint
npm start            # serve production build
```

```bash
npx tsc --noEmit     # type-check without emitting
```

```bash
npx next info        # print environment debug info
```

No test suite configured.

## Architecture

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Firebase (Auth, Firestore, Storage) · Resend · `react-masonry-css` · `@dnd-kit` · `react-hook-form`

**Path alias**: `@/*` → `./src/*` (configured in `tsconfig.json`)

**Pages** (`src/app/`):
- `src/app/page.tsx` — homepage with masonry artwork grid, admin upload button
- `src/app/about/page.tsx` — bio, skills, clients, contact form, portrait photo
- `src/app/artwork/[id]/page.tsx` — individual artwork detail + "More Works" grid
- `src/app/admin/page.tsx` — dashboard with artworks/about tabs (auth-gated)
- `src/app/layout.tsx` — root layout, imports `Header` and `globals.css`

**API**: `src/app/api/contact/route.ts` — POST sends notification + confirmation emails via `Resend`

**Components** (`src/components/`):
- `src/components/Header.tsx` — nav + secret admin login (triple-click artist name)
- `src/components/ArtworkGrid.tsx` — masonry grid with `@dnd-kit` drag-and-drop reorder
- `src/components/ArtworkCard.tsx` — card with `useSortable`, links to `/artwork/[id]`
- `src/components/ArtworkUploadModal.tsx` — upload/edit artwork modal, Firebase Storage
- `src/components/DeleteConfirmModal.tsx` — confirmation dialog for artwork deletion
- `src/components/ContactForm.tsx` — `react-hook-form` form, POSTs to `/api/contact`
- `src/components/SkillBar.tsx` — animated skill bar, inline edit/delete for admins
- `src/components/AddSkillForm.tsx` — form to add new skill with percentage slider
- `src/components/PortraitUpload.tsx` — portrait image upload to Firebase Storage
- `src/components/LoadingSpinner.tsx` — framer-motion spinner with optional text

**Lib** (`src/lib/`):
- `src/lib/firebase.ts` — exports `auth`, `db`, `storage` from Firebase SDK
- `src/lib/hooks/useAuth.ts` — `useAuth()` hook: `user`, `loading`, `login`, `logout`

**Types**: `src/types/index.ts` — `Artwork`, `AboutContent`, `Skill`, `ContactFormData`, `User`

## Data Flow

- All data in Firestore. Components use `onSnapshot` for real-time listeners.
- **Artworks**: `artworks` collection, ordered by `order` field. Drag-and-drop reorder persisted via `writeBatch`.
- **About**: single doc `about/content` — `bio`, `email`, `instagram`, `skills`, `clients`, `portraitUrl`.
- About page uses `savingRef` to prevent Firestore snapshots from overwriting in-progress edits.
- Images stored in Firebase Storage, URLs saved to Firestore docs.

## Admin Auth

- `useAuth()` hook gates admin features. When `user` is truthy, inline edit controls appear on public pages.
- Secret login: triple-click "Emma" in `src/components/Header.tsx`.
- `/admin` redirects to `/` if not authenticated.
- Per-section visibility toggles (eye icon) on about page via `SectionWrapper`.

## Styling

- Tailwind CSS v4, config in `tailwind.config.ts`
- Custom colors: `background`, `foreground`, `text-light`, `text-medium`, `text-dark`, `accent-blue`, `accent-light-blue`, `border-light`, `border-medium`
- Fonts: `Dancing Script` (script), `Inter` (sans) imported in `src/app/globals.css`
- Animations: `framer-motion` — `motion.div` with `initial`/`animate`/`transition` pattern
- Custom scrollbar styles in `src/app/globals.css`

## Images

- `next/image` with `remotePatterns` in `next.config.ts` allowing `firebasestorage.googleapis.com` and `*.firebasestorage.app`
- Static assets in `public/`: `emma-fleming.png`, SVG icons

## Environment Variables

Firebase: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` — fallbacks in `src/lib/firebase.ts`

Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`

## Conventions

- All pages are `'use client'` — no server components currently
- Firestore mutations: optimistic local state update, then `updateDoc`/`writeBatch`, rollback on error
- Components accept `isAdmin` prop to conditionally render edit controls
- `onSnapshot` listeners cleaned up in `useEffect` return

<!-- caliber:managed:pre-commit -->
## Before Committing

**IMPORTANT:** Before every git commit, you MUST ensure Caliber syncs agent configs with the latest code changes.

First, check if the pre-commit hook is already installed:
```bash
grep -q "caliber" .git/hooks/pre-commit 2>/dev/null && echo "hook-active" || echo "no-hook"
```

- If **hook-active**: the hook handles sync automatically — just commit normally. Tell the user: "Caliber will sync your agent configs automatically via the pre-commit hook."
- If **no-hook**: run Caliber manually before committing:
  1. Tell the user: "Caliber: Syncing agent configs with your latest changes..."
  2. Run: `/opt/homebrew/bin/caliber refresh && git add CLAUDE.md .claude/ .cursor/ .cursorrules .github/copilot-instructions.md .github/instructions/ AGENTS.md CALIBER_LEARNINGS.md .agents/ .opencode/ 2>/dev/null`
  3. After it completes, briefly tell the user what Caliber updated. Then proceed with the commit.

If `/opt/homebrew/bin/caliber` is not found, tell the user: "This project uses Caliber for agent config sync. Run /setup-caliber to get set up."
<!-- /caliber:managed:pre-commit -->

<!-- caliber:managed:learnings -->
## Session Learnings

Read `CALIBER_LEARNINGS.md` for patterns and anti-patterns learned from previous sessions.
These are auto-extracted from real tool usage — treat them as project-specific rules.
<!-- /caliber:managed:learnings -->

<!-- caliber:managed:sync -->
## Context Sync

This project uses [Caliber](https://github.com/caliber-ai-org/ai-setup) to keep AI agent configs in sync across Claude Code, Cursor, Copilot, and Codex.
Configs update automatically before each commit via `/opt/homebrew/bin/caliber refresh`.
If the pre-commit hook is not set up, run `/setup-caliber` to configure everything automatically.
<!-- /caliber:managed:sync -->
