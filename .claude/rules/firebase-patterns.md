---
paths:
  - src/lib/**
  - src/components/**
  - src/app/**
---

# Firebase Patterns

- Use `onSnapshot` for real-time Firestore listeners, always unsubscribe in `useEffect` cleanup
- Firestore refs: `doc(db, 'collection', 'id')` or `collection(db, 'name')`
- Optimistic updates: set local state first, then `updateDoc`/`addDoc`, rollback in `catch`
- About content lives at `doc(db, 'about', 'content')` — single document pattern
- Artworks use `collection(db, 'artworks')` with `orderBy('order')` queries
- Batch reorder writes use `writeBatch` from `firebase/firestore`
- Use `savingRef` pattern (see `src/app/about/page.tsx`) to prevent snapshot overwrites during edits
- Images: upload to Firebase Storage via `ref`/`uploadBytes`/`getDownloadURL`, store URL in Firestore doc
- Firebase SDK exports from `src/lib/firebase.ts`: `auth`, `db`, `storage`
