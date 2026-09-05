<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: hocphi-info-fe

Public tuition lookup/comparison site for Vietnamese universities. Product spec lives at
`../yeu-cau-san-pham.md` (repo root, one level up). Backend is a separate repo
(`hocphi-info-be`), FastAPI (Python) — see `.env.local` for the API base URL.

Owner is learning React/Next.js while building this (background: 4 years Flutter). Prefer
plain, idiomatic patterns over clever abstractions — this is a learning project as much as a
product build.

## Architecture

No named architecture (no MVC/MVVM/Clean Architecture). Next.js's file-system router IS the
routing layer; everything else is a flat, colocated structure. Don't introduce
repository/use-case/entity layers — the app is read/filter/display, not complex business logic.

## Folder structure

```
src/
├── app/
│   ├── page.tsx                  # "/"
│   ├── layout.tsx                # shared shell (header/footer go here)
│   ├── nganh/{page,loading,error}.tsx   # "/nganh" (S1) — Server Component page + boundaries
│   └── truong/{page,loading,error}.tsx  # "/truong" (S2)
├── components/             # Reusable UI (Button, FilterPanel, Chart, …). Not route-specific.
├── lib/                    # API calls + data transforms. Flat, no repository/service layering.
├── types/                  # Shared TypeScript types (Truong, Nganh, HocPhi, …)
└── hooks/                  # Custom hooks, only when state logic repeats across components
```

Route-specific components that aren't reused elsewhere can live next to their `page.tsx`
(colocation) instead of in `components/` — don't force premature sharing.

## Conventions

- State: `useState`/`useReducer`/Context only. No Redux/Zustand unless a real cross-page
  global-state need shows up (e.g. the comparison tray, F8).
- Data fetching: plain `fetch`, no React Query/SWR yet — add only when caching/refetch pain
  is actually felt.
- Filter/sort state lives in the URL query string, not React state (`lib/url.ts` +
  `lib/filters.ts`). Write params with `window.history.pushState`/`replaceState`
  (`lib/url.ts`'s `writeParams`), **not** `router.push()` — the data is already on the
  client, so a filter click should not trigger a server round-trip. `lib/filters.ts`
  functions are pure (no React import) so the same filter/sort logic runs on the server
  (first render in `page.tsx`, for correct SSR HTML) and on the client (every change after
  that) — keep new filter/sort logic in that shape rather than inlining it in a component.
- Path alias `@/*` → `./src/*` (already configured in `tsconfig.json`).
- Env vars: `NEXT_PUBLIC_API_URL` for the backend base URL (see `.env.local` / `.env.production`).

## Git commit messages

Always in English, regardless of the conversation language. No AI-attribution lines
(no "Generated with Claude", no Co-Authored-By Claude) in commits or PR descriptions.
