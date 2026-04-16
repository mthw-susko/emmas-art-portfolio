---
name: add-component
description: Creates a new React component following this project's patterns: 'use client' directive, framer-motion animations, Tailwind styling, TypeScript interface for props, optional isAdmin prop pattern. Use when user says 'add component', 'new component', 'create widget', or adds files to src/components/. Do NOT use for pages (src/app/), API routes (src/app/api/), hooks (src/lib/hooks/), or type definitions (src/types/).
---
# Add Component

## Critical

- Every component lives in `src/components/` as a single file named `PascalCase.tsx`.
- Every component that uses hooks, event handlers, or browser APIs MUST start with `'use client';` on line 1. The only exception is purely presentational components with zero interactivity (like `LoadingSpinner` which only uses framer-motion — but even it could need `'use client'` depending on usage context). When in doubt, add `'use client'`.
- Use `export default function ComponentName` — not arrow functions, not named exports. Every existing component in this project uses this pattern.
- All props are defined via a TypeScript `interface` named `{ComponentName}Props` directly above the component function. Never use inline types.
- Import paths use the `@/*` alias (maps to `./src/*`). Example: `import { Artwork } from '@/types';`
- Types shared across components belong in `src/types/index.ts`. Component-specific prop interfaces stay in the component file.

## Instructions

### Step 1: Create the component file

Create `src/components/{ComponentName}.tsx`. Follow this exact structure:

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface {ComponentName}Props {
  // required props first
  // optional props after, with defaults
  isAdmin?: boolean;
}

export default function {ComponentName}({ isAdmin = false }: {ComponentName}Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* component content */}

      {isAdmin && (
        <div className="...">
          {/* admin-only controls */}
        </div>
      )}
    </motion.div>
  );
}
```

**Verify:** File exists at `src/components/{ComponentName}.tsx`, starts with `'use client';`, uses `export default function`.

### Step 2: Define the props interface

Follow these conventions extracted from existing components:

- `isAdmin?: boolean` with default `false` — used in `SkillBar`, `ArtworkCard` for conditional admin controls
- Admin callbacks use optional chaining pattern: `onEdit?: (item: Type) => void` then called as `onEdit?.(item)`
- Async callbacks for destructive actions: `onConfirm?: () => Promise<void>` (see `DeleteConfirmModal`)
- Index prop for staggered animations: `index: number` then `delay: index * 0.1` (see `ArtworkCard`)
- Size variants use union types: `size?: 'sm' | 'md' | 'lg'` with lookup objects (see `LoadingSpinner`)

**Verify:** Props interface is named `{ComponentName}Props`. All optional props have defaults in destructuring.

### Step 3: Add framer-motion animations

Use the project's established animation patterns:

| Pattern | Code | Used in |
|---------|------|---------|
| Fade up on mount | `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}` | `ContactForm`, `ArtworkCard` |
| Staggered children | `transition={{ duration: 0.5, delay: index * 0.1 }}` | `ArtworkCard` |
| Hover scale | `whileHover={{ scale: 1.02 }}` or `whileHover={{ scale: 1.05 }}` | `ArtworkCard`, `Header` |
| Tap scale | `whileTap={{ scale: 0.95 }}` | `Header` |
| Animated bar/progress | `initial={{ width: 0 }} animate={{ width: '...' }} transition={{ duration: 1, delay: 0.2 }}` | `SkillBar` |
| Enter/exit (modals) | Wrap in `<AnimatePresence>`, use `initial`, `animate`, `exit` props | `Header` login modal |
| Fade in text | `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}` | `LoadingSpinner`, `ContactForm` status |

Import `AnimatePresence` from `framer-motion` only if the component has elements that mount/unmount with exit animations.

**Verify:** At least one `motion.*` element exists. Animation values match the patterns above.

### Step 4: Apply Tailwind styling

Follow the project's Tailwind conventions:

- **Text colors:** `text-gray-500` (body), `text-gray-700` (inputs/secondary), `text-gray-900` (headings), `text-blue-500`/`text-blue-600` (accents/links), `text-red-600` (errors/delete)
- **Backgrounds:** `bg-white` (cards/modals), `bg-blue-500` (primary buttons), `bg-gray-200`/`bg-gray-300` (secondary buttons), `bg-red-600` (danger buttons)
- **Buttons:** `px-4 py-2 rounded-md` or `rounded-lg`. Hover states use darker shade: `hover:bg-blue-600`. Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- **Inputs:** `w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white shadow-sm`
- **Modals:** `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4` for overlay, `bg-white rounded-lg shadow-xl max-w-md w-full p-6` for content
- **Admin controls:** Appear on hover with `opacity-0 group-hover:opacity-100 transition-opacity duration-200`. Use `group` on parent.
- **SVG icons:** Inline SVGs, `className="w-4 h-4"`, `fill="none" stroke="currentColor" viewBox="0 0 24 24"` with strokeLinecap/strokeLinejoin/strokeWidth
- **Spacing:** `space-x-2` for inline items, `space-y-4` for form fields, `mb-4` for section spacing
- **Transitions:** `transition-colors duration-200` on interactive elements

**Verify:** No custom CSS. All styling uses Tailwind utility classes matching the patterns above.

### Step 5: Wire up admin behavior (if applicable)

The `isAdmin` pattern in this project:

1. Component receives `isAdmin?: boolean` prop (default `false`)
2. Admin-only UI is conditionally rendered: `{isAdmin && (<div>...</div>)}`
3. Admin callbacks are optional props: `onEdit?: (item: Type) => void`
4. Parent page gets admin state from `useAuth()` hook: `const { user } = useAuth();` then passes `isAdmin={!!user}`
5. Admin controls use hover-reveal pattern on cards (see `ArtworkCard` lines 99-128)
6. Destructive actions show a confirmation modal before executing

Do NOT import `useAuth` directly in the component — receive `isAdmin` as a prop instead. Only pages import `useAuth`.

**Verify:** `useAuth` is NOT imported in the component file. Admin UI only renders when `isAdmin` is truthy.

### Step 6: Add shared types (if needed)

If the component introduces a new data shape used by multiple components, add the interface to `src/types/index.ts`:

```typescript
export interface NewType {
  id: string;
  // fields...
}
```

Follow existing conventions: `id: string` first, optional fields use `?`, dates use `Date` type.

**Verify:** New types are exported from `src/types/index.ts`. Component imports them via `import { NewType } from '@/types';`.

### Step 7: Verify the build

Run `npm run build` to check for TypeScript errors and build issues.

**Verify:** Build completes with no errors.

## Examples

### Example: Add a TestimonialCard component

**User says:** "Add a testimonial card component with client name, quote, and admin delete"

**Actions:**

1. Create `src/components/TestimonialCard.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  clientName: string;
  quote: string;
  index: number;
  isAdmin?: boolean;
  onDelete?: (clientName: string) => void;
}

export default function TestimonialCard({
  clientName,
  quote,
  index,
  isAdmin = false,
  onDelete,
}: TestimonialCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete?.(clientName);
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <p className="text-gray-700 italic mb-4">&ldquo;{quote}&rdquo;</p>
      <p className="text-sm font-medium text-gray-500">{clientName}</p>

      {isAdmin && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:scale-110 transition-transform"
            title="Delete testimonial"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Testimonial</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this testimonial from &ldquo;{clientName}&rdquo;?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
```

2. Run `npm run build` — no errors.

**Result:** Component follows all project patterns — `'use client'`, default export function, framer-motion fade-up with stagger, Tailwind classes matching existing palette, hover-reveal admin controls, inline delete confirmation modal.

## Common Issues

**Error: `"use client" must be at the top of the file`**
The `'use client';` directive must be the very first line. No imports, comments, or blank lines before it.

**Error: `Cannot find module '@/types'`**
The `@/*` path alias maps to `./src/*`. Verify `tsconfig.json` has `"@/*": ["./src/*"]` in `compilerOptions.paths`.

**Error: `motion is not exported from 'framer-motion'`**
This project uses `framer-motion` (not `motion` from `framer-motion/m`). Import as: `import { motion } from 'framer-motion';`. For enter/exit animations, also import `AnimatePresence`.

**Admin controls not showing:**
1. Verify the parent passes `isAdmin={!!user}` (not `isAdmin={user}` — `user` is an object, not boolean)
2. Verify the component destructures with default: `isAdmin = false`
3. Check the conditional render uses `{isAdmin && (...)}` not `{isAdmin ? (...) : null}`

**Hover-reveal admin buttons not appearing:**
The parent element needs `className="group relative"` and the admin controls div needs `opacity-0 group-hover:opacity-100 transition-opacity duration-200`. Missing `group` on the parent is the most common cause.

**Animation not playing:**
If `initial` and `animate` are set but nothing animates, check that you're using `motion.div` (not plain `div`). Also check that the component is mounted (not conditionally rendered with a falsy value on first render).

**Build error: `Type 'X' is not assignable to type 'Y'`**
Callback props must match exactly. Use `() => Promise<void>` for async callbacks (like delete confirmations), `() => void` for sync. Check existing components for the correct signature.