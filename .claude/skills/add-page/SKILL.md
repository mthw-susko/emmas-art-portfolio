---
name: add-page
description: Creates a new Next.js App Router page following the project's 'use client' + framer-motion + Firestore onSnapshot pattern. Use when user says 'add page', 'new page', 'create route', or adds files to src/app/. Do NOT use for API routes (src/app/api/).
paths:
  - src/app/**/page.tsx
---
# Add Page

## Critical

- Every page in this project is a Client Component — always start with `'use client';`
- All data comes from Firestore via `onSnapshot` real-time listeners — never use `getDoc`/`getDocs` for page data
- The `@/*` path alias maps to `./src/*` — use it for all imports
- Admin features are gated by `useAuth()` hook — when `user` is truthy, show edit controls inline
- Do NOT create a separate layout unless the page needs a distinct sub-layout. The root layout at `src/app/layout.tsx` already provides `<Header />`, `<main>`, and `<footer>`
- Do NOT create API routes with this skill. API routes live in `src/app/api/` and follow a different pattern (no 'use client', uses NextResponse)

## Instructions

### Step 1: Create the page directory and file

Create a new directory under `src/app/` with the route name and add a `page.tsx` file inside it, following the pattern of `src/app/about/page.tsx` or `src/app/admin/page.tsx`. For dynamic routes, follow the pattern of `src/app/artwork/[id]/page.tsx`.

Verify: The parent directory `src/app/` exists. The route name is lowercase kebab-case.

### Step 2: Add the 'use client' directive and imports

Follow this exact import order (matches existing pages like `src/app/about/page.tsx`):

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { YourType } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
```

Import order:
1. React hooks
2. `framer-motion`
3. Firebase SDK functions from `firebase/firestore`
4. Local lib (`@/lib/firebase`, `@/lib/hooks/useAuth`)
5. Types (`@/types`)
6. Components (`@/components/*`)

Only import what you use. If the page has no Firestore data, omit Firebase imports. If no admin features, omit `useAuth`.

Verify: No unused imports. `'use client';` is the very first line.

### Step 3: Define the component with the data-loading pattern

For a page that reads a single Firestore document (like `src/app/about/page.tsx`):

```tsx
export default function PageName() {
  const [data, setData] = useState<YourType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const docRef = doc(db, 'collectionName', 'docId');
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setData(doc.data() as YourType);
      }
      setLoading(false);
    });

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
      {/* page content */}
    </div>
  );
}
```

For a page that reads a Firestore collection (like `src/app/page.tsx`):

```tsx
useEffect(() => {
  const collRef = collection(db, 'collectionName');
  
  const unsubscribe = onSnapshot(collRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as YourType[];
    setData(items);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
```

For dynamic route pages (like `src/app/artwork/[id]/page.tsx`), use the Next.js 15 async params pattern:

```tsx
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PageName({ params }: PageProps) {
  const { id } = use(params);
  // ... use id in useEffect dependency array
}
```

Verify: `onSnapshot` is used (not `getDoc`). Cleanup `unsubscribe` is returned from `useEffect`. Loading state shows `<LoadingSpinner>`. Null/empty state is handled.

### Step 4: Add framer-motion animations

Wrap content sections in `<motion.div>` with fade-in animations. Follow the existing pattern from `src/app/about/page.tsx`:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* section content */}
</motion.div>
```

For staggered sections, add `delay` to subsequent sections:

```tsx
transition={{ duration: 0.6, delay: 0.2 }}
transition={{ duration: 0.6, delay: 0.3 }}
```

For horizontal slide-in (used in two-column layouts):

```tsx
initial={{ opacity: 0, x: -20 }}  // left column
initial={{ opacity: 0, x: 20 }}   // right column
```

Verify: At least one `<motion.div>` wraps the main content. Transitions use `duration: 0.6` to match existing pages.

### Step 5: Add admin-gated controls (if applicable)

Conditionally render edit controls when `user` is truthy:

```tsx
{user && (
  <button
    className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
  >
    Action
  </button>
)}
```

For Firestore mutations, use `updateDoc`/`deleteDoc` with try/catch:

```tsx
import { updateDoc } from 'firebase/firestore';

try {
  const docRef = doc(db, 'collection', 'id');
  await updateDoc(docRef, { field: value });
} catch (error) {
  console.error('Error updating:', error);
}
```

Verify: Admin controls are wrapped in `{user && (...)}`. Mutations use try/catch with `console.error`.

### Step 6: Add type to `src/types/index.ts` (if needed)

If the page reads from a new Firestore collection, add the corresponding interface:

```tsx
export interface NewType {
  id: string;
  // fields matching Firestore document structure
}
```

Verify: Type is exported. Type matches the Firestore document shape.

### Step 7: Style with Tailwind CSS

Follow the project's styling conventions from `src/app/about/page.tsx` and `src/app/page.tsx`:
- Page container: `<div className="max-w-6xl mx-auto px-4 py-8">`
- Headings: `text-2xl font-bold text-blue-500` or `text-3xl md:text-4xl font-bold text-blue-500`
- Body text: `text-gray-600 leading-relaxed` or `text-gray-500`
- Links: `text-blue-500 hover:text-blue-600` or `text-gray-500 hover:text-blue-500 transition-colors`
- Buttons: `bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors`
- Section spacing: `space-y-8` or `mb-8`/`mb-12`

Verify: No custom CSS classes — everything uses Tailwind utilities. Colors use the project palette (`blue-500`, `gray-500`, `gray-600`).

### Step 8: Verify the page works

```bash
npm run dev
```

Navigate to the new route. Check:
1. Page loads without console errors
2. Loading spinner appears briefly
3. Framer-motion animations play on mount
4. Firestore data renders correctly
5. If admin features exist, they appear only when logged in

```bash
npm run build
```

Check for TypeScript/build errors.

## Examples

### Example: User says "add a gallery page that shows artworks by category"

Actions:
1. Create `src/app/gallery/page.tsx`
2. Add type `ArtworkCategory` to `src/types/index.ts` if needed
3. Use `onSnapshot` on the `artworks` collection
4. Group artworks by category in component state
5. Wrap sections in `<motion.div>` with staggered fade-in
6. Use `max-w-6xl mx-auto px-4 py-8` container
7. Use `<LoadingSpinner text="Loading gallery..." />` for loading state

Result: `src/app/gallery/page.tsx` — a client component with real-time Firestore data, framer-motion animations, loading/empty states, and Tailwind styling matching the rest of the site.

### Example: User says "create a page for /commissions"

Actions:
1. Create `src/app/commissions/page.tsx` following the pattern from `src/app/about/page.tsx`
2. Use `onSnapshot` on `doc(db, 'pages', 'commissions')` for content
3. Gate edit controls behind `useAuth()` — `{user && (...)}`
4. Add `CommissionsContent` interface to `src/types/index.ts`

Result file structure:
```
src/app/commissions/    # new route directory
src/types/index.ts      # CommissionsContent interface added
```

## Common Issues

**Error: `params` type mismatch in dynamic routes**
Next.js 15 changed `params` to be a Promise. Use `use(params)` from React (see `src/app/artwork/[id]/page.tsx` for the pattern):
```tsx
import { use } from 'react';
const { id } = use(params);
```
Do NOT use `await` in the component body — it's a Client Component.

**Error: `FirebaseError: Missing or insufficient permissions`**
The Firestore security rules may not allow reads on the new collection. Check Firebase console > Firestore > Rules. For development, the rules likely allow authenticated reads.

**Error: `onSnapshot` fires with stale data after mutation**
This is expected — `onSnapshot` eventually delivers the update. Do NOT add manual refetch logic. The real-time listener handles it.

**Hydration mismatch warnings**
The root `<html>` has `suppressHydrationWarning`. If the new page uses browser-only APIs (e.g., `window`), guard them inside `useEffect` or check `typeof window !== 'undefined'`.

**Page not appearing in navigation**
The `src/components/Header.tsx` component contains the nav links. Add a new `<Link>` there if the page should be in the main navigation.

**Build error: `Type 'X' is not assignable to type 'Y'`**
Firestore `doc.data()` returns `DocumentData`. Always cast: `doc.data() as YourType`. Ensure the interface in `src/types/index.ts` matches the actual Firestore document fields.
