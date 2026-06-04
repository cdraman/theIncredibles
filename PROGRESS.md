# theIncredibles — Progress Tracker

## How to Use This File
- Update this file as features are built and decisions are made
- At the start of a new Claude session, say "Read my project files from theIncredibles" — Claude will read them directly via MCP
- Keep CURRENT FOCUS and BLOCKERS up to date — these are the most important sections

---

## Current Focus
_What are we working on right now?_

- Scaffolding the Expo mobile app

---

## Blockers
_Anything preventing progress?_

- Supabase Studio UI failing to load schema (cosmetic bug, does not affect functionality)

---

## Environment

| Item | Status | Notes |
|---|---|---|
| MacBook RAM | ✅ 16GB | Docker capped at 4GB |
| Docker Desktop | ✅ Done | v29.1.5 |
| Tailscale on MacBook | Not started | |
| Tailscale on phones | Not started | |
| MCP filesystem server | ✅ Done | Scoped to ~/builds/theIncredibles |

---

## Backend — Supabase

| Item | Status | Notes |
|---|---|---|
| Docker Compose set up | ✅ Done | Running at http://localhost:8000 |
| Supabase running locally | ✅ Done | All containers healthy |
| Supabase credentials secured | ✅ Done | Custom passwords set — avoid # in passwords (breaks DB URLs) |
| Database schema designed | ✅ Done | 5 tables: profiles, tasks, task_comments, notes, reminders |
| RLS enabled | ✅ Done | All tables have row level security enabled |
| Auth configured | ✅ Done | |
| Users created (Dasa, Harini, Smaran) | ✅ Done | Dasa & Harini = admin, Smaran = member |
| Roles configured (admin vs standard) | ✅ Done | |

---

## Backend — Media Integration Service

| Item | Status | Notes |
|---|---|---|
| Service scaffolded | Not started | Node.js |
| Google Photos OAuth configured | Not started | |
| OneDrive OAuth configured | Not started | |
| Thumbnail cache implemented | Not started | |
| `/photos` endpoint working | Not started | |
| `/videos` endpoint working | Not started | |

---

## Mobile App — Expo

| Item | Status | Notes |
|---|---|---|
| Expo project scaffolded | Not started | |
| Supabase client connected | Not started | |
| Auth / login screen | Not started | |
| Navigation structure | Not started | |

---

## Features

| Feature | Status | Notes |
|---|---|---|
| Tasks | Not started | |
| Notes | Not started | |
| Reminders | Not started | |
| Photos — Google Photos section | Not started | |
| Photos — OneDrive section | Not started | |
| Push notifications | Not started | Strategy TBD |

---

## Decisions Log
_Record of key decisions made during build — useful context for future sessions_

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-03 | Supabase for backend | DB + auth + storage in one self-hosted package |
| 2026-06-03 | React Native + Expo for mobile | Single codebase, Android first, iOS later |
| 2026-06-03 | Tailscale for remote access | Secure, no port forwarding, easy family setup |
| 2026-06-03 | Server-side media integration | Smaran doesn't need Google/MS credentials |
| 2026-06-03 | On-demand thumbnail loading | TBs of data makes background sync impractical |
| 2026-06-03 | Server-side thumbnail cache | Google Photos-quality scroll smoothness for both sources |
| 2026-06-03 | MCP filesystem server configured | Claude can read/write to ~/builds/theIncredibles directly |
| 2026-06-03 | Docker memory capped at 4GB | Leaves headroom on 16GB MacBook for other apps |
| 2026-06-03 | Moved project to ~/builds/ | Avoids iCloud syncing Docker images from Documents folder |
| 2026-06-04 | task_comments separate table | Tasks can have many comments; keeps tasks table clean |
| 2026-06-04 | reminders use last_acknowledged_at | Simple snooze tracking sufficient; no full history needed |
| 2026-06-04 | Task status: not_started → in_progress → done | done → in_progress allowed only by admins |
| 2026-06-04 | Avoid # in passwords | Special chars break Postgres connection URLs |
| 2026-06-04 | Internal DB user passwords reset via 127.0.0.1 trust | Required after POSTGRES_PASSWORD change |

---

## Codebase Structure

```
~/builds/theIncredibles/
  ├── FAMILY_APP.md
  ├── PROGRESS.md
  ├── backend/
  │   ├── scripts/
  │   │   ├── generate-keys.js   ← generates ANON_KEY + SERVICE_ROLE_KEY into .env
  │   │   └── create-users.js    ← creates family member accounts in Supabase
  │   ├── supabase/
  │   │   ├── migrations/
  │   │   │   └── 001_initial_schema.sql  ← applied ✅
  │   │   └── docker/                     ← Docker Compose + config
  │   └── media-service/                  ← Node.js media proxy (not started)
  └── mobile/                             ← React Native + Expo app (not started)
```
