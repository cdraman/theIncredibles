# theIncredibles — Challenges & Solutions

A log of setup and design challenges encountered during the build, and how they were resolved.

---

## 1. Supabase Studio UI failing to load schema

**Problem:** After applying the initial schema migration, Supabase Studio showed "Failed to load schemas" with a JSON validation error.

**Impact:** Cosmetic only — could not browse tables in the UI.

**Resolution:** Verified tables exist and RLS is enabled directly via `psql`:
```bash
docker exec -i supabase-db psql -U postgres -d postgres -c "\dt public.*"
docker exec -i supabase-db psql -U postgres -d postgres -c "select tablename, rowsecurity from pg_tables where schemaname = 'public';"
```
All tables confirmed healthy. Studio bug does not affect functionality.

**Status:** Unresolved (cosmetic) — proceed without Studio for now.

---

## 2. Special characters in passwords breaking Postgres connection URLs

**Problem:** Initial passwords contained `#` (e.g. `Incr3dibles#Postgres!2026`). The `#` character is a URL fragment delimiter and broke internal Postgres connection strings used by Supabase services (`supabase-auth`, `supabase-rest`, `supabase-storage`, `supabase-pooler`), causing them to crash-loop on startup.

**Error seen:**
```
invalid port ":Incr3dibles" after host
parsing db connection url: postgres://supabase_auth_admin:Incr3dibles
```

**Resolution:** Changed `POSTGRES_PASSWORD` to a value without special URL-breaking characters:
```
POSTGRES_PASSWORD=Incr3dibles2026Postgres
```

**Lesson:** Avoid `#`, `@`, `:`, `/`, `?` in Postgres passwords used in Supabase self-hosted setups.

---

## 3. Internal Supabase DB users had stale passwords after POSTGRES_PASSWORD change

**Problem:** Even after updating `POSTGRES_PASSWORD` in `.env` and restarting containers, internal service users (`authenticator`, `supabase_auth_admin`, `supabase_storage_admin`, `pgbouncer`, `supabase_admin`) still had the old password hashed in the database. Wiping volumes (`docker compose down -v`) did not help because Supabase's init scripts only set these passwords on the very first initialization.

**Error seen:**
```
failed SASL auth (FATAL: password authentication failed for user "supabase_auth_admin")
password authentication failed for user "authenticator"
```

**Resolution:** Used the `pg_hba.conf` trust rule for `127.0.0.1` to connect as `supabase_admin` without a password and reset all internal user passwords:
```bash
docker exec -i supabase-db psql -h 127.0.0.1 -U supabase_admin -d postgres << 'EOF'
ALTER USER authenticator PASSWORD 'Incr3dibles2026Postgres';
ALTER USER supabase_auth_admin PASSWORD 'Incr3dibles2026Postgres';
ALTER USER supabase_storage_admin PASSWORD 'Incr3dibles2026Postgres';
ALTER USER pgbouncer PASSWORD 'Incr3dibles2026Postgres';
ALTER USER supabase_admin PASSWORD 'Incr3dibles2026Postgres';
EOF
```

**Lesson:** After changing `POSTGRES_PASSWORD` in a running Supabase instance, internal DB user passwords must be manually reset. The `127.0.0.1` trust rule in `pg_hba.conf` is the escape hatch.

---

## 4. Default Supabase JWT keys not matching custom JWT_SECRET

**Problem:** The default `ANON_KEY` and `SERVICE_ROLE_KEY` in `.env.example` are signed with a demo JWT secret. After setting a custom `JWT_SECRET`, the old keys no longer validated, causing API calls to fail.

**Resolution:** Wrote a script (`backend/scripts/generate-keys.js`) that reads `JWT_SECRET` from `.env` and generates new `ANON_KEY` and `SERVICE_ROLE_KEY` signed with the correct secret, writing them directly back to `.env` without printing them to screen.

```bash
node ~/builds/theIncredibles/backend/scripts/generate-keys.js
```

**Lesson:** Any time `JWT_SECRET` is changed, `ANON_KEY` and `SERVICE_ROLE_KEY` must be regenerated to match.

---

## 5. Supabase source embedded as a git submodule

**Problem:** Supabase was cloned into `backend/supabase/` which contained its own `.git` folder, making it an embedded git repository. This caused `git add .` to treat it as a submodule and not include its contents in commits.

**Resolution:**
```bash
rm -rf ~/builds/theIncredibles/backend/supabase/.git
git rm --cached backend/supabase -r -f
git add backend/supabase
```

Also updated `.gitignore` to exclude the bulk of the Supabase source (apps, examples, packages) — we only need `docker/` and `migrations/`.

**Lesson:** When cloning third-party repos into a project, always remove their `.git` folder immediately if they're not intended as submodules.

---

## 6. Expo SDK version incompatibility with Expo Go

**Problem:** Scaffolded the Expo app with SDK 56 (latest). The Expo Go app on Android only supported SDK 54 at the time, causing an incompatibility error. Downgrading to SDK 53 also failed due to npm peer dependency conflicts. Downgrading in-place caused cascading version conflicts across React, React Native, and TypeScript.

**Resolution:** Deleted the app entirely and recreated it fresh with SDK 53, then upgraded to SDK 54 using `--legacy-peer-deps`:
```bash
rm -rf mobile/theIncredibles
npx create-expo-app@latest theIncredibles --template blank-typescript --no-install
# Select SDK 53
npm install
npx expo install expo@^54.0.0
npx expo install --fix -- --legacy-peer-deps
```

**Lesson:** Always check the current Expo Go SDK support before scaffolding. Prefer creating fresh with the target SDK rather than downgrading in-place.

---

## 7. Phone unable to reach Supabase at localhost

**Problem:** The Supabase client in the app was configured with `http://localhost:8000`. On the phone, `localhost` refers to the phone itself, not the MacBook, causing "Network request failed" on login.

**Resolution:** Changed `SUPABASE_URL` in `lib/supabase.ts` to the MacBook's local network IP:
```typescript
const SUPABASE_URL = 'http://192.168.86.218:8000'
```

**Pending:** This IP is only valid on the home network. Once Tailscale is set up, this should be made configurable via an environment variable so it works both locally and on-the-go.

---

## 8. Project folder in iCloud-synced Documents directory

**Problem:** Project was initially created under `~/Documents/theIncredibles`. macOS syncs `Documents` to iCloud, which would unnecessarily upload Docker images, node_modules, and build artifacts — potentially GBs of data.

**Resolution:** Moved the entire project to `~/builds/theIncredibles` which is outside iCloud sync scope:
```bash
mv ~/Documents/theIncredibles ~/builds/theIncredibles
```
Also updated the MCP config to point to the new path.

**Lesson:** Keep build artifacts and Docker data outside iCloud-synced folders.
