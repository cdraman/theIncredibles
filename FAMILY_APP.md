# theIncredibles — Project Requirements

## Overview
theIncredibles is a self-hosted family dashboard app for personal use. Accessible on mobile from anywhere via a secure tunnel. Hosted on a MacBook at home.

---

## Family
- Users: me (Bob), spouse (Helen), child (Dash)
- Administrators: Bob and Helen
- Standard user: Dash
- Primary devices: Android (iOS support planned for later)

---

## Features

### Tasks
- Each task has an **owner**: Bob, Helen, or Dash
- Each task has a **due date**
- Each task has a **description** — plain text describing what needs to be done
- Each task has a **completion criteria** — plain text describing what "done" looks like
- Task status flow: `not_started` → `in_progress` → `done`
  - Owner or admin can move: not_started → in_progress → done
  - Only admins can move: done → in_progress
- **Administrators** (Bob and Helen) can:
  - Create tasks and assign owner
  - Change the owner of a task
  - Mark a task as "Not Done" (revert done → in_progress)
  - Receive a push notification when any task is marked Done
- **Dash** is a child user (standard user role):
  - Can view and update status of their own tasks
  - Cannot change task ownership or create tasks
- All family members can add comments to any task
- Only admins can edit or delete comments

### Notes
- All family members can create notes
- Supported content types:
  - Plain text
  - Links to websites
  - File attachments
- Visible to all family members

### Reminders
- Each reminder has a **target**: Bob, Helen, or Dash
- Reminders are **periodic** — they recur on a schedule (e.g. every Friday at 5 PM)
- Schedule stored as a cron expression (e.g. `0 17 * * 5` = every Friday at 5 PM)
- **Administrators** (Bob and Helen) can:
  - Create, edit, and delete reminders
  - Assign or change the target
- **Targets** (the person the reminder is directed at):
  - Receive a notification when the reminder fires
  - Can only **Acknowledge** the reminder — snoozes until next scheduled occurrence
  - Cannot edit or delete the reminder
- Acknowledgement tracked via `last_acknowledged_at` (no full history needed)
- Example: *"Dash, start a load of your laundry by 5 PM"* — repeats every Friday

### Photos & Videos
- Photos and videos live in **Google Photos** and **Microsoft OneDrive** (existing family storage; TBs of data)
- Integration is **server-side only** — the MacBook backend authenticates with Google/Microsoft and proxies media to the app
- Family members (including Dash) only log into the family app — no Google or Microsoft authentication on their devices
- The app has **separate sections** for Google Photos and OneDrive
- **View only** — no upload or download to phone
- **On-demand loading** — no background sync (too expensive given TBs of data)
- **Scroll performance goal: Google Photos-quality smoothness**

#### Thumbnail caching strategy
- Media service fetches thumbnails from Google/OneDrive on first request and **caches them locally** on the MacBook
- Subsequent scrolls are served from local cache — fast, no API call
- Thumbnails are small (few KB each) so caching thousands is cheap on disk
- App pre-fetches thumbnails 2–3 rows ahead of the scroll position
- Virtualized list on the app — only visible thumbnails held in memory
- Lightweight placeholder shown while a thumbnail is loading
- Full resolution photo/video fetched on demand when an item is opened

---

## Stack

### Backend
- **Supabase** (self-hosted via Docker)
  - PostgreSQL database
  - Auth (per family member)
  - REST API (PostgREST)
  - File storage (notes attachments)
- **Media integration service** (Node.js, Docker container)
  - Google Photos API integration (server-side OAuth)
  - Microsoft OneDrive API integration (server-side OAuth)
  - Server-side thumbnail cache (local disk on MacBook)
  - Proxies thumbnails and media to the app on demand

### Mobile App
- **React Native + Expo SDK 54**
  - Single codebase for Android (+ iOS later)
  - Virtualized list for photo grid (smooth scrolling)
  - Pre-fetch thumbnails ahead of scroll position

### Remote Access
- **Tailscale**
  - Secure tunnel from phones to home server
  - No port forwarding needed

---

## Hosting
- **Host machine:** MacBook (always-on, 16GB RAM)
- **Runtime:** Docker Desktop (memory capped at 4GB)
- MacBook needs to stay awake — use Amphetamine or equivalent

---

## Architecture
```
Phone (LTE or any WiFi)
  → Tailscale tunnel
    → MacBook Tailscale IP
      ├── Supabase :8000 (tasks, notes, reminders, auth)
      └── Media service :3001
            ├── Thumbnail cache (local disk)
            ├── Google Photos API (on first request / cache miss)
            └── Microsoft OneDrive API (on first request / cache miss)
```

---

## Open Questions / Decisions
- Push notifications strategy: TBD
- Supabase URL strategy: currently hardcoded to local IP — needs env-based config for Tailscale

---

## How to Use This File
At the start of a new Claude session, say "Read my project files from theIncredibles" — Claude will read them directly via MCP from ~/builds/theIncredibles.
