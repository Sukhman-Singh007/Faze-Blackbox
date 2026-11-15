# Deployment — FaZe Blackbox

## 1. GitHub (one-time, owner does this — the Muse GitHub App cannot create repos)

1. Go to https://github.com/new — Repository name: `Faze-Blackbox`, Public, **do not** add README/.gitignore/license (empty repo).
2. Tell Mica "done". Mica pushes this code to `main`.
3. Add your teammate: repo → **Settings → Collaborators → Add people** → `Akumar1313` → Invite. They accept the invite by email / GitHub notifications.

## 2. Vercel

1. https://vercel.com/new → Import `Sukhman-Singh007/Faze-Blackbox`.
2. Framework: Vite. Build command `npm run build`, output `dist`.
3. Optional env vars (app works without them): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Use the `*.vercel.app` URL for Devpost.

## 3. Supabase (optional)

1. Create a project at https://supabase.com/dashboard.
2. SQL Editor → run `supabase/migrations/001_init.sql`.
3. `supabase functions deploy validate-answer` and set its `SUPABASE_SERVICE_ROLE_KEY` secret in the Supabase dashboard (never in Vercel frontend env).
4. Add the URL + anon key to Vercel env vars and redeploy.

## 4. Devpost

Deadline: **12:00 PM Sunday, Nov 15, 2026 (CST)** — verified on the Devpost form. Copy `DEVPOST.md` into the Devpost form, paste the GitHub + Vercel URLs, and submit. Do not claim Supabase Realtime is live in production unless the steps above are done — demo-local sync is the tested path.
