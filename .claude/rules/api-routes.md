---
paths:
  - src/app/api/**
---

# API Route Conventions

- Use Next.js App Router route handlers: `export async function POST(request: NextRequest)`
- Validate required fields early, return `{ error }` with appropriate status code
- Check env vars before using external services, return 500 if missing
- Return JSON via `NextResponse.json()`
- Contact route pattern: `src/app/api/contact/route.ts` — sends two emails (notification + confirmation)
