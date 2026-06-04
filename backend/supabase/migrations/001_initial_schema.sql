-- theIncredibles — Initial Schema
-- Migration: 001_initial_schema.sql

-- ============================================================
-- PROFILES
-- Extends Supabase auth.users with app-specific fields
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null check (role in ('admin', 'member')),
  created_at  timestamp with time zone default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table public.tasks (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  description          text,
  completion_criteria  text,
  owner_id             uuid not null references public.profiles(id),
  due_date             date,
  status               text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done')),
  created_by           uuid not null references public.profiles(id),
  created_at           timestamp with time zone default now(),
  updated_at           timestamp with time zone default now()
);

-- ============================================================
-- TASK COMMENTS
-- ============================================================
create table public.task_comments (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  author_id   uuid not null references public.profiles(id),
  content     text not null,
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

-- ============================================================
-- NOTES
-- Visible to all family members
-- ============================================================
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id),
  type        text not null check (type in ('text', 'link', 'attachment')),
  content     text,
  file_url    text,
  created_at  timestamp with time zone default now(),
  updated_at  timestamp with time zone default now()
);

-- ============================================================
-- REMINDERS
-- Periodic reminders targeted at a specific family member
-- ============================================================
create table public.reminders (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  target_id             uuid not null references public.profiles(id),
  created_by            uuid not null references public.profiles(id),
  schedule              text not null, -- cron expression e.g. "0 17 * * 5" = every Friday at 5PM
  last_fired_at         timestamp with time zone,
  last_acknowledged_at  timestamp with time zone,
  created_at            timestamp with time zone default now(),
  updated_at            timestamp with time zone default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- Auto-updates updated_at on row changes
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger task_comments_updated_at
  before update on public.task_comments
  for each row execute function public.handle_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

create trigger reminders_updated_at
  before update on public.reminders
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.notes enable row level security;
alter table public.reminders enable row level security;

-- Profiles: all authenticated users can read, only own profile can be updated
create policy "profiles_read" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Tasks: all authenticated users can read
create policy "tasks_read" on public.tasks
  for select using (auth.role() = 'authenticated');

-- Tasks: admins can insert
create policy "tasks_insert_admin" on public.tasks
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Tasks: status update rules enforced at app level (see PROGRESS.md)
-- admins can update anything, owners can update status (except done -> in_progress)
create policy "tasks_update" on public.tasks
  for update using (
    auth.uid() = owner_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Tasks: only admins can delete
create policy "tasks_delete_admin" on public.tasks
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Task comments: all authenticated users can read and insert
create policy "task_comments_read" on public.task_comments
  for select using (auth.role() = 'authenticated');

create policy "task_comments_insert" on public.task_comments
  for insert with check (auth.role() = 'authenticated');

-- Task comments: only admins can update or delete
create policy "task_comments_update_admin" on public.task_comments
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "task_comments_delete_admin" on public.task_comments
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Notes: all authenticated users can read and insert
create policy "notes_read" on public.notes
  for select using (auth.role() = 'authenticated');

create policy "notes_insert" on public.notes
  for insert with check (auth.role() = 'authenticated');

-- Notes: authors can update their own, admins can update any
create policy "notes_update" on public.notes
  for update using (
    auth.uid() = author_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Notes: authors can delete their own, admins can delete any
create policy "notes_delete" on public.notes
  for delete using (
    auth.uid() = author_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Reminders: all authenticated users can read
create policy "reminders_read" on public.reminders
  for select using (auth.role() = 'authenticated');

-- Reminders: only admins can insert, update, delete
create policy "reminders_insert_admin" on public.reminders
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "reminders_update_admin" on public.reminders
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "reminders_delete_admin" on public.reminders
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
