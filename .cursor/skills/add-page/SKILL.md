---
name: add-page
description: Creates a new Next.js App Router page following the project's 'use client' + framer-motion + Firestore onSnapshot pattern. Use when user says 'add page', 'new page', 'create route', or adds files to src/app/. Do NOT use for API routes (src/app/api/).
---
# Add Page

## Critical

- Every page in this project is a **client component** — always start with `'use client';`
- All data comes from **Firestore `onSnapshot` real-time listeners** — never use `getDoc`/`getDocs` for page data
- Always **clean up listeners** in the `useEffect` return function (`return () => unsubscribe();`)
- Import paths use the `@/*` alias (maps to `./src/*`) — never use relative paths like `../../`
- If the page needs admin features, gate them with `useAuth()` — when `user` is truthy, show edit controls
- Do NOT create API routes with this skill — those use a different pattern (server-side, no `'use client'`)

## Instructions

### Step 1: Create the route directory and page file

Create `src/app/<route-name>/page.tsx`. For dynamic routes, use `src/app/<route-name>/[param]/page.tsx`.

Naming: directories are kebab-case, the file is always `page.tsx`.

Verify: The parent directory exists under `src/app/`. If creating a nested route, ensure intermediate directories exist.

### Step 2: Write the page boilerplate

Follow this exact structure — it matches every existing page in the project:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
// OR for collections:
// import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
// Import types from @/types

export default function PageName() {
  const [data, setData] = useState<YourType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Single document:
    const docRef = doc(db, 'collection', 'docId');
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setData(doc.data() as YourType);
      }
      setLoading(false);
    });

    // OR collection:
    // const q = query(collection(db, 'items'), orderBy('order'));
    // const unsubscribe = onSnapshot(q, (snapshot) => {
    //   const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as YourType[];
    //   setData(items);
    //   setLoading(false);
    // });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Content not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page content here */}
      </motion.div>
    </div>
  );
}
```

Verify: File starts with `'use client';`. `useEffect` has a cleanup return. Loading and empty states both handled.

### Step 3: Add the type definition

If the page needs a new data type, add it to `src/types/index.ts`. Follow the existing pattern:

```tsx
export interface NewType {
  id: string;
  // fields matching your Firestore document
}
```

Existing types: `Artwork`, `AboutContent`, `Skill`, `ContactFormData`, `User`.

Verify: The type is exported from `src/types/index.ts` and imported in the page via `import { NewType } from '@/types';`

### Step 4: Add framer-motion animations

This project uses `motion.div` wrappers for entrance animations. Patterns used in existing pages:

```tsx
// Fade up (most common — used for main content sections)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

// Slide from left (used for side content like portraits)
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6 }}
>

// Staggered sections — increment delay by 0.2 or 0.3
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.3 }}
>
```

Verify: `framer-motion` is imported as `import { motion } from 'framer-motion';`. At least one `motion.div` wrapper exists in the return JSX.

### Step 5: Add admin editing (if applicable)

If the page has editable content, follow the about page pattern:

1. Get `user` from `useAuth()` — already done in Step 2
2. Gate edit controls with `{user && (...)}`
3. For inline text editing, use local state + `savingRef` to prevent Firestore snapshots from overwriting in-progress edits:

```tsx
const savingRef = useRef({ fieldName: false });

// In the onSnapshot callback:
if (!editingField && !savingRef.current.fieldName) {
  setLocalField(data.fieldName);
}

// On blur/save:
const handleFieldBlur = async () => {
  savingRef.current.fieldName = true;
  try {
    await updateDoc(doc(db, 'collection', 'docId'), { fieldName: localField });
  } catch (error) {
    console.error('Error updating field:', error);
  } finally {
    savingRef.current.fieldName = false;
  }
};
```

4. Firestore writes use `updateDoc` for partial updates, `setDoc` for full document creation.

Verify: Admin controls only render when `user` is truthy. Firestore writes are wrapped in try/catch with `console.error`.

### Step 6: Add navigation link in Header

If the page should appear in the nav, update `src/components/Header.tsx` to add a `Link` to the new route. The header uses Next.js `Link` from `next/link`.

Verify: Run `npm run dev` and confirm the page loads at the expected URL. Check that the loading spinner appears briefly, then content renders.

### Step 7: Handle dynamic route params (if applicable)

For `[param]` routes, follow the artwork detail page pattern — Next.js 15 passes `params` as a Promise:

```tsx
import { use } from 'react';

interface PageProps {
  params: Promise<{ paramName: string }>;
}

export default function PageName({ params }: PageProps) {
  const { paramName } = use(params);
  // Use paramName in useEffect dependency array and Firestore queries
}
```

Verify: The `params` type uses `Promise<>`. The `use()` hook unwraps it. The param is in the `useEffect` dependency array.

## Examples

**User says:** "Add a commissions page that shows pricing tiers from Firestore"

**Actions taken:**
1. Create `src/app/commissions/page.tsx`
2. Add `CommissionTier` type to `src/types/index.ts`
3. Write page with `'use client'`, `onSnapshot` listener on `commissions` collection, `LoadingSpinner` for loading state, `motion.div` fade-up animations
4. Admin gate: `{user && <button>+ Add Tier</button>}`
5. Add "Commissions" link in `Header.tsx`
6. Run `npm run dev`, navigate to `/commissions`, confirm it loads

**Result:** `/commissions` page with real-time Firestore data, entrance animations, admin edit controls, consistent layout (`max-w-6xl mx-auto px-4 py-8`).

## Common Issues

**"FirebaseError: Missing or insufficient permissions"**
1. Check Firestore security rules allow reads on the collection you're querying
2. For admin writes, ensure the user is authenticated before calling `updateDoc`

**Page shows loading spinner forever**
1. Verify the Firestore collection/document path is correct (typo in collection name)
2. Check that `setLoading(false)` is called inside the `onSnapshot` callback, not outside it
3. Open browser devtools Network tab — if no Firestore requests appear, `db` may not be initialized (check `.env.local` for `NEXT_PUBLIC_FIREBASE_*` vars)

**"Text content does not match server-rendered HTML" hydration error**
1. Ensure the file has `'use client';` as the very first line (no comments or blank lines before it)
2. Do not use `Date.now()`, `Math.random()`, or browser-only APIs in the initial render — put them in `useEffect`

**Animations not playing**
1. Verify `framer-motion` is imported as `import { motion } from 'framer-motion';` (not `import motion from ...`)
2. Ensure `motion.div` (not `motion.section` etc.) is used — the project consistently uses `motion.div`

**`params` type error in dynamic routes**
1. Next.js 15 changed `params` to be a Promise. Use `import { use } from 'react';` and `const { id } = use(params);`
2. Do NOT use `async` on the component function — `use()` handles the unwrapping

**Snapshot overwrites user edits in text fields**
1. Use the `savingRef` pattern from Step 5 — set a ref flag before saving, check it in the snapshot callback
2. Also track an `editing` boolean state to skip snapshot updates while the user is typing