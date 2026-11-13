-- =====================================================
-- SAHITYIK SHABD LOK - COMMENTS SYSTEM
-- Run this file in Supabase SQL Editor.
-- =====================================================

-- 1. Create comments table

create table if not exists public.comments (
    id uuid primary key default gen_random_uuid(),

    submission_id uuid not null
        references public.submissions(id)
        on delete cascade,

    author_id uuid not null
        references public.profiles(id)
        on delete cascade,

    author_name text not null,

    body text not null
        check (char_length(body) between 1 and 2000),

    status text not null default 'pending'
        check (status in ('pending', 'approved', 'rejected')),

    created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security

alter table public.comments enable row level security;

-- 3. Public users can read only approved comments
-- Comments are visible only when their writing is published.

drop policy if exists "Public reads approved comments"
on public.comments;

create policy "Public reads approved comments"
on public.comments
for select
to anon, authenticated
using (
    status = 'approved'
    and exists (
        select 1
        from public.submissions s
        where s.id = submission_id
          and s.status = 'published'
    )
);

-- 4. Logged-in users can read their own comments
-- Staff can read comments for moderation.

drop policy if exists "Users read own comments or staff"
on public.comments;

create policy "Users read own comments or staff"
on public.comments
for select
to authenticated
using (
    author_id = (select auth.uid())
    or public.is_staff()
);

-- 5. Logged-in users can submit pending comments
-- Users cannot directly publish their comments.

drop policy if exists "Users submit pending comments"
on public.comments;

create policy "Users submit pending comments"
on public.comments
for insert
to authenticated
with check (
    author_id = (select auth.uid())
    and status = 'pending'
    and exists (
        select 1
        from public.submissions s
        where s.id = submission_id
          and s.status = 'published'
    )
);

-- 6. Only authorized staff can moderate comments.

drop policy if exists "Staff moderate comments"
on public.comments;

create policy "Staff moderate comments"
on public.comments
for update
to authenticated
using (
    public.is_staff()
)
with check (
    public.is_staff()
);

-- 7. Permissions

grant select on public.comments to anon, authenticated;
grant insert on public.comments to authenticated;
grant update on public.comments to authenticated;

-- 8. Helpful index

create index if not exists comments_submission_status_idx
on public.comments (submission_id, status, created_at);

-- =====================================================
-- END OF COMMENTS SCHEMA
-- =====================================================
