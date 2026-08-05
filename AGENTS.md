<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`mobilo` is a client-rendered Next.js 16 / React 19 furniture storefront (Spanish, "Maria Amor 11B"). Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`); dev server runs on port 3000.

- Supabase is optional for local dev. Credentials come from `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`), which are not committed (`.env*` is gitignored). `src/lib/supabase.ts` falls back to placeholder values when they are unset.
- Without Supabase configured, the storefront still works end-to-end for browsing: `src/app/page.tsx` catches the failed Supabase query and falls back to bundled demo products in `src/lib/demoData.ts`. Add-to-cart and cart totals (client-side, `localStorage`) work fully offline.
- Features that REQUIRE a real Supabase project + the schema in `supabase-schema.sql`: checkout order submission (`CartSidebar.tsx`) and the `/admin` panel (products/orders; login password `mobilo2024`). These silently no-op / show errors without a backend.
- `npm run lint` reports some pre-existing errors/warnings in the app's own source — these are not environment problems.
