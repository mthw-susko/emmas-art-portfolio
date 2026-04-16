---
name: firestore-feature
description: Adds a new Firestore-backed feature with onSnapshot listener, optimistic updates, and savingRef pattern. Use when user says 'add collection', 'new data type', 'store in firestore', 'add field to about', 'new firestore document', or creates new Firestore documents/collections. Do NOT use for read-only UI changes, styling, or static content that doesn't involve Firestore.
paths:
  - src/types/index.ts
  - src/lib/firebase.ts
  - src/app/**/page.tsx
  - src/components/**/*.tsx
---
# Firestore Feature

Adds a new Firestore-backed feature following this project's established patterns: real-time `onSnapshot` listeners, optimistic local state updates, `savingRef` to prevent snapshot overwrites during saves, and admin-gated editing via `useAuth()`.

## Critical

1. **All Firestore reads use `onSnapshot`, never `getDocs`** — the only exception is one-time queries like getting max order value in `src/components/ArtworkUploadModal.tsx`. Every component that displays Firestore data must use a real-time listener.
2. **Never update component state directly from Firestore snapshots while the user is editing or saving.** Use the `savingRef` pattern from `src/app/about/page.tsx` to guard against this.
3. **All files that use Firestore must be `'use client'` components** — Firestore SDK requires browser APIs.
4. **Admin features are gated by `useAuth()` hook** — never expose write operations to unauthenticated users. Check `user` from `useAuth()` before rendering edit controls.
5. **Import `db` from `@/lib/firebase`** and Firestore functions from the `firebase/firestore` package. Never initialize a new Firestore instance.

## Instructions

### Step 1: Define the Type

Add your new type to `src/types/index.ts`. Follow the existing pattern (see `Artwork`, `AboutContent`, `Skill` interfaces in that file):

```typescript
// src/types/index.ts
export interface YourType {
  id: string;          // Firestore document ID, always present
  fieldName: string;
  order: number;       // Include if the collection is orderable
  createdAt: Date;     // Include if tracking creation time
}
```

**Verify:** `npm run lint` passes. The type is exported and importable as `import { YourType } from '@/types'`.

### Step 2: Set Up the Real-Time Listener

For a **collection** (like `artworks` in `src/components/ArtworkGrid.tsx`), use `onSnapshot` with a query:

```typescript
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { YourType } from '@/types';

const [items, setItems] = useState<YourType[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const q = query(collection(db, 'yourCollection'), orderBy('order', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as YourType[];
    setItems(data);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
```

For a **single document** (like `about/content` in `src/app/about/page.tsx`), use `onSnapshot` on a doc ref:

```typescript
import { doc, onSnapshot } from 'firebase/firestore';

useEffect(() => {
  const docRef = doc(db, 'collectionName', 'docId');
  
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as YourType;
      setContent(data);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);
```

**Verify:** The component renders data from Firestore. The `unsubscribe` cleanup runs on unmount (check no memory leak warnings in console).

### Step 3: Add the savingRef Pattern for Editable Fields

This step uses the output from Step 2. When a field is inline-editable by admins, you need three pieces of state per field to prevent Firestore snapshots from clobbering in-progress edits (see `src/app/about/page.tsx` for the reference implementation):

```typescript
import { useState, useRef } from 'react';

// 1. Local editing state
const [editingField, setEditingField] = useState(false);
const [localValue, setLocalValue] = useState('');

// 2. Saving ref — tracks async save in progress
const savingRef = useRef({ fieldName: false });

// 3. Guard the snapshot callback
onSnapshot(docRef, (doc) => {
  if (doc.exists()) {
    const data = doc.data() as YourType;
    const isEditing = editingField || savingRef.current.fieldName;
    if (!isEditing) {
      setContent(data);
    }
    if (!editingField && !savingRef.current.fieldName) {
      setLocalValue(data.fieldName);
    }
  }
});
```

Add `editingField` to the `useEffect` dependency array so the listener re-subscribes when editing state changes (matching `src/app/about/page.tsx:126`).

**Verify:** Edit a field, confirm the value stays while typing. Trigger a Firestore update from another source — the local edit should not be overwritten.

### Step 4: Implement Optimistic Updates with Revert-on-Error

For **blur-to-save** fields (text inputs, textareas):

```typescript
const handleFieldBlur = async () => {
  if (!content || localValue === content.fieldName) {
    setEditingField(false);
    return;
  }
  
  setEditingField(false);
  savingRef.current.fieldName = true;
  
  try {
    const docRef = doc(db, 'collectionName', 'docId');
    await updateDoc(docRef, { fieldName: localValue });
    setContent({ ...content, fieldName: localValue });
  } catch (error) {
    console.error('Error updating fieldName:', error);
    setLocalValue(content.fieldName); // Revert on error
  } finally {
    savingRef.current.fieldName = false;
  }
};
```

For **immediate updates** (toggles, sliders, drag-and-drop):

```typescript
const handleUpdate = async (newValue: string) => {
  if (!content) return;
  
  // Optimistic update
  const updated = { ...content, fieldName: newValue };
  setContent(updated);
  
  try {
    const docRef = doc(db, 'collectionName', 'docId');
    await updateDoc(docRef, { fieldName: newValue });
  } catch (error) {
    console.error('Error updating:', error);
    setContent(content); // Revert to previous state
  }
};
```

For **batch writes** (reordering collections, like `src/components/ArtworkGrid.tsx:82-96`):

```typescript
import { writeBatch } from 'firebase/firestore';

const handleReorder = async (newItems: YourType[]) => {
  const previousItems = items;
  setItems(newItems); // Optimistic
  
  try {
    const batch = writeBatch(db);
    newItems.forEach((item, index) => {
      const ref = doc(db, 'yourCollection', item.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error updating order:', error);
    setItems(previousItems); // Revert
  }
};
```

**Verify:** Make an update, confirm UI updates instantly. Simulate a Firestore error (e.g., bad doc path) and confirm the UI reverts.

### Step 5: Add New Documents to a Collection

When creating new documents, follow the pattern from `src/components/ArtworkUploadModal.tsx`:

```typescript
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

const handleAdd = async (newItem: Omit<YourType, 'id'>) => {
  try {
    // Get current max order
    const q = query(collection(db, 'yourCollection'), orderBy('order', 'desc'));
    const snapshot = await getDocs(q);
    const maxOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order || 0);
    
    await addDoc(collection(db, 'yourCollection'), {
      ...newItem,
      order: maxOrder + 1,
      createdAt: new Date(),
    });
    // No need to update local state — onSnapshot listener handles it
  } catch (error) {
    console.error('Error adding item:', error);
  }
};
```

**Verify:** Add a document, confirm it appears in the UI without manual refresh (the `onSnapshot` listener picks it up automatically).

### Step 6: Gate Admin Controls

Use `useAuth()` to conditionally render edit/delete/add controls:

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

const { user } = useAuth();

// In JSX:
{user && (
  <button
    onClick={handleEdit}
    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
  >
    Edit
  </button>
)}
```

Pass `isAdmin={!!user}` to child components that need to know auth state but shouldn't import the hook themselves (pattern from `src/app/page.tsx:64`).

**Verify:** Log out — edit controls should disappear. Log in — they reappear.

### Step 7: Add Loading State

Use the project's `src/components/LoadingSpinner.tsx` component:

```typescript
import LoadingSpinner from '@/components/LoadingSpinner';

if (loading) {
  return <LoadingSpinner text="Loading your content..." />;
}
```

**Verify:** Refresh the page — spinner shows briefly before data loads.

### Step 8: Adding a Field to the Existing About Document

If you're adding a new field to `about/content` rather than a new collection:

1. Update `AboutContent` interface in `src/types/index.ts` — mark new fields optional with `?` for backward compatibility with existing documents.
2. Add default value handling in the `onSnapshot` callback in `src/app/about/page.tsx` (see the `defaultContent` object at line 103).
3. Add local editing state + savingRef entry if the field is admin-editable.
4. Add the UI in the appropriate `SectionWrapper` in `src/app/about/page.tsx`.

**Verify:** The page loads without errors even if the Firestore document doesn't have the new field yet. Admin can edit and save the new field.

## Examples

### Example: User says "Add a testimonials collection to the site"

**Actions taken:**
1. Add `Testimonial` interface to `src/types/index.ts`:
   ```typescript
   export interface Testimonial {
     id: string;
     author: string;
     text: string;
     order: number;
     createdAt: Date;
   }
   ```
2. Create `src/components/TestimonialList.tsx` — `'use client'` component with `onSnapshot` listener on `testimonials` collection, ordered by `order` field. Accepts `isAdmin` prop.
3. Create `src/components/AddTestimonialForm.tsx` — form component that uses `addDoc` to create new testimonials with `order: maxOrder + 1`.
4. Add testimonial section to the about page (or new page) inside a `SectionWrapper` with visibility toggle.
5. Wire up admin controls gated by `useAuth()` — add/edit/delete buttons only render when `user` is truthy.

**Result:** Testimonials load in real-time via `onSnapshot`. Admins see add/edit/delete controls. Optimistic updates with revert-on-error. No manual refresh needed after mutations.

### Example: User says "Add a tagline field to the about page"

**Actions taken:**
1. Add `tagline?: string` to `AboutContent` in `src/types/index.ts`.
2. In `src/app/about/page.tsx`:
   - Add `editingTagline` state, `localTagline` state, and `tagline` key to `savingRef`.
   - Add default tagline to `defaultContent`.
   - Guard snapshot with `!editingTagline && !savingRef.current.tagline`.
   - Add blur-to-save handlers (`handleTaglineBlur`, `handleTaglineFocus`).
   - Add textarea in a `SectionWrapper` for the tagline section.

**Result:** Tagline appears on about page. Admins can click to edit inline, blur to save. Firestore snapshots don't overwrite mid-edit.

## Common Issues

**"FirebaseError: Missing or insufficient permissions"**
1. Check Firestore security rules in Firebase Console — the collection may not have read/write rules.
2. Confirm the user is authenticated if the operation requires auth.
3. Verify the collection/document path matches exactly (Firestore paths are case-sensitive).

**Snapshot overwrites user input mid-edit**
1. Confirm `savingRef` is a `useRef`, not `useState` — refs update synchronously.
2. Check that the `onSnapshot` callback guards ALL local state updates with `if (!editing && !savingRef.current.field)`.
3. Verify the editing boolean is in the `useEffect` dependency array (see `src/app/about/page.tsx:126`).

**New documents don't appear in the UI after `addDoc`**
1. Confirm the component has an active `onSnapshot` listener on the same collection.
2. Check the `orderBy` field in the query matches the field name set during `addDoc`.
3. If filtering (like `excludeId`), verify the filter isn't accidentally excluding the new document.

**"Cannot read properties of null" when calling update handlers**
1. Every handler that mutates state should start with `if (!content) return;` — the data may not have loaded yet.
2. Check that `loading` state prevents rendering the editable UI before data arrives.

**Optimistic update reverts immediately**
1. The `onSnapshot` listener may be overwriting the optimistic state. Ensure the savingRef flag is set to `true` BEFORE the async `updateDoc` call, not after.
2. Pattern: `savingRef.current.field = true` → `await updateDoc(...)` → `savingRef.current.field = false` in `finally`.

**Timestamp fields show as `{seconds: N, nanoseconds: N}` instead of Date**
1. Firestore timestamps need explicit conversion: `doc.data().createdAt?.toDate() || new Date()` (see `src/components/ArtworkGrid.tsx:57`).
2. When writing, use plain `new Date()` — Firestore auto-converts it to a Timestamp.
