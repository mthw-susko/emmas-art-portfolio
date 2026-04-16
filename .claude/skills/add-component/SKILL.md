---
name: add-component
description: Creates a new React component following this project's patterns: 'use client' directive, framer-motion animations, Tailwind styling, typed props interface, and optional isAdmin prop for admin-gated UI. Use when user says 'add component', 'new component', 'create widget', or adds files to src/components/. Do NOT use for pages (src/app/), API routes (src/app/api/), hooks (src/lib/hooks/), or type definitions (src/types/).
paths:
  - src/components/**/*.tsx
---
# Add Component

## Critical

- ALL components go in `src/components/`. Never create component files elsewhere.
- ALL components use `export default function ComponentName`. No arrow-function exports, no named exports.
- Components that use React hooks, browser APIs, or event handlers MUST start with `'use client';` as the first line. Components that only render static markup from props (like `src/components/LoadingSpinner.tsx`) may omit it — but when in doubt, include it.
- Import types from `@/types` using the `@/*` path alias. Never use relative paths to `src/`.
- Props interface is always named `ComponentNameProps` and defined directly above the component in the same file.
- The `isAdmin` prop pattern: `isAdmin?: boolean` with default `false`. Admin UI is conditionally rendered with `{isAdmin && (...)}` blocks inside the JSX.

## Instructions

### Step 1: Define the props interface

Create a TypeScript interface named `ComponentNameProps` with all required and optional props. Follow these conventions from existing components:

- Callback props use `on` prefix: `onEdit`, `onDelete`, `onSubmit`, `onCancel`, `onClose`, `onConfirm`
- Callback props that involve async operations return `Promise<void>`: `onConfirm: () => Promise<void>`
- Boolean props default to `false`: `isAdmin?: boolean`, `isDraggable?: boolean`
- Size/variant props use union types: `size?: 'sm' | 'md' | 'lg'`
- If the component uses a project type (Artwork, Skill, etc.), import it: `import { Artwork } from '@/types';`

Verify: Interface compiles with `npx tsc --noEmit` before proceeding.

### Step 2: Create the component file

Create a new file in `src/components/` following this exact structure (matching `src/components/ArtworkCard.tsx` and `src/components/SkillBar.tsx`):

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ComponentNameProps {
  // props here
  isAdmin?: boolean;
}

export default function ComponentName({ isAdmin = false, ...otherProps }: ComponentNameProps) {
  // component body
}
```

Key patterns from the codebase:
- `useState` for local UI state (editing, loading, confirmations)
- `motion.div` as the outermost animated wrapper
- Destructure all props in the function signature with defaults

Verify: File exists in `src/components/` and contains `export default function`.

### Step 3: Add framer-motion animations

Use the animation patterns established in this project:

**Fade-in with slide up** (most common — used by `src/components/ArtworkCard.tsx`, `src/components/ContactForm.tsx`, `src/components/AddSkillForm.tsx`):
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

**Fade-in with slide up and stagger** (for items in a list — used by `src/components/ArtworkCard.tsx`):
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>
```

**Collapse/expand** (for forms that appear/disappear — used by `src/components/AddSkillForm.tsx`):
```tsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
>
```

**Simple fade** (for status messages — used by `src/components/ContactForm.tsx`, `src/components/LoadingSpinner.tsx`):
```tsx
<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.2 }}
>
```

**Animated bar/progress** (used by `src/components/SkillBar.tsx`):
```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${value}%` }}
  transition={{ duration: 1, delay: 0.2 }}
/>
```

**Hover scale** (interactive cards — used by `src/components/ArtworkCard.tsx`):
```tsx
whileHover={{ scale: 1.02 }}
```

Verify: Component renders with visible animation when mounted.

### Step 4: Apply Tailwind styling

Follow these project conventions from existing components:

**Text colors** (from Tailwind config custom theme):
- Headings: `text-gray-900` with `font-bold` and `text-2xl` or `text-lg`
- Body: `text-gray-600`
- Labels and secondary text: `text-gray-500` with `text-sm font-medium`
- Error text: `text-red-600 text-sm`
- Success text: `text-green-600 text-sm`
- Accent and link text: `text-blue-500` or `text-blue-600`
- Input and secondary element text: `text-gray-700`

**Backgrounds:**
- Cards and modals: `bg-white`
- Primary buttons: `bg-blue-600`
- Danger buttons: `bg-red-600`
- Cancel/secondary buttons: `bg-gray-300`

**Buttons:**
- Primary: `bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700`
- Danger: `bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700`
- Cancel/secondary: `bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400`
- Outline: `border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

**Inputs:**
- Standard: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`
- Fancy: `border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white shadow-sm`

**Admin icon buttons** (small circular action buttons, see `src/components/ArtworkCard.tsx`):
```tsx
<button className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 hover:scale-110 transition-transform">
  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {/* path */}
  </svg>
</button>
```

**Modals** (overlay pattern from `src/components/DeleteConfirmModal.tsx`):
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
    {/* content */}
  </div>
</div>
```

**Spacing:** `space-y-4` for form fields, `space-x-2` or `gap-3` for button groups, `mb-4` between sections.

Verify: Component renders with correct colors and spacing matching adjacent components.

### Step 5: Add admin-gated UI (if applicable)

If the component has admin functionality:

1. Add `isAdmin?: boolean` to props with default `false`
2. Add admin callback props as optional: `onEdit?: (item: Type) => void`
3. Guard admin callbacks with `&&`: `onEdit?.(item)` or `if (isAdmin && onUpdate) { onUpdate(...) }`
4. Render admin controls conditionally:

```tsx
{isAdmin && (
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    {/* edit/delete buttons */}
  </div>
)}
```

The hover-reveal pattern (`opacity-0 group-hover:opacity-100`) requires `group` class on a parent element and `className="group"` on the card container.

Verify: Admin controls only appear when `isAdmin={true}` is passed.

### Step 6: Verify the component

```bash
npm run lint
```

```bash
npm run build
```

If the component is used in a page, run `npm run dev` and check the browser.

## Examples

**User says:** "Add a testimonial card component"

**Actions taken:**
1. Create `src/components/TestimonialCard.tsx`
2. Define `TestimonialCardProps` with `quote: string`, `author: string`, `isAdmin?: boolean`, `onDelete?: () => void`
3. Use `motion.div` with `initial={{ opacity: 0, y: 20 }}` fade-in
4. Style with `text-gray-600` for quote, `text-gray-900 font-semibold` for author
5. Add admin delete button with hover-reveal pattern

**Result:**
```tsx
'use client';

import { motion } from 'framer-motion';

interface TestimonialCardProps {
  quote: string;
  author: string;
  index?: number;
  isAdmin?: boolean;
  onDelete?: () => void;
}

export default function TestimonialCard({ quote, author, index = 0, isAdmin = false, onDelete }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-white rounded-lg shadow-sm p-6"
    >
      <p className="text-gray-600 italic mb-4">&ldquo;{quote}&rdquo;</p>
      <p className="text-gray-900 font-semibold text-sm">{author}</p>

      {isAdmin && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onDelete?.()}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:scale-110 transition-transform"
            title="Delete testimonial"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}
```

## Common Issues

**Error: `'use client'` must be at the top of the file**
The `'use client';` directive must be the very first line — no imports, no comments before it. Blank lines after it are fine.

**Error: `Cannot find module '@/types'`**
The path alias `@/*` maps to `./src/*` via `tsconfig.json`. If you get this error, check that `tsconfig.json` has `"@/*": ["./src/*"]` in `compilerOptions.paths`.

**Error: `motion is not defined` or `framer-motion` import issues**
Import from `framer-motion`, not `motion/react` or other paths: `import { motion } from 'framer-motion';`

**Admin controls visible without `isAdmin`**
Ensure the default is `false`: `isAdmin = false` in destructuring. Never default to `true`.

**Animation not visible**
If wrapping `motion.div` inside another div, the outer div may clip overflow. Add `overflow-visible` or remove the wrapper. Also confirm `initial` differs from `animate` — identical values produce no animation.

**Smart quotes (`\u201C`) cause JSX parse errors**
Use HTML entities for curly quotes: `&ldquo;` and `&rdquo;` instead of literal `\u201C` and `\u201D`. This project uses this pattern consistently (see `src/components/DeleteConfirmModal.tsx`, `src/components/SkillBar.tsx`).

**Component not re-rendering on Firestore updates**
Components don't subscribe to Firestore directly — parent pages use `onSnapshot` and pass data as props. If your component needs live data, the parent page should manage the listener and pass updated props down.
